<?php

namespace Database\Seeders;

use App\Models\Criteria;
use App\Models\Option;
use Illuminate\Database\Seeder; // Assuming your model for options is Option

class optionsSeeder extends Seeder
{
    public function run()
    {
        $criteriaData = [
            [
                'label' => 'Nature of Products/Service',
                'options' => [
                    ['label' => 'Savings', 'points' => 1],
                    ['label' => 'Loan', 'points' => 2],
                ],
            ],
            [
                'label' => 'Purpose of account opening',
                'options' => [
                    ['label' => 'Personal/Salary Saving', 'points' => 1],
                    ['label' => 'Loan proceeds account', 'points' => 1],
                    ['label' => 'Business Operations', 'points' => 3],
                    ['label' => 'Remittance', 'points' => 5],
                    ['label' => 'Multi-purpose', 'points' => 5],
                ],
            ],
            // ... Add all other criteria here with 'label' set ...
        ];

        foreach ($criteriaData as $c) {
            // Check if label exists
            if (! isset($c['label'])) {
                // You can skip or assign a default label
                continue; // skip if no label to avoid DB error
            }

            // Create the Criteria
            $criteria = Criteria::create([
                'label' => $c['label'],
            ]);

            // Create associated options
            foreach ($c['options'] as $opt) {
                $criteria->options()->create([
                    'label' => $opt['label'],
                    'points' => $opt['points'],
                ]);
            }
        }
    }
}
