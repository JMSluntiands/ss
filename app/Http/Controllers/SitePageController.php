<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\HeroSlide;
use App\Models\JerseyItem;
use App\Models\SiteEvent;
use App\Models\SiteMember;
// use App\Models\SiteTournamentRoster;
use App\Services\MemberDashboardStatsService;
use App\Support\SiteEventDisplay;
use App\Support\TournamentXDomain;
use Inertia\Inertia;

class SitePageController extends Controller
{
    public function home(MemberDashboardStatsService $stats)
    {
        $members = SiteMember::query()
            ->orderBy('sort_order')
            ->get();

        $heroSlides = HeroSlide::query()
            ->where('published', true)
            ->orderBy('sort_order')
            ->get([
                'id',
                'title_primary',
                'title_secondary',
                'tagline',
                'tagline_accent',
                'cta_label',
                'cta_url',
                'cta_opens_join_modal',
                'image_url',
                'use_logo_visual',
                'sort_order',
            ]);

        return Inertia::render('Welcome', [
            'heroSlides' => $heroSlides,
            'members' => $stats->rosterProfiles($members),
            // 'tournamentRosters' => SiteTournamentRoster::query()
            //     ->orderBy('sort_order')
            //     ->get(['id', 'name', 'event_date', 'location', 'result', 'description', 'image_url', 'roster']),
        ]);
    }

    public function blog()
    {
        return Inertia::render('Blog', [
            'posts' => BlogPost::query()
                ->where('published', true)
                ->latest()
                ->get([
                    'id',
                    'title',
                    'excerpt',
                    'images',
                    'category',
                    'author',
                    'read_time',
                    'created_at',
                ]),
        ]);
    }

    public function blogShow(BlogPost $post)
    {
        if (! $post->published) {
            abort(404);
        }

        return Inertia::render('Blog/Show', [
            'post' => $post,
        ]);
    }

    public function events()
    {
        return Inertia::render('Event', [
            'upcomingEvents' => SiteEventDisplay::loadAndApplyFormat(
                SiteEvent::where('is_upcoming', true)
                    ->withCount([
                        'registrations as registration_count' => fn ($query) => $query
                            ->whereIn('status', ['tentative', 'confirmed']),
                    ])
                    ->latest()
                    ->get()
            ),
            'pastEvents' => SiteEventDisplay::loadAndApplyFormat(
                SiteEvent::where('is_upcoming', false)->latest()->get()
            ),
        ]);
    }

    public function eventShow(SiteEvent $event)
    {
        SiteEventDisplay::loadAndApplyFormat($event);

        $registeredCount = $event->registrations()
            ->whereIn('status', ['tentative', 'confirmed'])
            ->count();

        return Inertia::render('Events/Show', [
            'event' => $event,
            'registeredCount' => $registeredCount,
        ]);
    }

    public function members(MemberDashboardStatsService $stats)
    {
        $members = SiteMember::query()
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Members', [
            'members' => $stats->rosterProfiles($members),
        ]);
    }

    public function memberShow(SiteMember $member, MemberDashboardStatsService $stats)
    {
        $member->load('user:id,name,blader_name');

        $activity = $stats->activityCountsForMember($member);

        return Inertia::render('Members/Show', [
            'member' => $stats->rosterProfile($member),
            'activity' => $activity,
            'tournaments' => $stats->participatedTournamentsForMember($member)->all(),
            'events' => $stats->eventHistoryForMember($member)->all(),
            'tournamentx_url' => TournamentXDomain::baseUrl(),
        ]);
    }

    public function jersey()
    {
        return Inertia::render('Jersey', [
            'items' => JerseyItem::orderBy('sort_order')->get(),
        ]);
    }
}
