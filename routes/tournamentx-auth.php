<?php

use App\Http\Controllers\TournamentX\Auth\AuthenticatedSessionController;
use App\Http\Controllers\TournamentX\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest:tournamentx')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware(['auth:tournamentx', 'organizer.account'])->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
