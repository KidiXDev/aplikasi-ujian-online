<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

    // Penjadwalan
    Route::prefix('penjadwalan')->name('penjadwalan.')->group(function () {
        Route::get('/', [PenjadwalanController::class, 'index'])->name('index');
        Route::get('/create', [PenjadwalanController::class, 'create'])->name('create');
        Route::post('/', [PenjadwalanController::class, 'store'])->name('store');
        Route::get('/{penjadwalan}/edit', [PenjadwalanController::class, 'edit'])->name('edit');
        Route::put('/{penjadwalan}', [PenjadwalanController::class, 'update'])->name('update');
        Route::delete('/{penjadwalan}', [PenjadwalanController::class, 'destroy'])->name('destroy');
    });

    // Rekap Nilai
    Route::prefix('rekap-nilai')->name('rekap.nilai.')->group(function () {
        Route::get('/', [RekapNilaiController::class, 'index'])->name('index');
        Route::get('/{id}', [RekapNilaiController::class, 'show'])->name('detail');
        Route::get('/{id}/export', [RekapNilaiController::class, 'export'])->name('export');
    });

    // MASTER DATA
    Route::prefix('master-data')->name('master-data.')->group(function () {

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
        Route::prefix('matakuliah')->name('matakuliah.')->group(function () {
            Route::get('/', [MatkulController::class, 'index'])->name('index');
            Route::get('/create', [MatkulController::class, 'create'])->name('create');
            Route::post('/', [MatkulController::class, 'store'])->name('store');
            Route::get('/{matakuliah}/edit', [MatkulController::class, 'edit'])->name('edit');
            Route::put('/{matakuliah}', [MatkulController::class, 'update'])->name('update');
            Route::delete('/{matakuliah}', [MatkulController::class, 'destroy'])->name('destroy');
        });

        // Bank Soal
        Route::prefix('bank-soal')->name('bank.soal.')->group(function () {
            Route::get('/', [BankSoalController::class, 'index'])->name('index');
            Route::get('/create', fn () => Inertia::render('banksoalcreate'))->name('create');
            Route::post('/', [BankSoalController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [BankSoalController::class, 'edit'])->name('edit');
            Route::put('/{id}', [BankSoalController::class, 'update'])->name('update');
            Route::delete('/{id}', [BankSoalController::class, 'destroy'])->name('destroy');
        });

        // Paket Soal
        Route::prefix('paket-soal')->name('paket-soal.')->group(function () {
            Route::get('/', [PaketSoalController::class, 'index'])->name('index');
            Route::get('/create', [PaketSoalEditController::class, 'create'])->name('create');
            Route::post('/', [PaketSoalEditController::class, 'store'])->name('store');
            Route::get('/{paket_soal}/edit', [PaketSoalEditController::class, 'edit'])->name('edit');
            Route::put('/{paket_soal}', [PaketSoalEditController::class, 'update'])->name('update');
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
        Route::prefix('user')->name('user.')->group(function () {
            Route::get('/', [UserManagerController::class, 'index'])->name('manager');
            Route::get('create', [UserManagerEditController::class, 'create'])->name('create');
            Route::post('/', [UserManagerEditController::class, 'store'])->name('store');
            Route::get('{id}/edit', [UserManagerEditController::class, 'edit'])->name('edit');
            Route::put('{id}', [UserManagerEditController::class, 'update'])->name('update');
            Route::delete('{user}', [UserManagerController::class, 'delete'])->name('destroy');
        });
    });

    // Token API
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
