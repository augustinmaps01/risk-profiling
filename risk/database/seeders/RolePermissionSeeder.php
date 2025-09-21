<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // User Management
            ['name' => 'View Users', 'slug' => 'view-users'],
            ['name' => 'Manage Users', 'slug' => 'manage-users'],

            // Role Management
            ['name' => 'View Roles', 'slug' => 'view-roles'],
            ['name' => 'Manage Roles', 'slug' => 'manage-roles'],

            // Permission Management
            ['name' => 'View Permissions', 'slug' => 'view-permissions'],
            ['name' => 'Manage Permissions', 'slug' => 'manage-permissions'],

            // Customer Management
            ['name' => 'View Customers', 'slug' => 'view-customers'],
            ['name' => 'Manage Customers', 'slug' => 'manage-customers'],

            // Risk Assessment
            ['name' => 'View Risk Assessments', 'slug' => 'view-risk-assessments'],
            ['name' => 'Create Risk Assessments', 'slug' => 'create-risk-assessments'],
            ['name' => 'Edit Risk Assessments', 'slug' => 'edit-risk-assessments'],
            ['name' => 'Delete Risk Assessments', 'slug' => 'delete-risk-assessments'],

            // Risk Settings
            ['name' => 'View Risk Settings', 'slug' => 'view-risk-settings'],
            ['name' => 'Manage Risk Settings', 'slug' => 'manage-risk-settings'],

            // Dashboard & Analytics
            ['name' => 'View Basic Dashboard', 'slug' => 'view-basic-dashboard'],
            ['name' => 'View Admin Dashboard', 'slug' => 'view-admin-dashboard'],
            ['name' => 'View Branch Analytics', 'slug' => 'view-branch-analytics'],
            ['name' => 'View System Analytics', 'slug' => 'view-system-analytics'],

            // Reports
            ['name' => 'View Basic Reports', 'slug' => 'view-basic-reports'],
            ['name' => 'View Advanced Reports', 'slug' => 'view-advanced-reports'],
            ['name' => 'Export Reports', 'slug' => 'export-reports'],

            // System Settings
            ['name' => 'View System Settings', 'slug' => 'view-system-settings'],
            ['name' => 'Manage System Settings', 'slug' => 'manage-system-settings'],

            // Audit Logs
            ['name' => 'View Audit Logs', 'slug' => 'view-audit-logs'],
            ['name' => 'Manage Audit Logs', 'slug' => 'manage-audit-logs'],

            // Branch Management
            ['name' => 'View Branches', 'slug' => 'view-branches'],
            ['name' => 'Manage Branches', 'slug' => 'manage-branches'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['slug' => $permission['slug']], $permission);
        }

        // Create roles
        $adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Administrator']
        );

        $managerRole = Role::firstOrCreate(
            ['slug' => 'manager'],
            ['name' => 'Manager']
        );

        $complianceRole = Role::firstOrCreate(
            ['slug' => 'compliance'],
            ['name' => 'Compliance Officer']
        );

        $userRole = Role::firstOrCreate(
            ['slug' => 'users'],
            ['name' => 'Regular User']
        );

        // Assign permissions to roles
        $adminPermissions = Permission::all();
        $adminRole->permissions()->sync($adminPermissions->pluck('id'));

        $compliancePermissions = Permission::whereIn('slug', [
            'view-users', 'view-roles', 'view-permissions',
            'view-customers', 'manage-customers',
            'view-risk-assessments', 'edit-risk-assessments',
            'view-risk-settings', 'manage-risk-settings',
            'view-basic-dashboard', 'view-branch-analytics',
            'view-advanced-reports', 'export-reports',
            'view-audit-logs', 'view-branches',
        ])->get();
        $complianceRole->permissions()->sync($compliancePermissions->pluck('id'));

        $managerPermissions = Permission::whereIn('slug', [
            'view-users', 'view-roles', 'view-permissions',
            'view-customers', 'manage-customers',
            'view-risk-assessments', 'edit-risk-assessments',
            'view-basic-dashboard', 'view-branch-analytics',
            'view-basic-reports', 'view-branches',
        ])->get();
        $managerRole->permissions()->sync($managerPermissions->pluck('id'));

        $userPermissions = Permission::whereIn('slug', [
            'view-customers',
            'view-risk-assessments', 'create-risk-assessments', 'edit-risk-assessments',
        ])->get();
        $userRole->permissions()->sync($userPermissions->pluck('id'));

        // Create default admin user
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'status' => 'active',
                'branch_id' => 1, // Head Office
                'email_verified_at' => now(),
            ]
        );

        $adminUser->roles()->sync([$adminRole->id]);

        // Create default manager user
        $managerUser = User::firstOrCreate(
            ['email' => 'manager@example.com'],
            [
                'first_name' => 'System',
                'last_name' => 'Manager',
                'username' => 'manager',
                'password' => Hash::make('password'),
                'status' => 'active',
                'branch_id' => 1, // Head Office
                'email_verified_at' => now(),
            ]
        );

        $managerUser->roles()->sync([$managerRole->id]);

        // Create default compliance user
        $complianceUser = User::firstOrCreate(
            ['email' => 'compliance@example.com'],
            [
                'first_name' => 'System',
                'last_name' => 'Compliance',
                'username' => 'compliance',
                'password' => Hash::make('password'),
                'status' => 'active',
                'branch_id' => 1, // Head Office
                'email_verified_at' => now(),
            ]
        );

        $complianceUser->roles()->sync([$complianceRole->id]);
    }
}
