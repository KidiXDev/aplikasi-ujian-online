<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use App\Models\Dosen;

class DosenManagerEditController extends Controller
{
    public function edit($id)
    {
        $user = User::with(['roles', 'dosen'])->findOrFail($id);

        return Inertia::render('dosen-management/form.dosen-manager', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'nip' => $user->dosen->nip ?? '', // Ambil dari relasi
                'aktif' => $user->dosen->aktif ?? false, // Ambil dari relasi
            ],
            'allRoles' => Role::all(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $dosen = Dosen::where('nip', $user->nip)->first();

        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
            'nip' => 'required|string|unique:data_db.t_guru,nip,' . $request->nip . ',nip',
            'aktif' => 'required|boolean',
        ]);

        // Update data user
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'nip' => $data['nip'], // Perbarui NIP di tabel users
        ]);

        // Update or create data dosen
        $dosen = Dosen::where('nip', $user->nip)->first();

        if ($dosen) {
            $dosen->update([
                'nip' => $data['nip'], // Perbarui NIP di tabel t_guru
                'aktif' => $data['aktif'],
                'nama' => $data['name'],
            ]);
        } else {
            Dosen::create([
                'nip' => $data['nip'],
                'aktif' => $data['aktif'],
                'nama' => $data['name'],
            ]);
        }

        // Sinkronisasi roles
        if (isset($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return redirect()->route('master-data.dosen.manager')->with('success', 'User updated successfully');
    }

    public function create()
    {
        $allRoles = Role::all();

        return Inertia::render('dosen-management/form.dosen-manager', [
            'user' => null,
            'allRoles' => $allRoles
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
            'nip' => 'required|string|unique:data_db.t_guru,nip',
            'aktif' => 'required|boolean',
        ]);

        $user = User::create([
            'nip' => $data['nip'],
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);

        $dosen = Dosen::create([
            'nip' => $data['nip'],
            'aktif' => $data['aktif'],
            'password' => bcrypt($data['password']),
            'nama' => $data['name'],
        ]);

        if (isset($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return redirect()->route('master-data.dosen.manager')->with('success', 'User created successfully');
    }
}
