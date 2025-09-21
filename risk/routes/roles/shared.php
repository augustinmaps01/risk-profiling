<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BranchController;
use Illuminate\Support\Facades\Route;

// CSRF Cookie route for session-based authentication
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
})->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

// Public routes - stateless API endpoints (no authentication required)
Route::post('/auth/register', [AuthController::class, 'register'])->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);
Route::post('/auth/login', [AuthController::class, 'login'])->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);
Route::post('/auth/validate-reset-token', [AuthController::class, 'validateResetToken'])->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);

// Public branch routes for registration
Route::get('/branches/dropdown', [BranchController::class, 'dropdown']);

// Shared authenticated routes - accessible by all authenticated users
Route::middleware(['auth:sanctum', 'status'])->group(function () {

    // Authentication routes - shared by all roles
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/upload-profile-picture', [AuthController::class, 'uploadProfilePicture']);
        Route::get('/tokens', [AuthController::class, 'tokens']);
        Route::delete('/tokens/{tokenId}', [AuthController::class, 'revokeToken']);

        // Enhanced JWT token management
        Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
        Route::get('/validate-token', [AuthController::class, 'validateToken']);
        Route::post('/revoke-token', [AuthController::class, 'revokeToken']);
    });

});

// Rate limited routes - applies to all API routes
Route::middleware(['throttle:api'])->group(function () {
    // All API routes are automatically rate limited
});
