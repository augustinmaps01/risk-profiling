<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Criteria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CriteriaController extends Controller
{
    /**
     * Display a listing of the criteria.
     */
    public function index(): JsonResponse
    {
        try {
            $criteria = Criteria::withCount('options')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($criterion) {
                    return [
                        'id' => $criterion->id,
                        'category' => $criterion->category,
                        'options_count' => $criterion->options_count,
                        'created_at' => $criterion->created_at ? $criterion->created_at->format('Y-m-d') : null,
                        'updated_at' => $criterion->updated_at ? $criterion->updated_at->format('Y-m-d') : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $criteria,
                'message' => 'Criteria retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve criteria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created criteria in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'category' => 'required|string|max:255|unique:criteria,category',
            ]);

            $criteria = Criteria::create([
                'category' => $request->category,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $criteria->id,
                    'category' => $criteria->category,
                    'options_count' => 0,
                    'created_at' => $criteria->created_at ? $criteria->created_at->format('Y-m-d') : null,
                    'updated_at' => $criteria->updated_at ? $criteria->updated_at->format('Y-m-d') : null,
                ],
                'message' => 'Criteria created successfully',
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create criteria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified criteria.
     */
    public function show(Criteria $criteria): JsonResponse
    {
        try {
            $criteria->load('options');

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $criteria->id,
                    'category' => $criteria->category,
                    'options' => $criteria->options->map(function ($option) {
                        return [
                            'id' => $option->id,
                            'label' => $option->label,
                            'points' => $option->points,
                        ];
                    }),
                    'created_at' => $criteria->created_at ? $criteria->created_at->format('Y-m-d') : null,
                    'updated_at' => $criteria->updated_at ? $criteria->updated_at->format('Y-m-d') : null,
                ],
                'message' => 'Criteria retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve criteria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified criteria in storage.
     */
    public function update(Request $request, Criteria $criteria): JsonResponse
    {
        try {
            $request->validate([
                'category' => 'required|string|max:255|unique:criteria,category,'.$criteria->id,
            ]);

            $criteria->update([
                'category' => $request->category,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $criteria->id,
                    'category' => $criteria->category,
                    'options_count' => $criteria->options()->count(),
                    'created_at' => $criteria->created_at ? $criteria->created_at->format('Y-m-d') : null,
                    'updated_at' => $criteria->updated_at ? $criteria->updated_at->format('Y-m-d') : null,
                ],
                'message' => 'Criteria updated successfully',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update criteria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified criteria from storage.
     */
    public function destroy(Criteria $criteria): JsonResponse
    {
        try {
            // Count options before deletion for response
            $optionsCount = $criteria->options()->count();

            // Delete the criteria (options will be cascade deleted due to foreign key constraint)
            $criteria->delete();

            return response()->json([
                'success' => true,
                'message' => "Criteria deleted successfully. {$optionsCount} associated options were also removed.",
                'data' => [
                    'deleted_criteria_id' => $criteria->id,
                    'deleted_options_count' => $optionsCount,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete criteria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get criteria for dropdown/select options
     */
    public function dropdown(): JsonResponse
    {
        try {
            $criteria = Criteria::orderBy('category')
                ->get(['id', 'category']);

            return response()->json([
                'success' => true,
                'data' => $criteria,
                'message' => 'Criteria dropdown data retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve criteria dropdown',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
