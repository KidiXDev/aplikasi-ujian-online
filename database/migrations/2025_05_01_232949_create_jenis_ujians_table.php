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
            Schema::connection('data_db')->create('jenis_ujians', function (Blueprint $table) {
                $table->id();
                $table->integer('id_ujian')->unique();
                $table->string('jenis_ujian');
                $table->timestamps();
            });
        } catch (\Exception $e) {
            // Table might already exist or connection issue in CI
            // Let's try with default connection as fallback in CI environment
            if (app()->environment('testing', 'ci') && !Schema::hasTable('jenis_ujians')) {
                Schema::create('jenis_ujians', function (Blueprint $table) {
                    $table->id();
                    $table->integer('id_ujian')->unique();
                    $table->string('jenis_ujian');
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
            Schema::connection('data_db')->dropIfExists('jenis_ujians');
        } catch (\Exception $e) {
            // Fallback for CI environment
            if (app()->environment('testing', 'ci')) {
                Schema::dropIfExists('jenis_ujians');
            }
        }
    }
};
