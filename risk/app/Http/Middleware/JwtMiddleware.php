<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class JwtMiddleware
{
    /**
     * Handle an incoming request with JWT token validation.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        try {
            // Get token from Authorization header
            $token = $request->bearerToken();

            if (! $token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            // Find the token in the database
            $accessToken = PersonalAccessToken::findToken($token);

            if (! $accessToken) {
                return $this->unauthorizedResponse('Invalid token');
            }

            // Check if token is expired
            if ($accessToken->expires_at && $accessToken->expires_at->isPast()) {
                // Delete expired token
                $accessToken->delete();

                return $this->unauthorizedResponse('Token expired');
            }

            // Get the tokenable (user) associated with this token
            $user = $accessToken->tokenable;

            if (! $user) {
                return $this->unauthorizedResponse('User not found');
            }

            // Check if user is still active
            if ($user->status !== 'active') {
                return $this->unauthorizedResponse('Account inactive');
            }

            // Set the authenticated user
            Auth::setUser($user);

            // Update last used timestamp
            $accessToken->update(['last_used_at' => now()]);

            // Add token info to request for potential use
            $request->attributes->add([
                'token_id' => $accessToken->id,
                'token_created' => $accessToken->created_at,
                'token_expires' => $accessToken->expires_at,
            ]);

            return $next($request);

        } catch (\Exception $e) {
            return $this->unauthorizedResponse('Authentication failed: '.$e->getMessage());
        }
    }

    /**
     * Return unauthorized response.
     */
    private function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error_code' => 'UNAUTHORIZED',
        ], 401);
    }
}
