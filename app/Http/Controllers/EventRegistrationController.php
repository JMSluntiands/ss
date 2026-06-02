<?php

namespace App\Http\Controllers;

use App\Models\EventRegistration;
use App\Models\SiteEvent;
use App\Services\MemberAccountService;
use App\Support\TournamentXDomain;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventRegistrationController extends Controller
{
    public function register(Request $request, SiteEvent $event, MemberAccountService $memberAccounts)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->guest(TournamentXDomain::url('/login'))
                ->with('error', 'Log in with your TournamentX account to register for this event.');
        }

        $bladerName = $memberAccounts->tournamentBladerName($user);

        if ($event->registrations()->where('user_id', $user->id)->whereIn('status', ['tentative', 'confirmed'])->exists()) {
            return back()->with('error', 'You already have a registration for this event.');
        }
        $maxSlots = (int) $event->slots;
        if ($maxSlots > 0) {
            $registeredCount = $event->registrations()
                ->whereIn('status', ['tentative', 'confirmed'])
                ->count();

            if ($registeredCount >= $maxSlots) {
                return back()->with('error', 'Registration is closed. All slots are filled.');
            }
        }

        $rules = [
            'full_name' => 'required|string|max:255',
            'entry_type' => 'required|in:single,double',
            'blader_name_1' => 'required|string|max:255',
            'blader_name_2' => 'nullable|string|max:255',
        ];

        if ($event->require_payment) {
            $rules['payment_proof'] = 'required|image|max:5120';
        } else {
            $rules['payment_proof'] = 'nullable|image|max:5120';
        }

        if (!$event->allow_double_entry && $request->entry_type === 'double') {
            return back()->with('error', 'Double entry is not allowed for this event.');
        }

        if ($request->entry_type === 'double' && empty($request->blader_name_2)) {
            return back()->with('error', 'Blader Name 2 is required for double entry.');
        }

        $data = $request->validate($rules);

        if ($request->hasFile('payment_proof')) {
            $data['payment_proof'] = $request->file('payment_proof')->store('payment-proofs');
        }

        $data['site_event_id'] = $event->id;
        $data['user_id'] = $user->id;
        $data['full_name'] = $user->name;
        $data['blader_name_1'] = $bladerName;
        $data['status'] = 'tentative';

        EventRegistration::create($data);

        return back()->with('success', 'Registration submitted! Please wait for confirmation.');
    }

    public function confirm(EventRegistration $registration, MemberAccountService $memberAccounts)
    {
        $event = $registration->event;

        if (!auth()->user()->isAdmin() && $event->user_id !== auth()->id()) {
            abort(403);
        }

        $registration->update(['status' => 'confirmed']);

        if ($event->tournament_id) {
            $tournament = $event->tournament;
            $nextSeed = $tournament->participants()->count() + 1;

            $tournament->participants()->create([
                'name' => $registration->blader_name_1,
                'user_id' => $registration->user_id,
                'seed' => $nextSeed,
            ]);

            if ($registration->entry_type === 'double' && $registration->blader_name_2) {
                $nextSeed = $tournament->participants()->count() + 1;
                $partner = $memberAccounts->resolveUserByBladerName($registration->blader_name_2);
                $tournament->participants()->create([
                    'name' => $registration->blader_name_2,
                    'user_id' => $partner?->id,
                    'seed' => $nextSeed,
                ]);
            }
        }

        return back()->with('success', "{$registration->full_name} has been confirmed and added to the tournament.");
    }

    public function reject(EventRegistration $registration)
    {
        $event = $registration->event;

        if (!auth()->user()->isAdmin() && $event->user_id !== auth()->id()) {
            abort(403);
        }

        $registration->update(['status' => 'rejected']);

        return back()->with('success', "{$registration->full_name} has been rejected.");
    }

    public function destroy(EventRegistration $registration)
    {
        $event = $registration->event;
        $event->loadMissing('tournament');

        if (! auth()->user()->isAdmin() && $event->user_id !== auth()->id()) {
            abort(403);
        }

        if ($registration->status === 'confirmed' && $event->tournament) {
            $names = array_filter([$registration->blader_name_1, $registration->blader_name_2]);
            if ($names !== []) {
                $event->tournament->participants()->whereIn('name', $names)->delete();
            }
        }

        if ($registration->payment_proof && Storage::exists($registration->payment_proof)) {
            Storage::delete($registration->payment_proof);
        }

        $fullName = $registration->full_name;
        $registration->delete();

        return back()->with('success', "Registration for {$fullName} has been deleted.");
    }
}
