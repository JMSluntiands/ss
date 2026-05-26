<?php

use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TournamentController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return \Inertia\Inertia::render('Welcome');
})->name('home');

Route::get('/members', function () {
    return \Inertia\Inertia::render('Members');
})->name('members');

Route::get('/events', function () {
    return \Inertia\Inertia::render('Event');
})->name('events');

Route::get('/blog', function () {
    return \Inertia\Inertia::render('Blog');
})->name('blog');

Route::get('/jersey', function () {
    return \Inertia\Inertia::render('Jersey');
})->name('jersey');

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

require __DIR__.'/auth.php';
