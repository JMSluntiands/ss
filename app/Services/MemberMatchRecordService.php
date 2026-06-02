<?php

namespace App\Services;

use App\Models\Participant;
use App\Models\SiteMember;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;

class MemberMatchRecordService
{
    /**
     * @return array{wins: int, losses: int}
     */
    public function forMember(SiteMember $member): array
    {
        return $this->forMembers(collect([$member]))[$member->id] ?? ['wins' => 0, 'losses' => 0];
    }

    /**
     * @param  Collection<int, SiteMember>  $members
     * @return array<int, array{wins: int, losses: int}>
     */
    public function forMembers(Collection $members): array
    {
        if ($members->isEmpty()) {
            return [];
        }

        $members->each(fn (SiteMember $member) => $member->loadMissing('user'));

        $records = $members->mapWithKeys(fn (SiteMember $member) => [
            $member->id => ['wins' => 0, 'losses' => 0],
        ])->all();

        $participantToMember = [];

        foreach ($members as $member) {
            foreach ($this->participantIdsForMember($member) as $participantId) {
                $participantToMember[$participantId] = $member->id;
            }
        }

        if ($participantToMember === []) {
            return $records;
        }

        $participantIds = array_keys($participantToMember);

        $matches = TournamentMatch::query()
            ->where('status', 'completed')
            ->where(function ($query) use ($participantIds) {
                $query->whereIn('player1_id', $participantIds)
                    ->orWhereIn('player2_id', $participantIds);
            })
            ->get(['player1_id', 'player2_id', 'winner_id', 'is_draw']);

        foreach ($matches as $match) {
            foreach ([$match->player1_id, $match->player2_id] as $participantId) {
                if (! $participantId || ! isset($participantToMember[$participantId])) {
                    continue;
                }

                if ($match->is_draw) {
                    continue;
                }

                $memberId = $participantToMember[$participantId];

                if ($match->winner_id === $participantId) {
                    $records[$memberId]['wins']++;
                } elseif ($match->winner_id) {
                    $records[$memberId]['losses']++;
                }
            }
        }

        return $records;
    }

    public function syncForMatch(TournamentMatch $match): void
    {
        if ($match->status !== 'completed') {
            return;
        }

        $participantIds = array_filter([$match->player1_id, $match->player2_id]);

        if ($participantIds === []) {
            return;
        }

        $this->syncForParticipants($participantIds);
    }

    /**
     * @param  array<int>  $participantIds
     */
    public function syncForParticipants(array $participantIds): void
    {
        $members = $this->membersForParticipants($participantIds);

        foreach ($members as $member) {
            $this->syncMember($member);
        }
    }

    public function syncMember(SiteMember $member): void
    {
        $record = $this->forMember($member);

        $member->update([
            'wins' => $record['wins'],
            'losses' => $record['losses'],
        ]);
    }

    /**
     * @return Collection<int, SiteMember>
     */
    public function syncAllMembers(): Collection
    {
        $members = SiteMember::query()->orderBy('sort_order')->get();

        foreach ($members as $member) {
            $this->syncMember($member);
        }

        return $members;
    }

    /**
     * @return Collection<int, SiteMember>
     */
    private function membersForParticipants(array $participantIds): Collection
    {
        $participants = Participant::query()
            ->with(['user.siteMember'])
            ->whereIn('id', $participantIds)
            ->get();

        $members = collect();

        foreach ($participants as $participant) {
            if ($participant->user?->siteMember) {
                $members->put($participant->user->siteMember->id, $participant->user->siteMember);

                continue;
            }

            $matched = SiteMember::query()
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($participant->name)])
                ->when($participant->user_id, fn ($q) => $q->orWhere('user_id', $participant->user_id))
                ->first();

            if ($matched) {
                $members->put($matched->id, $matched);
            }
        }

        return $members->values();
    }

    /**
     * @return array<int>
     */
    private function participantIdsForMember(SiteMember $member): array
    {
        $query = Participant::query();

        if ($member->user_id) {
            $query->where('user_id', $member->user_id);
        } else {
            $names = array_unique(array_filter([
                $member->name,
                $member->user?->blader_name,
            ]));

            if ($names === []) {
                return [];
            }

            $query->where(function ($builder) use ($names) {
                foreach ($names as $name) {
                    $builder->orWhereRaw('LOWER(name) = ?', [mb_strtolower($name)]);
                }
            });
        }

        return $query->pluck('id')->all();
    }
}
