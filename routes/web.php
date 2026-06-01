<?php

use App\Http\Controllers\AdminContentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\EventRegistrationController;
use App\Support\TournamentXDomain;
use Illuminate\Support\Facades\Route;

$registerMainSite = function (): void {
    Route::get('/site-assets/logo', fn () => \App\Support\SiteAssets::logoResponse())->name('site.logo');
    Route::get('/site-assets/tournamentx-logo', fn () => \App\Support\SiteAssets::tournamentXLogoResponse())->name('site.tournamentx-logo');

    Route::get('/', [\App\Http\Controllers\SitePageController::class, 'home'])->name('home');

    Route::get('/members', [\App\Http\Controllers\SitePageController::class, 'members'])->name('members');
    Route::get('/events', [\App\Http\Controllers\SitePageController::class, 'events'])->name('events');
    Route::get('/events/{event}', [\App\Http\Controllers\SitePageController::class, 'eventShow'])->name('events.show');
    Route::get('/blog', [\App\Http\Controllers\SitePageController::class, 'blog'])->name('blog');
    Route::get('/blog/{post}', [\App\Http\Controllers\SitePageController::class, 'blogShow'])->name('blog.show');
    Route::get('/jersey', [\App\Http\Controllers\SitePageController::class, 'jersey'])->name('jersey');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::post('/events/{event}/register', [EventRegistrationController::class, 'register'])->name('events.register');
        Route::post('/registrations/{registration}/confirm', [EventRegistrationController::class, 'confirm'])->name('registrations.confirm');
        Route::post('/registrations/{registration}/reject', [EventRegistrationController::class, 'reject'])->name('registrations.reject');

        Route::get('/private-file/payment-qr/{event}', function (\App\Models\SiteEvent $event) {
            if (! $event->payment_qr || ! \Illuminate\Support\Facades\Storage::exists($event->payment_qr)) {
                abort(404);
            }

            return \Illuminate\Support\Facades\Storage::response($event->payment_qr);
        })->name('private.payment-qr');
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
};

$registerTournamentRedirects = function (): void {
    $to = fn (string $path) => redirect()->away(TournamentXDomain::url($path));

    Route::get('/login', fn () => $to('/login'));
    Route::get('/register', fn () => $to('/register'));
    Route::get('/forgot-password', fn () => $to('/forgot-password'));
    Route::get('/dashboard', fn () => $to('/dashboard'));
    Route::get('/profile', fn () => $to('/profile'));
    Route::get('/my-events', fn () => $to('/my-events'));
    Route::get('/my-events/{any}', fn () => $to('/my-events'))->where('any', '.*');
    Route::get('/tournaments', fn () => $to('/dashboard'));
    Route::get('/tournaments/{any}', fn () => $to('/dashboard'))->where('any', '.*');
    Route::get('/t/{any}', fn () => $to('/'))->where('any', '.*');
};

$mainDomain = config('tournamentx.main_domain');

if ($mainDomain) {
    Route::domain($mainDomain)->group(function () use ($registerMainSite, $registerTournamentRedirects): void {
        $registerMainSite();
        if (TournamentXDomain::isEnabled()) {
            $registerTournamentRedirects();
        }
    });
} else {
    $registerMainSite();
    if (TournamentXDomain::isEnabled()) {
        $registerTournamentRedirects();
    }
}
