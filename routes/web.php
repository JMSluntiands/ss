<?php

use App\Http\Controllers\EventRegistrationController;
use App\Http\Controllers\MemberAuthController;
use App\Http\Controllers\MemberDashboardController;
use App\Services\MemberDashboardStatsService;
use App\Support\TournamentXDomain;
use Illuminate\Support\Facades\Route;

$registerMainSite = function (): void {
    Route::get('/site-assets/logo', fn () => \App\Support\SiteAssets::logoResponse())->name('site.logo');
    Route::get('/site-assets/tournamentx-logo', fn () => \App\Support\SiteAssets::tournamentXLogoResponse())->name('site.tournamentx-logo');

    Route::get('/', [\App\Http\Controllers\SitePageController::class, 'home'])->name('home');

    Route::get('/members', [\App\Http\Controllers\SitePageController::class, 'members'])->name('members');
    Route::get('/members/{member}', [\App\Http\Controllers\SitePageController::class, 'memberShow'])->name('members.show');
    Route::get('/events', [\App\Http\Controllers\SitePageController::class, 'events'])->name('events');
    Route::get('/events/{event}', [\App\Http\Controllers\SitePageController::class, 'eventShow'])->name('events.show');
    Route::get('/blog', [\App\Http\Controllers\SitePageController::class, 'blog'])->name('blog');
    Route::get('/blog/{post}', [\App\Http\Controllers\SitePageController::class, 'blogShow'])->name('blog.show');
    Route::get('/jersey', [\App\Http\Controllers\SitePageController::class, 'jersey'])->name('jersey');

    Route::post('/events/{event}/register', [EventRegistrationController::class, 'register'])
        ->name('events.register');

    Route::middleware('guest')->group(function () {
        Route::get('/member/login', [MemberAuthController::class, 'create'])->name('member.login');
        Route::post('/member/login', [MemberAuthController::class, 'store'])->name('member.login.store');
    });

    Route::middleware('auth')->post('/member/logout', [MemberAuthController::class, 'destroy'])->name('member.logout');

    Route::middleware(['auth', 'site.member'])->prefix('member')->name('member.')->group(function () {
        Route::get('/dashboard', [MemberDashboardController::class, 'index'])->name('dashboard');
        Route::put('/password', [MemberDashboardController::class, 'updatePassword'])->name('password');
    });

    Route::get('/private-file/payment-qr/{event}', function (\App\Models\SiteEvent $event) {
        if (! $event->payment_qr || ! \Illuminate\Support\Facades\Storage::exists($event->payment_qr)) {
            abort(404);
        }

        return \Illuminate\Support\Facades\Storage::response($event->payment_qr);
    })->name('private.payment-qr');

    Route::any('/admin/{any?}', fn () => abort(404))->where('any', '.*');
};

$registerTournamentRedirects = function (): void {
    $to = fn (string $path) => redirect()->away(TournamentXDomain::url($path));

    Route::get('/login', fn () => $to('/login'));
    Route::get('/register', fn () => $to('/register'));
    Route::get('/forgot-password', fn () => $to('/forgot-password'));
    Route::get('/dashboard', function () use ($to) {
        $user = auth()->user();
        if ($user && app(MemberDashboardStatsService::class)->isMemberDashboardUser($user)) {
            return redirect()->route('member.dashboard');
        }

        return $to('/dashboard');
    });
    Route::get('/profile', fn () => $to('/profile'));
    Route::get('/my-events', fn () => $to('/my-events'));
    Route::get('/my-events/{any}', fn () => $to('/my-events'))->where('any', '.*');
    Route::get('/tournaments', fn () => $to('/dashboard'));
    Route::get('/tournaments/{any}', fn () => $to('/dashboard'))->where('any', '.*');
    Route::get('/t/{any}', fn () => $to('/'))->where('any', '.*');
};

$mainDomain = config('tournamentx.main_domain');

$registerPlatformAdmin = function (): void {
    require __DIR__.'/platform_admin.php';
};

if ($mainDomain) {
    Route::domain($mainDomain)->group(function () use ($registerMainSite, $registerTournamentRedirects, $registerPlatformAdmin): void {
        $registerMainSite();
        $registerPlatformAdmin();
        if (TournamentXDomain::isEnabled()) {
            $registerTournamentRedirects();
        }
    });
} else {
    $registerMainSite();
    $registerPlatformAdmin();
    if (TournamentXDomain::isEnabled()) {
        $registerTournamentRedirects();
    }
}
