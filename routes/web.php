<?php

use App\Http\Controllers\MatkulController;
use App\Http\Controllers\UserManagerController;
use App\Http\Controllers\UserManagerEditController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // yang perlu diinget, buat name yang punya nama lebih dari 1 kata, contohnya monitoring-ujian
    // itu harus diubah jadi pake titik, contoh monitoring.ujian
    // jadi nanti di route name-nya jadi monitoring.ujian

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('jadwal-ujian', function () {
        return Inertia::render('peserta');
    })->name('peserta');

    Route::get('monitoring-ujian', function () {
        return Inertia::render('peserta');
    })->name('monitoring.ujian');

    Route::get('rekap-nilai', function () {
        return Inertia::render('peserta');
    })->name('peserta');



    // Buat route yang punya submenu, bisa dimasukkan ke dalam group
    // contohnya kek gini buat master-data
    Route::prefix('master-data')->name('master-data.')->group(function () {
        Route::get('/', function () {
            return redirect()->route('dashboard');
        })->name('index');

        Route::get('peserta', function () {
            return Inertia::render('peserta');
        })->name('peserta');

        Route::get('dosen', function () {
            return Inertia::render('peserta');
        })->name('peserta');

        Route::get('kategori-ujian', function () {
            return Inertia::render('peserta');
        })->name('peserta');

        Route::get('jenis-ujian', function () {
            return Inertia::render('jenis-ujian');
        })->name('jenis.ujian');

        Route::get('soal', function () {
            return Inertia::render('peserta');
        })->name('peserta');

        Route::get('matakuliah', [MatkulController::class, 'index'])->name('matakuliah');
    });

    Route::middleware(['role:super_admin'])->group(function () {
        Route::prefix('user-management')->name('user-management.')->group(function () {
            Route::get('/', function () {
                return redirect()->route('dashboard');
            })->name('index');

            Route::get('user', [UserManagerController::class, 'index'])->name('user.manager');
            Route::get('/user/{id}/edit', [UserManagerEditController::class, 'edit'])->name('user.edit');
            Route::put('/user/{id}', [UserManagerEditController::class, 'update'])->name('user.update');
            Route::delete('user/{user}', [UserManagerController::class, 'delete'])->name('user.destroy');


            Route::get('roles', function () {
                return Inertia::render('user-management/role-manager');
            })->name('roles');
        });
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
