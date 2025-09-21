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
        Schema::create('branch', function (Blueprint $table) {
            $table->id();
            $table->string('branch_name');
            $table->string('brak');  // Branch abbreviation/acronym
            $table->string('brcode'); // Branch code
            $table->timestamps();

            // Add indexes for better performance
            $table->unique('brcode');
            $table->index('brak');
            $table->index('branch_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch');
    }
};
