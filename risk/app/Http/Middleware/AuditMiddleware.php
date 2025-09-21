<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Log API requests for compliance
        if ($request->is('api/*') && auth()->check()) {
            $this->logApiRequest($request, $response);
        }

        return $response;
    }

    private function logApiRequest(Request $request, Response $response): void
    {
        try {
            $action = $this->getActionFromRequest($request);
            $resourceType = $this->getResourceTypeFromRequest($request);

            if ($action && $resourceType) {
                $oldValues = $this->getOldValues($request);
                $newValues = $this->getNewValues($request, $response);

                AuditLog::create([
                    'user_id' => auth()->id(),
                    'action' => $action,
                    'resource_type' => $resourceType,
                    'resource_id' => $this->getResourceId($request),
                    'old_values' => $oldValues,
                    'new_values' => $newValues,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'session_id' => session()->getId(),
                ]);

                // Also log to user activities for certain actions
                $this->logUserActivity($request, $action, $resourceType);
            }
        } catch (\Exception $e) {
            // Log error but don't break the request
            logger()->error('Audit logging failed: '.$e->getMessage());
        }
    }

    private function getActionFromRequest(Request $request): ?string
    {
        $method = $request->method();
        $path = $request->path();

        return match ($method) {
            'GET' => 'viewed',
            'POST' => 'created',
            'PUT', 'PATCH' => 'updated',
            'DELETE' => 'deleted',
            default => null,
        };
    }

    private function getResourceTypeFromRequest(Request $request): ?string
    {
        $path = $request->path();

        if (preg_match('/api\/(\w+)/', $path, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private function getResourceId(Request $request): ?string
    {
        $segments = $request->segments();
        $lastSegment = end($segments);

        return is_numeric($lastSegment) ? $lastSegment : null;
    }

    private function getOldValues(Request $request): ?array
    {
        // For PUT/PATCH requests, try to get the current model data
        if (in_array($request->method(), ['PUT', 'PATCH'])) {
            $resourceId = $this->getResourceId($request);
            $resourceType = $this->getResourceTypeFromRequest($request);

            if ($resourceId && $resourceType) {
                try {
                    $modelClass = $this->getModelClass($resourceType);
                    if ($modelClass && class_exists($modelClass)) {
                        $model = $modelClass::find($resourceId);

                        return $model ? $model->toArray() : null;
                    }
                } catch (\Exception $e) {
                    // Ignore errors in getting old values
                }
            }
        }

        return null;
    }

    private function getNewValues(Request $request, Response $response): ?array
    {
        $data = [];

        // Add response status
        $data['response_status'] = $response->getStatusCode();
        $data['success'] = $response->isSuccessful();

        // For POST/PUT/PATCH requests, include the request data (excluding sensitive fields)
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            $requestData = $request->except([
                'password',
                'password_confirmation',
                'current_password',
                'token',
                '_token',
                '_method',
            ]);

            if (! empty($requestData)) {
                $data['request_data'] = $requestData;
            }
        }

        return ! empty($data) ? $data : null;
    }

    private function getModelClass(string $resourceType): ?string
    {
        $models = [
            'users' => \App\Models\User::class,
            'customers' => \App\Models\Customer::class,
            'criteria' => \App\Models\Criteria::class,
            'options' => \App\Models\Option::class,
            'roles' => \Spatie\Permission\Models\Role::class,
            'permissions' => \Spatie\Permission\Models\Permission::class,
        ];

        return $models[$resourceType] ?? null;
    }

    private function logUserActivity(Request $request, string $action, string $resourceType): void
    {
        // Only log certain actions to user activities
        $importantActions = ['created', 'updated', 'deleted'];
        $importantResources = ['customers', 'users', 'criteria', 'options'];

        if (in_array($action, $importantActions) && in_array($resourceType, $importantResources)) {
            try {
                $description = $this->getActivityDescription($action, $resourceType, $request);
                $entityId = $this->getResourceId($request);

                \App\Models\UserActivity::log(
                    action: $action.'_'.rtrim($resourceType, 's'),
                    description: $description,
                    entityType: ucfirst(rtrim($resourceType, 's')),
                    entityId: $entityId ? (int) $entityId : null,
                    metadata: [
                        'endpoint' => $request->getPathInfo(),
                        'method' => $request->method(),
                        'user_agent' => $request->userAgent(),
                    ]
                );
            } catch (\Exception $e) {
                logger()->error('User activity logging failed: '.$e->getMessage());
            }
        }
    }

    private function getActivityDescription(string $action, string $resourceType, Request $request): string
    {
        $resource = ucfirst(rtrim($resourceType, 's'));
        $resourceId = $this->getResourceId($request);

        switch ($action) {
            case 'created':
                return "Created new {$resource}".($resourceId ? " #{$resourceId}" : '');
            case 'updated':
                return "Updated {$resource}".($resourceId ? " #{$resourceId}" : '');
            case 'deleted':
                return "Deleted {$resource}".($resourceId ? " #{$resourceId}" : '');
            case 'viewed':
                return "Viewed {$resource}".($resourceId ? " #{$resourceId}" : ' list');
            default:
                return "Performed {$action} on {$resource}".($resourceId ? " #{$resourceId}" : '');
        }
    }
}
