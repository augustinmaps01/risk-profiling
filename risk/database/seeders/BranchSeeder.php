<?php

namespace Database\Seeders;

use App\Models\Branch;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        Branch::truncate();

        // Branch data from the provided information
        $branches = [
            [
                'id' => 1,
                'branch_name' => 'Head Office',
                'brak' => 'HO',
                'brcode' => '00',
                'created_at' => '2025-08-03 14:31:55',
                'updated_at' => '2025-08-03 14:31:55',
            ],
            [
                'id' => 2,
                'branch_name' => 'Main Office',
                'brak' => 'MO',
                'brcode' => '01',
                'created_at' => '2025-08-03 14:33:50',
                'updated_at' => '2025-08-16 15:34:32',
            ],
            [
                'id' => 3,
                'branch_name' => 'Jasaan Branch',
                'brak' => 'JB',
                'brcode' => '02',
                'created_at' => '2025-08-03 14:51:10',
                'updated_at' => '2025-08-18 11:54:11',
            ],
            [
                'id' => 36,
                'branch_name' => 'Salay Branch',
                'brak' => 'SB',
                'brcode' => '03',
                'created_at' => '2025-08-10 10:43:03',
                'updated_at' => '2025-08-10 10:43:03',
            ],
            [
                'id' => 37,
                'branch_name' => 'CDO Branch',
                'brak' => 'CDOB',
                'brcode' => '04',
                'created_at' => '2025-08-10 10:44:27',
                'updated_at' => '2025-08-18 11:53:41',
            ],
            [
                'id' => 38,
                'branch_name' => 'Maramag Branch',
                'brak' => 'MB',
                'brcode' => '05',
                'created_at' => '2025-08-16 14:53:10',
                'updated_at' => '2025-08-16 14:53:10',
            ],
            [
                'id' => 39,
                'branch_name' => 'Gingoog Branch',
                'brak' => 'GNG-BLU',
                'brcode' => '06',
                'created_at' => '2025-08-16 15:21:08',
                'updated_at' => '2025-08-16 15:21:08',
            ],
            [
                'id' => 40,
                'branch_name' => 'Camiguin Branch Lite',
                'brak' => 'CMG-BLU',
                'brcode' => '07',
                'created_at' => '2025-08-16 17:22:16',
                'updated_at' => '2025-08-16 17:22:16',
            ],
            [
                'id' => 41,
                'branch_name' => 'Butuan Branch Lite',
                'brak' => 'BXU-BLU',
                'brcode' => '08',
                'created_at' => '2025-08-18 11:55:01',
                'updated_at' => '2025-08-18 11:55:01',
            ],
            [
                'id' => 42,
                'branch_name' => 'KIBAWE Branch Lite',
                'brak' => 'KIBAWE-BLU',
                'brcode' => '09',
                'created_at' => '2025-08-18 11:55:49',
                'updated_at' => '2025-08-18 11:55:49',
            ],
            [
                'id' => 43,
                'branch_name' => 'Claveria Branch Lite',
                'brak' => 'CVR-BLU',
                'brcode' => '10',
                'created_at' => '2025-08-20 23:02:37',
                'updated_at' => '2025-08-20 23:02:37',
            ],
        ];

        foreach ($branches as $branch) {
            Branch::create([
                'branch_name' => $branch['branch_name'],
                'brak' => $branch['brak'],
                'brcode' => $branch['brcode'],
                'created_at' => Carbon::parse($branch['created_at']),
                'updated_at' => Carbon::parse($branch['updated_at']),
            ]);
        }

        $this->command->info('Branch seeder completed successfully!');
        $this->command->info('Total branches created: '.count($branches));
    }
}
