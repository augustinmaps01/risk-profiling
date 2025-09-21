<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $table = 'branch';

    protected $fillable = [
        'branch_name',
        'brak',
        'brcode',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the customers for the branch.
     */
    public function customers()
    {
        return $this->hasMany(Customer::class, 'branch_id');
    }

    /**
     * Get the users assigned to this branch.
     */
    public function users()
    {
        return $this->hasMany(User::class, 'branch_id');
    }

    /**
     * Scope to get branches by code.
     */
    public function scopeByCode($query, $code)
    {
        return $query->where('brcode', $code);
    }

    /**
     * Scope to get branches by name.
     */
    public function scopeByName($query, $name)
    {
        return $query->where('branch_name', 'like', '%'.$name.'%');
    }

    /**
     * Get formatted branch display name.
     */
    public function getDisplayNameAttribute()
    {
        return "{$this->branch_name} ({$this->brak})";
    }
}
