<?php

namespace App\Console\Commands;

use App\Models\SystemSetting;
use Illuminate\Console\Command;

class InitializeSystemSettings extends Command
{
    protected $signature = 'system:init-settings';

    protected $description = 'Initialize default system settings';

    public function handle()
    {
        $this->info('Initializing default system settings...');

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

        $created = 0;
        $updated = 0;

        foreach ($defaults as $default) {
            $setting = SystemSetting::firstOrCreate(
                ['key' => $default['key']],
                $default
            );

            if ($setting->wasRecentlyCreated) {
                $created++;
                $this->line("Created: {$default['key']}");
            } else {
                $updated++;
                $this->line("Exists: {$default['key']}");
            }
        }

        $this->info("Initialization complete! Created: {$created}, Already existed: {$updated}");

        return Command::SUCCESS;
    }
}
