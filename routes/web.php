<?php

use App\Http\Controllers\AdminContentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EventRegistrationController;
use App\Http\Controllers\TournamentController;
use Illuminate\Support\Facades\Route;

Route::get('/', [\App\Http\Controllers\SitePageController::class, 'home'])->name('home');

Route::get('/members', [\App\Http\Controllers\SitePageController::class, 'members'])->name('members');
Route::get('/events', [\App\Http\Controllers\SitePageController::class, 'events'])->name('events');
Route::get('/blog', [\App\Http\Controllers\SitePageController::class, 'blog'])->name('blog');
Route::get('/blog/{post}', [\App\Http\Controllers\SitePageController::class, 'blogShow'])->name('blog.show');
Route::get('/jersey', [\App\Http\Controllers\SitePageController::class, 'jersey'])->name('jersey');

Route::get('/dashboard', [TournamentController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/t/{tournament:slug}', [TournamentController::class, 'showPublic'])->name('tournaments.public');
Route::get('/t/{tournament:slug}/live', [TournamentController::class, 'liveData'])->name('tournaments.liveDataPublic');
Route::get('/t/{tournament:slug}/judge', [TournamentController::class, 'judgeLogin'])->name('judge.login');
Route::post('/t/{tournament:slug}/judge', [TournamentController::class, 'judgeVerify'])->name('judge.verify');
Route::get('/t/{tournament:slug}/judge/panel', [TournamentController::class, 'judgePanel'])->name('judge.panel');
Route::post('/t/{tournament:slug}/judge/matches/{match}/report', [TournamentController::class, 'judgeReportMatch'])->name('judge.report');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/my-events', [AdminContentController::class, 'userEventsIndex'])->name('my-events');
    Route::get('/my-events/{event}/registrations', [AdminContentController::class, 'eventRegistrations'])->name('my-events.registrations');
    Route::post('/my-events', [AdminContentController::class, 'eventStore'])->name('my-events.store');
    Route::put('/my-events/{event}', [AdminContentController::class, 'eventUpdate'])->name('my-events.update');
    Route::delete('/my-events/{event}', [AdminContentController::class, 'eventDestroy'])->name('my-events.destroy');

    Route::post('/events/{event}/register', [EventRegistrationController::class, 'register'])->name('events.register');
    Route::post('/registrations/{registration}/confirm', [EventRegistrationController::class, 'confirm'])->name('registrations.confirm');
    Route::post('/registrations/{registration}/reject', [EventRegistrationController::class, 'reject'])->name('registrations.reject');

    Route::get('/private-file/payment-qr/{event}', function (\App\Models\SiteEvent $event) {
        if (!$event->payment_qr || !\Illuminate\Support\Facades\Storage::exists($event->payment_qr)) {
            abort(404);
        }
        return \Illuminate\Support\Facades\Storage::response($event->payment_qr);
    })->name('private.payment-qr');

    Route::get('/private-file/payment-proof/{registration}', function (\App\Models\EventRegistration $registration) {
        $event = $registration->event;
        if (!auth()->user()->isAdmin() && $event->user_id !== auth()->id()) {
            abort(403);
        }
        if (!$registration->payment_proof || !\Illuminate\Support\Facades\Storage::exists($registration->payment_proof)) {
            abort(404);
        }
        return \Illuminate\Support\Facades\Storage::response($registration->payment_proof);
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
    Route::post('/tournaments/{tournament}/matches/{match}/report', [TournamentController::class, 'reportMatch'])->name('matches.report');
    Route::get('/tournaments/{tournament}/live', [TournamentController::class, 'liveData'])->name('tournaments.liveData');
    Route::delete('/tournaments/{tournament}', [TournamentController::class, 'destroy'])->name('tournaments.destroy');

    Route::post('/tournaments/{tournament}/participants', [ParticipantController::class, 'store'])->name('participants.store');
    Route::post('/tournaments/{tournament}/participants/bulk', [ParticipantController::class, 'bulkStore'])->name('participants.bulk');
    Route::post('/tournaments/{tournament}/participants/randomize', [ParticipantController::class, 'randomize'])->name('participants.randomize');
    Route::patch('/tournaments/{tournament}/participants/{participant}/judge', [ParticipantController::class, 'updateJudge'])->name('participants.updateJudge');
    Route::delete('/tournaments/{tournament}/participants/{participantId}', [ParticipantController::class, 'destroy'])->name('participants.destroy');
});

Route::get('/admin/login', [AdminLoginController::class, 'create'])->name('admin.login');
Route::post('/admin/login', [AdminLoginController::class, 'store'])->name('admin.login.store');

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
    Route::patch('/users/{user}/role', [AdminController::class, 'updateUserRole'])->name('users.role');
    Route::post('/users/{user}/tournament-access', [AdminController::class, 'toggleTournamentAccess'])->name('users.tournamentAccess');
    Route::patch('/users/{user}/permissions', [AdminController::class, 'updatePermissions'])->name('users.permissions');
    Route::get('/tournaments', [AdminController::class, 'tournaments'])->name('tournaments');
    Route::delete('/tournaments/{tournament}', [AdminController::class, 'deleteTournament'])->name('tournaments.delete');

    Route::get('/content/blog', [AdminContentController::class, 'blogIndex'])->name('content.blog');
    Route::post('/content/blog', [AdminContentController::class, 'blogStore'])->name('content.blog.store');
    Route::put('/content/blog/{post}', [AdminContentController::class, 'blogUpdate'])->name('content.blog.update');
    Route::delete('/content/blog/{post}', [AdminContentController::class, 'blogDestroy'])->name('content.blog.destroy');

    Route::get('/content/events', [AdminContentController::class, 'eventsIndex'])->name('content.events');
    Route::post('/content/events', [AdminContentController::class, 'eventStore'])->name('content.events.store');
    Route::put('/content/events/{event}', [AdminContentController::class, 'eventUpdate'])->name('content.events.update');
    Route::delete('/content/events/{event}', [AdminContentController::class, 'eventDestroy'])->name('content.events.destroy');

    Route::get('/content/members', [AdminContentController::class, 'membersIndex'])->name('content.members');
    Route::post('/content/members', [AdminContentController::class, 'memberStore'])->name('content.members.store');
    Route::put('/content/members/{member}', [AdminContentController::class, 'memberUpdate'])->name('content.members.update');
    Route::delete('/content/members/{member}', [AdminContentController::class, 'memberDestroy'])->name('content.members.destroy');

    Route::get('/content/jersey', [AdminContentController::class, 'jerseyIndex'])->name('content.jersey');
    Route::post('/content/jersey', [AdminContentController::class, 'jerseyStore'])->name('content.jersey.store');
    Route::put('/content/jersey/{item}', [AdminContentController::class, 'jerseyUpdate'])->name('content.jersey.update');
    Route::delete('/content/jersey/{item}', [AdminContentController::class, 'jerseyDestroy'])->name('content.jersey.destroy');
});

require __DIR__.'/auth.php';
