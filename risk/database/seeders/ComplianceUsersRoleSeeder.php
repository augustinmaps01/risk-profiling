<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class ComplianceUsersRoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create Compliance role
        $complianceRole = Role::firstOrCreate(
            ['slug' => 'compliance'],
            ['name' => 'Compliance']
        );

        // Create Users role (if not exists already as 'user')
        $usersRole = Role::firstOrCreate(
            ['slug' => 'users'],
            ['name' => 'Users']
        );

        // Define permissions for Compliance role
        $compliancePermissions = Permission::whereIn('slug', [
            'view-users',
            'view-roles',
            'view-permissions',
            'view-customers',
            'manage-customers',
        ])->get();

        // Define permissions for Users role
        $usersPermissions = Permission::whereIn('slug', [
            'view-customers',
        ])->get();

        // Assign permissions to roles
        $complianceRole->permissions()->sync($compliancePermissions->pluck('id'));
        $usersRole->permissions()->sync($usersPermissions->pluck('id'));

        $this->command->info('Compliance and Users roles created successfully!');
        $this->command->info('Compliance role has permissions: '.$compliancePermissions->pluck('name')->implode(', '));
        $this->command->info('Users role has permissions: '.$usersPermissions->pluck('name')->implode(', '));
    }
}
