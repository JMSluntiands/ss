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

    public function isMemberDashboardUser(User $user): bool
    {
        return \App\Support\UserAccountType::isMember($user);
    }

    /**
     * @return array{sf: int, of: int, bf: int, xf: int, matches_played: int, rounds_won: int}
     */
    public function aggregateFinishStats(User $user): array
    {
        $totals = [
            'sf' => 0,
            'of' => 0,
            'bf' => 0,
            'xf' => 0,
            'matches_played' => 0,
            'rounds_won' => 0,
        ];

        foreach ($this->participatedTournaments($user) as $entry) {
            $stats = $entry['finish_stats'] ?? null;

            if (! $stats) {
                continue;
            }

            foreach (array_keys($totals) as $key) {
                $totals[$key] += (int) ($stats[$key] ?? 0);
            }
        }

        return $totals;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function matchHistory(User $user): array
    {
        $participantIds = $this->participantIdsForUser($user);

        if ($participantIds === []) {
            return [];
        }

        return TournamentMatch::query()
            ->with([
                'tournament:id,name,slug',
                'player1:id,name',
                'player2:id,name',
            ])
            ->where('status', 'completed')
            ->where(function ($query) use ($participantIds) {
                $query->whereIn('player1_id', $participantIds)
                    ->orWhereIn('player2_id', $participantIds);
            })
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (TournamentMatch $match) use ($participantIds) {
                $myId = in_array($match->player1_id, $participantIds, true)
                    ? $match->player1_id
                    : $match->player2_id;

                if (! $myId) {
                    return null;
                }

                $side = $match->player1_id === $myId ? 'p1' : 'p2';
                $opponent = $side === 'p1' ? $match->player2 : $match->player1;

                $finishes = [];
                foreach ($match->round_details ?? [] as $round) {
                    if (($round['winner'] ?? '') === $side) {
                        $finish = (string) ($round['finish'] ?? '');
                        if ($finish !== '') {
                            $finishes[] = $finish;
                        }
                    }
                }

                $result = 'loss';
                if ($match->is_bye) {
                    $result = 'bye';
                } elseif ($match->is_draw) {
                    $result = 'draw';
                } elseif ($match->winner_id === $myId) {
                    $result = 'win';
                }

                return [
                    'id' => $match->id,
                    'tournament_name' => $match->tournament?->name ?? 'Tournament',
                    'tournament_slug' => $match->tournament?->slug,
                    'opponent_name' => $opponent?->name,
                    'result' => $result,
                    'finishes' => $finishes,
                    'round' => $match->round,
                    'played_at' => $match->updated_at?->toIso8601String(),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @return array<int>
     */
    private function participantIdsForUser(User $user): array
    {
        $user->loadMissing('siteMember');

        $ids = Participant::query()
            ->where('user_id', $user->id)
            ->pluck('id')
            ->all();

        if ($user->siteMember) {
            $scoped = Participant::query();
            $this->applyParticipantScope($scoped, $user->siteMember);
            $ids = array_values(array_unique([...$ids, ...$scoped->pluck('id')->all()]));
        }

        return $ids;
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
