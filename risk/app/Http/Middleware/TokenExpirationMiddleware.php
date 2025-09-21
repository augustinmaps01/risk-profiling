<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class TokenExpirationMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if request has bearer token
        if ($request->bearerToken()) {
            $token = PersonalAccessToken::findToken($request->bearerToken());

            if ($token) {
                $now = Carbon::now();

                // Check expires_at first (most accurate)
                if ($token->expires_at && $token->expires_at->isPast()) {
                    $token->delete();

                    return response()->json([
                        'success' => false,
                        'message' => 'Token has expired',
                        'error_code' => 'TOKEN_EXPIRED',
                        'expired_at' => $token->expires_at->toISOString(),
                    ], 401);
                }

                // Fallback to Sanctum configuration if no expires_at
                $expirationMinutes = (int) config('sanctum.expiration', 10);
                if ($expirationMinutes && $token->created_at->addMinutes($expirationMinutes)->isPast()) {
                    $token->delete();

                    return response()->json([
                        'success' => false,
                        'message' => 'Token has expired (by creation time)',
                        'error_code' => 'TOKEN_EXPIRED',
                        'created_at' => $token->created_at->toISOString(),
                        'expiration_minutes' => $expirationMinutes,
                    ], 401);
                }

                // Check for role-specific expiration rules
                $user = $token->tokenable;
                if ($user && $user->roles) {
                    foreach ($user->roles as $role) {
                        // Compliance officers and regular users both get 10-minute sessions
                        if (in_array($role->slug, ['compliance', 'users'])) {
                            $roleExpirationMinutes = 10; // 10 minutes for both roles

                            if ($token->created_at->addMinutes($roleExpirationMinutes)->isPast()) {
                                $token->delete();

                                return response()->json([
                                    'success' => false,
                                    'message' => 'Session expired due to security policy',
                                    'error_code' => 'ROLE_SESSION_EXPIRED',
                                ], 401);
                            }
                        }
                    }
                }
            }
        }

        return $next($request);
    }
}
