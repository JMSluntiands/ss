<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Models\Tournament;
use App\Support\ImageOptimizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ParticipantController extends Controller
{
    public function store(Request $request, Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:32',
            'avatar' => 'nullable|image|max:5120',
        ]);

        $nextSeed = $tournament->participants()->count() + 1;

        $participant = $tournament->participants()->create([
            'name' => $validated['name'],
            'seed' => $nextSeed,
        ]);

        if ($request->hasFile('avatar')) {
            $this->storeAvatar($tournament, $participant, $request->file('avatar'));
        }

        return back();
    }

    public function bulkStore(Request $request, Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'names' => 'required|string',
        ]);

        $names = array_values(array_filter(
            array_map('trim', preg_split('/\r?\n/', $validated['names'])),
            fn ($name) => $name !== ''
        ));

        if (empty($names)) {
            return back()->withErrors(['names' => 'Please provide at least one participant name.']);
        }

        $tooLong = array_filter($names, fn ($name) => mb_strlen($name) > 32);
        if ($tooLong !== []) {
            return back()->withErrors(['names' => 'Each participant name must be 32 characters or fewer.']);
        }

        $currentCount = $tournament->participants()->count();

        foreach ($names as $index => $name) {
            $tournament->participants()->create([
                'name' => $name,
                'seed' => $currentCount + $index + 1,
            ]);
        }

        return back();
    }

    public function randomize(Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $participants = $tournament->participants()->get();
        $seeds = range(1, $participants->count());
        shuffle($seeds);

        foreach ($participants as $i => $participant) {
            $participant->update(['seed' => $seeds[$i]]);
        }

        return back();
    }

    public function updateJudge(Request $request, Tournament $tournament, Participant $participant)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'judge' => 'nullable|string|max:32',
        ]);

        $participant->update(['judge' => $validated['judge']]);

        return back();
    }

    public function updateAvatar(Request $request, Tournament $tournament, Participant $participant)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        if ($participant->tournament_id !== $tournament->id) {
            abort(404);
        }

        if ($tournament->status === 'completed') {
            return back()->withErrors(['avatar' => 'Photos cannot be changed after the tournament is completed.']);
        }

        $request->validate([
            'avatar' => 'nullable|image|max:5120',
            'remove_avatar' => 'nullable|boolean',
        ]);

        if ($request->boolean('remove_avatar')) {
            $this->deleteAvatarFile($participant);
            $participant->update(['avatar_path' => null]);

            return back();
        }

        if ($request->hasFile('avatar')) {
            $this->deleteAvatarFile($participant);
            $this->storeAvatar($tournament, $participant, $request->file('avatar'));
        }

        return back();
    }

    public function destroy(Tournament $tournament, $participantId)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $participant = Participant::where('id', $participantId)
            ->where('tournament_id', $tournament->id)
            ->firstOrFail();

        $this->deleteAvatarFile($participant);
        $participant->delete();

        $tournament->participants()->orderBy('seed')->get()
            ->each(function ($p, $index) {
                $p->update(['seed' => $index + 1]);
            });

        return redirect()->route('tournaments.show', $tournament);
    }

    private function storeAvatar(Tournament $tournament, Participant $participant, $file): void
    {
        $directory = 'participant-avatars/'.$tournament->id;
        $path = ImageOptimizer::storeOptimized($file, $directory, 256, 85);

        if ($path) {
            $participant->update(['avatar_path' => $path]);
        }
    }

    private function deleteAvatarFile(Participant $participant): void
    {
        if (! $participant->avatar_path) {
            return;
        }

        Storage::disk('public')->delete($participant->avatar_path);
    }
}
