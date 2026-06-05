<?php

use App\Http\Controllers\AdminContentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminPlatformController;
use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Middleware\ConfigurePlatformAdminSession;
use App\Support\PlatformAdmin;
use Illuminate\Support\Facades\Route;

Route::middleware([ConfigurePlatformAdminSession::class, 'web'])
    ->prefix(PlatformAdmin::pathPrefix())
    ->name('admin.')
    ->group(function (): void {
        Route::middleware('guest:platform_admin')->group(function (): void {
            Route::get('/login', [AdminLoginController::class, 'create'])->name('login');
            Route::post('/login', [AdminLoginController::class, 'store'])->name('login.store');
        });

        Route::middleware(['auth:platform_admin', 'admin'])->group(function (): void {
            Route::post('/logout', [AdminLoginController::class, 'destroy'])->name('logout');

            Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');

            Route::get('/platform/pricing', [AdminPlatformController::class, 'pricing'])->name('platform.pricing');
            Route::put('/platform/pricing', [AdminPlatformController::class, 'updatePricing'])->name('platform.pricing.update');
            Route::post('/platform/pricing/reset', [AdminPlatformController::class, 'resetPricing'])->name('platform.pricing.reset');
            Route::get('/platform/sites', [AdminPlatformController::class, 'sites'])->name('platform.sites');
            Route::put('/platform/promo', [AdminPlatformController::class, 'updatePromo'])->name('platform.promo.update');
            Route::post('/platform/promo/reset', [AdminPlatformController::class, 'resetPromo'])->name('platform.promo.reset');

            Route::get('/users', [AdminController::class, 'users'])->name('users');
            Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
            Route::patch('/users/{user}/role', [AdminController::class, 'updateUserRole'])->name('users.role');
            Route::post('/users/{user}/tournament-access', [AdminController::class, 'toggleTournamentAccess'])->name('users.tournamentAccess');
            Route::patch('/users/{user}/permissions', [AdminController::class, 'updatePermissions'])->name('users.permissions');
            Route::patch('/users/{user}/plan', [AdminController::class, 'updateUserPlan'])->name('users.plan');
            Route::get('/plan-requests', [AdminController::class, 'planRequests'])->name('plan-requests');
            Route::post('/plan-requests/{planUpgradeRequest}/approve', [AdminController::class, 'approvePlanRequest'])->name('plan-requests.approve');
            Route::post('/plan-requests/{planUpgradeRequest}/reject', [AdminController::class, 'rejectPlanRequest'])->name('plan-requests.reject');
            Route::get('/plan-requests/{planUpgradeRequest}/payment-proof', [AdminController::class, 'planRequestPaymentProof'])->name('plan-requests.payment-proof');
            Route::get('/platform/plan-upgrade-payment/qr', [AdminPlatformController::class, 'planUpgradePaymentQr'])->name('platform.plan-upgrade-payment.qr');
            Route::post('/platform/plan-upgrade-payment', [AdminPlatformController::class, 'updatePlanUpgradePayment'])->name('platform.plan-upgrade-payment.update');
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
            Route::post('/content/members/{member}/provision-account', [AdminContentController::class, 'memberProvisionAccount'])->name('content.members.provision');
            Route::put('/content/members/{member}/password', [AdminContentController::class, 'memberUpdatePassword'])->name('content.members.password');
            Route::delete('/content/members/{member}', [AdminContentController::class, 'memberDestroy'])->name('content.members.destroy');

            Route::get('/content/jersey', [AdminContentController::class, 'jerseyIndex'])->name('content.jersey');
            Route::post('/content/jersey', [AdminContentController::class, 'jerseyStore'])->name('content.jersey.store');
            Route::put('/content/jersey/{item}', [AdminContentController::class, 'jerseyUpdate'])->name('content.jersey.update');
            Route::delete('/content/jersey/{item}', [AdminContentController::class, 'jerseyDestroy'])->name('content.jersey.destroy');
        });
    });
