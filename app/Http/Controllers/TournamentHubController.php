<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Tournament;
use App\Services\MemberDashboardStatsService;
use App\Support\TournamentXDomain;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TournamentHubController extends Controller
{
    public function communities(MemberDashboardStatsService $statsService)
    {
        $user = auth()->user();
        $user->loadMissing('siteMember');

        $owned = Tournament::query()
            ->where('user_id', $user->id)
            ->latest()
            ->withCount('participants')
            ->get(['id', 'name', 'slug', 'format', 'status', 'start_time', 'max_participants'])
            ->map(fn (Tournament $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
                'format' => $t->format,
                'status' => $t->status,
                'start_time' => $t->start_time,
                'max_participants' => $t->max_participants,
                'participants_count' => $t->participants_count,
                'role' => 'organizer',
            ]);

        $ownedIds = $owned->pluck('id');

        $joined = $statsService->participatedTournaments($user)
            ->filter(fn (array $t) => ! $ownedIds->contains($t['id']))
            ->map(fn (array $t) => [...$t, 'role' => 'player']);

        return Inertia::render('Hub/Communities', [
            'ownedTournaments' => $owned,
            'joinedTournaments' => $joined->values()->all(),
            'shadowMember' => $user->siteMember !== null,
            'memberProfile' => $user->siteMember
                ? $statsService->rosterProfile($user->siteMember)
                : null,
        ]);
    }

    public function discover(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $status = (string) $request->query('status', 'all');

        $query = Tournament::query()
            ->withCount('participants')
            ->with(['user:id,name'])
            ->when($q !== '', fn ($builder) => $builder->where('name', 'like', '%'.$q.'%'))
            ->when($status !== 'all', fn ($builder) => $builder->where('status', $status))
            ->latest();

        $tournaments = $query
            ->limit(48)
            ->get(['id', 'name', 'slug', 'format', 'status', 'start_time', 'max_participants', 'user_id', 'description'])
            ->map(fn (Tournament $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
                'format' => $t->format,
                'status' => $t->status,
                'start_time' => $t->start_time,
                'max_participants' => $t->max_participants,
                'participants_count' => $t->participants_count,
                'description' => $t->description ? str($t->description)->limit(120)->toString() : null,
                'organizer_name' => $t->user?->name,
                'is_mine' => $t->user_id === auth()->id(),
            ]);

        return Inertia::render('Hub/Discover', [
            'tournaments' => $tournaments,
            'filters' => [
                'q' => $q,
                'status' => $status,
            ],
        ]);
    }

    public function news()
    {
        $posts = BlogPost::query()
            ->where('published', true)
            ->latest()
            ->limit(24)
            ->get([
                'id',
                'title',
                'excerpt',
                'images',
                'category',
                'author',
                'read_time',
                'created_at',
            ]);

        return Inertia::render('Hub/News', [
            'posts' => $posts,
            'mainSiteUrl' => TournamentXDomain::mainSiteUrl(),
        ]);
    }
}
