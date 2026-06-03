<?php

use App\Http\Controllers\AdminContentController;
use App\Http\Controllers\EventRegistrationController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\TournamentHubController;
use Illuminate\Support\Facades\Route;

Route::get('/csrf-cookie', [TournamentController::class, 'csrfCookie'])->name('csrf.cookie');

Route::get('/site-assets/logo', fn () => \App\Support\SiteAssets::logoResponse())->name('site.logo');
Route::get('/site-assets/tournamentx-logo', fn () => \App\Support\SiteAssets::tournamentXLogoResponse())->name('site.tournamentx-logo');

if (config('tournamentx.domain')) {
    Route::get('/', function () {
        if (auth()->check()) {
            return redirect()->route('dashboard');
        }

        return redirect()->route('login');
    })->name('tournamentx.home');
}

Route::get('/dashboard', [TournamentController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/communities', [TournamentHubController::class, 'communities'])->name('communities');
    Route::get('/discover', [TournamentHubController::class, 'discover'])->name('discover');
    Route::get('/news', [TournamentHubController::class, 'news'])->name('news');
});

Route::get('/t/{tournament:slug}', [TournamentController::class, 'showPublic'])->name('tournaments.public');
Route::get('/t/{tournament:slug}/live', [TournamentController::class, 'liveData'])->name('tournaments.liveDataPublic');
Route::get('/t/{tournament:slug}/matches', [TournamentController::class, 'playerMatching'])->name('tournaments.playerMatching');
Route::get('/t/{tournament:slug}/matches/live', [TournamentController::class, 'playerMatchingLive'])->name('tournaments.playerMatchingLive');
Route::get('/t/{tournament:slug}/judge', [TournamentController::class, 'judgeLogin'])->name('judge.login');
Route::post('/t/{tournament:slug}/judge', [TournamentController::class, 'judgeVerify'])->name('judge.verify');
Route::get('/t/{tournament:slug}/judge/panel', [TournamentController::class, 'judgePanel'])->name('judge.panel');
Route::post('/t/{tournament:slug}/judge/matches/{match}/report', [TournamentController::class, 'judgeReportMatch'])->name('judge.report');
Route::patch('/t/{tournament:slug}/judge/matches/{match}/live-score', [TournamentController::class, 'judgeUpdateMatchLiveScore'])->name('judge.liveScore');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/my-events', [AdminContentController::class, 'userEventsIndex'])->name('my-events');
    Route::get('/my-events/{event}/registrations', [AdminContentController::class, 'eventRegistrations'])->name('my-events.registrations');
    Route::post('/registrations/{registration}/confirm', [EventRegistrationController::class, 'confirm'])->name('registrations.confirm');
    Route::post('/registrations/{registration}/reject', [EventRegistrationController::class, 'reject'])->name('registrations.reject');
    Route::delete('/registrations/{registration}', [EventRegistrationController::class, 'destroy'])->name('registrations.destroy');
    Route::post('/my-events', [AdminContentController::class, 'eventStore'])->name('my-events.store');
    Route::put('/my-events/{event}', [AdminContentController::class, 'eventUpdate'])->name('my-events.update');
    Route::delete('/my-events/{event}', [AdminContentController::class, 'eventDestroy'])->name('my-events.destroy');

    Route::get('/private-file/payment-qr/{event}', function (\App\Models\SiteEvent $event) {
        if (! $event->payment_qr || ! \Illuminate\Support\Facades\Storage::disk('local')->exists($event->payment_qr)) {
            abort(404);
        }

        return \Illuminate\Support\Facades\Storage::disk('local')->response($event->payment_qr);
    })->name('private.payment-qr');

    Route::get('/private-file/payment-proof/{registration}', function (\App\Models\EventRegistration $registration) {
        $event = $registration->event;
        if (! auth()->user()->isAdmin() && $event->user_id !== auth()->id()) {
            abort(403);
        }
        if (! $registration->payment_proof || ! \Illuminate\Support\Facades\Storage::disk('local')->exists($registration->payment_proof)) {
            abort(404);
        }

        return \Illuminate\Support\Facades\Storage::disk('local')->response($registration->payment_proof);
    })->name('private.payment-proof');

    Route::get('/tournaments/create', [TournamentController::class, 'create'])->name('tournaments.create');
    Route::post('/tournaments', [TournamentController::class, 'store'])->name('tournaments.store');
    Route::get('/tournaments/{tournament}', [TournamentController::class, 'show'])->name('tournaments.show');
    Route::get('/tournaments/{tournament}/edit', [TournamentController::class, 'edit'])->name('tournaments.edit');
    Route::put('/tournaments/{tournament}', [TournamentController::class, 'update'])->name('tournaments.update');
    Route::post('/tournaments/{tournament}/start', [TournamentController::class, 'start'])->name('tournaments.start');
    Route::post('/tournaments/{tournament}/next-round', [TournamentController::class, 'nextRound'])->name('tournaments.nextRound');
    Route::post('/tournaments/{tournament}/reset-finals', [TournamentController::class, 'resetFinals'])->name('tournaments.resetFinals');
    Route::patch('/tournaments/{tournament}/stadiums', [TournamentController::class, 'updateStadiums'])->name('tournaments.updateStadiums');
    Route::post('/tournaments/{tournament}/judge-code', [TournamentController::class, 'generateJudgeCode'])->name('tournaments.generateJudgeCode');
    Route::patch('/tournaments/{tournament}/matches/{match}/status', [TournamentController::class, 'setMatchStatus'])->name('matches.setStatus');
    Route::patch('/tournaments/{tournament}/matches/{match}/live-score', [TournamentController::class, 'updateMatchLiveScore'])->name('matches.liveScore');
    Route::patch('/tournaments/{tournament}/matches/{match}/players', [TournamentController::class, 'updateMatchPlayers'])->name('matches.updatePlayers');
    Route::post('/tournaments/{tournament}/matches/{match}/report', [TournamentController::class, 'reportMatch'])->name('matches.report');
    Route::get('/tournaments/{tournament}/live', [TournamentController::class, 'liveData'])->name('tournaments.liveData');
    Route::delete('/tournaments/{tournament}', [TournamentController::class, 'destroy'])->name('tournaments.destroy');

    Route::get('/tournaments/{tournament}/participant-accounts', [ParticipantController::class, 'searchAccounts'])->name('participants.searchAccounts');
    Route::post('/tournaments/{tournament}/participants/link-accounts', [ParticipantController::class, 'linkAccounts'])->name('participants.linkAccounts');
    Route::post('/tournaments/{tournament}/participants', [ParticipantController::class, 'store'])->name('participants.store');
    Route::post('/tournaments/{tournament}/participants/bulk', [ParticipantController::class, 'bulkStore'])->name('participants.bulk');
    Route::patch('/tournaments/{tournament}/participants/{participant}/link', [ParticipantController::class, 'linkParticipant'])->name('participants.link');
    Route::post('/tournaments/{tournament}/participants/randomize', [ParticipantController::class, 'randomize'])->name('participants.randomize');
    Route::patch('/tournaments/{tournament}/participants/{participant}/judge', [ParticipantController::class, 'updateJudge'])->name('participants.updateJudge');
    Route::post('/tournaments/{tournament}/participants/{participant}/avatar', [ParticipantController::class, 'updateAvatar'])->name('participants.updateAvatar');
    Route::delete('/tournaments/{tournament}/participants/{participantId}', [ParticipantController::class, 'destroy'])->name('participants.destroy');
});

require __DIR__.'/auth.php';
