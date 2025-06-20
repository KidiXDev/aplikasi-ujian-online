<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Config;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only run this in CI or testing environment
        if (app()->environment('testing', 'ci')) {
            // Make sure the data_db connection is properly configured for testing
            Config::set('database.connections.data_db.driver', 'sqlite');
            Config::set('database.connections.data_db.database', database_path('data_db.sqlite'));

            // Purge connections to make sure they're reconnected with new settings
            \Illuminate\Support\Facades\DB::purge('data_db');
            \Illuminate\Support\Facades\DB::reconnect('data_db');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Nothing to do here
    }
};
