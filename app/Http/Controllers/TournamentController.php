<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Services\DoubleEliminationService;
use App\Services\RoundRobinService;
use App\Services\SwissService;
use App\Support\TwoStageGroups;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Cookie;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TournamentController extends Controller
{
    public function __construct(
        private SwissService $swissService,
        private RoundRobinService $roundRobinService,
        private DoubleEliminationService $doubleEliminationService,
    ) {}

    private function redirectPath(Request $request, string $path): string
    {
        $basePath = trim($request->getBaseUrl(), '/');
        $fullPath = $basePath === '' ? ltrim($path, '/') : $basePath.'/'.ltrim($path, '/');

        return '/'.$fullPath;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function jsonWithFreshCsrf(array $data): JsonResponse
    {
        $token = csrf_token();

        return response()
            ->json([
                ...$data,
                'csrf_token' => $token,
            ])
            ->withCookie($this->xsrfCookie($token));
    }

    private function xsrfCookie(string $token): Cookie
    {
        return Cookie::create(
            'XSRF-TOKEN',
            $token,
            0,
            config('session.path', '/'),
            config('session.domain'),
            (bool) config('session.secure'),
            true,
            false,
            config('session.same_site', 'lax'),
        );
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizeSwissTopCut(Request $request, array $validated): array
    {
        if (! in_array($validated['format'] ?? '', ['swiss', 'round_robin'], true)) {
            $validated['swiss_top_cut_players'] = null;

            return $validated;
        }

        $raw = $request->input('swiss_top_cut_players');
        if ($raw === '' || $raw === null) {
            $validated['swiss_top_cut_players'] = null;

            return $validated;
        }

        if (! is_numeric($raw)) {
            throw ValidationException::withMessages([
                'swiss_top_cut_players' => 'Top cut must be a number or left blank for Swiss only (no playoff bracket).',
            ]);
        }

        $n = (int) $raw;
        if ($n < 2 || $n > 512) {
            throw ValidationException::withMessages([
                'swiss_top_cut_players' => 'Top cut must be between 2 and 512 players.',
            ]);
        }

        $validated['swiss_top_cut_players'] = $n;

        return $validated;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizeDoubleEliminationOptions(array $validated): array
    {
        $usesDoubleElim = ($validated['format'] ?? '') === 'double_elimination'
            || ($validated['final_stage_format'] ?? '') === 'double_elimination';

        if (! $usesDoubleElim) {
            $validated['de_split_participants'] = false;
            $validated['de_grand_finals'] = 'reset';

            return $validated;
        }

        $validated['de_split_participants'] = (bool) ($validated['de_split_participants'] ?? false);
        $validated['de_grand_finals'] = in_array($validated['de_grand_finals'] ?? 'reset', ['reset', 'single', 'none'], true)
            ? $validated['de_grand_finals']
            : 'reset';

        return $validated;
    }

    public function index()
    {
        $user = auth()->user();
        $user->loadMissing('siteMember');
        $statsService = app(\App\Services\MemberDashboardStatsService::class);
        $isMemberDashboard = $statsService->isMemberDashboardUser($user);

        if ($isMemberDashboard) {
            $mainUrl = \App\Support\TournamentXDomain::mainSiteUrl();

            if ($mainUrl) {
                return redirect()->away(rtrim($mainUrl, '/').route('member.dashboard', [], false));
            }

            if (\Illuminate\Support\Facades\Route::has('member.dashboard')) {
                return redirect()->route('member.dashboard');
            }
        }

        $tournaments = collect();

        if (! $isMemberDashboard) {
            $tournaments = Tournament::where('user_id', $user->id)
                ->latest()
                ->with(['matches.winner', 'swissStandings.participant'])
                ->get()
                ->map(function ($tournament) {
                    $champion = null;

                    if ($tournament->status === 'completed') {
                        if ($tournament->tournament_type === 'two_stage') {
                            $match = $tournament->matches
                                ->where('stage', 'final')
                                ->filter(fn ($m) => $m->winner_id && $m->next_match_id === null
                                    && !in_array($m->bracket, ['placement_3', 'placement_5']))
                                ->sortByDesc('round')
                                ->first();

                            if (!$match) {
                                $match = $tournament->matches
                                    ->first(fn ($m) => $m->stage === 'final' && $m->bracket === 'grand_final' && $m->winner_id);
                            }

                            $champion = $match?->winner?->name;
                        } elseif (in_array($tournament->format, ['swiss', 'round_robin'], true)) {
                            $finalWinners = $tournament->matches
                                ->where('stage', 'final')
                                ->filter(fn ($m) => $m->winner_id && ($m->next_match_id === null || $m->bracket === 'grand_final'));
                            if ($finalWinners->isNotEmpty()) {
                                $match = $finalWinners->sortByDesc('round')->first();
                                $champion = $match?->winner?->name;
                            } else {
                                $topStanding = $tournament->swissStandings->sortBy('rank')->first();
                                $champion = $topStanding?->participant?->name;
                            }
                        } else {
                            $match = $tournament->matches
                                ->first(fn ($m) => $m->bracket === 'grand_final' && $m->winner_id);

                            if (!$match) {
                                $match = $tournament->matches
                                    ->filter(fn ($m) => $m->winner_id && $m->next_match_id === null
                                        && !in_array($m->bracket, ['placement_3', 'placement_5']))
                                    ->sortByDesc('round')
                                    ->first();
                            }

                            $champion = $match?->winner?->name;
                        }
                    }

                    $tournament->champion_name = $champion;
                    unset($tournament->matches, $tournament->swissStandings);

                    return $tournament;
                });
        }

        $memberStats = $statsService->forUser($user);
        $participated = $statsService->participatedTournaments($user);

        return Inertia::render('Dashboard', [
            'tournaments' => $tournaments,
            'memberStats' => $memberStats,
            'participatedTournaments' => $participated->all(),
            'isShadowMember' => $memberStats !== null,
            'isMemberDashboard' => $isMemberDashboard,
            'aggregateFinishStats' => $isMemberDashboard ? $statsService->aggregateFinishStats($user) : null,
            'matchHistory' => $isMemberDashboard ? $statsService->matchHistory($user) : [],
        ]);
    }

    public function create()
    {
        if (! auth()->user()->canCreateTournaments()) {
            abort(403, 'You do not have permission to create tournaments.');
        }

        return Inertia::render('Tournaments/Create');
    }

    public function store(Request $request)
    {
        if (! auth()->user()->canCreateTournaments()) {
            abort(403, 'You do not have permission to create tournaments.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'tournament_type' => 'required|in:single_elimination,two_stage',
            'format' => 'required|in:single_elimination,double_elimination,round_robin,swiss',
            'group_stage_format' => 'nullable|in:swiss,round_robin',
            'final_stage_format' => 'nullable|in:single_elimination,double_elimination',
            'participants_per_group' => 'nullable|integer|min:2',
            'advance_per_group' => 'nullable|integer|min:1',
            'swiss_rounds' => 'nullable|integer|min:1',
            'swiss_top_cut_players' => 'nullable',
            'pts_for_match_win' => 'nullable|numeric|min:0',
            'pts_for_match_tie' => 'nullable|numeric|min:0',
            'pts_for_game_win' => 'nullable|numeric|min:0',
            'pts_for_game_tie' => 'nullable|numeric|min:0',
            'pts_for_bye' => 'nullable|numeric|min:0',
            'break_ties' => 'boolean',
            'third_place_match' => 'boolean',
            'placement_matches_fifth_seventh' => 'boolean',
            'de_split_participants' => 'boolean',
            'de_grand_finals' => 'nullable|in:reset,single,none',
            'stadiums' => 'nullable|integer|min:1',
        ]);

        $validated = $this->normalizeSwissTopCut($request, $validated);
        $validated = $this->normalizeDoubleEliminationOptions($validated);

        $slug = $validated['slug'] ?: Str::slug($validated['name']);
        $baseSlug = $slug;
        $counter = 1;
        while (Tournament::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        $tournament = Tournament::create([
            ...$validated,
            'slug' => $slug,
            'user_id' => auth()->id(),
        ]);

        return redirect()->to($this->redirectPath($request, 'tournaments/'.$tournament->id));
    }

    public function show(Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $tournament->load(['participants', 'matches.player1', 'matches.player2', 'matches.winner']);

        if (in_array($tournament->format, ['swiss', 'round_robin'], true)) {
            $tournament->load(['swissStandings' => function ($query) {
                $query->orderBy('rank')->with('participant');
            }]);
        }

        $tournament->makeVisible('judge_code');

        return Inertia::render('Tournaments/Show', [
            'tournament' => $tournament,
            'plan_participant_limit' => \App\Support\TournamentXPlan::maxParticipantsForTournament($tournament),
        ]);
    }

    public function showPublic(Tournament $tournament)
    {
        $tournament->load(['participants', 'matches.player1', 'matches.player2', 'matches.winner']);

        if (in_array($tournament->format, ['swiss', 'round_robin'], true)) {
            $tournament->load(['swissStandings' => function ($query) {
                $query->orderBy('rank')->with('participant');
            }]);
        }

        $tournament->loadMissing('user');

        return Inertia::render('Tournaments/Show', [
            'tournament' => $tournament,
            'readOnly' => true,
            'plan_participant_limit' => \App\Support\TournamentXPlan::maxParticipantsForTournament($tournament),
        ]);
    }

    public function edit(Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Tournaments/Create', [
            'tournament' => $tournament,
        ]);
    }

    public function update(Request $request, Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tournament_type' => 'required|in:single_elimination,two_stage',
            'format' => 'required|in:single_elimination,double_elimination,round_robin,swiss',
            'group_stage_format' => 'nullable|in:swiss,round_robin',
            'final_stage_format' => 'nullable|in:single_elimination,double_elimination',
            'participants_per_group' => 'nullable|integer|min:2',
            'advance_per_group' => 'nullable|integer|min:1',
            'swiss_rounds' => 'nullable|integer|min:1',
            'swiss_top_cut_players' => 'nullable',
            'pts_for_match_win' => 'nullable|numeric|min:0',
            'pts_for_match_tie' => 'nullable|numeric|min:0',
            'pts_for_game_win' => 'nullable|numeric|min:0',
            'pts_for_game_tie' => 'nullable|numeric|min:0',
            'pts_for_bye' => 'nullable|numeric|min:0',
            'break_ties' => 'boolean',
            'third_place_match' => 'boolean',
            'placement_matches_fifth_seventh' => 'boolean',
            'de_split_participants' => 'boolean',
            'de_grand_finals' => 'nullable|in:reset,single,none',
            'stadiums' => 'nullable|integer|min:1',
        ]);

        $validated = $this->normalizeSwissTopCut($request, $validated);
        $validated = $this->normalizeDoubleEliminationOptions($validated);

        $tournament->update($validated);

        return redirect()->to($this->redirectPath($request, 'tournaments/'.$tournament->id));
    }

    public function start(Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $participants = $tournament->participants()->orderBy('seed')->get();

        if ($participants->count() < 2) {
            return back()->withErrors(['tournament' => 'Need at least 2 participants to start.']);
        }

        if (!$tournament->judge_code) {
            $tournament->update(['judge_code' => strtoupper(Str::random(6))]);
        }

        if ($tournament->format === 'swiss') {
            $this->swissService->startTournament($tournament);
        } elseif ($tournament->format === 'round_robin') {
            $this->roundRobinService->startTournament($tournament);
        } else {
            $tournament->matches()->delete();

            if ($tournament->format === 'double_elimination') {
                $this->generateDoubleEliminationBracket($tournament, $participants);
            } else {
                $this->generateSingleEliminationBracket($tournament, $participants);
            }

            $tournament->update(['status' => 'active']);
        }

        return back();
    }

    public function updateStadiums(Request $request, Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'stadiums' => 'nullable|integer|min:1',
        ]);

        $tournament->update(['stadiums' => $validated['stadiums']]);

        return back();
    }

    public function setMatchStatus(Request $request, Tournament $tournament, TournamentMatch $match)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,playing',
            'stadium' => 'nullable|integer|min:1',
        ]);

        $data = ['status' => $validated['status']];
        if ($validated['status'] === 'playing') {
            $data['stadium'] = $validated['stadium'] ?? null;
        } else {
            $data['stadium'] = null;
        }

        $match->update($data);

        return back();
    }

    public function updateMatchLiveScore(Request $request, Tournament $tournament, TournamentMatch $match)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        if ($match->tournament_id !== $tournament->id) {
            abort(404);
        }

        if ($match->status !== 'playing') {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Only playing matches can sync live scores.'], 422);
            }

            return back()->withErrors(['match' => 'Only playing matches can sync live scores.']);
        }

        $validated = $request->validate([
            'round_details' => ['nullable', 'array'],
            'round_details.*.round' => ['required', 'integer', 'min:1'],
            'round_details.*.winner' => ['required', 'in:p1,p2'],
            'round_details.*.finish' => ['required', 'string', 'max:8'],
            'round_details.*.points' => ['required', 'integer', 'min:0', 'max:10'],
            'player1_score' => 'nullable|integer|min:0',
            'player2_score' => 'nullable|integer|min:0',
        ]);

        $match->update([
            'round_details' => $validated['round_details'] ?? [],
            'player1_score' => $validated['player1_score'] ?? 0,
            'player2_score' => $validated['player2_score'] ?? 0,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }

    public function updateMatchPlayers(Request $request, Tournament $tournament, TournamentMatch $match)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'player1_id' => 'nullable|exists:participants,id',
            'player2_id' => 'nullable|exists:participants,id|different:player1_id',
        ]);

        $player1Id = $validated['player1_id'] ?? null;
        $player2Id = $validated['player2_id'] ?? null;

        $participantIds = $tournament->participants()->pluck('id')->toArray();
        if (($player1Id && !in_array($player1Id, $participantIds)) || ($player2Id && !in_array($player2Id, $participantIds))) {
            return back()->withErrors(['match' => 'Selected players must belong to this tournament.']);
        }

        $isElim = in_array($tournament->format, ['single_elimination', 'double_elimination'], true);
        $hasAnyScore = !is_null($match->player1_score) || !is_null($match->player2_score) || $match->winner_id;
        $canEdit = $match->round === 1 || ($isElim && !$hasAnyScore);

        if (!$canEdit) {
            return back()->withErrors(['match' => 'Players can only be edited in round 1, or in elimination matches without scores yet.']);
        }

        $match->update([
            'player1_id' => $player1Id,
            'player2_id' => $player2Id,
            'winner_id' => null,
            'player1_score' => null,
            'player2_score' => null,
            'player1_battle_points' => 0,
            'player2_battle_points' => 0,
            'is_draw' => false,
            'round_details' => null,
            'status' => 'pending',
            'stadium' => null,
        ]);

        return back();
    }

    public function reportMatch(Request $request, Tournament $tournament, TournamentMatch $match)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        if (!auth()->user()->isAdmin() && !auth()->user()->can_score_matches) {
            abort(403, 'You do not have permission to score matches.');
        }

        // Swiss / Round Robin group stage flow
        if (in_array($tournament->format, ['swiss', 'round_robin'], true) && $match->stage !== 'final') {
            if ($tournament->matches()->where('stage', 'final')->exists()) {
                return back()->withErrors(['match' => 'Group stage scores cannot be edited after the final stage has started.']);
            }

            $validated = $request->validate([
                'winner_id' => 'nullable|exists:participants,id',
                'player1_battle_points' => 'required|integer|min:0',
                'player2_battle_points' => 'required|integer|min:0',
                'is_draw' => 'boolean',
                'round_details' => 'nullable|array',
            ]);

            $isDraw = $validated['is_draw'] ?? false;
            $winnerId = $isDraw ? 0 : ($validated['winner_id'] ?? 0);

            $groupService = $tournament->format === 'round_robin'
                ? $this->roundRobinService
                : $this->swissService;

            $groupService->submitMatchResult(
                $match,
                $winnerId,
                $validated['player1_battle_points'],
                $validated['player2_battle_points'],
                $isDraw
            );

            if (isset($validated['round_details'])) {
                $match->update(['round_details' => $validated['round_details']]);
            }

            return back();
        }

        // Elimination bracket flow (SE, DE, final stage)
        $validated = $request->validate([
            'winner_id' => 'required|exists:participants,id',
            'player1_score' => 'nullable|integer|min:0',
            'player2_score' => 'nullable|integer|min:0',
            'round_details' => 'nullable|array',
        ]);

        $match->update([
            'winner_id' => $validated['winner_id'],
            'player1_score' => $validated['player1_score'] ?? null,
            'player2_score' => $validated['player2_score'] ?? null,
            'round_details' => $validated['round_details'] ?? null,
            'status' => 'completed',
        ]);

        // Winner advances to next match (feeder order determines player1 vs player2)
        if ($match->next_match_id) {
            $this->doubleEliminationService->propagateParticipantToNextMatch($match, $validated['winner_id'], 'next_match_id');
        }

        // DE: Loser drops to losers bracket
        if ($match->loser_next_match_id) {
            $loserId = $validated['winner_id'] == $match->player1_id
                ? $match->player2_id
                : $match->player1_id;

            if ($loserId) {
                $this->doubleEliminationService->propagateParticipantToNextMatch($match, $loserId, 'loser_next_match_id');
            }
        }

        $this->doubleEliminationService->propagateByeAdvances($tournament, $match->stage ?? 'group');

        $this->doubleEliminationService->resolveEliminationProgress($tournament, $match);

        // Check tournament completion
        if ($match->stage === 'final') {
            $lastMatch = TournamentMatch::where('tournament_id', $tournament->id)
                ->where('stage', 'final')
                ->where(function ($q) {
                    $q->where('bracket', 'grand_final')
                      ->orWhere(function ($q2) {
                          $q2->whereNull('next_match_id')
                              ->where(function ($q3) {
                                  $q3->whereNull('bracket')
                                      ->orWhere('bracket', 'winners');
                              });
                      });
                })
                ->orderByDesc('round')
                ->first();

            if ($lastMatch && $lastMatch->winner_id) {
                $tournament->update(['status' => 'completed']);
            }
        } else {
            if (! $this->doubleEliminationService->usesDoubleElimination($tournament, $match->stage ?? 'group')) {
                $grandFinal = TournamentMatch::where('tournament_id', $tournament->id)
                    ->where('stage', '!=', 'final')
                    ->where('bracket', 'grand_final')
                    ->first();

                if ($grandFinal?->winner_id) {
                    $tournament->update(['status' => 'completed']);
                } else {
                    $finalMatch = TournamentMatch::where('tournament_id', $tournament->id)
                        ->where('stage', '!=', 'final')
                        ->whereNull('next_match_id')
                        ->where(function ($q) {
                            $q->whereNull('bracket')
                              ->orWhere('bracket', 'winners');
                        })
                        ->orderByDesc('round')
                        ->first();

                    if ($finalMatch && $finalMatch->winner_id) {
                        $tournament->update(['status' => 'completed']);
                    }
                }
            }
        }

        return back();
    }

    public function nextRound(Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        if (! in_array($tournament->format, ['swiss', 'round_robin'], true)) {
            return back()->withErrors(['tournament' => 'Only Swiss and Round Robin tournaments support round advancement.']);
        }

        $groupService = $tournament->format === 'round_robin'
            ? $this->roundRobinService
            : $this->swissService;

        if (! $groupService->isCurrentRoundComplete($tournament)) {
            return back()->withErrors(['tournament' => 'All matches in the current round must be completed first.']);
        }

        $continued = $groupService->advanceToNextRound($tournament);

        if (! $continued && $tournament->tournament_type === 'two_stage') {
            $this->startFinalStage($tournament);
        }

        if (! $continued
            && in_array($tournament->format, ['swiss', 'round_robin'], true)
            && (int) ($tournament->swiss_top_cut_players ?? 0) >= 2
            && $tournament->tournament_type === 'single_elimination') {
            $this->startFinalStage($tournament);
        }

        return back();
    }

    private function startFinalStage(Tournament $tournament): void
    {
        $tournament->matches()->where('stage', 'final')->delete();

        $totalParticipants = $tournament->participants()->count();

        $swissTopCut = (int) ($tournament->swiss_top_cut_players ?? 0);
        if (in_array($tournament->format, ['swiss', 'round_robin'], true) && $swissTopCut >= 2) {
            $totalAdvancing = min($swissTopCut, $totalParticipants);
        } elseif ($tournament->tournament_type === 'two_stage') {
            $finalFormat = $tournament->final_stage_format ?: 'single_elimination';
            $groupPlayers = $this->buildTwoStageFinalGroupParticipants($tournament);

            foreach ($groupPlayers as $index => $players) {
                if ($players->count() < 2) {
                    continue;
                }
                $tag = 'final_g'.($index + 1);
                if ($finalFormat === 'double_elimination') {
                    $this->generateDoubleEliminationBracket($tournament, $players, 'final', $tag);
                } else {
                    $this->generateSingleEliminationBracket($tournament, $players, 'final', $tag);
                }
            }

            return;
        } else {
            return;
        }

        if ($totalAdvancing < 2) {
            $totalAdvancing = 2;
        }

        $topPlayers = $tournament->swissStandings()
            ->orderBy('rank')
            ->limit($totalAdvancing)
            ->with('participant')
            ->get()
            ->map(fn ($s) => $s->participant);

        $finalFormat = 'single_elimination';

        if ($finalFormat === 'double_elimination') {
            $this->generateDoubleEliminationBracket($tournament, $topPlayers, 'final');
        } else {
            $this->generateSingleEliminationBracket($tournament, $topPlayers, 'final');
        }
    }

    /**
     * @return \Illuminate\Support\Collection<int, \Illuminate\Support\Collection<int, \App\Models\Participant>>
     */
    private function buildTwoStageFinalGroupParticipants(Tournament $tournament): array
    {
        $participants = $tournament->participants()->orderBy('seed')->get();
        $total = $participants->count();
        $perGroup = (int) ($tournament->participants_per_group ?? 0);
        $groupCount = $perGroup > 0 ? max(2, (int) ceil($total / $perGroup)) : 2;
        $groupSize = (int) ceil($total / $groupCount);
        $advancePerGroup = max(2, (int) ($tournament->advance_per_group ?: 2));

        $groups = [];
        for ($g = 0; $g < $groupCount; $g++) {
            $memberIds = $participants->slice($g * $groupSize, $groupSize)->pluck('id');
            $advancing = $tournament->swissStandings()
                ->whereIn('participant_id', $memberIds)
                ->with('participant')
                ->get()
                ->sort(function ($a, $b) {
                    $cmp = (float) $b->tournament_points <=> (float) $a->tournament_points;
                    if ($cmp !== 0) {
                        return $cmp;
                    }
                    $cmp = $b->battle_points <=> $a->battle_points;
                    if ($cmp !== 0) {
                        return $cmp;
                    }

                    return (float) $b->opponent_strength <=> (float) $a->opponent_strength;
                })
                ->take($advancePerGroup)
                ->map(fn ($s) => $s->participant)
                ->values();

            $groups[] = $advancing;
        }

        return $groups;
    }

    private function resolveBracketTag(?string $prefix, ?string $suffix): ?string
    {
        if ($prefix === null && $suffix === null) {
            return null;
        }
        if ($prefix === null) {
            return $suffix;
        }
        if ($suffix === null) {
            return $prefix;
        }

        return "{$prefix}_{$suffix}";
    }

    private function generateSingleEliminationBracket(
        Tournament $tournament,
        $participants,
        string $stage = 'group',
        ?string $bracketTag = null,
    )
    {
        $count = $participants->count();

        $bracketSize = 1;
        while ($bracketSize < $count) {
            $bracketSize *= 2;
        }

        $totalRounds = intval(log($bracketSize, 2));

        // Standard bracket seeding: place participants so BYEs are spread evenly
        $seedOrder = $this->generateSeedOrder($bracketSize);
        $slots = array_fill(0, $bracketSize, null);
        foreach ($seedOrder as $slotIndex => $seed) {
            if ($seed <= $count) {
                $slots[$slotIndex] = $participants[$seed - 1];
            }
        }

        $matchNumber = 1;
        $matchesByRound = [];
        $round1Matches = [];

        for ($i = 0; $i < $bracketSize; $i += 2) {
            $p1 = $slots[$i];
            $p2 = $slots[$i + 1];

            $isBye = ($p1 === null || $p2 === null);
            $winner = null;
            if ($isBye) {
                $winner = $p1 ?? $p2;
            }

            $match = TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'stage' => $stage,
                'bracket' => $this->resolveBracketTag($bracketTag, null),
                'round' => 1,
                'match_number' => $matchNumber++,
                'player1_id' => $p1?->id,
                'player2_id' => $p2?->id,
                'winner_id' => $winner?->id,
                'is_bye' => $isBye,
                'status' => $isBye ? 'completed' : 'pending',
            ]);

            $round1Matches[] = $match;
        }
        $matchesByRound[1] = $round1Matches;

        $previousRoundMatches = $round1Matches;

        for ($round = 2; $round <= $totalRounds; $round++) {
            $currentRoundMatches = [];
            $rmn = 1;

            for ($i = 0; $i < count($previousRoundMatches); $i += 2) {
                $feederMatch1 = $previousRoundMatches[$i];
                $feederMatch2 = $previousRoundMatches[$i + 1];

                $p1Id = $feederMatch1->winner_id;
                $p2Id = $feederMatch2->winner_id;

                $match = TournamentMatch::create([
                    'tournament_id' => $tournament->id,
                    'stage' => $stage,
                    'bracket' => $this->resolveBracketTag($bracketTag, null),
                    'round' => $round,
                    'match_number' => $rmn++,
                    'player1_id' => $p1Id,
                    'player2_id' => $p2Id,
                    'status' => 'pending',
                ]);

                $feederMatch1->update(['next_match_id' => $match->id]);
                $feederMatch2->update(['next_match_id' => $match->id]);

                $currentRoundMatches[] = $match;
            }

            $matchesByRound[$round] = $currentRoundMatches;
            $previousRoundMatches = $currentRoundMatches;
        }

        // 3rd / 4th: bronze match between semi-final losers (optional)
        if ($tournament->third_place_match && $totalRounds >= 2) {
            $semiFinals = $matchesByRound[$totalRounds - 1] ?? [];

            if (count($semiFinals) === 2) {
                $thirdPlaceMatch = TournamentMatch::create([
                    'tournament_id' => $tournament->id,
                    'stage' => $stage,
                    'bracket' => $this->resolveBracketTag($bracketTag, 'placement_3'),
                    'round' => 1,
                    'match_number' => 1,
                    'status' => 'pending',
                ]);

                $semiFinals[0]->update(['loser_next_match_id' => $thirdPlaceMatch->id]);
                $semiFinals[1]->update(['loser_next_match_id' => $thirdPlaceMatch->id]);
            }
        }

        // 5th–7th: mini-bracket for quarter-final losers (separate option from 3rd place)
        if ($tournament->placement_matches_fifth_seventh && $totalRounds >= 3) {
            $quarterFinals = $matchesByRound[$totalRounds - 2] ?? [];

            if (count($quarterFinals) === 4) {
                $fifthSemi1 = TournamentMatch::create([
                    'tournament_id' => $tournament->id,
                    'stage' => $stage,
                    'bracket' => $this->resolveBracketTag($bracketTag, 'placement_5'),
                    'round' => 1,
                    'match_number' => 1,
                    'status' => 'pending',
                ]);
                $fifthSemi2 = TournamentMatch::create([
                    'tournament_id' => $tournament->id,
                    'stage' => $stage,
                    'bracket' => $this->resolveBracketTag($bracketTag, 'placement_5'),
                    'round' => 1,
                    'match_number' => 2,
                    'status' => 'pending',
                ]);
                $fifthFinal = TournamentMatch::create([
                    'tournament_id' => $tournament->id,
                    'stage' => $stage,
                    'bracket' => $this->resolveBracketTag($bracketTag, 'placement_5'),
                    'round' => 2,
                    'match_number' => 1,
                    'status' => 'pending',
                ]);

                $fifthSemi1->update(['next_match_id' => $fifthFinal->id]);
                $fifthSemi2->update(['next_match_id' => $fifthFinal->id]);

                $quarterFinals[0]->update(['loser_next_match_id' => $fifthSemi1->id]);
                $quarterFinals[1]->update(['loser_next_match_id' => $fifthSemi1->id]);
                $quarterFinals[2]->update(['loser_next_match_id' => $fifthSemi2->id]);
                $quarterFinals[3]->update(['loser_next_match_id' => $fifthSemi2->id]);
            }
        }

        $this->doubleEliminationService->propagateByeAdvances($tournament, $stage);
    }

    private function generateDoubleEliminationBracket(
        Tournament $tournament,
        $participants,
        string $stage = 'group',
        ?string $bracketPrefix = null,
    ): void {
        $this->doubleEliminationService->generate($tournament, $participants, $stage, $bracketPrefix);
    }

    /**
     * Generate standard bracket seed order so BYEs are spread evenly.
     * Returns array where index = slot position, value = seed number (1-based).
     */
    private function generateSeedOrder(int $bracketSize): array
    {
        $rounds = intval(log($bracketSize, 2));
        $order = [1];

        for ($r = 0; $r < $rounds; $r++) {
            $newOrder = [];
            $sum = count($order) * 2 + 1;
            foreach ($order as $seed) {
                $newOrder[] = $seed;
                $newOrder[] = $sum - $seed;
            }
            $order = $newOrder;
        }

        return $order;
    }

    public function resetFinals(Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $hasGroupTopCut = in_array($tournament->format, ['swiss', 'round_robin'], true)
            && (int) ($tournament->swiss_top_cut_players ?? 0) >= 2;

        if ($tournament->tournament_type !== 'two_stage' && ! $hasGroupTopCut) {
            return back()->withErrors(['tournament' => 'Only two-stage tournaments or single-stage Swiss/Round Robin with a top cut have a resettable final bracket.']);
        }

        $tournament->update(['status' => 'active']);
        $this->startFinalStage($tournament);

        return back();
    }

    public function csrfCookie(): JsonResponse
    {
        return $this->jsonWithFreshCsrf([]);
    }

    public function liveData(Tournament $tournament)
    {
        $tournament->load(['matches.player1', 'matches.player2', 'matches.winner']);

        $data = [
            'matches' => $tournament->matches,
            'status' => $tournament->status,
            'current_round' => $tournament->current_round,
        ];

        if (in_array($tournament->format, ['swiss', 'round_robin'], true)) {
            $tournament->load(['swissStandings' => fn ($q) => $q->orderBy('rank')->with('participant')]);
            $data['swiss_standings'] = $tournament->swissStandings;
        }

        return $this->jsonWithFreshCsrf($data);
    }

    public function playerMatching(Tournament $tournament)
    {
        return Inertia::render('Tournaments/PlayerMatching', [
            'tournament' => $tournament->only([
                'id', 'name', 'slug', 'status', 'format', 'current_round', 'tournament_type',
                'pts_for_match_win', 'pts_for_match_tie', 'swiss_top_cut_players', 'advance_per_group',
            ]),
            'matches' => $this->playingMatchesForDisplay($tournament),
            'group_leaders' => $this->playerMatchingGroupLeaders($tournament),
            'standings' => $this->playerMatchingStandings($tournament),
        ]);
    }

    public function playerMatchingLive(Tournament $tournament)
    {
        return $this->jsonWithFreshCsrf([
            'matches' => $this->playingMatchesForDisplay($tournament),
            'status' => $tournament->status,
            'current_round' => $tournament->current_round,
            'group_leaders' => $this->playerMatchingGroupLeaders($tournament),
            'standings' => $this->playerMatchingStandings($tournament),
        ]);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, TournamentMatch>
     */
    private function playingMatchesForDisplay(Tournament $tournament)
    {
        return $tournament->matches()
            ->with(['player1', 'player2'])
            ->where('status', 'playing')
            ->whereNotNull('player1_id')
            ->whereNotNull('player2_id')
            ->where('is_bye', false)
            ->orderBy('stadium')
            ->orderBy('match_number')
            ->get();
    }

    /**
     * @return array<int, int>
     */
    private function standingsPointsDiff(Tournament $tournament): array
    {
        $ptsDiff = [];
        $matches = $tournament->matches()
            ->where('status', 'completed')
            ->where('is_bye', false)
            ->get(['player1_id', 'player2_id', 'player1_battle_points', 'player2_battle_points']);

        foreach ($matches as $match) {
            if ($match->player1_id) {
                $ptsDiff[$match->player1_id] = ($ptsDiff[$match->player1_id] ?? 0)
                    + $match->player1_battle_points - $match->player2_battle_points;
            }
            if ($match->player2_id) {
                $ptsDiff[$match->player2_id] = ($ptsDiff[$match->player2_id] ?? 0)
                    + $match->player2_battle_points - $match->player1_battle_points;
            }
        }

        return $ptsDiff;
    }

    /**
     * @param  \Illuminate\Support\Collection<int, \App\Models\SwissStanding>  $standings
     * @param  array<int, int>  $ptsDiff
     */
    private function sortStandingsLikeUi($standings, array $ptsDiff)
    {
        return $standings->sort(function ($a, $b) use ($ptsDiff) {
            $cmp = (float) $b->tournament_points <=> (float) $a->tournament_points;
            if ($cmp !== 0) {
                return $cmp;
            }
            $cmp = $b->battle_points <=> $a->battle_points;
            if ($cmp !== 0) {
                return $cmp;
            }
            $cmp = (float) $b->opponent_strength <=> (float) $a->opponent_strength;
            if ($cmp !== 0) {
                return $cmp;
            }

            $pdA = $ptsDiff[$a->participant_id] ?? 0;
            $pdB = $ptsDiff[$b->participant_id] ?? 0;

            return $pdB <=> $pdA;
        })->values();
    }

    /**
     * @return array<int, array{group: string, participant_name: string, participant_id: int|null}>
     */
    private function playerMatchingGroupLeaders(Tournament $tournament): array
    {
        if ($tournament->tournament_type !== 'two_stage') {
            return [];
        }

        if (!in_array($tournament->format, ['swiss', 'round_robin'], true)) {
            return [];
        }

        $participants = $tournament->participants()->orderBy('seed')->get(['id', 'name', 'seed']);
        if ($participants->isEmpty()) {
            return [];
        }

        $standings = $tournament->swissStandings()->get();
        if ($standings->isEmpty()) {
            return [];
        }

        $ptsDiff = $this->standingsPointsDiff($tournament);
        $leaders = [];

        foreach (TwoStageGroups::split($participants, $tournament)->values() as $g => $groupParticipants) {
            $memberIds = $groupParticipants->pluck('id')->all();
            $groupStandings = $standings->whereIn('participant_id', $memberIds);
            $leaderStanding = $this->sortStandingsLikeUi($groupStandings, $ptsDiff)->first();
            if (!$leaderStanding) {
                continue;
            }

            $leaderParticipant = $participants->firstWhere('id', $leaderStanding->participant_id);
            if (!$leaderParticipant) {
                continue;
            }

            $leaders[] = [
                'group' => TwoStageGroups::labelForIndex($g),
                'participant_name' => $leaderParticipant->name,
                'participant_id' => $leaderParticipant->id,
            ];
        }

        return $leaders;
    }

    /**
     * @return array<int, array{
     *     rank: int,
     *     participant_id: int,
     *     participant_name: string,
     *     wins: int,
     *     losses: int,
     *     draws: int,
     *     tournament_points: float,
     *     battle_points: int,
     *     opponent_strength: float,
     *     pts_diff: int
     * }>
     */
    private function playerMatchingStandings(Tournament $tournament): array
    {
        if (! in_array($tournament->format, ['swiss', 'round_robin'], true)) {
            return [];
        }

        $standings = $tournament->swissStandings()->with('participant')->get();
        if ($standings->isEmpty()) {
            return [];
        }

        $ptsDiff = $this->standingsPointsDiff($tournament);
        $sorted = $this->sortStandingsLikeUi($standings, $ptsDiff);

        return $sorted->values()->map(function ($standing, int $index) use ($ptsDiff) {
            return [
                'rank' => $index + 1,
                'participant_id' => $standing->participant_id,
                'participant_name' => $standing->participant->name ?? '—',
                'wins' => (int) $standing->wins,
                'losses' => (int) $standing->losses,
                'draws' => (int) $standing->draws,
                'tournament_points' => (float) $standing->tournament_points,
                'battle_points' => (int) $standing->battle_points,
                'opponent_strength' => (float) $standing->opponent_strength,
                'pts_diff' => $ptsDiff[$standing->participant_id] ?? 0,
            ];
        })->all();
    }

    public function destroy(Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        $tournament->delete();

        return redirect()->route('dashboard');
    }

    public function generateJudgeCode(Tournament $tournament)
    {
        if ($tournament->user_id !== auth()->id()) {
            abort(403);
        }

        if (!auth()->user()->isAdmin() && !auth()->user()->can_use_judge) {
            abort(403, 'You do not have permission to use the judge system.');
        }

        $tournament->update(['judge_code' => strtoupper(Str::random(6))]);

        return back();
    }

    public function judgeLogin(Request $request, Tournament $tournament)
    {
        if ($tournament->status === 'completed') {
            session()->forget("judge_access_{$tournament->id}");
            abort(403, 'Judge access is disabled after the tournament is completed.');
        }

        if (!$tournament->judge_code) {
            abort(404);
        }

        if (session("judge_access_{$tournament->id}")) {
            return redirect()->route('judge.panel', $tournament);
        }

        $codeFromQuery = strtoupper(preg_replace('/[^A-Z0-9]/', '', (string) $request->query('code', '')));
        if ($codeFromQuery !== '' && $codeFromQuery === $tournament->judge_code) {
            session(["judge_access_{$tournament->id}" => true]);

            return redirect()->route('judge.panel', $tournament);
        }

        return Inertia::render('Tournaments/JudgeLogin', [
            'tournament' => $tournament->only(['id', 'name', 'slug']),
            'prefillCode' => $codeFromQuery !== '' ? $codeFromQuery : null,
        ]);
    }

    public function judgeVerify(Request $request, Tournament $tournament)
    {
        if ($tournament->status === 'completed') {
            session()->forget("judge_access_{$tournament->id}");
            abort(403, 'Judge access is disabled after the tournament is completed.');
        }

        if (!$tournament->judge_code) {
            abort(404);
        }

        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        if (strtoupper($validated['code']) !== $tournament->judge_code) {
            return back()->withErrors(['code' => 'Invalid judge code.']);
        }

        session(["judge_access_{$tournament->id}" => true]);

        return redirect()->route('judge.panel', $tournament);
    }

    public function judgePanel(Tournament $tournament)
    {
        if ($tournament->status === 'completed') {
            session()->forget("judge_access_{$tournament->id}");
            abort(403, 'Judge access is disabled after the tournament is completed.');
        }

        if (!session("judge_access_{$tournament->id}")) {
            return redirect()->route('judge.login', $tournament);
        }

        $tournament->load(['participants', 'matches.player1', 'matches.player2', 'matches.winner']);

        return Inertia::render('Tournaments/JudgePanel', [
            'tournament' => $tournament,
        ]);
    }

    public function judgeUpdateMatchLiveScore(Request $request, Tournament $tournament, TournamentMatch $match)
    {
        if ($tournament->status === 'completed') {
            session()->forget("judge_access_{$tournament->id}");
            abort(403);
        }

        if (! session("judge_access_{$tournament->id}")) {
            abort(403);
        }

        if ($match->tournament_id !== $tournament->id) {
            abort(404);
        }

        if ($match->status !== 'playing') {
            return response()->json(['message' => 'Only playing matches can sync live scores.'], 422);
        }

        $validated = $request->validate([
            'round_details' => ['nullable', 'array'],
            'round_details.*.round' => ['required', 'integer', 'min:1'],
            'round_details.*.winner' => ['required', 'in:p1,p2'],
            'round_details.*.finish' => ['required', 'string', 'max:8'],
            'round_details.*.points' => ['required', 'integer', 'min:0', 'max:10'],
            'player1_score' => 'nullable|integer|min:0',
            'player2_score' => 'nullable|integer|min:0',
        ]);

        $roundDetails = $validated['round_details'] ?? [];

        $match->update([
            'round_details' => $roundDetails,
            'player1_score' => $validated['player1_score'] ?? 0,
            'player2_score' => $validated['player2_score'] ?? 0,
        ]);

        return response()->json([
            'ok' => true,
            'match' => $match->fresh(['player1', 'player2'])->only([
                'id', 'status', 'player1_score', 'player2_score', 'round_details',
            ]),
        ]);
    }

    public function judgeReportMatch(Request $request, Tournament $tournament, TournamentMatch $match)
    {
        if ($tournament->status === 'completed') {
            session()->forget("judge_access_{$tournament->id}");
            abort(403, 'Judge access is disabled after the tournament is completed.');
        }

        if (!session("judge_access_{$tournament->id}")) {
            abort(403);
        }

        if ($match->status !== 'playing' && $match->status !== 'completed') {
            return back()->withErrors(['match' => 'Only playing or completed matches can be scored.']);
        }

        $validated = $request->validate([
            'winner_id' => 'required|exists:participants,id',
            'player1_score' => 'nullable|integer|min:0',
            'player2_score' => 'nullable|integer|min:0',
            'round_details' => 'nullable|array',
        ]);

        $p1Score = $validated['player1_score'] ?? 0;
        $p2Score = $validated['player2_score'] ?? 0;
        $isDraw = $p1Score > 0 && $p1Score === $p2Score;

        if ($match->status === 'completed' && $match->winner_id && ! in_array($tournament->format, ['swiss', 'round_robin'], true) && $validated['winner_id'] != $match->winner_id) {
            return back()->withErrors(['match' => 'For completed elimination matches, keep the same winner and only update round points.']);
        }

        if (in_array($tournament->format, ['swiss', 'round_robin'], true) && $match->stage !== 'final') {
            if ($tournament->matches()->where('stage', 'final')->exists()) {
                return back()->withErrors(['match' => 'Group stage scores cannot be edited after the final stage has started.']);
            }

            $winnerId = $isDraw ? 0 : $validated['winner_id'];

            $groupService = $tournament->format === 'round_robin'
                ? $this->roundRobinService
                : $this->swissService;

            $groupService->submitMatchResult(
                $match,
                $winnerId,
                $p1Score,
                $p2Score,
                $isDraw
            );

            $match->update([
                'round_details' => $validated['round_details'] ?? null,
                'player1_score' => $p1Score,
                'player2_score' => $p2Score,
            ]);

            return back();
        }

        $match->update([
            'winner_id' => $validated['winner_id'],
            'player1_score' => $p1Score ?: null,
            'player2_score' => $p2Score ?: null,
            'round_details' => $validated['round_details'] ?? null,
            'status' => 'completed',
        ]);

        if ($match->next_match_id) {
            $this->doubleEliminationService->propagateParticipantToNextMatch($match, $validated['winner_id'], 'next_match_id');
        }

        if ($match->loser_next_match_id) {
            $loserId = $validated['winner_id'] == $match->player1_id
                ? $match->player2_id
                : $match->player1_id;

            if ($loserId) {
                $this->doubleEliminationService->propagateParticipantToNextMatch($match, $loserId, 'loser_next_match_id');
            }
        }

        $this->doubleEliminationService->propagateByeAdvances($tournament, $match->stage ?? 'group');

        $this->doubleEliminationService->resolveEliminationProgress($tournament, $match);

        if ($match->stage === 'final') {
            $lastMatch = TournamentMatch::where('tournament_id', $tournament->id)
                ->where('stage', 'final')
                ->where(function ($q) {
                    $q->where('bracket', 'grand_final')
                      ->orWhere(function ($q2) {
                          $q2->whereNull('next_match_id')
                              ->where(function ($q3) {
                                  $q3->whereNull('bracket')
                                      ->orWhere('bracket', 'winners');
                              });
                      });
                })
                ->orderByDesc('round')
                ->first();

            if ($lastMatch && $lastMatch->winner_id) {
                $tournament->update(['status' => 'completed']);
            }
        }

        return back();
    }
}
