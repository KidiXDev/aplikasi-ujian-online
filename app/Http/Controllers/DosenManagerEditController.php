<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Dosen;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

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
                'dosen' => [
                    'nip' => $user->dosen->nip ?? '',
                    'aktif' => $user->dosen->aktif ?? false,
            ],
        ],  'allRoles' => Role::all(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Validasi input, kecuali password karena opsional update password
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
            'nip' => 'required|string|unique:data_db.t_guru,nip,' . $user->nip . ',nip',
            'aktif' => 'required|boolean',
            'password' => 'nullable|string|min:8', // password opsional
        ]);

        // Update data user
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'nip' => $data['nip'],
        ]);

        // Update atau buat data dosen
        $dosen = Dosen::find($user->nip);

        $dosenData = [
            'nip' => $data['nip'],
            'aktif' => $data['aktif'],
            'nama' => $data['name'],
        ];

        // Jika ada password baru, hash dan set ke data dosen
        if (!empty($data['password'])) {
            $dosenData['password'] = bcrypt($data['password']);
        }

        if ($dosen) {
            $dosen->update($dosenData);
        } else {
            Dosen::create($dosenData);
        }

        // Sinkronisasi roles jika ada
        if (isset($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return redirect()->route('master-data.dosen.manager')->with('success', 'Dosen berhasil diedit');
    }

    public function create()
    {
        $allRoles = Role::all();

        return Inertia::render('dosen-management/form.dosen-manager', [
            'user' => null,
            'allRoles' => $allRoles,
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

        Dosen::create([
            'nip' => $data['nip'],
            'aktif' => $data['aktif'],
            'password' => bcrypt($data['password']),
            'nama' => $data['name'],
        ]);

        if (isset($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return redirect()->route('master-data.dosen.manager')->with('success', 'Dosen berhasil ditambahkan');
    }
}
