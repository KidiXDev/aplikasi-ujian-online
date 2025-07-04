<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PesertaFilterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $peserta = DB::connection('data_db')->table('t_peserta')->get();

        foreach ($peserta as $row) {
            DB::connection('data_db')->table('t_peserta')
                ->where('id', $row->id)
                ->update(['filter' => rand(1, 3)]);
        }
    }
}
