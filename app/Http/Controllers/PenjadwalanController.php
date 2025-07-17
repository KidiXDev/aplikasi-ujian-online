<?php

namespace App\Http\Controllers;

use App\Models\Penjadwalan;
use App\Models\Event;
use App\Models\KategoriSoal;
use App\Models\JadwalUjian;
use App\Models\JadwalUjianSoal;
use App\Models\Peserta;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PenjadwalanController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Penjadwalan::with([
            'event',           // Relasi ke Event untuk mendapatkan nama_event
            'event.jadwalUjian',
            'jenis_ujian'      // Relasi ke KategoriSoal untuk nama kategori
        ]);

        if ($search) {
            $query->where('kode_jadwal', 'like', "%{$search}%")
                ->orWhere('tipe_ujian', 'like', "%{$search}%")
                ->orWhereHas('event', function ($q) use ($search) {
                    $q->where('nama_event', 'like', "%{$search}%");
                })
                ->orWhereHas('event.jadwalUjian', function ($q) use ($search) {
                    $q->where('nama_ujian', 'like', "%{$search}%");
                });
        }

        $data = $query->orderBy('id_penjadwalan', 'desc')
            ->paginate($request->input('pages', 10)) // Ganti dari per_page ke pages
            ->withQueryString();

        // Transform data untuk menambahkan informasi dari JadwalUjian
        $data->getCollection()->transform(function ($penjadwalan) {
            return [
                'id_penjadwalan' => $penjadwalan->id_penjadwalan,
                'tanggal' => $penjadwalan->tanggal,
                'waktu_mulai' => $penjadwalan->waktu_mulai,
                'waktu_selesai' => $penjadwalan->waktu_selesai,
                'kuota' => $penjadwalan->kuota,
                'status' => $penjadwalan->status,
                'tipe_ujian' => $penjadwalan->tipe_ujian, // Akan menggunakan accessor dari model
                'id_paket_ujian' => $penjadwalan->id_paket_ujian,
                'jenis_ujian' => $penjadwalan->jenis_ujian,
                'kode_jadwal' => $penjadwalan->kode_jadwal,
                'online_offline' => $penjadwalan->online_offline,
                'flag' => $penjadwalan->flag,

                // Data dari relasi Event
                'event' => [
                    'id_event' => $penjadwalan->event?->id_event,
                    'nama_event' => $penjadwalan->event?->nama_event,
                    'mulai_event' => $penjadwalan->event?->mulai_event,
                    'akhir_event' => $penjadwalan->event?->akhir_event,
                ],


                'paket_ujian' => $penjadwalan->event?->nama_event ?? 'paket tidak ditemukan',

                // Data tambahan dari JadwalUjian
                'jadwal_ujian_count' => $penjadwalan->event?->jadwalUjian?->count() ?? 0,
            ];
        });

        return Inertia::render('penjadwalan/penjadwalan-manager', [
            'data' => $data,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        // Ambil KategoriSoal dan Event yang memiliki template JadwalUjian
        $kategoriSoal = KategoriSoal::all(['id', 'kategori']);

        // Ambil Event yang memiliki template JadwalUjian (untuk dropdown paket ujian)
        $events = Event::whereHas('jadwalUjian', function ($query) {
            $query->where(function ($q) {
                $q->where('kode_kelas', null)
                    ->orWhere('kode_kelas', 1);
            })
                ->whereNull('id_penjadwalan');
        })->get(['id_event', 'nama_event']);

        // $events = Event::all(['id_event', 'nama_event']);

        return Inertia::render('penjadwalan/form.penjadwalan-manager', [
            'kategoriSoal' => $kategoriSoal,
            'events' => $events,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_paket_ujian' => 'required|integer|exists:data_db.t_event,id_event',
            'tipe_ujian' => 'required|integer|exists:data_db.t_kat_soal,id',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'required|after:waktu_mulai',
            'kuota' => 'required|integer|min:1',
            'jenis_ujian' => 'required|integer',
        ]);

        return DB::transaction(function () use ($validated) {
            // Validasi bahwa Event yang dipilih memiliki template JadwalUjian
            $hasTemplate = JadwalUjian::where(function ($q) {
                $q->where('kode_kelas', null)
                    ->orWhere('kode_kelas', 1);
            })
                ->whereNull('id_penjadwalan')
                ->where('id_event', $validated['id_paket_ujian'])
                ->exists();

            if (!$hasTemplate) {
                return redirect()->back()->with('error', 'Event yang dipilih tidak memiliki template jadwal ujian.');
            }

            // Ambil data kategori dan event sebelum create
            $kategoriSoal = KategoriSoal::find($validated['tipe_ujian']);
            $event = Event::find($validated['id_paket_ujian']);

            // Generate kode jadwal
            $kodeJadwal = $this->generateKodeJadwal($validated['id_paket_ujian'], $validated['tipe_ujian']);

            // Tambahkan kode jadwal ke data yang akan disimpan
            $validated['kode_jadwal'] = $kodeJadwal;

            // Buat Penjadwalan
            $penjadwalan = Penjadwalan::create($validated);

            // Buat JadwalUjian otomatis
            $this->createJadwalUjian($penjadwalan);

            // ✅ Debug: Get duplication statistics (optional, can be removed in production)
            $stats = $this->getDuplikasiStats($penjadwalan);

            // Prepare nama untuk success message
            $kategoriNama = $kategoriSoal ? $kategoriSoal->kategori : 'Kategori Ujian';
            $namaEvent = $event ? $event->nama_event : 'Event';

            return redirect()->route('penjadwalan.index')
                ->with('success', 'Jadwal ujian berhasil ditambahkan.');
        });
    }

    public function edit($id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);

        // Load relasi yang diperlukan
        $penjadwalan->load(['event', 'jenis_ujian']);

        $kategoriSoal = KategoriSoal::all(['id', 'kategori']);

        // Ambil Event yang memiliki template JadwalUjian (untuk dropdown paket ujian)
        $events = Event::whereHas('jadwalUjian', function ($query) {
            $query->where('kode_kelas', null)
                ->whereNull('id_penjadwalan');
        })->get(['id_event', 'nama_event']);

        return Inertia::render('penjadwalan/form.penjadwalan-manager', [
            'penjadwalan' => [
                'id_penjadwalan' => $penjadwalan->id_penjadwalan,
                'id_paket_ujian' => $penjadwalan->id_paket_ujian,
                'tipe_ujian' => $penjadwalan->tipe_ujian,
                'tanggal' => $penjadwalan->tanggal,
                'waktu_mulai' => $penjadwalan->waktu_mulai,
                'waktu_selesai' => $penjadwalan->waktu_selesai,
                'kuota' => $penjadwalan->kuota,
                'jenis_ujian' => $penjadwalan->jenis_ujian,
                'kode_jadwal' => $penjadwalan->kode_jadwal,
                'online_offline' => $penjadwalan->online_offline,
                'status' => $penjadwalan->status,
                'flag' => $penjadwalan->flag,
                // Add event data with null safety
                'event' => $penjadwalan->event ? [
                    'id_event' => $penjadwalan->event->id_event,
                    'nama_event' => $penjadwalan->event->nama_event,
                ] : null,
            ],
            'kategoriSoal' => $kategoriSoal,
            'events' => $events,
        ]);
    }

    public function update(Request $request, $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);

        $validated = $request->validate([
            'id_paket_ujian' => 'required|integer|exists:data_db.t_event,id_event',
            'tipe_ujian' => 'required|integer|exists:data_db.t_kat_soal,id',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'required|after:waktu_mulai',
            'kuota' => 'required|integer|min:1',
            'jenis_ujian' => 'required|integer',
        ]);

        return DB::transaction(function () use ($validated, $penjadwalan) {
            // Validasi bahwa Event yang dipilih memiliki template JadwalUjian
            $hasTemplate = JadwalUjian::where('kode_kelas', null)
                ->whereNull('id_penjadwalan')
                ->where('id_event', $validated['id_paket_ujian'])
                ->exists();

            if (!$hasTemplate) {
                return redirect()->back()->with('error', 'Event yang dipilih tidak memiliki template jadwal ujian.');
            }

            // Regenerate kode_jadwal if tipe_ujian or id_paket_ujian changes
            if ($penjadwalan->tipe_ujian != $validated['tipe_ujian'] || $penjadwalan->id_paket_ujian != $validated['id_paket_ujian']) {
                $validated['kode_jadwal'] = $this->generateKodeJadwal($validated['id_paket_ujian'], $validated['tipe_ujian']);
            }

            // Jika id_paket_ujian berubah, perlu regenerasi JadwalUjian dan JadwalUjianSoal
            if ($penjadwalan->id_paket_ujian != $validated['id_paket_ujian']) {
                // Hapus JadwalUjian dan JadwalUjianSoal yang lama
                $oldJadwalUjian = JadwalUjian::where('id_penjadwalan', $penjadwalan->id_penjadwalan)->get();
                foreach ($oldJadwalUjian as $jadwal) {
                    JadwalUjianSoal::where('id_ujian', $jadwal->id_ujian)->delete();
                }
                JadwalUjian::where('id_penjadwalan', $penjadwalan->id_penjadwalan)->delete();

                // Update penjadwalan terlebih dahulu
                $penjadwalan->update($validated);

                // Regenerasi JadwalUjian dan JadwalUjianSoal dengan paket ujian baru
                $this->createJadwalUjian($penjadwalan);
            } else {
                // Jika id_paket_ujian tidak berubah, hanya update penjadwalan
                $penjadwalan->update($validated);
            }

            // Ambil data kategori dan event untuk success message dengan null safety
            $kategoriSoal = KategoriSoal::find($validated['tipe_ujian']);
            $event = Event::find($validated['id_paket_ujian']);

            $kategoriNama = $kategoriSoal ? $kategoriSoal->kategori : 'Kategori Ujian';
            $namaEvent = $event ? $event->nama_event : 'Event';

            return redirect()->route('penjadwalan.index')
                ->with('success', 'Jadwal ujian berhasil diperbarui.');
        });
    }

    public function destroy($id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);

        return DB::transaction(function () use ($penjadwalan) {
            // Load relasi untuk mendapatkan nama event
            $penjadwalan->load(['event']);

            // Handle case where event might be null
            $namaEvent = $penjadwalan->event ? $penjadwalan->event->nama_event : 'Event tidak ditemukan';

            // Hapus JadwalUjianSoal yang terkait dengan JadwalUjian dari penjadwalan ini
            $jadwalUjianIds = JadwalUjian::where('id_penjadwalan', $penjadwalan->id_penjadwalan)->pluck('id_ujian');
            if ($jadwalUjianIds->isNotEmpty()) {
                JadwalUjianSoal::whereIn('id_ujian', $jadwalUjianIds)->delete();
            }

            // Hapus JadwalUjian yang terkait dengan penjadwalan ini
            JadwalUjian::where('id_penjadwalan', $penjadwalan->id_penjadwalan)->delete();

            // Hapus penjadwalan
            $penjadwalan->delete();

            return redirect()->back()
                ->with('success', 'Jadwal ujian berhasil dihapus.');
        });
    }

    /**
     * Tampilkan daftar peserta untuk jadwal ujian tertentu
     * Fungsi: 
     * - Menampilkan peserta yang sudah terdaftar dalam ujian (tersimpan di kode_kelas jadwal_ujian)
     * - Menyediakan daftar peserta dari tabel peserta yang bisa ditambahkan ke ujian
     * - Memungkinkan pengelolaan peserta per jadwal ujian melalui kode_kelas
     */
    public function showPeserta(Request $request, $id)
    {
        $penjadwalan = Penjadwalan::with(['event', 'jenis_ujian'])->findOrFail($id);

        // Ambil jadwal ujian terkait
        $jadwalUjian = JadwalUjian::where('id_penjadwalan', $id)->first();

        if (!$jadwalUjian) {
            return redirect()->back()->with('error', 'Jadwal ujian tidak ditemukan.');
        }

        // Parse peserta yang sudah terdaftar dari kode_kelas di jadwal_ujian
        $pesertaIds = [];
        if ($jadwalUjian->kode_kelas) {
            $pesertaIds = explode(',', $jadwalUjian->kode_kelas);
            $pesertaIds = array_filter(array_map('trim', $pesertaIds));
        }

        // Query peserta yang terdaftar dengan pagination, search, filter, dan sort
        $search = $request->input('search');
        $filter = $request->input('filter');
        $sort = $request->input('sort', 'nama');
        $direction = $request->input('direction', 'asc');
        $pages = $request->query('pages', 10);
        $query = Peserta::with('jurusanRef');

        if (!empty($pesertaIds)) {
            $query->whereIn('id', $pesertaIds);
        } else {
            // Jika tidak ada peserta terdaftar, return empty query
            $query->whereRaw('1 = 0'); // This will return no results
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%");
            });
        }

        if ($filter !== null && $filter !== '') {
            $query->where('filter', $filter);
        }

        // Sorting: hanya izinkan sort by 'nama', 'nis', atau 'filter'
        $allowedSorts = ['nama', 'nis', 'filter'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->orderBy('nama');
        }

        $data = $query
            ->paginate((int)$pages)
            ->withQueryString();

        // Hitung jumlah peserta terdaftar
        $jumlahTerdaftar = !empty($pesertaIds) ? Peserta::whereIn('id', $pesertaIds)->count() : 0;

        // Ambil semua nilai unik filter dari peserta yang terdaftar
        $filterOptions = Peserta::query()
            ->select('filter')
            ->whereNotNull('filter')
            ->whereIn('id', $pesertaIds)
            ->distinct()
            ->orderBy('filter')
            ->pluck('filter')
            ->toArray();

        return Inertia::render('penjadwalan/peserta-manager', [
            'penjadwalan' => [
                'id_penjadwalan' => $penjadwalan->id_penjadwalan,
                'kode_jadwal' => $penjadwalan->kode_jadwal,
                'tanggal' => $penjadwalan->tanggal,
                'waktu_mulai' => $penjadwalan->waktu_mulai,
                'waktu_selesai' => $penjadwalan->waktu_selesai,
                'kuota' => $penjadwalan->kuota,
                'tipe_ujian' => $penjadwalan->tipe_ujian,
                'event' => [
                    'id_event' => $penjadwalan->event->id_event ?? null,
                    'nama_event' => $penjadwalan->event->nama_event ?? 'Event tidak ditemukan',
                ],
            ],
            'jadwalUjian' => $jadwalUjian,
            'data' => $data, // Paginated data peserta terdaftar
            'jumlahTerdaftar' => $jumlahTerdaftar,
            'sisaKuota' => $penjadwalan->kuota - $jumlahTerdaftar,
            'filters' => $request->only(['search', 'filter', 'sort', 'direction']),
            'filterOptions' => $filterOptions,
        ]);
    }

    /**
     * Tampilkan halaman untuk menambah peserta ke ujian
     */
    public function addPesertaForm(Request $request, $id)
    {
        $penjadwalan = Penjadwalan::with(['event', 'jenis_ujian'])->findOrFail($id);

        // Ambil jadwal ujian terkait
        $jadwalUjian = JadwalUjian::where('id_penjadwalan', $id)->first();

        if (!$jadwalUjian) {
            return redirect()->back()->with('error', 'Jadwal ujian tidak ditemukan.');
        }

        // Parse peserta yang sudah terdaftar dari kode_kelas
        $registeredPesertaIds = [];
        if ($jadwalUjian->kode_kelas) {
            $registeredPesertaIds = explode(',', $jadwalUjian->kode_kelas);
            $registeredPesertaIds = array_filter(array_map('trim', $registeredPesertaIds));
        }

        // Query peserta yang tersedia (belum terdaftar) dengan pagination dan search

        $search = $request->input('search');
        $filter = $request->input('filter');
        $sort = $request->input('sort', 'nama');
        $direction = $request->input('direction', 'asc');
        $pages = $request->query('pages', 10);
        $query = Peserta::with('jurusanRef')
            ->where('status', 1);

        if (!empty($registeredPesertaIds)) {
            $query->whereNotIn('id', $registeredPesertaIds);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%");
            });
        }

        if ($filter !== null && $filter !== '') {
            $query->where('filter', $filter);
        }

        // Sorting: hanya izinkan sort by 'nama', 'nis', atau 'filter'
        $allowedSorts = ['nama', 'nis', 'filter'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->orderBy('nama');
        }

        $data = $query
            ->paginate((int)$pages)
            ->withQueryString();

        $jumlahTerdaftar = count($registeredPesertaIds);

        // Ambil semua nilai unik filter dari peserta yang tersedia
        $filterOptions = Peserta::query()
            ->select('filter')
            ->whereNotNull('filter')
            ->distinct()
            ->orderBy('filter')
            ->pluck('filter')
            ->toArray();

        return Inertia::render('penjadwalan/add-peserta', [
            'penjadwalan' => [
                'id_penjadwalan' => $penjadwalan->id_penjadwalan,
                'kode_jadwal' => $penjadwalan->kode_jadwal,
                'tanggal' => $penjadwalan->tanggal,
                'waktu_mulai' => $penjadwalan->waktu_mulai,
                'waktu_selesai' => $penjadwalan->waktu_selesai,
                'kuota' => $penjadwalan->kuota,
                'tipe_ujian' => $penjadwalan->tipe_ujian,
                'event' => [
                    'id_event' => $penjadwalan->event->id_event ?? null,
                    'nama_event' => $penjadwalan->event->nama_event ?? 'Event tidak ditemukan',
                ],
            ],
            'jadwalUjian' => $jadwalUjian,
            'data' => $data, // Paginated data peserta tersedia
            'jumlahTerdaftar' => $jumlahTerdaftar,
            'sisaKuota' => $penjadwalan->kuota - $jumlahTerdaftar,
            'filters' => $request->only(['search', 'filter', 'sort', 'direction']),
            'filterOptions' => $filterOptions,
        ]);
    }

    /**
     * Tambahkan peserta ke jadwal ujian
     * Peserta ditambahkan dengan cara menyimpan ID peserta ke dalam kode_kelas di tabel jadwal_ujian
     */
    public function addPeserta(Request $request, $id)
    {
        $request->validate([
            'peserta_ids' => 'required|array|min:1',
            'peserta_ids.*' => 'exists:data_db.t_peserta,id',
        ]);

        $penjadwalan = Penjadwalan::with(['jenis_ujian'])->findOrFail($id);

        // Ambil semua jadwal ujian yang terkait dengan penjadwalan ini
        $jadwalUjians = JadwalUjian::where('id_penjadwalan', $id)->get();

        if ($jadwalUjians->isEmpty()) {
            return redirect()->back()->with('error', 'Jadwal ujian tidak ditemukan.');
        }

        // Hitung total peserta yang sudah terdaftar di semua jadwal ujian
        $existingPesertaIds = [];
        foreach ($jadwalUjians as $jadwalUjian) {
            if ($jadwalUjian->kode_kelas) {
                $ids = explode(',', $jadwalUjian->kode_kelas);
                $existingPesertaIds = array_merge($existingPesertaIds, array_filter(array_map('trim', $ids)));
            }
        }
        $existingPesertaIds = array_unique($existingPesertaIds);

        // Validasi kuota
        $pesertaBaru = count($request->peserta_ids);
        $jumlahTerdaftar = count($existingPesertaIds);

        if (($jumlahTerdaftar + $pesertaBaru) > $penjadwalan->kuota) {
            return redirect()->back()->with(
                'error',
                'Kuota tidak mencukupi.'
            );
        }

        // Gabungkan peserta baru dengan yang sudah ada
        $allPesertaIds = array_merge($existingPesertaIds, $request->peserta_ids);
        $allPesertaIds = array_unique($allPesertaIds); // Remove duplicates
        $kodeKelas = implode(',', $allPesertaIds);

        // Update semua jadwal ujian terkait penjadwalan ini
        foreach ($jadwalUjians as $jadwalUjian) {
            $jadwalUjian->update(['kode_kelas' => $kodeKelas]);
        }

        // Get kategori name for success message
        $kategoriSoal = KategoriSoal::find($penjadwalan->tipe_ujian);
        $kategoriNama = $kategoriSoal ? $kategoriSoal->kategori : 'Kategori';

        // Tetap di halaman add-peserta setelah submit
        return redirect()->back()->with(
            'success',
            "Berhasil menambahkan {$pesertaBaru} peserta ke semua jadwal ujian {$kategoriNama}."
        );
    }

    /**
     * Hapus peserta dari jadwal ujian
     * Peserta dihapus dengan cara menghapus ID peserta dari kode_kelas di tabel jadwal_ujian
     */
    public function removePeserta(Request $request, $id)
    {
        $request->validate([
            'peserta_id' => 'required|exists:data_db.t_peserta,id',
        ]);

        $penjadwalan = Penjadwalan::findOrFail($id);
        $jadwalUjian = JadwalUjian::where('id_penjadwalan', $id)->first();

        if (!$jadwalUjian) {
            return redirect()->back()->with('error', 'Jadwal ujian tidak ditemukan.');
        }

        // Parse peserta yang sudah terdaftar dari kode_kelas
        $existingPesertaIds = [];
        if ($jadwalUjian->kode_kelas) {
            $existingPesertaIds = explode(',', $jadwalUjian->kode_kelas);
            $existingPesertaIds = array_filter(array_map('trim', $existingPesertaIds));
        }

        // Hapus peserta dari daftar
        $pesertaIdToRemove = (string)$request->peserta_id;
        $updatedPesertaIds = array_filter($existingPesertaIds, function ($id) use ($pesertaIdToRemove) {
            return $id !== $pesertaIdToRemove;
        });

        // Update kode_kelas
        $kodeKelas = empty($updatedPesertaIds) ? null : implode(',', $updatedPesertaIds);
        $jadwalUjian->update(['kode_kelas' => $kodeKelas]);

        // Ambil nama peserta untuk pesan sukses
        $peserta = Peserta::find($request->peserta_id);
        $namaPeserta = $peserta ? $peserta->nama : 'Peserta';

        return redirect()->back()->with(
            'success',
            'Peserta berhasil dihapus.'
        );
    }

    /**
     * Clear all participants from an exam schedule
     */
    public function clearAllPeserta($id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        $jadwalUjian = JadwalUjian::where('id_penjadwalan', $id)->first();

        if (!$jadwalUjian) {
            return redirect()->back()->with('error', 'Jadwal ujian tidak ditemukan.');
        }

        // Clear all participants
        $jadwalUjian->update(['kode_kelas' => null]);

        return redirect()->back()->with(
            'success',
            'Semua peserta berhasil dihapus.'
        );
    }

    /**
     * Remove selected participants from an exam schedule
     */
    public function removeSelectedPeserta(Request $request, $id)
    {
        $request->validate([
            'peserta_ids' => 'required|array|min:1',
            'peserta_ids.*' => 'required|exists:data_db.t_peserta,id',
        ]);

        $penjadwalan = Penjadwalan::findOrFail($id);
        $jadwalUjian = JadwalUjian::where('id_penjadwalan', $id)->first();

        if (!$jadwalUjian) {
            return redirect()->back()->with('error', 'Jadwal ujian tidak ditemukan.');
        }

        // Parse peserta yang sudah terdaftar dari kode_kelas
        $existingPesertaIds = [];
        if ($jadwalUjian->kode_kelas) {
            $existingPesertaIds = explode(',', $jadwalUjian->kode_kelas);
            $existingPesertaIds = array_filter(array_map('trim', $existingPesertaIds));
        }

        // Remove selected participants
        $pesertaIdsToRemove = array_map('strval', $request->peserta_ids);
        $updatedPesertaIds = array_filter($existingPesertaIds, function ($id) use ($pesertaIdsToRemove) {
            return !in_array($id, $pesertaIdsToRemove);
        });

        // Update kode_kelas
        $kodeKelas = empty($updatedPesertaIds) ? null : implode(',', $updatedPesertaIds);
        $jadwalUjian->update(['kode_kelas' => $kodeKelas]);

        $jumlahDihapus = count($pesertaIdsToRemove);

        return redirect()->back()->with(
            'success',
            'Peserta berhasil dihapus.'
        );
    }

    /**
     * Generate kode jadwal seperti format TFL0002
     */
    private function generateKodeJadwal($idEvent, $idKategori)
    {
        // Ambil kategori soal (tipe ujian)
        $kategori = KategoriSoal::find($idKategori);

        if (!$kategori) {
            return 'UJI0001';
        }

        // Ambil 3 huruf konsonan dari tipe ujian, hilangkan non-huruf dan vokal
        $cleanKategori = strtoupper(preg_replace('/[^A-Za-z]/', '', $kategori->kategori));
        $konsonan = preg_replace('/[AEIOU]/i', '', $cleanKategori);

        // Ambil 3 huruf konsonan: pertama, kedua, dan terakhir (atau tambahkan 'X' jika kurang)
        if (strlen($konsonan) >= 3) {
            $prefix = $konsonan[0] . $konsonan[1] . $konsonan[strlen($konsonan) - 1];
        } elseif (strlen($konsonan) == 2) {
            $prefix = $konsonan[0] . $konsonan[1] . 'X';
        } elseif (strlen($konsonan) == 1) {
            $prefix = $konsonan[0] . 'XX';
        } else {
            $prefix = 'UJI';
        }

        // Cari nomor urut terakhir untuk prefix ini
        $lastKode = Penjadwalan::where('kode_jadwal', 'LIKE', $prefix . '%')
            ->orderBy('kode_jadwal', 'desc')
            ->first();

        if ($lastKode) {
            $lastNumber = (int) substr($lastKode->kode_jadwal, -4);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        $number = str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        return $prefix . $number;
    }

    /**
     * Duplicate JadwalUjian records based on event and assign to penjadwalan
     */
    private function createJadwalUjian($penjadwalan)
    {
        // Ambil SEMUA template yang tersedia (tanpa filter id_event)
        $templateJadwalUjian = JadwalUjian::where('kode_kelas', null)
            ->whereNull('id_penjadwalan') // Template yang belum pernah digunakan
            ->where('id_event', $penjadwalan->id_paket_ujian) // Hanya ambil template untuk event ini
            ->get();

        if ($templateJadwalUjian->isNotEmpty()) {
            $jadwalUjianBatch = []; // Array untuk batch insert

            // Loop untuk mempersiapkan data duplikasi setiap template yang ditemukan
            foreach ($templateJadwalUjian as $template) {
                // Cek duplikasi berdasarkan kombinasi unique untuk menghindari duplikat dalam batch
                $duplicateKey = $penjadwalan->id_penjadwalan . '-' . $template->id_event . '-' . $template->kode_part . '-' . $template->nama_ujian;

                // Tambahkan ke batch hanya jika belum ada dalam batch
                $jadwalUjianBatch[$duplicateKey] = [
                    'nama_ujian' => $template->nama_ujian,
                    'kode_kelas' => null, // Set untuk penjadwalan baru
                    'id_event' => $template->id_event, // Dari template
                    'kode_part' => $template->kode_part, // Dari template
                    'id_penjadwalan' => $penjadwalan->id_penjadwalan, // Assign ke penjadwalan
                ];
            }

            // Batch insert untuk efisiensi
            if (!empty($jadwalUjianBatch)) {
                JadwalUjian::insert(array_values($jadwalUjianBatch));
            }

            // Duplikasi soal untuk semua JadwalUjian yang baru dibuat
            $this->createJadwalUjianSoal($penjadwalan);
        } else {
            // Fallback: Create default JadwalUjian if no template found
            $kategoriSoal = KategoriSoal::find($penjadwalan->tipe_ujian);
            $kategoriNama = $kategoriSoal ? $kategoriSoal->kategori : 'Kategori Tidak Diketahui';

            // Clean kategori name for fallback
            if (strpos($kategoriNama, '-') !== false) {
                $kategoriNama = trim(explode('-', $kategoriNama)[0]);
            }

            $jadwalUjianBaru = JadwalUjian::create([
                'nama_ujian' => $kategoriNama,
                'kode_kelas' => null,
                'id_event' => $penjadwalan->id_paket_ujian,
                'kode_part' => null,
                'id_penjadwalan' => $penjadwalan->id_penjadwalan,
            ]);

            // Duplikasi soal untuk JadwalUjian fallback yang baru dibuat
            // Note: Mungkin tidak ada template soal untuk fallback case
            $this->createJadwalUjianSoal($penjadwalan);
        }
    }

    /**
     * Duplicate JadwalUjianSoal records for all JadwalUjian in this penjadwalan
     */
    private function createJadwalUjianSoal($penjadwalan)
    {
        // Ambil semua JadwalUjian yang baru dibuat untuk penjadwalan ini
        $jadwalUjianBaru = JadwalUjian::where('id_penjadwalan', $penjadwalan->id_penjadwalan)->get();

        if ($jadwalUjianBaru->isEmpty()) {
            return; // Tidak ada jadwal ujian, skip duplikasi soal
        }

        $soalBaruBatch = []; // Array untuk batch insert

        foreach ($jadwalUjianBaru as $jadwalUjian) {
            // Cek apakah sudah ada soal untuk jadwal ujian ini
            $existingSoal = JadwalUjianSoal::where('id_ujian', $jadwalUjian->id_ujian)
                ->where('id_penjadwalan', $penjadwalan->id_penjadwalan)
                ->exists();

            if ($existingSoal) {
                continue; // Skip jika sudah ada soal untuk jadwal ujian ini
            }

            // Cari template JadwalUjian yang sesuai untuk mendapatkan id_ujian template
            $templateJadwalUjian = JadwalUjian::where('kode_kelas', null)
                ->whereNull('id_penjadwalan')
                ->where('id_event', $jadwalUjian->id_event)
                ->where('nama_ujian', $jadwalUjian->nama_ujian)
                ->where('kode_part', $jadwalUjian->kode_part)
                ->first();

            if (!$templateJadwalUjian) {
                // Jika tidak ada template JadwalUjian yang cocok, skip
                continue;
            }

            // Cari template soal berdasarkan id_ujian dari template JadwalUjian
            // Template soal adalah yang id_penjadwalan = null DAN id_ujian = template.id_ujian
            $templateSoal = JadwalUjianSoal::whereNull('id_penjadwalan')
                ->where('id_ujian', $templateJadwalUjian->id_ujian)
                ->get();

            // Ambil semua kombinasi yang sudah ada untuk mencegah duplikasi
            $existingCombinations = JadwalUjianSoal::where('id_ujian', $jadwalUjian->id_ujian)
                ->where('id_penjadwalan', $penjadwalan->id_penjadwalan)
                ->pluck('kd_bidang')
                ->toArray();

            // Duplikasi setiap template soal yang ditemukan
            foreach ($templateSoal as $template) {
                // Cek duplikasi berdasarkan kd_bidang yang sudah ada
                if (!in_array($template->kd_bidang, $existingCombinations)) {
                    // Tambahkan ke batch untuk CREATE DUPLIKAT SOAL BARU
                    $soalBaruBatch[] = [
                        'id_ujian' => $jadwalUjian->id_ujian, // Link ke JadwalUjian yang baru (bukan template)
                        'kd_bidang' => $template->kd_bidang,
                        'total_soal' => $template->total_soal,
                        'ujian_soal' => $template->ujian_soal,
                        'id_penjadwalan' => $penjadwalan->id_penjadwalan, // Assign ke penjadwalan
                        'direction' => $template->direction,
                        'total_direction' => $template->total_direction,
                    ];

                    // Tambahkan ke existing combinations untuk mencegah duplikasi dalam batch yang sama
                    $existingCombinations[] = $template->kd_bidang;
                }
            }
        }

        // Batch insert untuk efisiensi
        if (!empty($soalBaruBatch)) {
            JadwalUjianSoal::insert($soalBaruBatch);
        }
    }

    /**
     * Get statistics of JadwalUjian and JadwalUjianSoal for a specific penjadwalan
     * Useful for debugging and verifying duplication results
     */
    private function getDuplikasiStats($penjadwalan)
    {
        $jadwalUjianCount = JadwalUjian::where('id_penjadwalan', $penjadwalan->id_penjadwalan)->count();
        $jadwalUjianSoalCount = JadwalUjianSoal::where('id_penjadwalan', $penjadwalan->id_penjadwalan)->count();

        return [
            'jadwal_ujian_count' => $jadwalUjianCount,
            'jadwal_ujian_soal_count' => $jadwalUjianSoalCount,
            'penjadwalan_id' => $penjadwalan->id_penjadwalan,
        ];
    }

    /**
     * Check if penjadwalan already has complete duplication (both JadwalUjian and JadwalUjianSoal)
     */
    private function isPenjadwalanComplete($penjadwalan)
    {
        $hasJadwalUjian = JadwalUjian::where('id_penjadwalan', $penjadwalan->id_penjadwalan)->exists();
        $hasJadwalUjianSoal = JadwalUjianSoal::where('id_penjadwalan', $penjadwalan->id_penjadwalan)->exists();

        return $hasJadwalUjian && $hasJadwalUjianSoal;
    }
}
