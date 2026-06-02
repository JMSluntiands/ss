<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Support\BlogImageStorage;
use App\Support\ImageOptimizer;
use App\Models\JerseyItem;
use App\Models\SiteEvent;
use App\Models\SiteMember;
use App\Services\MemberAccountService;
use App\Services\MemberMatchRecordService;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminContentController extends Controller
{
    // ── User-facing Events (authenticated) ──

    public function userEventsIndex()
    {
        if (!auth()->user()->isAdmin() && !auth()->user()->can_manage_events) {
            abort(403, 'You do not have permission to manage events.');
        }

        $events = SiteEvent::withCount('registrations')->latest()->paginate(20);
        $tournaments = auth()->user()->tournaments()->select($this->tournamentFieldsForEvents())->latest()->get();

        return Inertia::render('MyEvents', [
            'events' => $events,
            'tournaments' => $tournaments,
            'userName' => auth()->user()->name,
        ]);
    }

    public function eventRegistrations(Request $request, SiteEvent $event)
    {
        if (! auth()->user()->isAdmin() && $event->user_id !== auth()->id()) {
            abort(403);
        }

        $event->load('tournament');

        $search = trim((string) $request->input('search', ''));

        $registrationsQuery = $event->registrations()->with('user')->latest();

        if ($search !== '') {
            $like = '%'.$search.'%';
            $registrationsQuery->where(function ($query) use ($like) {
                $query->where('full_name', 'like', $like)
                    ->orWhere('blader_name_1', 'like', $like)
                    ->orWhere('blader_name_2', 'like', $like)
                    ->orWhere('entry_type', 'like', $like)
                    ->orWhere('status', 'like', $like)
                    ->orWhereHas('user', function ($userQuery) use ($like) {
                        $userQuery->where('email', 'like', $like)
                            ->orWhere('name', 'like', $like);
                    });
            });
        }

        return Inertia::render('EventRegistrations', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'require_payment' => $event->require_payment,
                'allow_double_entry' => $event->allow_double_entry,
                'tournament_id' => $event->tournament_id,
                'tournament' => $event->tournament,
            ],
            'registrations' => $registrationsQuery->paginate(15)->withQueryString(),
            'statusCounts' => [
                'total' => $event->registrations()->count(),
                'tentative' => $event->registrations()->where('status', 'tentative')->count(),
                'confirmed' => $event->registrations()->where('status', 'confirmed')->count(),
                'rejected' => $event->registrations()->where('status', 'rejected')->count(),
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    // ── Blog Posts ──

    public function blogIndex()
    {
        $posts = BlogPost::latest()->paginate(20);
        return Inertia::render('Admin/Content/Blog', ['posts' => $posts]);
    }

    private function blogRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'category' => 'required|string|max:100',
            'author' => 'required|string|max:100',
            'read_time' => 'nullable|string|max:50',
            'published' => 'nullable|in:0,1,true,false,on,off',
            'images' => 'nullable',
            'images.*' => 'nullable|file|max:15360|mimes:jpg,jpeg,png,gif,webp,bmp,svg,heic,heif',
            'keep_images' => 'nullable|array',
            'keep_images.*' => 'string|max:500',
        ];
    }

    private function prepareBlogData(array $data, Request $request): array
    {
        unset($data['images'], $data['keep_images']);

        foreach (['title', 'excerpt', 'content', 'category', 'author', 'read_time'] as $field) {
            if ($request->exists($field)) {
                $value = $request->input($field);
                $data[$field] = is_string($value) ? $value : $data[$field] ?? null;
            }
        }

        $data['published'] = $request->boolean('published');

        return $data;
    }

    private function storeUploadedBlogImages(Request $request): array
    {
        $paths = [];
        if (!$request->hasFile('images')) {
            return $paths;
        }

        foreach ($request->file('images') as $file) {
            $stored = BlogImageStorage::store($file);
            if ($stored) {
                $paths[] = $stored;
            }
        }

        return $paths;
    }

    private function deleteBlogImages(?array $paths): void
    {
        if (!$paths) {
            return;
        }
        foreach ($paths as $path) {
            if ($path) {
                ImageOptimizer::deleteStored($path);
            }
        }
    }

    public function blogStore(Request $request)
    {
        $data = $this->prepareBlogData($request->validate($this->blogRules()), $request);

        $uploaded = $this->storeUploadedBlogImages($request);
        $data['images'] = $uploaded ?: null;

        BlogPost::create($data);
        return back()->with('success', 'Blog post created.');
    }

    public function blogUpdate(Request $request, BlogPost $post)
    {
        $data = $this->prepareBlogData($request->validate($this->blogRules()), $request);

        $keep = $request->input('keep_images', []);
        $current = $post->images ?? [];
        $toDelete = array_diff($current, $keep);
        $this->deleteBlogImages(array_values($toDelete));

        $uploaded = $this->storeUploadedBlogImages($request);
        $data['images'] = array_values(array_merge($keep, $uploaded)) ?: null;

        $post->update($data);
        return back()->with('success', 'Blog post updated.');
    }

    public function blogDestroy(BlogPost $post)
    {
        $this->deleteBlogImages($post->images);
        $post->delete();
        return back()->with('success', 'Blog post deleted.');
    }

    // ── Events ──

    public function eventsIndex()
    {
        $events = SiteEvent::latest()->paginate(20);
        $tournaments = Tournament::query()
            ->select($this->tournamentFieldsForEvents())
            ->latest()
            ->get();

        return Inertia::render('Admin/Content/Events', [
            'events' => $events,
            'tournaments' => $tournaments,
            'userName' => auth()->user()->name,
        ]);
    }

    /**
     * @return list<string>
     */
    private function tournamentFieldsForEvents(): array
    {
        return [
            'id',
            'name',
            'description',
            'tournament_type',
            'format',
            'group_stage_format',
            'final_stage_format',
            'swiss_rounds',
            'swiss_top_cut_players',
            'participants_per_group',
            'advance_per_group',
        ];
    }

    private function eventRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'organizer' => 'nullable|string|max:255',
            'date' => 'required|string|max:100',
            'time' => 'nullable|string|max:50',
            'location' => 'required|string|max:255',
            'map_address' => 'nullable|string|max:500',
            'map_lat' => 'nullable|numeric|between:-90,90',
            'map_lng' => 'nullable|numeric|between:-180,180',
            'format' => 'nullable|string|max:100',
            'rules' => 'nullable|string',
            'slots' => 'nullable|string|max:50',
            'entry_fee' => 'nullable|string|max:100',
            'pre_register_fee' => 'nullable|string|max:100',
            'pre_register_until' => 'nullable|date',
            'prizes' => 'nullable|array',
            'prizes.*.place' => 'required|string|max:100',
            'prizes.*.prize' => 'required|string|max:255',
            'status' => 'required|string|max:50',
            'participants' => 'nullable|integer',
            'winner' => 'nullable|string|max:100',
            'runner_up' => 'nullable|string|max:100',
            'is_upcoming' => 'boolean',
            'tournament_id' => 'nullable|exists:tournaments,id',
            'allow_double_entry' => 'boolean',
            'require_payment' => 'boolean',
            'payment_method' => 'nullable|string|max:1000',
            'payment_qr' => 'nullable|image|max:5120',
        ];
    }

    private function authorizeEventManagement(): void
    {
        $user = auth()->user();
        if (!$user->isAdmin() && !$user->can_manage_events) {
            abort(403, 'You do not have permission to manage events.');
        }
    }

    public function eventStore(Request $request)
    {
        $this->authorizeEventManagement();
        $data = $request->validate($this->eventRules());
        $data['user_id'] = auth()->id();

        if ($request->hasFile('payment_qr')) {
            $data['payment_qr'] = $request->file('payment_qr')->store('payment-qr');
        }

        SiteEvent::create($data);
        return back()->with('success', 'Event created.');
    }

    public function eventUpdate(Request $request, SiteEvent $event)
    {
        $this->authorizeEventManagement();
        $data = $request->validate($this->eventRules());

        if ($request->hasFile('payment_qr')) {
            if ($event->payment_qr) {
                \Illuminate\Support\Facades\Storage::delete($event->payment_qr);
            }
            $data['payment_qr'] = $request->file('payment_qr')->store('payment-qr');
        } else {
            unset($data['payment_qr']);
        }

        $event->update($data);
        return back()->with('success', 'Event updated.');
    }

    public function eventDestroy(SiteEvent $event)
    {
        $this->authorizeEventManagement();
        $event->delete();
        return back()->with('success', 'Event deleted.');
    }

    // ── Members ──

    public function membersIndex(MemberMatchRecordService $matchRecords)
    {
        $members = SiteMember::with('user:id,name,email')
            ->orderBy('sort_order')
            ->paginate(30);

        $records = $matchRecords->forMembers(collect($members->items()));

        $members->through(function (SiteMember $member) use ($records) {
            $record = $records[$member->id] ?? ['wins' => 0, 'losses' => 0];
            $member->wins = $record['wins'];
            $member->losses = $record['losses'];

            return $member;
        });

        return Inertia::render('Admin/Content/Members', ['members' => $members]);
    }

    public function memberStore(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'role' => 'required|string|max:50',
            'rank' => 'required|string|max:10',
            'bey' => 'nullable|string|max:100',
            'joined' => 'nullable|string|max:50',
            'image' => 'nullable|image|max:5120',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            $data['image_url'] = ImageOptimizer::storeOptimized($request->file('image'), 'member-images', 800, 82, 400);
        }
        unset($data['image']);

        $data['wins'] = 0;
        $data['losses'] = 0;

        SiteMember::create($data);
        return back()->with('success', 'Member added.');
    }

    public function memberUpdate(Request $request, SiteMember $member)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'role' => 'required|string|max:50',
            'rank' => 'required|string|max:10',
            'bey' => 'nullable|string|max:100',
            'joined' => 'nullable|string|max:50',
            'image' => 'nullable|image|max:5120',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            if ($member->image_url) {
                ImageOptimizer::deleteStored($member->image_url);
            }
            $data['image_url'] = ImageOptimizer::storeOptimized($request->file('image'), 'member-images', 800, 82, 400);
        }
        unset($data['image']);

        $member->update($data);
        return back()->with('success', 'Member updated.');
    }

    public function memberDestroy(SiteMember $member)
    {
        $member->delete();
        return back()->with('success', 'Member deleted.');
    }

    public function memberProvisionAccount(SiteMember $member, MemberAccountService $service, MemberMatchRecordService $matchRecords)
    {
        if ($member->user_id) {
            return back()->with('error', "{$member->name} already has a linked TournamentX account.");
        }

        $user = $service->provisionForMember($member);
        $matchRecords->syncMember($member->fresh());

        return back()->with('success', "TournamentX account created for {$member->name} ({$user->email}).");
    }

    // ── Jersey / Merch ──

    public function jerseyIndex()
    {
        $items = JerseyItem::orderBy('sort_order')->paginate(20);
        return Inertia::render('Admin/Content/Jersey', ['items' => $items]);
    }

    public function jerseyStore(Request $request)
    {
        $data = $this->validateJerseyItem($request, requireImage: true);

        $data['image_url'] = ImageOptimizer::storeOptimized($request->file('image'), 'shop-images', 1000);
        unset($data['image']);

        JerseyItem::create($data);

        return back()->with('success', 'Item created.');
    }

    public function jerseyUpdate(Request $request, JerseyItem $item)
    {
        $data = $this->validateJerseyItem($request);

        if ($request->hasFile('image')) {
            $this->deleteJerseyImage($item->image_url);
            $data['image_url'] = ImageOptimizer::storeOptimized($request->file('image'), 'shop-images', 1000);
        }
        unset($data['image']);

        $item->update($data);

        return back()->with('success', 'Item updated.');
    }

    public function jerseyDestroy(JerseyItem $item)
    {
        $this->deleteJerseyImage($item->image_url);
        $item->delete();

        return back()->with('success', 'Item deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateJerseyItem(Request $request, bool $requireImage = false): array
    {
        if (! $request->has('sizes')) {
            $request->merge(['sizes' => []]);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => ['required', Rule::in([JerseyItem::CATEGORY_JERSEY, JerseyItem::CATEGORY_BEYBLADE_PART])],
            'price' => 'required|numeric|min:0|max:9999999.99',
            'sizes' => [
                Rule::requiredIf(fn () => $request->input('category') === JerseyItem::CATEGORY_JERSEY),
                'array',
                Rule::when(
                    fn () => $request->input('category') === JerseyItem::CATEGORY_JERSEY,
                    ['min:1']
                ),
            ],
            'sizes.*' => 'string|max:50',
            'color' => 'nullable|string|max:100',
            'material' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'facebook_url' => 'nullable|string|max:500',
            'image' => ($requireImage ? 'required|' : 'nullable|').'image|max:5120',
            'available' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $data['sizes'] = array_values(array_filter(
            array_map('trim', $data['sizes'] ?? []),
            fn ($size) => $size !== ''
        ));

        $data['price'] = round((float) $data['price'], 2);
        $data['facebook_url'] = self::normalizeFacebookUrl($data['facebook_url'] ?? null);

        return $data;
    }

    private static function normalizeFacebookUrl(?string $url): ?string
    {
        if ($url === null || trim($url) === '') {
            return null;
        }

        $trimmed = trim($url);
        if (! preg_match('~^https?://~i', $trimmed)) {
            $trimmed = 'https://'.$trimmed;
        }

        if (! filter_var($trimmed, FILTER_VALIDATE_URL)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'facebook_url' => 'Please enter a valid Facebook link (e.g. https://www.facebook.com/yourpage).',
            ]);
        }

        $host = parse_url($trimmed, PHP_URL_HOST);
        if (! is_string($host) || ! preg_match('/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)m\.me$/i', $host)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'facebook_url' => 'Link must be a Facebook page or Messenger URL.',
            ]);
        }

        return $trimmed;
    }

    private function deleteJerseyImage(?string $imageUrl): void
    {
        if (! $imageUrl || str_starts_with($imageUrl, 'http://') || str_starts_with($imageUrl, 'https://')) {
            return;
        }

        \Illuminate\Support\Facades\Storage::disk('public')->delete($imageUrl);
    }
}
