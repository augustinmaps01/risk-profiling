<?php

namespace App\Console\Commands;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Console\Command;

class AssignAdminPermissions extends Command
{
    protected $signature = 'admin:assign-permissions';

    protected $description = 'Assign all necessary permissions to admin role';

    public function handle()
    {
        $this->info('Assigning permissions to admin role...');

        $admin = Role::where('slug', 'admin')->first();

        if (! $admin) {
            $this->error('Admin role not found!');

            return Command::FAILURE;
        }

        $permissions = Permission::all();

        $assigned = 0;
        foreach ($permissions as $permission) {
            if (! $admin->permissions()->where('permission_id', $permission->id)->exists()) {
                $admin->permissions()->attach($permission->id);
                $assigned++;
                $this->line("✓ Assigned: {$permission->name} ({$permission->slug})");
            } else {
                $this->line("- Already has: {$permission->name} ({$permission->slug})");
            }
        }

        $this->info("Complete! Assigned {$assigned} new permissions to admin role.");
        $this->info("Admin role now has {$admin->permissions()->count()} total permissions.");

        return Command::SUCCESS;
    }
}
