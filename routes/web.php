<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Matakuliah;
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
    MasterData\BidangController,
    RoleController,
    PermissionController
};

// Home route
Route::get('/', fn () => Inertia::render('auth/login'))->name('home');

// Group: auth & verified
Route::middleware(['auth', 'verified'])->group(function () {

    Route::bind('matakuliah', fn($value) => Matakuliah::where('id_mk', $value)->firstOrFail());
    Route::bind('paket_soal', fn($value) => \App\Models\JadwalUjianSoal::where('id_ujian', $value)->firstOrFail());

    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');

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

    // Master Data
    Route::prefix('master-data')->name('master-data.')->group(function () {
        Route::get('/', fn() => redirect()->route('dashboard'))->name('index');
        Route::get('peserta', fn() => Inertia::render('peserta'))->name('peserta');
        Route::get('dosen', fn() => Inertia::render('dosen'))->name('dosen');
        Route::get('kategori-ujian', fn() => Inertia::render('kategori-ujian'))->name('kategori.ujian');
        Route::get('soal', fn() => Inertia::render('soal'))->name('soal');
        Route::get('matakuliah', [MatkulController::class, 'index'])->name('matakuliah');
        Route::get('jenisujian', [JenisUjianController::class, 'index']);

        // Dosen
        Route::prefix('dosen')->name('dosen.')->group(function () {
            Route::get('/', [DosenManagerController::class, 'index'])->name('manager');
            Route::get('create', [DosenManagerEditController::class, 'create'])->name('create');
            Route::post('/', [DosenManagerEditController::class, 'store'])->name('store');
            Route::post('import', [DosenImportController::class, 'import'])->name('import');
            Route::get('{id}/edit', [DosenManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [DosenManagerEditController::class, 'update'])->name('update');
            Route::delete('{user}', [DosenManagerController::class, 'delete'])->name('destroy');
            Route::put('{dosen}/toggle-status', [DosenManagerController::class, 'toggleStatus'])->name('toggle-status');
        });

        Route::get('import-dosen', [DosenImportController::class, 'importViewDosen'])->name('import-dosen.view');

        // Peserta
        Route::prefix('peserta')->name('peserta.')->group(function () {
            Route::get('/', [PesertaManagerController::class, 'index'])->name('manager');
            Route::get('create', [PesertaManagerEditController::class, 'create'])->name('create');
            Route::post('/', [PesertaManagerEditController::class, 'store'])->name('store');
            Route::post('import', [PesertaImportController::class, 'import'])->name('import');
            Route::get('import', [PesertaImportController::class, 'importView'])->name('import.view');
            Route::get('{id}/edit', [PesertaManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [PesertaManagerEditController::class, 'update'])->name('update');
            Route::delete('{peserta}', [PesertaManagerController::class, 'delete'])->name('destroy');
            Route::put('{peserta}/toggle-status', [PesertaManagerController::class, 'toggleStatus'])->name('toggle-status');
        });

        // Bank Soal
        Route::get('bank-soal', [BankSoalController::class, 'index'])->name('bank.soal');
        Route::get('bank-soal/create', fn() => Inertia::render('banksoalcreate'))->name('bank.soal.create');
        Route::post('bank-soal', [BankSoalController::class, 'store'])->name('bank.soal.store');
        Route::get('bank-soal/{id}/edit', [BankSoalController::class, 'edit'])->name('bank.soal.edit');
        Route::put('bank-soal/{id}', [BankSoalController::class, 'update'])->name('bank.soal.update');
        Route::delete('bank-soal/{id}', [BankSoalController::class, 'destroy'])->name('bank.soal.destroy');
        Route::get('kategorisoal', [BankSoalController::class, 'getKategoriSoal']);

        // Matakuliah
        Route::prefix('matakuliah')->name('matakuliah.')->group(function () {
            Route::get('/', [MatkulController::class, 'index'])->name('index');
            Route::get('/create', [MatkulController::class, 'create'])->name('create');
            Route::post('/', [MatkulController::class, 'store'])->name('store');
            Route::get('/{matakuliah}/edit', [MatkulController::class, 'edit'])->name('edit');
            Route::put('/{matakuliah}', [MatkulController::class, 'update'])->name('update');
            Route::delete('/{matakuliah}', [MatkulController::class, 'destroy'])->name('destroy');
        });

        // Event
        Route::prefix('event')->name('event.')->group(function () {
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

        // Paket Soal
        Route::prefix('paket-soal')->name('paket-soal.')->group(function () {
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

        // Kategori Soal
        Route::prefix('kategori-soal')->name('kategori-soal.')->group(function () {
            Route::get('/', [\App\Http\Controllers\KategoriUjianController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\KategoriUjianController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\KategoriUjianController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [\App\Http\Controllers\KategoriUjianController::class, 'edit'])->name('edit');
            Route::put('/{id}', [\App\Http\Controllers\KategoriUjianController::class, 'update'])->name('update');
            Route::delete('/{id}', [\App\Http\Controllers\KategoriUjianController::class, 'destroy'])->name('destroy');
        });
        Route::get('/kategori-soal-dropdown', [\App\Http\Controllers\KategoriUjianController::class, 'getKategoriList'])->name('kategori-soal.dropdown');
        Route::get('/bank-soal-checkbox/{paket_soal}/edit', [BankSoalControllerCheckbox::class, 'edit'])->name('bank-soal-checkbox.edit');
        Route::put('/bank-soal-checkbox/{paket_soal}', [BankSoalControllerCheckbox::class, 'update'])->name('bank-soal-checkbox.update');
        Route::get('/bank-soal-checkbox/{paket_soal_id}/back', [BankSoalControllerCheckbox::class, 'back'])->name('bank-soal-checkbox.back');
    });

    // User Management
    Route::middleware(['role:super_admin'])->prefix('user-management')->name('user-management.')->group(function () {
        Route::get('/', fn() => redirect()->route('dashboard'))->name('index');
        Route::prefix('user')->name('user.')->group(function () {
            Route::get('/', [UserManagerController::class, 'index'])->name('manager');
            Route::get('create', [UserManagerEditController::class, 'create'])->name('create');
            Route::post('/', [UserManagerEditController::class, 'store'])->name('store');
            Route::get('{id}/edit', [UserManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [UserManagerEditController::class, 'update'])->name('update');
            Route::delete('{user}', [UserManagerController::class, 'delete'])->name('destroy');
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

    // Token
    Route::prefix('token')->name('token.')->group(function () {
        Route::get('/current', [TokenController::class, 'getCurrentToken'])->name('current');
        Route::get('/generate', [TokenController::class, 'generateNewToken'])->name('generate');
        Route::get('/copy', [TokenController::class, 'copyToken'])->name('copy');
    });

    // Paket Soal Extra Routes
    Route::get('/paket-soal/add-soal', [AddSoalController::class, 'showAddSoalForm'])->name('paket-soal.add-soal');
    Route::get('/bidangs', [BidangController::class, 'index']);
    Route::get('/paket-soal/list', [PaketSoalController::class, 'list']);
});

// Tambahkan setting & auth Laravel
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
