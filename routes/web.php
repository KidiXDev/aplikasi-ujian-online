<?php

use App\Http\Controllers\BankSoalController;
use App\Http\Controllers\KategoriUjianController;
use App\Http\Controllers\MatkulController;
use App\Http\Controllers\UserManagerController;
use App\Http\Controllers\UserManagerEditController;
use App\Http\Controllers\PesertaManagerController;
use App\Http\Controllers\PesertaManagerEditController;
use App\Http\Controllers\PesertaImportController;
use App\Http\Controllers\JenisUjianEditController;
use App\Http\Controllers\PenjadwalanController;
use App\Http\Controllers\JenisUjianController;
use App\Http\Controllers\BankSoalControllerCheckbox;
use App\Http\Controllers\PaketSoal\PaketSoalController;
use App\Http\Controllers\PaketSoal\PaketSoalEditController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Matakuliah;
use App\Http\Controllers\DosenManagerController;
use App\Http\Controllers\DosenManagerEditController;
use App\Http\Controllers\DosenImportController;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\MasterData\BidangController;
use App\Http\Controllers\PaketSoal\MakeEventController;
use App\Http\Controllers\PaketSoal\AddSoalController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\MonitoringUjianController;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return Auth::check() ? redirect()->route('dashboard') : Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // yang perlu diinget, buat name yang punya nama lebih dari 1 kata, contohnya monitoring-ujian
    // itu harus diubah jadi pake titik, contoh monitoring.ujian
    // jadi nanti di route name-nya jadi monitoring.ujian

    Route::get('/part/add-soal', [AddSoalController::class, 'showAddSoalForm'])->name('part.add-soal');

    Route::get('/part/list', [PaketSoalController::class, 'list']);

    Route::get('/bidangs', [BidangController::class, 'index']); // dropdown bidang

    Route::post('/part', [PaketSoalEditController::class, 'store'])->name('part.store');

    // Custom binding
    Route::bind('matakuliah', fn($value) => Matakuliah::where('id_mk', $value)->firstOrFail());

    // Custom binding agar {paket_soal} resolve ke JadwalUjianSoal berdasarkan id_ujian
    Route::bind('paket_soal', function ($value) {
        return \App\Models\JadwalUjianSoal::where('id_ujian', $value)->firstOrFail();
    });

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Monitoring Ujian
    Route::prefix('monitoring-ujian')->name('monitoring.ujian.')->group(function () {
        Route::get('/', [MonitoringUjianController::class, 'index'])->name('index');
        Route::get('/{id}/preview', [MonitoringUjianController::class, 'preview'])->name('preview');
        Route::get('/{id}', [MonitoringUjianController::class, 'show'])->name('detail');
        Route::post('/{id}/reset-participant', [MonitoringUjianController::class, 'resetParticipant'])->name('reset');
        Route::post('/{id}/delete-participant', [MonitoringUjianController::class, 'deleteParticipant'])->name('delete');
    });

    // Penjadwalan
    Route::prefix('penjadwalan')->name('penjadwalan.')->group(function () {
        Route::get('/', [PenjadwalanController::class, 'index'])->name('index');
        Route::get('/create', [PenjadwalanController::class, 'create'])->name('create');
        Route::post('/', [PenjadwalanController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [PenjadwalanController::class, 'edit'])->name('edit');
        Route::put('/{id}', [PenjadwalanController::class, 'update'])->name('update');
        Route::delete('/{id}', [PenjadwalanController::class, 'destroy'])->name('destroy');

        // Routes untuk peserta management
        Route::get('/{id}/peserta', [PenjadwalanController::class, 'showPeserta'])->name('peserta');
        Route::post('/{id}/peserta/add', [PenjadwalanController::class, 'addPeserta'])->name('peserta.add');
        Route::delete('/{id}/peserta/remove', [PenjadwalanController::class, 'removePeserta'])->name('peserta.remove');
        Route::delete('/{id}/peserta/clear-all', [PenjadwalanController::class, 'clearAllPeserta'])->name('peserta.clear-all');
        Route::delete('/{id}/peserta/remove-selected', [PenjadwalanController::class, 'removeSelectedPeserta'])->name('peserta.remove-selected');
        Route::get('/{id}/peserta/add', [PenjadwalanController::class, 'addPesertaForm'])->name('penjadwalan.peserta.add');
    });

    // Rekap Nilai
    Route::get('rekap-nilai', [App\Http\Controllers\RekapNilaiController::class, 'index'])->name('rekap.nilai');
    Route::get('rekap-nilai/{id}', [App\Http\Controllers\RekapNilaiController::class, 'show'])->name('rekap.nilai.detail');
    Route::get('rekap-nilai/{id}/export', [App\Http\Controllers\RekapNilaiController::class, 'export'])->name('rekap.nilai.export');
    Route::get('/rekap-nilai/{id}/preview', [App\Http\Controllers\RekapNilaiController::class, 'preview'])->name('rekap-nilai.preview');
    // MASTER DATA
    Route::prefix('master-data')->name('master-data.')->group(function () {
        Route::get('/', fn() => redirect()->route('dashboard'))->name('index');

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

        Route::prefix('dosen')->name('dosen.')->group(function () {
            Route::get('/', [DosenManagerController::class, 'index'])->name('manager');
            Route::get('{id}/edit', [DosenManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [DosenManagerEditController::class, 'update'])->name('update');
            Route::delete('{user}', [DosenManagerController::class, 'delete'])->name('destroy');
            Route::get('create', [DosenManagerEditController::class, 'create'])->name('create');
            Route::post('/', [DosenManagerEditController::class, 'store'])->name('store');
            Route::post('import', [DosenImportController::class, 'import'])->name('import');
            Route::put('{nip}/toggle-status', [DosenManagerController::class, 'toggleStatus'])->name('toggle-status');
        });

        Route::get('import-dosen', [DosenImportController::class, 'importViewDosen'])->name('import-dosen.view');

        Route::prefix('peserta')->name('peserta.')->group(function () {
            Route::get('/', [PesertaManagerController::class, 'index'])->name('manager');
            Route::get('{id}/edit', [PesertaManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [PesertaManagerEditController::class, 'update'])->name('update');
            Route::delete('{peserta}', [PesertaManagerController::class, 'delete'])->name('destroy');
            Route::get('create', [PesertaManagerEditController::class, 'create'])->name('create');
            Route::post('/', [PesertaManagerEditController::class, 'store'])->name('store');
            Route::post('import', [PesertaImportController::class, 'import'])->name('import');
            Route::get('import', [PesertaImportController::class, 'importView'])->name('import.view');

            // ✅ Tambahan dari kode kedua:
            Route::put('{peserta}/toggle-status', [PesertaManagerController::class, 'toggleStatus'])->name('toggle-status');
        });

        Route::get('/create', [PaketSoalEditController::class, 'create'])->name('create');


        // Route::prefix('import')->name('import.')->group(function () {
        //     Route::get('/', [PesertaImportController::class, 'importView'])->name('view');
        // });

        // Route show bank soal
        Route::get('bank-soal', [BankSoalController::class, 'index'])->name('bank.soal');

        // Route hapus bank soal
        Route::delete('bank-soal/{id}', [BankSoalController::class, 'destroy'])->name('bank.soal.destroy');

        // Route edit bank soal
        Route::put('bank-soal/{id}', [BankSoalController::class, 'update'])->name('bank.soal.update');
        Route::get('bank-soal/{id}/edit', [BankSoalController::class, 'edit'])->name('bank.soal.edit');

        // Route tambah bank soal
        Route::get('bank-soal/create', function () {
            return Inertia::render('banksoalcreate');
        })->name('bank.soal.create');
        // Route edit bank soal
        // Route::put('bank-soal/{id}', [BankSoalController::class, 'update'])->name('bank.soal.update');
        Route::get('bank-soal/{id}/edit', [BankSoalController::class, 'edit'])->name('bank.soal.edit');

        Route::post('bank-soal', [BankSoalController::class, 'store'])->name('bank.soal.store');

        // API route untuk dropdown kategori soal di bank soal
        Route::get('/kategorisoal', [BankSoalController::class, 'getKategoriSoal']);

        // Route untuk matakuliah dipindahkan ke dalam grup master-data
        Route::prefix('matakuliah')->name('matakuliah.')->group(function () {
            Route::get('/', [MatkulController::class, 'index'])->name('index');
            Route::get('/create', [MatkulController::class, 'create'])->name('create');
            Route::post('/', [MatkulController::class, 'store'])->name('store');
            Route::get('/{matakuliah}/edit', [MatkulController::class, 'edit'])->name('edit');
            Route::put('/{matakuliah}', [MatkulController::class, 'update'])->name('update');
            Route::delete('/{matakuliah}', [MatkulController::class, 'destroy'])->name('destroy');
        });

        // Event
        Route::prefix('paket')->name('paket.')->group(function () {
            Route::get('/', [MakeEventController::class, 'getEvent'])->name('getEvent');
            Route::get('/list', [MakeEventController::class, 'index'])->name('list');
            Route::get('/create', [MakeEventController::class, 'create'])->name('create');
            Route::post('/store', [MakeEventController::class, 'store'])->name('store');
            Route::get('/{id}', [MakeEventController::class, 'show'])->name('show');
            Route::get('/{id}/edit', [MakeEventController::class, 'edit'])->name('edit');
            Route::put('/{id}', [MakeEventController::class, 'update'])->name('update');
            Route::delete('/{id}', [MakeEventController::class, 'destroy'])->name('destroy');
            // Tambah route toggle status event
            Route::put('/{id}/toggle-status', [MakeEventController::class, 'toggleStatus'])->name('toggleStatus');
            Route::put('/{id}/status', [MakeEventController::class, 'change_status'])->name('updateStatus');
        });

        Route::prefix('jenis-ujian')->name('jenis-ujian.')->group(function () {
            Route::get('/', [JenisUjianController::class, 'index'])->name('manager');
            Route::get('{id}/edit', [JenisUjianEditController::class, 'edit'])->name('edit'); // Ensure the controller and method exist
            Route::put('{id}', [JenisUjianEditController::class, 'update'])->name('update');
            Route::delete('{user}', [JenisUjianController::class, 'delete'])->name('destroy');
            Route::get('create', [JenisUjianEditController::class, 'create'])->name('create');
            Route::post('/', [JenisUjianEditController::class, 'store'])->name('store');
        });

        // Paket Soal
        Route::prefix('part')->name('part.')->group(function () {
            Route::get('/', [PaketSoalController::class, 'indexAll'])->name('index');
            Route::get('/{id_event}', [PaketSoalController::class, 'index'])->name('show-by-event');
            Route::get('/create/{id_event}', [PaketSoalEditController::class, 'createWithEvent'])->name('create-with-event');
            Route::get('/create-event/{id_event}', fn() => Inertia::render('master-data/paket-soal/create-event'))->name('create-event');
            Route::post('/', [PaketSoalEditController::class, 'store'])->name('store');
            Route::post('/store', [PaketSoalEditController::class, 'store_data'])->name('store_data');
            Route::post('/copy-part', [PaketSoalEditController::class, 'copyPart'])->name('copy_part');
            Route::get('/list-event-to-copy/{id_event_tujuan}', [PaketSoalEditController::class, 'list_event_to_copy_part'])->name('list-event-to-copy');
            Route::post('/{event_id}', [PaketSoalEditController::class, 'store_id'])->name('store_id');
            Route::get('/{paket_soal}/edit', [PaketSoalEditController::class, 'edit'])->name('edit');
            Route::put('/{paket_soal}', [PaketSoalEditController::class, 'update'])->name('update');
            Route::delete('/{paket_soal}', [PaketSoalController::class, 'destroy'])->name('destroy');
            Route::get('/{paket_soal}/detail', [PaketSoalController::class, 'show'])->name('show');
        });

        // Route untuk kategori soal
        Route::prefix('kategori-soal')->name('kategori-soal.')->group(function () {
            Route::get('/', [KategoriUjianController::class, 'index'])->name('index');
            Route::get('/create', [KategoriUjianController::class, 'create'])->name('create');
            Route::post('/', [KategoriUjianController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [KategoriUjianController::class, 'edit'])->name('edit');
            Route::put('/{id}', [KategoriUjianController::class, 'update'])->name('update');
            Route::delete('/{id}', [KategoriUjianController::class, 'destroy'])->name('destroy');
        });
        Route::get('/kategori-soal-dropdown', [KategoriUjianController::class, 'getKategoriList'])
            ->name('kategori-soal.dropdown');

        // Bank Soal Checkbox Management
        Route::prefix('bank-soal-checkbox')->name('bank-soal-checkbox.')->group(function () {
            Route::get('/{paket_soal}/edit', [BankSoalControllerCheckbox::class, 'edit'])->name('edit');
            Route::put('/{paket_soal}', [BankSoalControllerCheckbox::class, 'update'])->name('update');
            Route::post('/{paket_soal}/select-all', [BankSoalControllerCheckbox::class, 'selectAll'])->name('select-all');
            Route::post('/{paket_soal}/select-random', [BankSoalControllerCheckbox::class, 'selectRandom'])->name('select-random');
            Route::post('/{paket_soal}/add-random', [BankSoalControllerCheckbox::class, 'addRandom'])->name('add-random');
            Route::post('/{paket_soal}/clear-all', [BankSoalControllerCheckbox::class, 'clearAll'])->name('clear-all');
            Route::get('/{paket_soal_id}/back', [BankSoalControllerCheckbox::class, 'back'])->name('back');
        });
    });

    // User Management routes
    Route::middleware(['role:super_admin'])->prefix('user-management')->name('user-management.')->group(function () {
        Route::get('/', fn() => redirect()->route('dashboard'))->name('index');

        Route::prefix('user')->name('user.')->group(function () {
            Route::get('/', [UserManagerController::class, 'index'])->name('manager');
            Route::get('{id}/edit', [UserManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [UserManagerEditController::class, 'update'])->name('update');
            Route::delete('{user}', [UserManagerController::class, 'delete'])->name('destroy');
            Route::get('create', [UserManagerEditController::class, 'create'])->name('create');
            Route::post('/', [UserManagerEditController::class, 'store'])->name('store');
        });

        Route::prefix('roles')->name('roles.')->group(function () {
            Route::get('/', [RoleController::class, 'index'])->name('index');
            Route::post('/', [RoleController::class, 'store'])->name('store');
            Route::put('/{role}', [RoleController::class, 'update'])->name('update');
            Route::delete('/{role}', [RoleController::class, 'destroy'])->name('destroy');
            Route::post('/{role}/permissions', [RoleController::class, 'assignPermissions'])->name('assign-permissions');
        });

        Route::prefix('permissions')->name('permissions.')->group(function () {
            Route::get('/', [PermissionController::class, 'index'])->name('index');
            Route::post('/', [PermissionController::class, 'store'])->name('store');
            Route::put('/{permission}', [PermissionController::class, 'update'])->name('update');
            Route::delete('/{permission}', [PermissionController::class, 'destroy'])->name('destroy');
        });
    });

    Route::prefix('token')->name('token.')->group(function () {
        Route::get('/current', [TokenController::class, 'getCurrentToken'])->name('current');
        Route::get('/generate', [TokenController::class, 'generateNewToken'])->name('generate');
        Route::get('/copy', [TokenController::class, 'copyToken'])->name('copy');
    });

    Route::get('/events/list', [MakeEventController::class, 'list']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';