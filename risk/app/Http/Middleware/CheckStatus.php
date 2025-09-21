<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $user = auth()->user();

        if ($user->status !== 'active') {
            auth()->logout();

            return response()->json([
                'success' => false,
                'message' => 'Account is inactive. Please contact administrator.',
            ], 403);
        }

        return $next($request);
    }
}
