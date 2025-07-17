<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Dosen;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class DosenManagerEditController extends Controller
{
    public function edit($nip)
    {
        $dosen = Dosen::findOrFail($nip);

        return Inertia::render('dosen-management/form.dosen-manager', [
            'dosen' => [
                'nip' => $dosen->nip,
                'nama' => $dosen->nama,
                'aktif' => $dosen->aktif,
            ],
        ]);
    }

    public function update(Request $request, $nip)
    {
        $data = $request->validate([
            'nip' => 'required|string|unique:data_db.t_guru,nip,' . $nip . ',nip',
            'nama' => 'required|string',
            'password' => 'nullable|string|min:8',
            'aktif' => 'required|boolean',
        ]);

        $dosen = Dosen::findOrFail($nip);

        $passwordFinal = !empty($data['password'])
        ? bcrypt($data['password'])
        : $dosen->password;

        if ($nip !== $data['nip']) {
            // Ganti NIP → hapus & buat ulang
            $dosen->delete();
            Dosen::create([
                'nip' => $data['nip'],
                'nama' => $data['nama'],
                'password' => $passwordFinal,
                'aktif' => $data['aktif'],
            ]);
        } else {
            // Update biasa
            $updateData = [
                'nama' => $data['nama'],
                'aktif' => $data['aktif'],
                'password' => $passwordFinal,
            ];

            $dosen->update($updateData);
        }

        return redirect()->route('master-data.dosen.manager')->with('success', 'Dosen berhasil diedit');
    }
    public function create()
    {
        return Inertia::render('dosen-management/form.dosen-manager', [
            'dosen' => null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nip' => 'required|string|unique:data_db.t_guru,nip',
            'nama' => 'required|string',
            'password' => 'required|string|min:8',
            'aktif' => 'required|boolean',
        ]);

        Dosen::create([
            'nip' => $data['nip'],
            'nama' => $data['nama'],
            'password' => bcrypt($data['password']),
            'aktif' => $data['aktif'],
        ]);

        return redirect()->route('master-data.dosen.manager')->with('success', 'Dosen berhasil ditambahkan');
    }

    // Toggle status aktif
    public function toggleStatus($nip)
    {
        $dosen = Dosen::findOrFail($nip);
        $dosen->aktif = !$dosen->aktif;
        $dosen->save();

        return response()->json([
            'success' => true,
            'aktif' => $dosen->aktif,
        ]);
    }
}
