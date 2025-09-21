<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
    ];

    protected $casts = [
        'value' => 'json',
    ];

    public static function getValue(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        $value = $setting ? $setting->value : $default;

        // If setting has a type field, try to cast appropriately
        if ($setting && isset($setting->type)) {
            switch ($setting->type) {
                case 'integer':
                case 'int':
                    return (int) $value;
                case 'float':
                case 'double':
                    return (float) $value;
                case 'boolean':
                case 'bool':
                    return (bool) $value;
                default:
                    return $value;
            }
        }

        return $value;
    }

    public static function setValue(string $key, $value, string $type = 'string', string $group = 'general', ?string $description = null): void
    {
        self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'group' => $group,
                'description' => $description,
            ]
        );
    }
}
