<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'status']);
        // Temporarily disabled for testing
        // $this->middleware('role:admin|compliance')->only(['index', 'show', 'stats']);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            // Check if the table exists and add some debug info
            $tableExists = \Schema::hasTable('audit_logs');
            if (! $tableExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Audit logs table does not exist',
                    'error' => 'database_table_missing',
                ], 500);
            }

            $query = AuditLog::with(['user.roles'])
                ->orderBy('created_at', 'desc');

            // Filter by date range
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('created_at', [
                    $request->start_date.' 00:00:00',
                    $request->end_date.' 23:59:59',
                ]);
            }

            // Filter by action
            if ($request->filled('action')) {
                $query->where('action', $request->action);
            }

            // Filter by user
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // Filter by resource type
            if ($request->filled('resource_type')) {
                $query->where('resource_type', $request->resource_type);
            }

            // Filter by resource id
            if ($request->filled('resource_id')) {
                $query->where('resource_id', $request->resource_id);
            }

            // Search in IP address
            if ($request->filled('ip_address')) {
                $query->where('ip_address', 'ILIKE', '%'.$request->ip_address.'%');
            }

            $auditLogs = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => AuditLogResource::collection($auditLogs),
                'meta' => [
                    'current_page' => $auditLogs->currentPage(),
                    'last_page' => $auditLogs->lastPage(),
                    'per_page' => $auditLogs->perPage(),
                    'total' => $auditLogs->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch audit logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(AuditLog $auditLog): JsonResponse
    {
        $auditLog->load(['user.roles']);

        return response()->json([
            'success' => true,
            'data' => new AuditLogResource($auditLog),
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->subDays(30)->startOfDay());
        $endDate = $request->get('end_date', now()->endOfDay());

        $totalLogs = AuditLog::whereBetween('created_at', [$startDate, $endDate])->count();

        $topActions = AuditLog::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $topUsers = AuditLog::with('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('user_id, COUNT(*) as log_count')
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->orderBy('log_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'user' => [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ],
                    'log_count' => $log->log_count,
                ];
            });

        $topResourceTypes = AuditLog::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('resource_type, COUNT(*) as count')
            ->whereNotNull('resource_type')
            ->groupBy('resource_type')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $dailyActivity = AuditLog::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $ipAddresses = AuditLog::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('ip_address, COUNT(*) as count')
            ->whereNotNull('ip_address')
            ->groupBy('ip_address')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_logs' => $totalLogs,
                'top_actions' => $topActions,
                'top_users' => $topUsers,
                'top_resource_types' => $topResourceTypes,
                'daily_activity' => $dailyActivity,
                'top_ip_addresses' => $ipAddresses,
                'date_range' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ],
        ]);
    }

    public function userActivity(Request $request, $userId): JsonResponse
    {
        $query = AuditLog::with(['user.roles'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc');

        // Filter by date range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date.' 00:00:00',
                $request->end_date.' 23:59:59',
            ]);
        }

        $auditLogs = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => AuditLogResource::collection($auditLogs),
            'meta' => [
                'current_page' => $auditLogs->currentPage(),
                'last_page' => $auditLogs->lastPage(),
                'per_page' => $auditLogs->perPage(),
                'total' => $auditLogs->total(),
            ],
        ]);
    }
}
