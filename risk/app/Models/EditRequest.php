<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EditRequest extends Model
{
    protected $fillable = [
        'user_id',
        'customer_id',
        'manager_id',
        'status',
        'reason',
        'manager_notes',
        'approved_at',
        'expires_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The user who made the request
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The customer to be edited
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * The manager handling the request
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Check if the request is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the request is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the request is disapproved
     */
    public function isDisapproved(): bool
    {
        return $this->status === 'disapproved';
    }

    /**
     * Check if the approval has expired
     */
    public function hasExpired(): bool
    {
        return $this->expires_at && $this->expires_at < now();
    }

    /**
     * Approve the request
     */
    public function approve(User $manager, ?string $notes = null, int $expiresInHours = 24): void
    {
        $this->update([
            'status' => 'approved',
            'manager_id' => $manager->id,
            'manager_notes' => $notes,
            'approved_at' => now(),
            'expires_at' => now()->addHours($expiresInHours),
        ]);
    }

    /**
     * Disapprove the request
     */
    public function disapprove(User $manager, ?string $notes = null): void
    {
        $this->update([
            'status' => 'disapproved',
            'manager_id' => $manager->id,
            'manager_notes' => $notes,
        ]);
    }
}
