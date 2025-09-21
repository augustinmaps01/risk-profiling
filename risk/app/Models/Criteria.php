<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Criteria extends Model
{
    //
    protected $fillable = ['category'];

    protected $table = 'criteria';

    public function options()
    {
        return $this->hasMany(Options::class);
    }
}
