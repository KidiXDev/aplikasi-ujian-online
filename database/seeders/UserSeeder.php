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
        $admin = Role::create(['name' => 'admin']);
        $superAdmin = Role::create(['name' => 'super_admin']);

        $dosen = Role::create(['name' => 'dosen']);

        // bikin permission
        Permission::create(['name' => 'kelola-soal']);
        Permission::create(['name' => 'lihat-nilai']);
        Permission::create(['name' => 'atur-jadwal']);

        // assign permission ke role (gatau bener apa gk, tapi kurang lebihnya gitu)
        $admin->givePermissionTo(['lihat-nilai', 'atur-jadwal']);
        $superAdmin->givePermissionTo(Permission::all());
        $dosen->givePermissionTo(Permission::all());

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
