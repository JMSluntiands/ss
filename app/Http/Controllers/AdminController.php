<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\JerseyItem;
use App\Models\SiteEvent;
use App\Models\SiteMember;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        ]);

        $data['password'] = bcrypt($data['password']);
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
        ]);
    }

    public function updateUserRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:user,admin',
        ]);

        if ($user->id === auth()->id() && $request->role !== 'admin') {
            return back()->with('error', 'You cannot remove your own admin role.');
        }

        $user->update(['role' => $request->role]);

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
