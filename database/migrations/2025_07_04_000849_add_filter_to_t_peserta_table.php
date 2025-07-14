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
        // Skip this migration in testing environment since we create the table with the column already
        if (app()->environment('testing')) {
            return;
        }

        Schema::connection('data_db')->table('t_peserta', function (Blueprint $table) {
            $table->integer('filter')->default(0)->after('nama');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Skip this migration in testing environment
        if (app()->environment('testing')) {
            return;
        }

        Schema::connection('data_db')->table('t_peserta', function (Blueprint $table) {
            $table->dropColumn('filter');
        });
    }
};
