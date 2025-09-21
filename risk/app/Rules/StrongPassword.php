<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class StrongPassword implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail('The :attribute must be a string.');

            return;
        }

        if (strlen($value) < 8) {
            $fail('The :attribute must be at least 8 characters long.');

            return;
        }

        if (! preg_match('/[a-z]/', $value)) {
            $fail('The :attribute must contain at least one lowercase letter.');

            return;
        }

        if (! preg_match('/[A-Z]/', $value)) {
            $fail('The :attribute must contain at least one uppercase letter.');

            return;
        }

        if (! preg_match('/[0-9]/', $value)) {
            $fail('The :attribute must contain at least one number.');

            return;
        }

        if (! preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $value)) {
            $fail('The :attribute must contain at least one symbol (!@#$%^&*).');

            return;
        }

        // Check for common weak passwords
        $weakPasswords = [
            'password123!', 'admin123!', 'welcome123!', 'changeme123!',
            '123456789!', 'qwerty123!', 'abc123456!', 'password1!',
        ];

        if (in_array(strtolower($value), array_map('strtolower', $weakPasswords))) {
            $fail('The :attribute cannot be a commonly used password.');

            return;
        }

        // Check for repeated characters
        if (preg_match('/(.)\1{2,}/', $value)) {
            $fail('The :attribute cannot contain more than 2 consecutive identical characters.');

            return;
        }
    }
}
