<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Peserta;
use App\Models\Jurusan;
use App\Models\User;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class PesertaManagerEditController extends Controller
{
    public function edit($id)
    {
        $peserta = Peserta::findOrFail($id);
        $allRoles = Role::all();
        $jurusanList = Jurusan::all(['id_jurusan', 'nama_jurusan']);

        return Inertia::render('master-data/form.peserta-manager', [
            'peserta' => [
                'id' => $peserta->id,
                'username' => $peserta->username,
                'nis' => $peserta->nis,
                'nama' => $peserta->nama,
                'status' => $peserta->status,
                'jurusan' => $peserta->jurusan,
            ],
            'allRoles' => $allRoles,
            'jurusanList' => $jurusanList,
        ]);
    }

    public function update(Request $request, $id)
    {
        $peserta = Peserta::findOrFail($id);

        $data = $request->validate([
            'username' => 'required|string|max:255',
            'status' => 'required|integer',
            'jurusan' => 'required|integer',
            'nis' => 'required|string|max:255',
            'nama' => 'required|string|max:255',
            'password' => 'nullable|string|min:8',
        ]);

        $updateData = [
            'username' => $data['username'],
            'status' => $data['status'],
            'jurusan' => $data['jurusan'],
            'nis' => $data['nis'],
            'nama' => $data['nama'],
        ];

        if (!empty($data['password'])) {
            $updateData['password'] = bcrypt($data['password']);
        }

        $peserta->update($updateData);

        if (isset($data['roles'])) {
            $peserta->syncRoles($data['roles']);
        }

        $page = $request->input('page', 1); // <-- Tambahkan ini
        return redirect()->route('master-data.peserta.manager', ['page' => $page])
            ->with('success', 'Peserta berhasil diupdate');
    }

    public function create()
    {
        $allRoles = Role::all();
        $jurusanList = Jurusan::all(['id_jurusan', 'nama_jurusan']);

        return Inertia::render('master-data/form.peserta-manager', [
            'peserta' => null,
            'allRoles' => $allRoles,
            'jurusanList' => $jurusanList,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|max:255',
            'password' => 'required|string|min:8',
            'nis' => 'required|string|max:255',
            'nama' => 'required|string|max:255',
            // 'email' => 'required|email|unique:users,email',
        ]);

        $peserta = Peserta::create([
            'username' => $data['username'],
            'password' => bcrypt($data['password']),
            'nis' => $data['nis'],
            'nama' => $data['nama'],
        ]);

        // $user = User::create([
        //     'name' => $data['username'],
        //     'email' => $data['email'],
        //     'password' => bcrypt($data['password']),
        // ]);

        if (isset($data['roles'])) {
            $peserta->syncRoles($data['roles']);
        }

        // --- Tambahan: Redirect ke halaman terakhir ---
        $perPage = 10; // Ganti sesuai paginasi di frontend
        $total = Peserta::count();
        $lastPage = ceil($total / $perPage);

        return redirect()->route('master-data.peserta.manager', ['page' => $lastPage])
            ->with('success', 'Peserta berhasil ditambahkan');
    }
}
