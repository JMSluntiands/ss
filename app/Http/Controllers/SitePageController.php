<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\JerseyItem;
use App\Models\SiteEvent;
use App\Models\SiteMember;
use Inertia\Inertia;

class SitePageController extends Controller
{
    public function home()
    {
        return Inertia::render('Welcome', [
            'members' => SiteMember::orderBy('sort_order')->get(),
        ]);
    }

    public function blog()
    {
        return Inertia::render('Blog', [
            'posts' => BlogPost::where('published', true)->latest()->get(),
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
            'upcomingEvents' => SiteEvent::where('is_upcoming', true)->latest()->get(),
            'pastEvents' => SiteEvent::where('is_upcoming', false)->latest()->get(),
        ]);
    }

    public function members()
    {
        return Inertia::render('Members', [
            'members' => SiteMember::orderBy('sort_order')->get(),
        ]);
    }

    public function jersey()
    {
        return Inertia::render('Jersey', [
            'items' => JerseyItem::orderBy('sort_order')->get(),
        ]);
    }
}
