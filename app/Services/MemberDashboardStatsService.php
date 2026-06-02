<?php

namespace App\Services;

use App\Models\EventRegistration;
use App\Models\Participant;
use App\Models\SiteMember;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\MemberAccountService;
use Illuminate\Support\Collection;

class MemberDashboardStatsService
{
    public function __construct(
        private ParticipantFinishStatsService $finishStats,
        private MemberAccountService $accounts,
        private MemberMatchRecordService $matchRecords,
    ) {}

    /**
     * @param  \Illuminate\Support\Collection<int, SiteMember>  $members
     * @return array<int, array<string, mixed>>
     */
    public function rosterProfiles($members): array
    {
        $records = $this->matchRecords->forMembers($members);

        return $members->map(function (SiteMember $member) use ($records) {
            $record = $records[$member->id] ?? ['wins' => 0, 'losses' => 0];

            return $this->formatRosterProfile($member, $record['wins'], $record['losses']);
        })->all();
    }

    public function rosterProfile(SiteMember $member): array
    {
        $record = $this->matchRecords->forMember($member);

        return $this->formatRosterProfile($member, $record['wins'], $record['losses']);
    }

    private function formatRosterProfile(SiteMember $member, int $wins, int $losses): array
    {
        $totalGames = $wins + $losses;

        return [
            'id' => $member->id,
            'name' => $member->name,
            'role' => $member->role,
            'rank' => $member->rank,
            'wins' => $wins,
            'losses' => $losses,
            'win_rate' => $totalGames > 0 ? round(($wins / $totalGames) * 100) : 0,
            'bey' => $member->bey,
            'joined' => $member->joined,
            'image_url' => $member->image_url,
            'has_tournamentx_account' => $member->user_id !== null,
        ];
    }

    public function activityCountsForMember(SiteMember $member): array
    {
        $user = $member->user;

        $participantQuery = Participant::query();
        $this->applyParticipantScope($participantQuery, $member);

        $participantIds = $participantQuery->pluck('id');

        $eventsQuery = EventRegistration::query()
            ->whereIn('status', ['tentative', 'confirmed']);
        $this->applyEventRegistrationScope($eventsQuery, $member);

        return [
            'events_entered' => (clone $eventsQuery)->count(),
            'tournaments_entered' => $participantIds->isEmpty()
                ? 0
                : Participant::query()
                    ->whereIn('id', $participantIds)
                    ->distinct('tournament_id')
                    ->count('tournament_id'),
            'tournament_match_wins' => $participantIds->isEmpty()
                ? 0
                : TournamentMatch::query()
                    ->where('status', 'completed')
                    ->whereIn('winner_id', $participantIds)
                    ->count(),
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function participatedTournamentsForMember(SiteMember $member): Collection
    {
        $query = Participant::query()
            ->with(['tournament' => fn ($q) => $q->select('id', 'name', 'slug', 'format', 'status', 'start_time', 'tournament_type')]);
        $this->applyParticipantScope($query, $member);

        return $query->latest('id')->get()
            ->unique('tournament_id')
            ->map(fn (Participant $participant) => $this->mapParticipationEntry($participant))
            ->filter()
            ->values();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function eventHistoryForMember(SiteMember $member): Collection
    {
        $query = EventRegistration::query()
            ->with(['event' => fn ($q) => $q->select('id', 'title', 'date', 'location', 'status')])
            ->whereIn('status', ['tentative', 'confirmed'])
            ->latest();
        $this->applyEventRegistrationScope($query, $member);

        return $query->get()->map(fn (EventRegistration $reg) => [
            'id' => $reg->id,
            'event_title' => $reg->event?->title ?? 'Event',
            'event_date' => $reg->event?->date,
            'location' => $reg->event?->location,
            'entry_type' => $reg->entry_type,
            'blader_name_1' => $reg->blader_name_1,
            'blader_name_2' => $reg->blader_name_2,
            'status' => $reg->status,
            'created_at' => $reg->created_at,
        ]);
    }

    public function forUser(User $user): ?array
    {
        $member = $user->siteMember;

        if (! $member) {
            return null;
        }

        $activity = $this->activityCountsForMember($member);
        $profile = $this->rosterProfile($member);

        return [
            'name' => $profile['name'],
            'role' => $profile['role'],
            'rank' => $profile['rank'],
            'wins' => $profile['wins'],
            'losses' => $profile['losses'],
            'win_rate' => $profile['win_rate'],
            'bey' => $profile['bey'],
            'joined' => $profile['joined'],
            'events_entered' => $activity['events_entered'],
            'tournaments_entered' => $activity['tournaments_entered'],
            'tournament_match_wins' => $activity['tournament_match_wins'],
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function participatedTournaments(User $user): Collection
    {
        $entries = collect();

        Participant::query()
            ->where('user_id', $user->id)
            ->with(['tournament' => fn ($q) => $q->select('id', 'name', 'slug', 'format', 'status', 'start_time', 'tournament_type')])
            ->latest('id')
            ->get()
            ->unique('tournament_id')
            ->each(function (Participant $participant) use ($entries) {
                $mapped = $this->mapParticipationEntry($participant);
                if ($mapped) {
                    $entries->put($participant->tournament_id, $mapped);
                }
            });

        $member = $user->siteMember;

        if ($member) {
            $this->participatedTournamentsForMember($member)
                ->each(function (array $row) use ($entries) {
                    if (! $entries->has($row['id'])) {
                        $entries->put($row['id'], $row);
                    }
                });
        }

        return $entries->values();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function mapParticipationEntry(Participant $participant): ?array
    {
        $tournament = $participant->tournament;

        if (! $tournament) {
            return null;
        }

        if (! $participant->user_id) {
            $resolved = $this->accounts->resolveUserByBladerName($participant->name);
            if ($resolved) {
                $participant->update(['user_id' => $resolved->id]);
            }
        }

        return [
            'id' => $tournament->id,
            'name' => $tournament->name,
            'slug' => $tournament->slug,
            'format' => $tournament->format,
            'status' => $tournament->status,
            'start_time' => $tournament->start_time,
            'blader_name' => $participant->name,
            'placement' => $this->placementForParticipant($tournament, $participant),
            'linked_account' => $participant->user_id !== null,
            'finish_stats' => $this->finishStats->forParticipant($tournament, $participant),
        ];
    }

    private function placementForParticipant(Tournament $tournament, Participant $participant): ?string
    {
        if ($tournament->status !== 'completed') {
            return null;
        }

        $tournament->loadMissing(['matches.winner', 'swissStandings']);

        $championId = $this->championParticipantId($tournament);

        if ($championId === $participant->id) {
            return 'Champion';
        }

        $finalMatch = $tournament->matches
            ->filter(fn ($m) => $m->winner_id && ($m->bracket === 'grand_final' || ($m->next_match_id === null && ! in_array($m->bracket, ['placement_3', 'placement_5'], true))))
            ->sortByDesc('round')
            ->first();

        if ($finalMatch && $finalMatch->winner_id !== $participant->id) {
            $loserId = $finalMatch->player1_id === $finalMatch->winner_id
                ? $finalMatch->player2_id
                : $finalMatch->player1_id;

            if ($loserId === $participant->id) {
                return 'Runner-up';
            }
        }

        $standing = $tournament->swissStandings
            ->firstWhere('participant_id', $participant->id);

        if ($standing?->rank) {
            return match ((int) $standing->rank) {
                1 => '1st',
                2 => '2nd',
                3 => '3rd',
                default => $standing->rank.'th',
            };
        }

        return null;
    }

    private function championParticipantId(Tournament $tournament): ?int
    {
        if ($tournament->tournament_type === 'two_stage') {
            $match = $tournament->matches
                ->where('stage', 'final')
                ->filter(fn ($m) => $m->winner_id && $m->next_match_id === null
                    && ! in_array($m->bracket, ['placement_3', 'placement_5'], true))
                ->sortByDesc('round')
                ->first();

            return $match?->winner_id;
        }

        $match = $tournament->matches
            ->first(fn ($m) => $m->bracket === 'grand_final' && $m->winner_id);

        if ($match) {
            return $match->winner_id;
        }

        $match = $tournament->matches
            ->filter(fn ($m) => $m->winner_id && $m->next_match_id === null
                && ! in_array($m->bracket, ['placement_3', 'placement_5'], true))
            ->sortByDesc('round')
            ->first();

        if ($match) {
            return $match->winner_id;
        }

        $topStanding = $tournament->swissStandings->sortBy('rank')->first();

        return $topStanding?->participant_id;
    }

    private function applyParticipantScope($query, SiteMember $member): void
    {
        $member->loadMissing('user');

        if ($member->user_id) {
            $query->where('user_id', $member->user_id);

            return;
        }

        $names = array_filter([$member->name, $member->user?->blader_name]);
        $query->where(function ($q) use ($names) {
            foreach ($names as $name) {
                $q->orWhereRaw('LOWER(name) = ?', [mb_strtolower($name)]);
            }
        });
    }

    private function applyEventRegistrationScope($query, SiteMember $member): void
    {
        $member->loadMissing('user');

        if ($member->user_id) {
            $query->where('user_id', $member->user_id);

            return;
        }

        $names = array_unique(array_filter([
            $member->name,
            $member->user?->blader_name,
        ]));

        $query->where(function ($q) use ($names) {
            foreach ($names as $name) {
                $q->orWhere('blader_name_1', $name)
                    ->orWhere('blader_name_2', $name);
            }
        });
    }
}
