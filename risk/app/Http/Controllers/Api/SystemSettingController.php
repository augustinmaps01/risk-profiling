<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SystemSettingController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'status']);
        $this->middleware('permission:manage-system-settings')->except(['index', 'show', 'getByGroup']);
        $this->middleware('permission:view-system-settings')->only(['index', 'show', 'getByGroup']);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $group = $request->get('group');

            $query = SystemSetting::orderBy('group')->orderBy('key');

            if ($group) {
                $query->where('group', $group);
            }

            $settings = $query->get();

            return response()->json([
                'success' => true,
                'data' => $settings,
                'message' => 'Settings retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve settings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(string $key): JsonResponse
    {
        try {
            $setting = SystemSetting::where('key', $key)->first();

            if (! $setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $setting,
                'message' => 'Setting retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve setting',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'settings' => 'required|array',
                'settings.*.key' => 'required|string',
                'settings.*.value' => 'nullable',
                'settings.*.type' => 'required|in:string,number,boolean,array,object',
                'settings.*.group' => 'required|string',
                'settings.*.description' => 'nullable|string',
            ]);

            foreach ($request->settings as $settingData) {
                SystemSetting::setValue(
                    $settingData['key'],
                    $settingData['value'],
                    $settingData['type'],
                    $settingData['group'],
                    $settingData['description'] ?? null
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
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
                'message' => 'Failed to update settings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getByGroup(string $group): JsonResponse
    {
        try {
            $settings = SystemSetting::where('group', $group)->orderBy('key')->get();

            return response()->json([
                'success' => true,
                'data' => $settings,
                'message' => 'Settings retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve settings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function initializeDefaults(): JsonResponse
    {
        try {
            $defaults = [
                // General Settings
                [
                    'key' => 'system_name',
                    'value' => 'Risk Profiling System',
                    'type' => 'string',
                    'group' => 'general',
                    'description' => 'The name of the system displayed in the interface',
                ],
                [
                    'key' => 'system_logo',
                    'value' => null,
                    'type' => 'string',
                    'group' => 'general',
                    'description' => 'URL or path to the system logo',
                ],
                [
                    'key' => 'timezone',
                    'value' => 'Asia/Manila',
                    'type' => 'string',
                    'group' => 'general',
                    'description' => 'Default system timezone',
                ],
                [
                    'key' => 'date_format',
                    'value' => 'Y-m-d',
                    'type' => 'string',
                    'group' => 'general',
                    'description' => 'Default date format for display',
                ],
                [
                    'key' => 'time_format',
                    'value' => 'H:i:s',
                    'type' => 'string',
                    'group' => 'general',
                    'description' => 'Default time format for display',
                ],
                // Security Settings
                [
                    'key' => 'auto_logout_minutes',
                    'value' => 10,
                    'type' => 'number',
                    'group' => 'security',
                    'description' => 'Auto logout time in minutes (0 for never)',
                ],
                [
                    'key' => 'session_lifetime',
                    'value' => 120,
                    'type' => 'number',
                    'group' => 'security',
                    'description' => 'Session lifetime in minutes',
                ],
                [
                    'key' => 'token_expiration_minutes',
                    'value' => 60,
                    'type' => 'number',
                    'group' => 'security',
                    'description' => 'API token expiration in minutes (0 for never expire)',
                ],
                [
                    'key' => 'password_min_length',
                    'value' => 8,
                    'type' => 'number',
                    'group' => 'security',
                    'description' => 'Minimum password length requirement',
                ],
                [
                    'key' => 'require_password_uppercase',
                    'value' => true,
                    'type' => 'boolean',
                    'group' => 'security',
                    'description' => 'Require uppercase letter in password',
                ],
                [
                    'key' => 'require_password_lowercase',
                    'value' => true,
                    'type' => 'boolean',
                    'group' => 'security',
                    'description' => 'Require lowercase letter in password',
                ],
                [
                    'key' => 'require_password_numbers',
                    'value' => true,
                    'type' => 'boolean',
                    'group' => 'security',
                    'description' => 'Require numbers in password',
                ],
                [
                    'key' => 'require_password_symbols',
                    'value' => true,
                    'type' => 'boolean',
                    'group' => 'security',
                    'description' => 'Require symbols in password',
                ],
            ];

            foreach ($defaults as $default) {
                SystemSetting::firstOrCreate(
                    ['key' => $default['key']],
                    $default
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Default settings initialized successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize default settings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);

            $file = $request->file('logo');
            $filename = 'system_logo_'.time().'.'.$file->getClientOriginalExtension();

            // Store the file in the public disk under 'logos' directory
            $path = $file->storeAs('logos', $filename, 'public');

            // Delete the old logo if it exists
            $oldLogo = SystemSetting::getValue('system_logo');
            if ($oldLogo && Storage::disk('public')->exists(str_replace('/storage/', '', $oldLogo))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldLogo));
            }

            // Create the full URL for the logo
            $logoUrl = '/storage/'.$path;

            // Update the system setting
            SystemSetting::setValue(
                'system_logo',
                $logoUrl,
                'string',
                'general',
                'URL or path to the system logo'
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'logo_url' => $logoUrl,
                    'filename' => $filename,
                ],
                'message' => 'Logo uploaded successfully',
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
                'message' => 'Failed to upload logo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteLogo(): JsonResponse
    {
        try {
            $oldLogo = SystemSetting::getValue('system_logo');

            if ($oldLogo && Storage::disk('public')->exists(str_replace('/storage/', '', $oldLogo))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldLogo));
            }

            // Remove the system setting
            SystemSetting::setValue(
                'system_logo',
                null,
                'string',
                'general',
                'URL or path to the system logo'
            );

            return response()->json([
                'success' => true,
                'message' => 'Logo deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete logo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
