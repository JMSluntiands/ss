<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\JerseyItem;
use App\Models\PlanUpgradeRequest;
use App\Models\SiteEvent;
use App\Models\SiteMember;
use App\Models\Tournament;
use App\Models\User;
use App\Support\TournamentXDomain;
use App\Support\TournamentXPlan;
use App\Support\UserAccountType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_tournaments' => Tournament::count(),
            'active_tournaments' => Tournament::where('status', 'active')->count(),
            'completed_tournaments' => Tournament::where('status', 'completed')->count(),
            'tournament_admins' => User::where('can_manage_tournaments', true)
                ->orWhere('role', 'admin')
                ->count(),
            'starter_plans' => User::where('tournamentx_plan', TournamentXPlan::STARTER)->count(),
            'community_plans' => User::where('tournamentx_plan', TournamentXPlan::COMMUNITY)->count(),
            'pending_plan_upgrades' => PlanUpgradeRequest::where('status', 'pending')->count(),
            'blog_posts' => BlogPost::count(),
            'site_events' => SiteEvent::count(),
            'site_members' => SiteMember::count(),
            'jersey_items' => JerseyItem::count(),
        ];

        $recentUsers = User::latest()->take(10)->get(['id', 'name', 'email', 'role', 'can_manage_tournaments', 'created_at']);

        $recentTournaments = Tournament::with('user:id,name')
            ->latest()
            ->take(10)
            ->get(['id', 'name', 'slug', 'status', 'format', 'user_id', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentTournaments' => $recentTournaments,
            'sites' => [
                'main_site_url' => TournamentXDomain::mainSiteUrl(),
                'tournamentx_url' => TournamentXDomain::baseUrl(),
                'tournamentx_home' => route('tournamentx.home', absolute: true),
            ],
        ]);
    }

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'blader_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:user,admin',
            'can_create_tournaments' => 'boolean',
            'can_manage_tournaments' => 'boolean',
            'can_use_judge' => 'boolean',
            'can_score_matches' => 'boolean',
            'can_manage_events' => 'boolean',
            'tournamentx_plan' => 'nullable|in:starter,community,pro',
        ]);

        $data['password'] = bcrypt($data['password']);
        $data['tournamentx_plan'] = $data['tournamentx_plan'] ?? TournamentXPlan::STARTER;
        $data['account_type'] = $data['role'] === 'admin'
            ? UserAccountType::ADMIN
            : UserAccountType::ORGANIZER;
        User::create($data);

        return back()->with('success', "User \"{$data['name']}\" has been created.");
    }

    public function users(Request $request)
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        $users = $query->withCount('tournaments')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
            'planOptions' => [
                ['value' => TournamentXPlan::STARTER, 'label' => 'Starter (Free)'],
                ['value' => TournamentXPlan::COMMUNITY, 'label' => 'Community'],
                ['value' => TournamentXPlan::PRO, 'label' => 'Pro'],
            ],
        ]);
    }

    public function updateUserPlan(Request $request, User $user)
    {
        $request->validate([
            'tournamentx_plan' => ['required', 'in:'.implode(',', [
                TournamentXPlan::STARTER,
                TournamentXPlan::COMMUNITY,
                TournamentXPlan::PRO,
            ])],
        ]);

        TournamentXPlan::applyEntitlements($user, $request->tournamentx_plan);

        PlanUpgradeRequest::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->update([
                'status' => 'approved',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

        return back()->with('success', "Plan updated to ".TournamentXPlan::label($request->tournamentx_plan)." for {$user->name}.");
    }

    public function planRequests()
    {
        $requests = PlanUpgradeRequest::query()
            ->with(['user:id,name,email,tournamentx_plan'])
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/PlanRequests', [
            'requests' => $requests,
            'planOptions' => [
                ['value' => TournamentXPlan::STARTER, 'label' => 'Starter (Free)'],
                ['value' => TournamentXPlan::COMMUNITY, 'label' => 'Community'],
                ['value' => TournamentXPlan::PRO, 'label' => 'Pro'],
            ],
        ]);
    }

    public function approvePlanRequest(PlanUpgradeRequest $planUpgradeRequest)
    {
        if (! $planUpgradeRequest->isPending()) {
            return back()->with('error', 'This request was already processed.');
        }

        $user = $planUpgradeRequest->user;
        TournamentXPlan::applyEntitlements($user, $planUpgradeRequest->requested_plan);

        $planUpgradeRequest->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', "Approved Community plan for {$user->name}.");
    }

    public function rejectPlanRequest(Request $request, PlanUpgradeRequest $planUpgradeRequest)
    {
        if (! $planUpgradeRequest->isPending()) {
            return back()->with('error', 'This request was already processed.');
        }

        $validated = $request->validate([
            'admin_note' => ['nullable', 'string', 'max:500'],
        ]);

        $planUpgradeRequest->update([
            'status' => 'rejected',
            'admin_note' => $validated['admin_note'] ?? null,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Upgrade request rejected.');
    }

    public function planRequestPaymentProof(PlanUpgradeRequest $planUpgradeRequest): Response
    {
        if (! $planUpgradeRequest->payment_proof || ! Storage::exists($planUpgradeRequest->payment_proof)) {
            abort(404);
        }

        return Storage::response($planUpgradeRequest->payment_proof);
    }

    public function updateUserRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:user,admin',
        ]);

        if ($user->id === auth()->id() && $request->role !== 'admin') {
            return back()->with('error', 'You cannot remove your own admin role.');
        }

        if ($user->isMemberAccount()) {
            return back()->with('error', 'Member accounts cannot be changed to admin or organizer here.');
        }

        $user->update([
            'role' => $request->role,
            'account_type' => $request->role === 'admin'
                ? UserAccountType::ADMIN
                : UserAccountType::ORGANIZER,
        ]);

        return back()->with('success', "Updated {$user->name}'s role to {$request->role}.");
    }

    public function toggleTournamentAccess(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot modify your own access.');
        }

        $user->update([
            'can_manage_tournaments' => !$user->can_manage_tournaments,
        ]);

        $status = $user->can_manage_tournaments ? 'granted' : 'revoked';
        return back()->with('success', "Tournament admin access {$status} for {$user->name}.");
    }

    public function tournaments(Request $request)
    {
        $query = Tournament::with('user:id,name');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $tournaments = $query->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Tournaments', [
            'tournaments' => $tournaments,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function updatePermissions(Request $request, User $user)
    {
        $data = $request->validate([
            'can_manage_tournaments' => 'boolean',
            'can_use_judge' => 'boolean',
            'can_score_matches' => 'boolean',
            'can_create_tournaments' => 'boolean',
            'can_manage_events' => 'boolean',
        ]);

        $user->update($data);

        return back()->with('success', "Permissions updated for {$user->name}.");
    }

    public function deleteTournament(Tournament $tournament)
    {
        $name = $tournament->name;
        $tournament->matches()->delete();
        $tournament->participants()->delete();
        $tournament->swissStandings()->delete();
        $tournament->delete();

        return back()->with('success', "Tournament \"{$name}\" has been deleted.");
    }
}
