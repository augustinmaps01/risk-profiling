<?php

namespace Database\Seeders;

use App\Models\Criteria;
use App\Models\Options;
use Illuminate\Database\Seeder;

class CriteriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $criteriaData = [
            [
                'category' => 'Nature of Products/Service',
                'options' => [
                    ['label' => 'Savings', 'points' => 1],
                    ['label' => 'Loans', 'points' => 2],
                ],
            ],
            [
                'category' => 'Purpose of account opening',
                'options' => [
                    ['label' => 'Personal/Salary Saving', 'points' => 1],
                    ['label' => 'Loan proceeds account', 'points' => 1],
                    ['label' => 'Business Operations', 'points' => 3],
                    ['label' => 'Remittance', 'points' => 5],
                    ['label' => 'Multi-purpose', 'points' => 5],
                ],
            ],
            [
                'category' => 'Source of Funds/Wealth',
                'options' => [
                    ['label' => 'Salary(employed)', 'points' => 1],
                    ['label' => 'Business (grocery store, sari-sari, buy & sell etc.)', 'points' => 3],
                    ['label' => 'Personal services', 'points' => 3],
                    ['label' => 'Remittance/Allotment', 'points' => 5],
                    ['label' => 'Allowance from parents', 'points' => 1],
                    ['label' => 'Allowances from parents/siblings/relative (working abroad)', 'points' => 5],
                    ['label' => 'Allowances – scholarship (grants/subsidy)', 'points' => 1],
                    ['label' => 'Fiancé ', 'points' => 7],
                    ['label' => 'Commission based (e.g. direct selling – personal collection, avon etc.)', 'points' => 5],
                    ['label' => 'Self-employed/Freelancer', 'points' => 5],
                    ['label' => 'Investments', 'points' => 3],
                    ['label' => 'Retirement', 'points' => 1],
                    ['label' => 'Sale of property', 'points' => 3],
                    ['label' => 'Pension', 'points' => 1],
                    ['label' => 'High net worth/foreign income/unclear source ', 'points' => 9],
                ],
            ],
            [

                'category' => 'Nature of Business or Employment',
                'options' => [
                    ['label' => 'Goverment Employee', 'points' => 1],
                    ['label' => 'Private Employee', 'points' => 1],
                    ['label' => 'OFW/Seafarer', 'points' => 3],
                    ['label' => 'Professionals (doctor, lawyer,CPA, architect)', 'points' => 5],
                    ['label' => 'Micro/small business', 'points' => 3],
                    ['label' => 'Real estate dealer/car dealership/jewelry trader', 'points' => 7],
                    ['label' => 'Pawnshop/money service business/lending company', 'points' => 7],
                    ['label' => 'Import/export holding company', 'points' => 7],
                    ['label' => 'Receiving donations', 'points' => 9],
                ],
            ],
            [

                'category' => 'Country of Origin/Operations',
                'options' => [
                    ['label' => 'Philippines or FATF Low-risk', 'points' => 1],
                    ['label' => 'Medium-risk jurisdiction', 'points' => 7],
                    ['label' => 'High-risk/FATF blacklisted country', 'points' => 9],
                ],
            ],
            [

                'category' => 'Watchlist Screening (OFAC/UNSCC list)',
                'options' => [
                    ['label' => 'Not found in the list', 'points' => 0],
                    ['label' => 'Potential match', 'points' => 7],
                    ['label' => 'Confirmed watchlist match', 'points' => 9],
                ],
            ],
            [
                'category' => 'Existense of Suspicious Transaction',
                'options' => [
                    ['label' => 'No suspicious behavior or red flags', 'points' => 0],
                    ['label' => 'Minor inconsistencies in declared information', 'points' => 5],
                    ['label' => 'Sudden or unexplained large transactions', 'points' => 5],
                    ['label' => 'Reluctant to provide information/documents', 'points' => 7],
                    ['label' => 'Third-party deposits without clear relation', 'points' => 7],
                    ['label' => 'Use of nominee, shell company', 'points' => 11],
                    ['label' => 'Customer previously reported for STR or involved in adverse media', 'points' => 11],
                ],
            ],
            [

                'category' => 'Public or High Profile Positions',
                'options' => [
                    ['label' => 'Is the customer or authorized signatories currently holding a political position (PEP)', 'points' => 11],
                    ['label' => 'affiliated with any high-profile organization', 'points' => 11],
                    ['label' => 'Close associate or family member of a PEP', 'points' => 11],
                    ['label' => 'High-profile individual subject to adverse media or reputational risk', 'points' => 11],
                ],
            ],
            [

                'category' => 'Other Risk Factors (amount, frequency, duration)',
                'options' => [
                    ['label' => 'Small/infrequent (less than P100k/year)', 'points' => 1],
                    ['label' => 'P100k-P1M/year, regular', 'points' => 3],
                    ['label' => 'Large but explainable (sale of property, loan proceeds, inheritance, business)', 'points' => 1],
                    ['label' => 'High value but inconsistent transactions', 'points' => 5],
                    ['label' => 'Frequent large transactions with limited documentation (no clear business justification for frequent large deposits/withdrawals)', 'points' => 5],
                    ['label' => 'Sudden change in transaction patter (unusual spike in volume)', 'points' => 7],
                    ['label' => 'Long dormant period, then sudden large activity', 'points' => 5],
                ],
            ],
        ];

        foreach ($criteriaData as $criteria) {
            $createdCriteria = Criteria::create([
                'category' => $criteria['category'],
            ]);

            foreach ($criteria['options'] as $option) {
                Options::create([
                    'criteria_id' => $createdCriteria->id,
                    'label' => $option['label'],
                    'points' => $option['points'],
                ]);
            }
        }
    }
}
