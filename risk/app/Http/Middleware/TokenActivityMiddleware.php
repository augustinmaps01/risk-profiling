<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TokenActivityMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Only track authenticated requests
        if ($request->user()) {
            $user = $request->user();
            $token = $request->user()->currentAccessToken();

            // Cache user activity for role-based tracking (both token and session auth)
            $cacheKey = "user_activity:{$user->id}";
            Cache::put($cacheKey, [
                'user_id' => $user->id,
                'token_id' => ($token && property_exists($token, 'id')) ? $token->id : null,
                'last_activity' => Carbon::now()->toISOString(),
                'roles' => $user->roles->pluck('slug')->toArray(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ], now()->addMinutes(15)); // Keep activity record for 15 minutes

            // Only handle token expiration for API token authentication (not session-based)
            if ($token && method_exists($token, 'update') && $request->bearerToken()) {
                // Update token's last used timestamp (only for actual API tokens)
                $token->update(['last_used_at' => Carbon::now()]);

                // Check if token should be expired due to inactivity
                $inactivityTimeout = 10; // 10 minutes

                if ($token->last_used_at &&
                    Carbon::parse($token->last_used_at)->diffInMinutes(Carbon::now()) > $inactivityTimeout) {

                    // Token inactive for more than 10 minutes - delete it
                    $token->delete();

                    return response()->json([
                        'success' => false,
                        'message' => 'Session expired due to inactivity',
                        'error_code' => 'SESSION_INACTIVE',
                    ], 401);
                }
            }
        }

        return $next($request);
    }
}
