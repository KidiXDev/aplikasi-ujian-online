<?php

use App\Http\Controllers\BankSoalController;
use App\Http\Controllers\KategoriUjianController;
use App\Http\Controllers\MatkulController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\UserManagerController;
use App\Http\Controllers\UserManagerEditController;
use App\Http\Controllers\PesertaManagerController;
use App\Http\Controllers\PesertaManagerEditController;
use App\Http\Controllers\PesertaImportController;
use App\Http\Controllers\JenisUjianEditController;
use App\Http\Controllers\PenjadwalanController;
use App\Http\Controllers\MonitoringUjianController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\JenisUjianController;
use App\Http\Controllers\BankSoalControllerCheckbox;
use App\Http\Controllers\PaketSoalController;
use App\Http\Controllers\PaketSoalEditController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Matakuliah;
use App\Models\PaketSoal;
use App\Http\Controllers\DosenManagerController;
use App\Http\Controllers\DosenManagerEditController;
use App\Http\Controllers\DosenImportController;
use App\Http\Controllers\TokenController;

// Custom route binding untuk Matakuliah model
Route::bind('matakuliah', function ($value) {
    return Matakuliah::where('id_mk', $value)->firstOrFail();
});

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

    Route::get('monitoring-ujian', [App\Http\Controllers\MonitoringUjianController::class, 'index'])->name('monitoring.ujian');
    Route::get('monitoring-ujian/{id}/preview', [App\Http\Controllers\MonitoringUjianController::class, 'preview'])->name('monitoring.ujian.preview');
    Route::get('monitoring-ujian/{id}', [App\Http\Controllers\MonitoringUjianController::class, 'show'])->name('monitoring.ujian.detail');

    Route::prefix('penjadwalan')->name('penjadwalan.')->group(function () {
        Route::get('/', [PenjadwalanController::class, 'index'])->name('index');
        Route::get('/create', [PenjadwalanController::class, 'create'])->name('create');
        Route::post('/', [PenjadwalanController::class, 'store'])->name('store');
        Route::get('/{penjadwalan}/edit', [PenjadwalanController::class, 'edit'])->name('edit');
        Route::put('/{penjadwalan}', [PenjadwalanController::class, 'update'])->name('update');
        Route::delete('/{penjadwalan}', [PenjadwalanController::class, 'destroy'])->name('destroy');
    });


    Route::get('rekap-nilai', [App\Http\Controllers\RekapNilaiController::class, 'index'])->name('rekap.nilai');
    Route::get('rekap-nilai/{id}', [App\Http\Controllers\RekapNilaiController::class, 'show'])->name('rekap.nilai.detail');
    Route::get('rekap-nilai/{id}/export', [App\Http\Controllers\RekapNilaiController::class, 'export'])->name('rekap.nilai.export');

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
            return Inertia::render('dosen');
        })->name('dosen');

        Route::get('kategori-ujian', function () {
            return Inertia::render('kategori-ujian');
        })->name('kategori.ujian');

        Route::get('soal', function () {
            return Inertia::render('soal');
        })->name('soal');

        Route::get('matakuliah', [MatkulController::class, 'index'])->name('matakuliah');
        Route::get('jenisujian', [JenisUjianController::class, 'index']); // ini tidak pakai name


        Route::get('paket-soal', function () {
            return Inertia::render('paket-soal');
        })->name('paket.soal');

        Route::prefix('dosen')->name('dosen.')->group(function () {
            Route::get('/', [DosenManagerController::class, 'index'])->name('manager');
            Route::get('{id}/edit', [DosenManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [DosenManagerEditController::class, 'update'])->name('update');
            Route::delete('{user}', [DosenManagerController::class, 'delete'])->name('destroy');
            Route::get('create', [DosenManagerEditController::class, 'create'])->name('create');
            Route::post('/', [DosenManagerEditController::class, 'store'])->name('store');
            Route::post('import', [DosenImportController::class, 'import'])->name('import');
        });

        // Route import dosen (halaman form import dosen)
        Route::get('import-dosen', [DosenImportController::class, 'importViewDosen'])->name('import-dosen.view');

        Route::prefix('peserta')->name('peserta.')->group(function () {
            Route::get('/', [PesertaManagerController::class, 'index'])->name('manager');
            Route::get('{id}/edit', [PesertaManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [PesertaManagerEditController::class, 'update'])->name('update');
            Route::delete('{peserta}', [PesertaManagerController::class, 'delete'])->name('destroy');
            Route::get('create', [PesertaManagerEditController::class, 'create'])->name('create');
            Route::post('/', [PesertaManagerEditController::class, 'store'])->name('store');
            Route::post('import', [PesertaImportController::class, 'import'])->name('import');
        });

        // Grup route untuk halaman tampilan import peserta
        Route::prefix('import')->name('import.')->group(function () {
            Route::get('/', [PesertaImportController::class, 'importView'])->name('view');
        });

        // Route show bank soal
        Route::get('bank-soal', [BankSoalController::class, 'index'])->name('bank.soal');

        // Route hapus bank soal
        Route::delete('bank-soal/{id}', [BankSoalController::class, 'destroy'])->name('bank.soal.destroy');

        // Route edit bank soal
        Route::put('bank-soal/update/{id}', [BankSoalController::class, 'update'])->name('bank.soal.update');
        Route::get('bank-soal/{id}/edit', [BankSoalController::class, 'edit'])->name('bank.soal.edit');

        // Route tambah bank soal
        Route::get('bank-soal/create', function () {
            return Inertia::render('banksoalcreate');
        })->name('bank.soal.create');
        // Route edit bank soal
        Route::put('bank-soal/{id}', [BankSoalController::class, 'update'])->name('bank.soal.update');
        Route::get('bank-soal/{id}/edit', [BankSoalController::class, 'edit'])->name('bank.soal.edit');

        Route::post('bank-soal', [BankSoalController::class, 'store'])->name('bank.soal.store');

        // Route untuk matakuliah dipindahkan ke dalam grup master-data
        Route::prefix('matakuliah')->name('matakuliah.')->group(function () {
            Route::get('/', [MatkulController::class, 'index'])->name('index');
            Route::get('/create', [MatkulController::class, 'create'])->name('create');
            Route::post('/', [MatkulController::class, 'store'])->name('store');
            Route::get('/{matakuliah}/edit', [MatkulController::class, 'edit'])->name('edit');
            Route::put('/{matakuliah}', [MatkulController::class, 'update'])->name('update');
            Route::delete('/{matakuliah}', [MatkulController::class, 'destroy'])->name('destroy');
        });

        // Route untuk paket soal
        Route::prefix('paket-soal')->name('paket-soal.')->group(function () {
            Route::get('/', [PaketSoalController::class, 'index'])->name('manager');
            Route::get('/create', [PaketSoalEditController::class, 'create'])->name('create');
            Route::post('/', [PaketSoalEditController::class, 'store'])->name('store');
            Route::get('/{paket_soal}/edit', [PaketSoalEditController::class, 'edit'])->name('edit');
            Route::put('/{paket_soal}', [PaketSoalEditController::class, 'update'])->name('update');
            Route::delete('/{paket_soal}', [PaketSoalController::class, 'delete'])->name('destroy');
            Route::post('/store', [PaketSoalEditController::class, 'store_data'])->name('store_data');
        });

        Route::prefix('bank-soal-checkbox')->name('bank-soal-checkbox.')->group(function () {
            Route::get('/', [BankSoalControllerCheckbox::class, 'index'])->name('index');
            Route::get('/{paket_soal}/edit', [BankSoalControllerCheckbox::class, 'edit'])->name('edit');
            Route::put('/{paket_soal}', [BankSoalControllerCheckbox::class, 'update'])->name('update');
        });

        Route::prefix('jenis-ujian')->name('jenis-ujian.')->group(function () {
            Route::get('/', [JenisUjianController::class, 'index'])->name('manager');
            Route::get('{id}/edit', [JenisUjianEditController::class, 'edit'])->name('edit'); // Ensure the controller and method exist
            Route::put('{id}', [JenisUjianEditController::class, 'update'])->name('update');
            Route::delete('{user}', [JenisUjianController::class, 'delete'])->name('destroy');
            Route::get('create', [JenisUjianEditController::class, 'create'])->name('create');
            Route::post('/', [JenisUjianEditController::class, 'store'])->name('store');
        });

        Route::get('/kategorisoal', [BankSoalController::class, 'getKategoriSoal']);
    });

    Route::middleware(['role:super_admin'])->group(function () {
        Route::prefix('user-management')->name('user-management.')->group(function () {
            Route::get('/', function () {
                return redirect()->route('dashboard');
            })->name('index');

            Route::prefix('user')->name('user.')->group(function () {
                Route::get('/', [UserManagerController::class, 'index'])->name('manager');
                Route::get('{id}/edit', [UserManagerEditController::class, 'edit'])->name('edit');
                Route::put('{id}', [UserManagerEditController::class, 'update'])->name('update');
                Route::delete('{user}', [UserManagerController::class, 'delete'])->name('destroy');
                Route::get('create', [UserManagerEditController::class, 'create'])->name('create');
                Route::post('/', [UserManagerEditController::class, 'store'])->name('store');
            });


            Route::get('roles', function () {
                return Inertia::render('user-management/role-manager');
            })->name('roles');
        });
    });

    // Token routes - accessible by all authenticated users (no role restriction)
    Route::get('/token/current', [TokenController::class, 'getCurrentToken'])->name('token.current');
    Route::get('/token/generate', [TokenController::class, 'generateNewToken'])->name('token.generate'); // Ubah POST menjadi GET
    Route::get('/token/copy', [TokenController::class, 'copyToken'])->name('token.copy');
});
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
