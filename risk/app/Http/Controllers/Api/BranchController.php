<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    /**
     * Display a listing of branches.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Branch::query();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('branch_name', 'like', "%{$search}%")
                    ->orWhere('brak', 'like', "%{$search}%")
                    ->orWhere('brcode', 'like', "%{$search}%");
            });
        }

        // Filter by branch code
        if ($request->has('brcode')) {
            $query->where('brcode', $request->brcode);
        }

        // Order by branch name by default
        $branches = $query->orderBy('branch_name')->get();

        return response()->json([
            'success' => true,
            'data' => $branches,
        ]);
    }

    /**
     * Display the specified branch.
     */
    public function show(Branch $branch): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $branch,
        ]);
    }

    /**
     * Get branches for dropdown/select components.
     */
    public function dropdown(): JsonResponse
    {
        $branches = Branch::select('id', 'branch_name', 'brak', 'brcode')
            ->orderBy('brcode')
            ->get()
            ->map(function ($branch) {
                return [
                    'value' => $branch->id,
                    'label' => $branch->display_name,
                    'branch_name' => $branch->branch_name,
                    'brcode' => $branch->brcode,
                    'brak' => $branch->brak,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $branches,
        ]);
    }

    /**
     * Get branch statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_branches' => Branch::count(),
            'main_branches' => Branch::whereNotLike('brak', '%-BLU')->count(),
            'lite_branches' => Branch::whereLike('brak', '%-BLU')->count(),
            'head_office' => Branch::where('brcode', '00')->exists(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
