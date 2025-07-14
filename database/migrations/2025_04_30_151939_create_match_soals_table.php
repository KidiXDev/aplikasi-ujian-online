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
        // Skip in testing environment since test tables are already created
        if (app()->environment('testing')) {
            return;
        }

        try {
            Schema::connection('data_db')->create('match_soals', function (Blueprint $table) {
                $table->id();
                $table->integer('soal_id')->nullable();
                $table->integer('paket_id')->nullable();
                $table->timestamps();
            });
        } catch (\Exception $e) {
            // Table might already exist or connection issue in CI
            // Let's try with default connection as fallback in CI environment
            if (app()->environment('testing', 'ci') && !Schema::hasTable('match_soals')) {
                Schema::create('match_soals', function (Blueprint $table) {
                    $table->id();
                    $table->integer('soal_id')->nullable();
                    $table->integer('paket_id')->nullable();
                    $table->timestamps();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            Schema::connection('data_db')->dropIfExists('match_soals');
        } catch (\Exception $e) {
            // Fallback for CI environment
            if (app()->environment('testing', 'ci')) {
                Schema::dropIfExists('match_soals');
            }
        }
    }
};
