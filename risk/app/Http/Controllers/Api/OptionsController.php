<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Criteria;
use App\Models\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OptionsController extends Controller
{
    /**
     * Display a listing of the options.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Options::with('criteria');

            // Filter by criteria if provided
            if ($request->has('criteria_id') && $request->criteria_id) {
                $query->where('criteria_id', $request->criteria_id);
            }

            $options = $query->orderBy('criteria_id')
                ->orderBy('points')
                ->get()
                ->map(function ($option) {
                    return [
                        'id' => $option->id,
                        'label' => $option->label,
                        'points' => $option->points,
                        'criteria_id' => $option->criteria_id,
                        'criteria_category' => $option->criteria->category ?? 'Unknown',
                        'created_at' => $option->created_at ? $option->created_at->format('Y-m-d') : null,
                        'updated_at' => $option->updated_at ? $option->updated_at->format('Y-m-d') : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $options,
                'message' => 'Options retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve options',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created option in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'label' => 'required|string|max:255',
                'points' => 'required|integer|min:1|max:10',
                'criteria_id' => 'required|exists:criteria,id',
            ]);

            // Check for duplicate label within the same criteria
            $existingOption = Options::where('criteria_id', $request->criteria_id)
                ->where('label', $request->label)
                ->first();

            if ($existingOption) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => [
                        'label' => ['An option with this label already exists in the selected criteria.'],
                    ],
                ], 422);
            }

            $option = Options::create([
                'label' => $request->label,
                'points' => $request->points,
                'criteria_id' => $request->criteria_id,
            ]);

            $option->load('criteria');

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $option->id,
                    'label' => $option->label,
                    'points' => $option->points,
                    'criteria_id' => $option->criteria_id,
                    'criteria_category' => $option->criteria->category,
                    'created_at' => $option->created_at ? $option->created_at->format('Y-m-d') : null,
                    'updated_at' => $option->updated_at ? $option->updated_at->format('Y-m-d') : null,
                ],
                'message' => 'Option created successfully',
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
                'message' => 'Failed to create option',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified option.
     */
    public function show(Options $option): JsonResponse
    {
        try {
            $option->load('criteria');

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $option->id,
                    'label' => $option->label,
                    'points' => $option->points,
                    'criteria_id' => $option->criteria_id,
                    'criteria_category' => $option->criteria->category,
                    'created_at' => $option->created_at ? $option->created_at->format('Y-m-d') : null,
                    'updated_at' => $option->updated_at ? $option->updated_at->format('Y-m-d') : null,
                ],
                'message' => 'Option retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve option',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified option in storage.
     */
    public function update(Request $request, Options $option): JsonResponse
    {
        try {
            $request->validate([
                'label' => 'required|string|max:255',
                'points' => 'required|integer|min:1|max:10',
                'criteria_id' => 'required|exists:criteria,id',
            ]);

            // Check for duplicate label within the same criteria (excluding current option)
            $existingOption = Options::where('criteria_id', $request->criteria_id)
                ->where('label', $request->label)
                ->where('id', '!=', $option->id)
                ->first();

            if ($existingOption) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => [
                        'label' => ['An option with this label already exists in the selected criteria.'],
                    ],
                ], 422);
            }

            $option->update([
                'label' => $request->label,
                'points' => $request->points,
                'criteria_id' => $request->criteria_id,
            ]);

            $option->load('criteria');

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $option->id,
                    'label' => $option->label,
                    'points' => $option->points,
                    'criteria_id' => $option->criteria_id,
                    'criteria_category' => $option->criteria->category,
                    'created_at' => $option->created_at ? $option->created_at->format('Y-m-d') : null,
                    'updated_at' => $option->updated_at ? $option->updated_at->format('Y-m-d') : null,
                ],
                'message' => 'Option updated successfully',
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
                'message' => 'Failed to update option',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified option from storage.
     */
    public function destroy(Options $option): JsonResponse
    {
        try {
            $optionId = $option->id;
            $optionLabel = $option->label;

            $option->delete();

            return response()->json([
                'success' => true,
                'message' => "Option '{$optionLabel}' deleted successfully.",
                'data' => [
                    'deleted_option_id' => $optionId,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete option',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get options by criteria ID
     */
    public function getByCriteria(Request $request, $criteriaId): JsonResponse
    {
        try {
            $criteria = Criteria::findOrFail($criteriaId);

            $options = Options::where('criteria_id', $criteriaId)
                ->orderBy('points')
                ->get()
                ->map(function ($option) use ($criteria) {
                    return [
                        'id' => $option->id,
                        'label' => $option->label,
                        'points' => $option->points,
                        'criteria_id' => $option->criteria_id,
                        'criteria_category' => $criteria->category,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $options,
                'message' => "Options for '{$criteria->category}' retrieved successfully",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve options for criteria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
