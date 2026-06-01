<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\JerseyItem;
use App\Models\SiteEvent;
use App\Models\SiteMember;
use App\Support\SiteEventDisplay;
use Inertia\Inertia;

class SitePageController extends Controller
{
    public function home()
    {
        return Inertia::render('Welcome', [
            'members' => SiteMember::query()
                ->orderBy('sort_order')
                ->get(['id', 'name', 'role', 'rank', 'wins', 'losses', 'bey', 'image_url']),
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
                SiteEvent::where('is_upcoming', true)->latest()->get()
            ),
            'pastEvents' => SiteEventDisplay::loadAndApplyFormat(
                SiteEvent::where('is_upcoming', false)->latest()->get()
            ),
        ]);
    }

    public function eventShow(SiteEvent $event)
    {
        SiteEventDisplay::loadAndApplyFormat($event);

        $registrationCounts = [
            'total' => $event->registrations()->whereIn('status', ['tentative', 'confirmed'])->count(),
            'confirmed' => $event->registrations()->where('status', 'confirmed')->count(),
            'tentative' => $event->registrations()->where('status', 'tentative')->count(),
        ];

        $event->load([
            'registrations' => function ($query) {
                $query
                    ->whereIn('status', ['tentative', 'confirmed'])
                    ->latest()
                    ->limit(15)
                    ->select([
                        'id',
                        'site_event_id',
                        'full_name',
                        'entry_type',
                        'blader_name_1',
                        'blader_name_2',
                        'status',
                        'created_at',
                    ]);
            },
        ]);

        return Inertia::render('Events/Show', [
            'event' => $event,
            'registrationCounts' => $registrationCounts,
        ]);
    }

    public function members()
    {
        return Inertia::render('Members', [
            'members' => SiteMember::query()
                ->orderBy('sort_order')
                ->get(['id', 'name', 'role', 'rank', 'wins', 'losses', 'bey', 'joined', 'image_url']),
        ]);
    }

    public function jersey()
    {
        return Inertia::render('Jersey', [
            'items' => JerseyItem::orderBy('sort_order')->get(),
        ]);
    }
}
