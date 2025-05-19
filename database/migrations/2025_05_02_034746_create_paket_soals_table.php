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
        if(!Schema::connection('data_db')->hasTable('paket_soals')) {
            Schema::connection('data_db')->create('paket_soals', function (Blueprint $table) {
                $table->id();
                $table->integer('kode_bidang');
                $table->string('nama_paket');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paket_soals');
    }
};
