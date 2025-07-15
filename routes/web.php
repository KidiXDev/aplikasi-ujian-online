<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
<<<<<<< HEAD
=======
use App\Models\Matakuliah;
use App\Models\PaketSoal;
use App\Http\Controllers\DosenManagerController;
use App\Http\Controllers\DosenManagerEditController;
use App\Http\Controllers\DosenImportController;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\MasterData\BidangController;
use App\Http\Controllers\PaketSoal\MakeEventController;
use App\Http\Controllers\PaketSoal\AddSoalController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882

use App\Http\Controllers\{
    EventController,
    MatkulController,
    BankSoalController,
    JenisUjianController,
    BankSoalControllerCheckbox,
    DosenManagerController,
    DosenManagerEditController,
    DosenImportController,
    PesertaManagerController,
    PesertaManagerEditController,
    PesertaImportController,
    PenjadwalanController,
    MonitoringUjianController,
    RekapNilaiController,
    TokenController,
    UserManagerController,
    UserManagerEditController,
    PaketSoal\PaketSoalController,
    PaketSoal\PaketSoalEditController,
    PaketSoal\MakeEventController,
    PaketSoal\AddSoalController,
    MasterData\BidangController
};

Route::get('/', fn () => Inertia::render('auth/login'))->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

<<<<<<< HEAD
    // Dashboard
    Route::get('dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    // Monitoring Ujian
    Route::prefix('monitoring-ujian')->name('monitoring.ujian.')->group(function () {
        Route::get('/', [MonitoringUjianController::class, 'index'])->name('index');
        Route::get('/{id}', [MonitoringUjianController::class, 'show'])->name('detail');
        Route::get('/{id}/preview', [MonitoringUjianController::class, 'preview'])->name('preview');
        Route::post('/{id}/reset-participant', [MonitoringUjianController::class, 'resetParticipant'])->name('reset');
        Route::post('/{id}/delete-participant', [MonitoringUjianController::class, 'deleteParticipant'])->name('delete');
    });

=======
    Route::get('/paket-soal/add-soal', [AddSoalController::class, 'showAddSoalForm'])->name('paket-soal.add-soal');
    // Login
    Route::get('/', fn() => Inertia::render('auth/login'))->name('home');

    Route::get('/paket-soal/list', [PaketSoalController::class, 'list']);

    Route::get('/bidangs', [BidangController::class, 'index']); // dropdown bidang

    Route::post('/paket-soal', [PaketSoalEditController::class, 'store'])->name('paket-soal.store');

    // Custom binding
    Route::bind('matakuliah', fn($value) => Matakuliah::where('id_mk', $value)->firstOrFail());

    // Custom binding agar {paket_soal} resolve ke JadwalUjianSoal berdasarkan id_ujian
    Route::bind('paket_soal', function ($value) {
        return \App\Models\JadwalUjianSoal::where('id_ujian', $value)->firstOrFail();
    });

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Monitoring Ujian
    Route::prefix('monitoring-ujian')->name('monitoring.ujian.')->group(function () {
        Route::get('/', [App\Http\Controllers\MonitoringUjianController::class, 'index'])->name('index');
        Route::get('/{id}/preview', [App\Http\Controllers\MonitoringUjianController::class, 'preview'])->name('preview');
        Route::get('/{id}', [App\Http\Controllers\MonitoringUjianController::class, 'show'])->name('detail');
        Route::post('/{id}/reset-participant', [App\Http\Controllers\MonitoringUjianController::class, 'resetParticipant'])->name('reset');
        Route::post('/{id}/delete-participant', [App\Http\Controllers\MonitoringUjianController::class, 'deleteParticipant'])->name('delete');
    });

>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
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
    Route::prefix('rekap-nilai')->name('rekap.nilai.')->group(function () {
        Route::get('/', [RekapNilaiController::class, 'index'])->name('index');
        Route::get('/{id}', [RekapNilaiController::class, 'show'])->name('detail');
        Route::get('/{id}/export', [RekapNilaiController::class, 'export'])->name('export');
    });

    // MASTER DATA
    Route::prefix('master-data')->name('master-data.')->group(function () {
<<<<<<< HEAD

        Route::get('/', fn () => redirect()->route('dashboard'))->name('index');
        Route::get('kategori-ujian', fn () => Inertia::render('kategori-ujian'))->name('kategori.ujian');
        Route::get('soal', fn () => Inertia::render('soal'))->name('soal');
        Route::get('jenisujian', [JenisUjianController::class, 'index']);

        // Event CRUD
        Route::prefix('event')->name('event.')->group(function () {
            Route::get('/', [EventController::class, 'index'])->name('index');
            Route::get('/create', [EventController::class, 'create'])->name('create');
            Route::post('/', [EventController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [EventController::class, 'edit'])->name('edit');
            Route::put('/{id}', [EventController::class, 'update'])->name('update');
            Route::delete('/{id}', [EventController::class, 'destroy'])->name('destroy');
        });

        // Matakuliah
=======
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
            Route::put('{dosen}/toggle-status', [DosenManagerController::class, 'toggleStatus'])->name('toggle-status');
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
>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
        Route::prefix('matakuliah')->name('matakuliah.')->group(function () {
            Route::get('/', [MatkulController::class, 'index'])->name('index');
            Route::get('/create', [MatkulController::class, 'create'])->name('create');
            Route::post('/', [MatkulController::class, 'store'])->name('store');
            Route::get('/{matakuliah}/edit', [MatkulController::class, 'edit'])->name('edit');
            Route::put('/{matakuliah}', [MatkulController::class, 'update'])->name('update');
            Route::delete('/{matakuliah}', [MatkulController::class, 'destroy'])->name('destroy');
        });

<<<<<<< HEAD
        // Bank Soal
        Route::prefix('bank-soal')->name('bank.soal.')->group(function () {
            Route::get('/', [BankSoalController::class, 'index'])->name('index');
            Route::get('/create', fn () => Inertia::render('banksoalcreate'))->name('create');
            Route::post('/', [BankSoalController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [BankSoalController::class, 'edit'])->name('edit');
            Route::put('/{id}', [BankSoalController::class, 'update'])->name('update');
            Route::delete('/{id}', [BankSoalController::class, 'destroy'])->name('destroy');
=======
        Route::prefix('event')->name('event.')->group(function () {
            Route::get('/create', [MakeEventController::class, 'create'])->name('create');
            Route::post('/store', [MakeEventController::class, 'store'])->name('store');
            Route::get('/list', [MakeEventController::class, 'index'])->name('list');
            Route::get('/{id}/edit', [MakeEventController::class, 'edit'])->name('edit');
            Route::put('/{id}', [MakeEventController::class, 'update'])->name('update');
            Route::get('/', [MakeEventController::class, 'getEvent'])->name('getEvent');
            Route::get('/{id}', [MakeEventController::class, 'show'])->name('show');
            Route::delete('/{id}', [MakeEventController::class, 'destroy'])->name('destroy');
>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
        });

        // Paket Soal
        Route::prefix('paket-soal')->name('paket-soal.')->group(function () {
<<<<<<< HEAD
            Route::get('/', [PaketSoalController::class, 'index'])->name('index');
            Route::get('/create', [PaketSoalEditController::class, 'create'])->name('create');
=======
            // Route index untuk menampilkan semua paket soal
            Route::get('/', [PaketSoalController::class, 'indexAll'])->name('index');
            
            // Route untuk menampilkan paket soal berdasarkan event
            Route::get('/{id_event}', [PaketSoalController::class, 'index'])->name('show-by-event');
            
            // Route untuk create dengan id_event otomatis
            Route::get('/create/{id_event}', [PaketSoalEditController::class, 'createWithEvent'])->name('create-with-event');
            
            // Route untuk create biasa
            Route::get('/create-event', fn() => Inertia::render('master-data/paket-soal/create-event'))->name('create-event');
            
            // Route untuk store
>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
            Route::post('/', [PaketSoalEditController::class, 'store'])->name('store');
            Route::post('/store', [PaketSoalEditController::class, 'store_data'])->name('store_data');
            Route::post('/{event_id}', [PaketSoalEditController::class, 'store_id'])->name('store_id');
            
            // Route untuk edit, update, destroy, show
            Route::get('/{paket_soal}/edit', [PaketSoalEditController::class, 'edit'])->name('edit');
            Route::put('/{paket_soal}', [PaketSoalEditController::class, 'update'])->name('update');
<<<<<<< HEAD
            Route::delete('/{paket_soal}', [PaketSoalController::class, 'delete'])->name('destroy');
        });

        // Import
        Route::get('/kategorisoal', [BankSoalController::class, 'getKategoriSoal']);
        Route::get('/bank-soal-checkbox/{paket_soal}/edit', [BankSoalControllerCheckbox::class, 'edit'])->name('bank-soal-checkbox.edit');
        Route::put('/bank-soal-checkbox/{paket_soal}', [BankSoalControllerCheckbox::class, 'update'])->name('bank-soal-checkbox.update');

        // Dosen
        Route::prefix('dosen')->name('dosen.')->group(function () {
            Route::get('/', [DosenManagerController::class, 'index'])->name('manager');
            Route::get('create', [DosenManagerEditController::class, 'create'])->name('create');
            Route::post('/', [DosenManagerEditController::class, 'store'])->name('store');
            Route::get('{id}/edit', [DosenManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [DosenManagerEditController::class, 'update'])->name('update');
            Route::delete('{user}', [DosenManagerController::class, 'delete'])->name('destroy');
            Route::post('import', [DosenImportController::class, 'import'])->name('import');
        });

        // Peserta
        Route::prefix('peserta')->name('peserta.')->group(function () {
            Route::get('/', [PesertaManagerController::class, 'index'])->name('manager');
            Route::get('create', [PesertaManagerEditController::class, 'create'])->name('create');
            Route::post('/', [PesertaManagerEditController::class, 'store'])->name('store');
            Route::get('{id}/edit', [PesertaManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [PesertaManagerEditController::class, 'update'])->name('update');
            Route::delete('{peserta}', [PesertaManagerController::class, 'delete'])->name('destroy');
            Route::post('import', [PesertaImportController::class, 'import'])->name('import');
        });
    });

    // Role admin
    Route::middleware(['role:super_admin'])->prefix('user-management')->name('user-management.')->group(function () {
        Route::get('roles', fn () => Inertia::render('user-management/role-manager'))->name('roles');
=======
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

        Route::get('/bank-soal-checkbox/{paket_soal}/edit', [BankSoalControllerCheckbox::class, 'edit'])->name('bank-soal-checkbox.edit');
        Route::put('/bank-soal-checkbox/{paket_soal}', [BankSoalControllerCheckbox::class, 'update'])->name('bank-soal-checkbox.update');
        Route::get('/bank-soal-checkbox/{paket_soal_id}/back', [BankSoalControllerCheckbox::class, 'back'])->name('bank-soal-checkbox.back');
    });

    // User Management routes
    Route::middleware(['role:super_admin'])->prefix('user-management')->name('user-management.')->group(function () {
        Route::get('/', fn() => redirect()->route('dashboard'))->name('index');

>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
        Route::prefix('user')->name('user.')->group(function () {
            Route::get('/', [UserManagerController::class, 'index'])->name('manager');
            Route::get('create', [UserManagerEditController::class, 'create'])->name('create');
            Route::post('/', [UserManagerEditController::class, 'store'])->name('store');
            Route::get('{id}/edit', [UserManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [UserManagerEditController::class, 'update'])->name('update');
            Route::delete('{user}', [UserManagerController::class, 'delete'])->name('destroy');
        });
<<<<<<< HEAD
    });

    // Token API
=======

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

>>>>>>> a0ebe7cf54f361afbc02439052b553691eb10882
    Route::prefix('token')->name('token.')->group(function () {
        Route::get('/current', [TokenController::class, 'getCurrentToken'])->name('current');
        Route::get('/generate', [TokenController::class, 'generateNewToken'])->name('generate');
        Route::get('/copy', [TokenController::class, 'copyToken'])->name('copy');
    });

    // Extra Routes
    Route::get('/paket-soal/add-soal', [AddSoalController::class, 'showAddSoalForm'])->name('paket-soal.add-soal');
    Route::get('/bidangs', [BidangController::class, 'index']);
    Route::get('/paket-soal/list', [PaketSoalController::class, 'list']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
