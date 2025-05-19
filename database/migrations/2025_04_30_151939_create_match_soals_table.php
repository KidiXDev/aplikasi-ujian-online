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
        if (!Schema::connection('data_db')->hasTable('match_soals')) {
            Schema::connection('data_db')->create('match_soals', function (Blueprint $table) {
                $table->id();
                $table->integer('soal_id')->nullable();
                $table->integer('paket_id')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('match_soals');
    }
};
