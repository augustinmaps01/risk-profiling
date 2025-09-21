<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enhanced Role and Permission Middleware
 *
 * This middleware provides comprehensive role-based access control with
 * support for both role and permission checking, as well as role exclusions.
 */
class RolePermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  string  $type  - either 'role', 'permission', or 'role_exclusive'
     * @param  mixed  ...$arguments  - roles/permissions to check
     */
    public function handle(Request $request, Closure $next, string $type, ...$arguments): Response
    {
        if (! auth()->check()) {
            return $this->unauthorizedResponse();
        }

        $user = auth()->user();

        // Log the access attempt for audit purposes
        Log::info('Role/Permission middleware check', [
            'user_id' => $user->id,
            'email' => $user->email,
            'type' => $type,
            'arguments' => $arguments,
            'route' => $request->route()?->getName() ?? $request->path(),
            'ip' => $request->ip(),
        ]);

        switch ($type) {
            case 'role':
                return $this->checkRoles($request, $next, $user, $arguments);

            case 'permission':
                return $this->checkPermissions($request, $next, $user, $arguments);

            case 'role_exclusive':
                return $this->checkRoleExclusive($request, $next, $user, $arguments);

            case 'role_or_permission':
                return $this->checkRoleOrPermission($request, $next, $user, $arguments);

            default:
                Log::warning('Invalid middleware type provided', [
                    'type' => $type,
                    'user_id' => $user->id,
                ]);

                return $this->forbiddenResponse('Invalid access control type.');
        }
    }

    /**
     * Check if user has any of the specified roles
     */
    private function checkRoles(Request $request, Closure $next, $user, array $roles): Response
    {
        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                return $next($request);
            }
        }

        Log::warning('Access denied - insufficient role', [
            'user_id' => $user->id,
            'required_roles' => $roles,
            'user_roles' => $user->roles->pluck('slug')->toArray(),
        ]);

        return $this->forbiddenResponse('You do not have the required role to access this resource.');
    }

    /**
     * Check if user has any of the specified permissions
     */
    private function checkPermissions(Request $request, Closure $next, $user, array $permissions): Response
    {
        foreach ($permissions as $permission) {
            if ($user->hasPermission($permission)) {
                return $next($request);
            }
        }

        Log::warning('Access denied - insufficient permission', [
            'user_id' => $user->id,
            'required_permissions' => $permissions,
            'user_permissions' => $this->getUserPermissions($user),
        ]);

        return $this->forbiddenResponse('You do not have the required permission to access this resource.');
    }

    /**
     * Check role exclusive access - certain roles are blocked from accessing specific routes
     */
    private function checkRoleExclusive(Request $request, Closure $next, $user, array $excludedRoles): Response
    {
        foreach ($excludedRoles as $role) {
            if ($user->hasRole($role)) {
                Log::info('Access denied - role exclusion', [
                    'user_id' => $user->id,
                    'excluded_role' => $role,
                    'route' => $request->path(),
                ]);

                return $this->forbiddenResponse('This resource is not accessible by users with your role.');
            }
        }

        return $next($request);
    }

    /**
     * Check if user has specified role OR permission (more flexible access control)
     */
    private function checkRoleOrPermission(Request $request, Closure $next, $user, array $arguments): Response
    {
        if (count($arguments) < 2) {
            return $this->forbiddenResponse('Invalid role or permission configuration.');
        }

        $roles = explode(',', $arguments[0]);
        $permissions = explode(',', $arguments[1]);

        // Check roles first
        foreach ($roles as $role) {
            if ($user->hasRole(trim($role))) {
                return $next($request);
            }
        }

        // Check permissions if no role matches
        foreach ($permissions as $permission) {
            if ($user->hasPermission(trim($permission))) {
                return $next($request);
            }
        }

        Log::warning('Access denied - insufficient role or permission', [
            'user_id' => $user->id,
            'required_roles' => $roles,
            'required_permissions' => $permissions,
            'user_roles' => $user->roles->pluck('slug')->toArray(),
            'user_permissions' => $this->getUserPermissions($user),
        ]);

        return $this->forbiddenResponse('You do not have the required role or permission to access this resource.');
    }

    /**
     * Get all user permissions for logging
     */
    private function getUserPermissions($user): array
    {
        return $user->roles
            ->flatMap(function ($role) {
                return $role->permissions->pluck('slug');
            })
            ->unique()
            ->values()
            ->toArray();
    }

    /**
     * Return unauthorized response
     */
    private function unauthorizedResponse(): Response
    {
        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated. Please log in to access this resource.',
            'code' => 'UNAUTHENTICATED',
        ], 401);
    }

    /**
     * Return forbidden response
     */
    private function forbiddenResponse(string $message = 'Access denied.'): Response
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'code' => 'FORBIDDEN',
        ], 403);
    }
}
