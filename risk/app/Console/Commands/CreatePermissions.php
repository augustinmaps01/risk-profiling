<?php

namespace App\Console\Commands;

use App\Models\Permission;
use Illuminate\Console\Command;

class CreatePermissions extends Command
{
    protected $signature = 'permissions:create';

    protected $description = 'Create default permissions for the system';

    public function handle()
    {
        $this->info('Creating default permissions...');

        $permissions = [
            // Permission Management
            [
                'name' => 'View Permissions',
                'slug' => 'view-permissions',
            ],
            [
                'name' => 'Manage Permissions',
                'slug' => 'manage-permissions',
            ],
            // System Settings
            [
                'name' => 'View System Settings',
                'slug' => 'view-system-settings',
            ],
            [
                'name' => 'Manage System Settings',
                'slug' => 'manage-system-settings',
            ],
            // User Management
            [
                'name' => 'View Users',
                'slug' => 'view-users',
            ],
            [
                'name' => 'Manage Users',
                'slug' => 'manage-users',
            ],
            // Role Management
            [
                'name' => 'View Roles',
                'slug' => 'view-roles',
            ],
            [
                'name' => 'Manage Roles',
                'slug' => 'manage-roles',
            ],
        ];

        $created = 0;
        $existing = 0;

        foreach ($permissions as $permissionData) {
            $permission = Permission::firstOrCreate(
                ['slug' => $permissionData['slug']],
                $permissionData
            );

            if ($permission->wasRecentlyCreated) {
                $created++;
                $this->line("Created: {$permissionData['name']} ({$permissionData['slug']})");
            } else {
                $existing++;
                $this->line("Exists: {$permissionData['name']} ({$permissionData['slug']})");
            }
        }

        $this->info("Permission creation complete! Created: {$created}, Already existed: {$existing}");

        return Command::SUCCESS;
    }
}
