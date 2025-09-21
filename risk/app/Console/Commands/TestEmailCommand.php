<?php

namespace App\Console\Commands;

use App\Mail\AdminPasswordResetMail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:email {email?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email functionality by sending a test password reset email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email') ?? 'test@example.com';

        $this->info('Testing email functionality...');
        $this->info('Mail driver: '.config('mail.default'));
        $this->info('From address: '.config('mail.from.address'));
        $this->info('To email: '.$email);

        // Create a fake user for testing
        $testUser = new User;
        $testUser->first_name = 'Test';
        $testUser->last_name = 'User';
        $testUser->email = $email;

        try {
            Mail::to($email)->send(new AdminPasswordResetMail($testUser, 'TEST123456', 'Test Admin'));

            if (config('mail.default') === 'log') {
                $this->info('✅ Email logged successfully! Check storage/logs/laravel.log');
            } else {
                $this->info('✅ Email sent successfully!');
            }

        } catch (\Exception $e) {
            $this->error('❌ Email failed to send: '.$e->getMessage());
            $this->error('Check your mail configuration in .env file');

            return 1;
        }

        return 0;
    }
}
