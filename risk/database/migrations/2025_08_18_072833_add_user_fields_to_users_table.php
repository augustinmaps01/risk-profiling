<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
            $table->string('first_name')->after('username');
            $table->char('middle_initial', 1)->nullable()->after('first_name');
            $table->string('last_name')->after('middle_initial');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('password');
            $table->string('profile_pic')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
