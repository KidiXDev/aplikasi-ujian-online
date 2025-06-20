<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dosen extends Model
{
    protected $connection = 'data_db'; 
    protected $table = 't_guru';      
    protected $primaryKey = 'nip';     
    public $incrementing = false;     
    protected $keyType = 'string';    

    public $timestamps = false;       

    protected $fillable = [
        'nip',
        'nama',
        'password',
        'aktif',
        'email',
    ];

    public function user(){
        return $this->belongsTo(User::class, 'nip', 'nip');
    }
}
