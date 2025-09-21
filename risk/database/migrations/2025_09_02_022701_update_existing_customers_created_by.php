<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing customers with null created_by to use the first admin/user
        $firstUser = User::first();

        if ($firstUser) {
            Customer::whereNull('created_by')
                ->update(['created_by' => $firstUser->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Set created_by back to null for customers that were updated
        Customer::whereNotNull('created_by')
            ->update(['created_by' => null]);
    }
};
