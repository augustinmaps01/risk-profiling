<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserActivityResource;
use App\Models\UserActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserActivityController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'status']);
        $this->middleware('role:admin')->except(['index', 'show', 'stats']);
    }

    public function index(Request $request): JsonResponse
    {
        $query = UserActivity::with(['user.roles'])
            ->orderBy('performed_at', 'desc');

        // Filter by date range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        // Filter by action
        if ($request->filled('action')) {
            $query->byAction($request->action);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->byUser($request->user_id);
        }

        // Filter by entity type
        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        // Search in description
        if ($request->filled('search')) {
            $query->where('description', 'ILIKE', '%'.$request->search.'%');
        }

        $activities = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => UserActivityResource::collection($activities),
            'meta' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
            ],
        ]);
    }

    public function show(UserActivity $activity): JsonResponse
    {
        $activity->load(['user.roles']);

        return response()->json([
            'success' => true,
            'data' => new UserActivityResource($activity),
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->subDays(30));
        $endDate = $request->get('end_date', now());

        $totalActivities = UserActivity::dateRange($startDate, $endDate)->count();

        $topActions = UserActivity::dateRange($startDate, $endDate)
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $topUsers = UserActivity::with('user')
            ->dateRange($startDate, $endDate)
            ->selectRaw('user_id, COUNT(*) as activity_count')
            ->groupBy('user_id')
            ->orderBy('activity_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($activity) {
                return [
                    'user' => [
                        'id' => $activity->user->id,
                        'name' => $activity->user->name,
                        'email' => $activity->user->email,
                    ],
                    'activity_count' => $activity->activity_count,
                ];
            });

        $dailyActivity = UserActivity::dateRange($startDate, $endDate)
            ->selectRaw('DATE(performed_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_activities' => $totalActivities,
                'top_actions' => $topActions,
                'top_users' => $topUsers,
                'daily_activity' => $dailyActivity,
                'date_range' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ],
        ]);
    }
}
