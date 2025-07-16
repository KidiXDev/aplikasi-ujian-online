<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // bikin role
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);

        $dosen = Role::firstOrCreate(['name' => 'dosen']);

        // bikin permission
        Permission::firstOrCreate(['name' => 'kelola-soal']);
        Permission::firstOrCreate(['name' => 'lihat-nilai']);
        Permission::firstOrCreate(['name' => 'atur-jadwal']);

        // assign permission ke role (gatau bener apa gk, tapi kurang lebihnya gitu)
        $admin->syncPermissions(['lihat-nilai', 'atur-jadwal']);
        $superAdmin->syncPermissions(Permission::all());
        $dosen->syncPermissions(Permission::all());

        $user = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Balatro',
                'password' => bcrypt('admin123'),
            ]
        );

        $user->assignRole('super_admin');
    }
}
