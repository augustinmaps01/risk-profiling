<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Options extends Model
{
    //
    protected $fillable = ['label', 'points', 'criteria_id'];

    protected $table = 'options';

    public function criteria()
    {
        return $this->belongsTo(Criteria::class);
    }
}
