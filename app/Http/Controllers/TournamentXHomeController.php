<?php

namespace App\Http\Controllers;

use App\Support\TournamentXAuth;
use App\Support\TournamentXMarketing;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TournamentXHomeController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $user = TournamentXAuth::user();

        if ($user) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('TournamentX/Home', TournamentXMarketing::inertiaProps());
    }
}
