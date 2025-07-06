<?php

namespace App\Http\Controllers;

use App\Models\Penjadwalan;
use App\Models\Event;
use App\Models\KategoriSoal;
use App\Models\JadwalUjian;
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
                ->orWhereHas('event', function($q) use ($search) {
                    $q->where('nama_event', 'like', "%{$search}%");
                })
                ->orWhereHas('event.jadwalUjian', function($q) use ($search) {
                    $q->where('nama_ujian', 'like', "%{$search}%");
                });
        }

        $data = $query->orderBy('id_penjadwalan', 'desc')
            ->paginate($request->input('per_page', 10))
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
        // Ambil data Event dan KategoriSoal
        $events = Event::where('status', 1)->get(['id_event', 'nama_event']);
        $kategoriSoal = KategoriSoal::all(['id', 'kategori']);

        return Inertia::render('penjadwalan/form.penjadwalan-manager', [
            'events' => $events,
            'kategoriSoal' => $kategoriSoal,
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

            // Prepare nama untuk success message
            $kategoriNama = $kategoriSoal ? $kategoriSoal->kategori : 'Kategori Ujian';
            $namaEvent = $event ? $event->nama_event : 'Event';

            return redirect()->route('penjadwalan.index')
                ->with('success', "Jadwal ujian {$kategoriNama} - {$namaEvent} dengan kode {$kodeJadwal} berhasil ditambahkan.");
        });
    }

    public function edit($id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        
        // Load relasi yang diperlukan
        $penjadwalan->load(['event', 'jenis_ujian']);
        
        $events = Event::where('status', 1)->get(['id_event', 'nama_event']);
        $kategoriSoal = KategoriSoal::all(['id', 'kategori']);

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
            'events' => $events,
            'kategoriSoal' => $kategoriSoal,
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
            // Jika event atau kategori berubah, generate ulang kode jadwal
            if ($penjadwalan->id_paket_ujian != $validated['id_paket_ujian'] || 
                $penjadwalan->tipe_ujian != $validated['tipe_ujian']) {
                $validated['kode_jadwal'] = $this->generateKodeJadwal($validated['id_paket_ujian'], $validated['tipe_ujian']);
            }

            $penjadwalan->update($validated);

            // Ambil data kategori dan event untuk success message dengan null safety
            $kategoriSoal = KategoriSoal::find($validated['tipe_ujian']);
            $event = Event::find($validated['id_paket_ujian']);

            $kategoriNama = $kategoriSoal ? $kategoriSoal->kategori : 'Kategori Ujian';
            $namaEvent = $event ? $event->nama_event : 'Event';

            return redirect()->route('penjadwalan.index')
                ->with('success', "Jadwal ujian {$kategoriNama} - {$namaEvent} berhasil diperbarui.");
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

            // Hapus JadwalUjian yang terkait dengan penjadwalan ini
            JadwalUjian::where('id_penjadwalan', $penjadwalan->id_penjadwalan)->delete();

            // Hapus penjadwalan
            $penjadwalan->delete();

            return redirect()->back()
                ->with('success', "Penjadwalan {$namaEvent} dan jadwal ujian terkait berhasil dihapus.");
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
        
        // Query peserta yang terdaftar dengan pagination dan search
        $search = $request->input('search');
        $query = Peserta::with('jurusanRef');
        
        if (!empty($pesertaIds)) {
            $query->whereIn('id', $pesertaIds);
        } else {
            // Jika tidak ada peserta terdaftar, return empty query
            $query->whereRaw('1 = 0'); // This will return no results
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nis', 'like', "%{$search}%");
            });
        }
        
        $data = $query->orderBy('nama')
                  ->paginate($request->input('per_page', 10))
                  ->withQueryString();

        // Hitung jumlah peserta terdaftar
        $jumlahTerdaftar = !empty($pesertaIds) ? Peserta::whereIn('id', $pesertaIds)->count() : 0;

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
            'filters' => $request->only(['search']),
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
        $query = Peserta::with('jurusanRef')
                        ->where('status', 1); // Hanya peserta aktif
        
        if (!empty($registeredPesertaIds)) {
            $query->whereNotIn('id', $registeredPesertaIds);
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nis', 'like', "%{$search}%");
            });
        }
        
        $data = $query->orderBy('nama')
                      ->paginate($request->input('per_page', 10))
                      ->withQueryString();
        
        $jumlahTerdaftar = count($registeredPesertaIds);
        
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
            'filters' => $request->only(['search']),
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
        
        // Validasi kuota
        $pesertaBaru = count($request->peserta_ids);
        $jumlahTerdaftar = count($existingPesertaIds);
        
        if (($jumlahTerdaftar + $pesertaBaru) > $penjadwalan->kuota) {
            return redirect()->back()->with('error', 
                "Tidak dapat menambahkan peserta. Kuota tersisa: " . 
                ($penjadwalan->kuota - $jumlahTerdaftar) . " peserta."
            );
        }
        
        // Gabungkan peserta baru dengan yang sudah ada
        $allPesertaIds = array_merge($existingPesertaIds, $request->peserta_ids);
        $allPesertaIds = array_unique($allPesertaIds); // Remove duplicates
        
        // Update kode_kelas dengan daftar peserta baru
        $kodeKelas = implode(',', $allPesertaIds);
        $jadwalUjian->update(['kode_kelas' => $kodeKelas]);
        
        $kategoriNama = $penjadwalan->jenis_ujian ? $penjadwalan->jenis_ujian->kategori : 'Kategori';
        
        // Redirect ke halaman peserta manager setelah berhasil menambahkan
        return redirect()->route('penjadwalan.peserta', $id)->with('success', 
            "Berhasil menambahkan {$pesertaBaru} peserta ke jadwal ujian {$kategoriNama}."
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
        $updatedPesertaIds = array_filter($existingPesertaIds, function($id) use ($pesertaIdToRemove) {
            return $id !== $pesertaIdToRemove;
        });
        
        // Update kode_kelas
        $kodeKelas = empty($updatedPesertaIds) ? null : implode(',', $updatedPesertaIds);
        $jadwalUjian->update(['kode_kelas' => $kodeKelas]);
        
        // Ambil nama peserta untuk pesan sukses
        $peserta = Peserta::find($request->peserta_id);
        $namaPeserta = $peserta ? $peserta->nama : 'Peserta';
        
        return redirect()->back()->with('success', 
            "Peserta {$namaPeserta} berhasil dihapus dari jadwal ujian."
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
        
        return redirect()->back()->with('success', 
            'Semua peserta berhasil dihapus dari jadwal ujian.'
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
        $updatedPesertaIds = array_filter($existingPesertaIds, function($id) use ($pesertaIdsToRemove) {
            return !in_array($id, $pesertaIdsToRemove);
        });
        
        // Update kode_kelas
        $kodeKelas = empty($updatedPesertaIds) ? null : implode(',', $updatedPesertaIds);
        $jadwalUjian->update(['kode_kelas' => $kodeKelas]);
        
        $jumlahDihapus = count($pesertaIdsToRemove);
        
        return redirect()->back()->with('success', 
            "{$jumlahDihapus} peserta berhasil dihapus dari jadwal ujian."
        );
    }

    /**
     * Generate kode jadwal seperti format TFL0002
     */
    private function generateKodeJadwal($idEvent, $idKategori)
    {
        // Ambil event dan kategori
        $event = Event::find($idEvent);
        $kategori = KategoriSoal::find($idKategori);

        if (!$event || !$kategori) {
            return 'UJI0001';
        }

        // Ambil 3 huruf pertama dari kombinasi event dan kategori
        $eventCode = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $event->nama_event), 0, 2));
        $kategoriCode = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $kategori->kategori), 0, 1));
        
        // Kombinasi 3 huruf
        $prefix = $eventCode . $kategoriCode;
        
        // Jika kurang dari 3 huruf, tambahkan 'X'
        $prefix = str_pad($prefix, 3, 'X');
        
        // Jika lebih dari 3 huruf, potong menjadi 3
        $prefix = substr($prefix, 0, 3);

        // Cari nomor urut terakhir untuk prefix ini
        $lastKode = Penjadwalan::where('kode_jadwal', 'LIKE', $prefix . '%')
            ->orderBy('kode_jadwal', 'desc')
            ->first();

        if ($lastKode) {
            // Ambil 4 digit terakhir dan tambah 1
            $lastNumber = (int) substr($lastKode->kode_jadwal, -4);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        // Format 4 digit dengan leading zero
        $number = str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        // Gabungkan prefix + number (format: ABC0001)
        return $prefix . $number;
    }

    /**
     * Buat JadwalUjian otomatis saat Penjadwalan dibuat
     */
    private function createJadwalUjian($penjadwalan)
    {
        // Load relasi event dan ambil kategori manual
        $penjadwalan->load(['event']);
        $kategoriSoal = KategoriSoal::find($penjadwalan->tipe_ujian);

        // Ambil nama kategori saja (bagian sebelum tanda "-")
        $kategoriNama = $kategoriSoal ? $kategoriSoal->kategori : 'Kategori Tidak Diketahui';
        
        // Jika kategori mengandung tanda "-", ambil bagian sebelumnya saja
        if (strpos($kategoriNama, '-') !== false) {
            $kategoriNama = trim(explode('-', $kategoriNama)[0]);
        }

        // Buat JadwalUjian dengan nama ujian = tipe ujian saja
        JadwalUjian::create([
            'nama_ujian' => $kategoriNama,
            'kode_kelas' => null, // Akan diisi dengan ID peserta yang ikut ujian (format: "1,2,3,4")
            'id_event' => $penjadwalan->id_paket_ujian,
            'kode_part' => 1, // Default atau ambil dari logic tertentu
            'id_penjadwalan' => $penjadwalan->id_penjadwalan,
        ]);
    }
}
