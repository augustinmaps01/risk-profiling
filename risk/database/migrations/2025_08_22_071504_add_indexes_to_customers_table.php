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
        Schema::table('customers', function (Blueprint $table) {
            // Index for name searches (LIKE queries)
            $table->index('name', 'customers_name_index');

            // Index for risk level filtering
            $table->index('risk_level', 'customers_risk_level_index');

            // Index for date filtering and ordering
            $table->index('created_at', 'customers_created_at_index');

            // Index for total score filtering/sorting
            $table->index('total_score', 'customers_total_score_index');

            // Composite index for branch + date queries (common combination)
            $table->index(['branch_id', 'created_at'], 'customers_branch_date_index');

            // Composite index for branch + risk level queries
            $table->index(['branch_id', 'risk_level'], 'customers_branch_risk_index');

            // Composite index for date range queries with risk level
            $table->index(['created_at', 'risk_level'], 'customers_date_risk_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Drop all the indexes we created
            $table->dropIndex('customers_name_index');
            $table->dropIndex('customers_risk_level_index');
            $table->dropIndex('customers_created_at_index');
            $table->dropIndex('customers_total_score_index');
            $table->dropIndex('customers_branch_date_index');
            $table->dropIndex('customers_branch_risk_index');
            $table->dropIndex('customers_date_risk_index');
        });
    }
};
