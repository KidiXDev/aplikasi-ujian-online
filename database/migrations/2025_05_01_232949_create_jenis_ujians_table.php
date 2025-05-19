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
        if (!Schema::connection('data_db')->hasTable('jenis_ujians')) {
            Schema::connection('data_db')->create('jenis_ujians', function (Blueprint $table) {
                $table->id();
                $table->integer('id_ujian')->unique();
                $table->string('jenis_ujian');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jenis_ujians');
    }
};
