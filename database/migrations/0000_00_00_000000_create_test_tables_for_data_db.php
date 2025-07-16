<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for testing environment only.
     * Creates minimal table structures for the data_db connection tables.
     */
    public function up(): void
    {
        // Only run in testing environment
        if (app()->environment('testing', 'ci')) {
            // Create tables on the data_db connection for testing
            $connection = 'data_db';

            // t_peserta table
            if (!Schema::connection($connection)->hasTable('t_peserta')) {
                Schema::connection($connection)->create('t_peserta', function (Blueprint $table) {
                    $table->id();
                    $table->string('nama')->nullable();
                    $table->integer('filter')->default(0); // Include the filter column
                    $table->string('nim')->nullable();
                    $table->string('email')->nullable();
                    $table->timestamps();
                });
            }

            // m_soal table
            if (!Schema::connection($connection)->hasTable('m_soal')) {
                Schema::connection($connection)->create('m_soal', function (Blueprint $table) {
                    $table->id();
                    $table->text('soal')->nullable();
                    $table->string('type')->nullable();
                    $table->timestamps();
                });
            }

            // t_status table
            if (!Schema::connection($connection)->hasTable('t_status')) {
                Schema::connection($connection)->create('t_status', function (Blueprint $table) {
                    $table->id();
                    $table->string('status')->nullable();
                    $table->timestamps();
                });
            }

            // t_penjadwalan table
            if (!Schema::connection($connection)->hasTable('t_penjadwalan')) {
                Schema::connection($connection)->create('t_penjadwalan', function (Blueprint $table) {
                    $table->id();
                    $table->string('nama')->nullable();
                    $table->datetime('tanggal')->nullable();
                    $table->timestamps();
                });
            }

            // t_pengerjaan_jawaban table
            if (!Schema::connection($connection)->hasTable('t_pengerjaan_jawaban')) {
                Schema::connection($connection)->create('t_pengerjaan_jawaban', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('pengerjaan_id')->nullable();
                    $table->unsignedBigInteger('soal_id')->nullable();
                    $table->text('jawaban')->nullable();
                    $table->timestamps();
                });
            }

            // t_pengerjaan table
            if (!Schema::connection($connection)->hasTable('t_pengerjaan')) {
                Schema::connection($connection)->create('t_pengerjaan', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('peserta_id')->nullable();
                    $table->datetime('mulai')->nullable();
                    $table->datetime('selesai')->nullable();
                    $table->timestamps();
                });
            }

            // paket_soals table
            if (!Schema::connection($connection)->hasTable('paket_soals')) {
                Schema::connection($connection)->create('paket_soals', function (Blueprint $table) {
                    $table->id();
                    $table->integer('kode_bidang');
                    $table->string('nama_paket');
                    $table->timestamps();
                });
            }

            // m_bidang table
            if (!Schema::connection($connection)->hasTable('m_bidang')) {
                Schema::connection($connection)->create('m_bidang', function (Blueprint $table) {
                    $table->id();
                    $table->string('nama')->nullable();
                    $table->timestamps();
                });
            }

            // tblmatkul table
            if (!Schema::connection($connection)->hasTable('tblmatkul')) {
                Schema::connection($connection)->create('tblmatkul', function (Blueprint $table) {
                    $table->id();
                    $table->string('namamk')->nullable();
                    $table->string('kodemk')->nullable();
                    $table->timestamps();
                });
            }

            // t_kat_soal table
            if (!Schema::connection($connection)->hasTable('t_kat_soal')) {
                Schema::connection($connection)->create('t_kat_soal', function (Blueprint $table) {
                    $table->id();
                    $table->string('kategori')->nullable();
                    $table->timestamps();
                });
            }

            // t_jurusan table
            if (!Schema::connection($connection)->hasTable('t_jurusan')) {
                Schema::connection($connection)->create('t_jurusan', function (Blueprint $table) {
                    $table->id();
                    $table->string('nama')->nullable();
                    $table->timestamps();
                });
            }

            // jenis_ujians table
            if (!Schema::connection($connection)->hasTable('jenis_ujians')) {
                Schema::connection($connection)->create('jenis_ujians', function (Blueprint $table) {
                    $table->id();
                    $table->integer('id_ujian')->unique();
                    $table->string('jenis_ujian');
                    $table->timestamps();
                });
            }

            // t_jadwal_ujian_soal table
            if (!Schema::connection($connection)->hasTable('t_jadwal_ujian_soal')) {
                Schema::connection($connection)->create('t_jadwal_ujian_soal', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('jadwal_id')->nullable();
                    $table->unsignedBigInteger('soal_id')->nullable();
                    $table->timestamps();
                });
            }

            // t_jadwal_ujian table
            if (!Schema::connection($connection)->hasTable('t_jadwal_ujian')) {
                Schema::connection($connection)->create('t_jadwal_ujian', function (Blueprint $table) {
                    $table->id();
                    $table->string('nama')->nullable();
                    $table->datetime('tanggal')->nullable();
                    $table->timestamps();
                });
            }

            // t_event table
            if (!Schema::connection($connection)->hasTable('t_event')) {
                Schema::connection($connection)->create('t_event', function (Blueprint $table) {
                    $table->id();
                    $table->string('nama')->nullable();
                    $table->datetime('tanggal')->nullable();
                    $table->timestamps();
                });
            }

            // t_guru table
            if (!Schema::connection($connection)->hasTable('t_guru')) {
                Schema::connection($connection)->create('t_guru', function (Blueprint $table) {
                    $table->id();
                    $table->string('nama')->nullable();
                    $table->string('email')->nullable();
                    $table->timestamps();
                });
            }

            // t_direction table
            if (!Schema::connection($connection)->hasTable('t_direction')) {
                Schema::connection($connection)->create('t_direction', function (Blueprint $table) {
                    $table->id();
                    $table->string('direction')->nullable();
                    $table->timestamps();
                });
            }

            // match_soals table
            if (!Schema::connection($connection)->hasTable('match_soals')) {
                Schema::connection($connection)->create('match_soals', function (Blueprint $table) {
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
        if (app()->environment('testing', 'ci')) {
            $connection = 'data_db';
            $tables = [
                't_peserta',
                'm_soal',
                't_status',
                't_penjadwalan',
                't_pengerjaan_jawaban',
                't_pengerjaan',
                'paket_soals',
                'm_bidang',
                'tblmatkul',
                't_kat_soal',
                't_jurusan',
                'jenis_ujians',
                't_jadwal_ujian_soal',
                't_jadwal_ujian',
                't_event',
                't_guru',
                't_direction',
                'match_soals'
            ];

            foreach ($tables as $table) {
                Schema::connection($connection)->dropIfExists($table);
            }
        }
    }
};
