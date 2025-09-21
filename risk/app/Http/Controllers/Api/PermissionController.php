<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PermissionRequest;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'status']);
        $this->middleware('permission:manage-permissions')->except(['index', 'show']);
        $this->middleware('permission:view-permissions')->only(['index', 'show']);
    }

    public function index(): JsonResponse
    {
        $permissions = Permission::with('roles')->get();

        return response()->json([
            'success' => true,
            'data' => PermissionResource::collection($permissions),
        ]);
    }

    public function store(PermissionRequest $request): JsonResponse
    {
        $permission = Permission::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Permission created successfully',
            'data' => new PermissionResource($permission),
        ], 201);
    }

    public function show(Permission $permission): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new PermissionResource($permission),
        ]);
    }

    public function update(PermissionRequest $request, Permission $permission): JsonResponse
    {
        $permission->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Permission updated successfully',
            'data' => new PermissionResource($permission),
        ]);
    }

    public function destroy(Permission $permission): JsonResponse
    {
        if ($permission->roles()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete permission. It is assigned to roles.',
            ], 422);
        }

        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Permission deleted successfully',
        ]);
    }

    public function assignToRole(Request $request, Permission $permission): JsonResponse
    {
        $request->validate([
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        $permission->roles()->syncWithoutDetaching([$request->role_id]);

        return response()->json([
            'success' => true,
            'message' => 'Permission assigned to role successfully',
        ]);
    }

    public function removeFromRole(Request $request, Permission $permission): JsonResponse
    {
        $request->validate([
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        $permission->roles()->detach($request->role_id);

        return response()->json([
            'success' => true,
            'message' => 'Permission removed from role successfully',
        ]);
    }
}
