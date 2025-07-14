<?php

namespace Tests\Traits;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

trait WithDataDbConnection
{
    /**
     * Setup the data_db connection for testing
     */
    protected function setUpDataDbConnection(): void
    {
        // Configure the data_db connection for testing
        Config::set('database.connections.data_db', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
        ]);

        // Purge and reconnect
        DB::purge('data_db');
        DB::reconnect('data_db');

        // Run migrations for the data_db connection
        Artisan::call('migrate', [
            '--database' => 'data_db',
            '--force' => true
        ]);
    }

    /**
     * Clean up the data_db connection after testing
     */
    protected function tearDownDataDbConnection(): void
    {
        DB::connection('data_db')->disconnect();
    }
}
