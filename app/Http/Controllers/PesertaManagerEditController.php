<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Peserta;
use App\Models\Jurusan;
use App\Models\KategoriSoal;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class PesertaManagerEditController extends Controller
{
    public function edit($id)
    {
        $peserta = Peserta::findOrFail($id);
        $allRoles = Role::all();
        $kategoriList = KategoriSoal::all(['id', 'kategori']);

        return Inertia::render('master-data/form.peserta-manager', [
            'peserta' => [
                'id' => $peserta->id,
                'username' => $peserta->username,
                'nis' => $peserta->nis,
                'nama' => $peserta->nama,
                'status' => $peserta->status,
                'jurusan' => $peserta->jurusan,
                'filter' => $peserta->filter,
            ],
            'allRoles' => $allRoles,
            'kategoriList' => $kategoriList,
        ]);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'username' => 'required|string|max:255',
            'status'   => 'required|integer',
            'jurusan'  => 'required|integer',
            'filter'   => 'required|string|max:2',
            'nis'      => 'required|string|max:15',
            'nama'     => 'required|string|max:255',
            'password' => 'nullable|string|min:8',
        ]);

        DB::transaction(function () use ($id, $data) {
            $peserta = Peserta::findOrFail($id);
            $oldNis = $peserta->nis;

            $updateData = [
                'username' => $data['username'],
                'status'   => $data['status'],
                'jurusan'  => $data['jurusan'],
                'filter'   => $data['filter'],
                'nis'      => $data['nis'],
                'nama'     => $data['nama'],
            ];

            if (!empty($data['password'])) {
                $updateData['password'] = bcrypt($data['password']);
            }

            $peserta->update($updateData);
            $peserta->refresh();

            if (isset($data['roles'])) {
                $peserta->syncRoles($data['roles']);
            }

            $status_yn = $peserta->status == 1 ? 'Y' : 'N';

            // Update tblkelas
            DB::connection('data_db')->table('tblkelas')
                ->where('Kelas', $oldNis)
                ->update([
                    'Kelas'  => $peserta->nis,
                    'tahun'  => date('Y'),
                    'Active' => $status_yn,
                ]);

            $kelasId = DB::connection('data_db')->table('tblkelas')
                ->where('Kelas', $peserta->nis)
                ->value('ID');

            // Update tblsiswa
            DB::connection('data_db')->table('tblsiswa')
                ->where('nis', $oldNis)
                ->update([
                    'nis'     => $peserta->nis,
                    'nama'    => $peserta->nama,
                    'IDKelas' => $kelasId,
                    'status'  => $status_yn,
                ]);
        });

        return redirect()->route('master-data.peserta.manager')
            ->with('success', 'Peserta berhasil diedit');
    }

    public function create()
    {
        $allRoles = Role::all();
        $kategoriList = KategoriSoal::all(['id', 'kategori']);

        return Inertia::render('master-data/form.peserta-manager', [
            'peserta' => null,
            'allRoles' => $allRoles,
            'kategoriList' => $kategoriList,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|max:255',
            'password' => 'required|string|min:8',
            'nis'      => 'required|string|max:15',
            'nama'     => 'required|string|max:255',
            'status'   => 'nullable|integer|in:0,1',
            'jurusan'  => 'required|integer',
            'filter'   => 'required|string|max:2',
        ]);

        DB::transaction(function () use ($data) {
            $status_yn = ($data['status'] ?? 1) == 1 ? 'Y' : 'N';

            $peserta = Peserta::create([
                'username' => $data['username'],
                'password' => bcrypt($data['password']),
                'nis'      => $data['nis'],
                'nama'     => $data['nama'],
                'jurusan'  => $data['jurusan'],
                'filter'   => $data['filter'],
                'status'   => $data['status'] ?? 1,
                'aktif'    => 1,
            ]);

            if (isset($data['roles'])) {
                $peserta->syncRoles($data['roles']);
            }

            DB::connection('data_db')->table('tblkelas')->updateOrInsert(
                ['Kelas' => $data['nis']],
                [
                    'tahun'  => date('Y'),
                    'Active' => $status_yn,
                ]
            );

            $kelasId = DB::connection('data_db')->table('tblkelas')
                ->where('Kelas', $data['nis'])
                ->value('ID') ?? 0;

            DB::connection('data_db')->table('tblsiswa')->updateOrInsert(
                ['nis' => $data['nis']],
                [
                    'nama'    => $data['nama'],
                    'IDKelas' => $kelasId,
                    'status'  => $status_yn,
                ]
            );
        });

        return redirect()->route('master-data.peserta.manager')
            ->with('success', 'Peserta berhasil ditambahkan');
    }
}
