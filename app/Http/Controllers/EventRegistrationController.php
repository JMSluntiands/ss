<?php

namespace App\Http\Controllers;

use App\Models\EventRegistration;
use App\Models\SiteEvent;
use Illuminate\Http\Request;

class EventRegistrationController extends Controller
{
    public function register(Request $request, SiteEvent $event)
    {
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
        $data['user_id'] = auth()->id();
        $data['status'] = 'tentative';

        EventRegistration::create($data);

        return back()->with('success', 'Registration submitted! Please wait for confirmation.');
    }

    public function confirm(EventRegistration $registration)
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
                'seed' => $nextSeed,
            ]);

            if ($registration->entry_type === 'double' && $registration->blader_name_2) {
                $nextSeed = $tournament->participants()->count() + 1;
                $tournament->participants()->create([
                    'name' => $registration->blader_name_2,
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
}
