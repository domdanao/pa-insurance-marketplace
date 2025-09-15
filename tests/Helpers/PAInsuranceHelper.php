<?php

if (! function_exists('validPAInsuranceData')) {
    function validPAInsuranceData(): array
    {
        return [
            // Application Type
            'application_type' => 'new',
            'existing_policy_number' => '',

            // Applicant's Information - Name
            'last_name' => 'Dela Cruz',
            'first_name' => 'Juan',
            'middle_name' => 'Santos',
            'suffix' => '',

            // Mailing Address
            'block_lot_phase_floor_unit' => '123',
            'street' => 'Rizal Street',
            'village_subdivision_condo' => 'San Antonio Village',
            'barangay' => 'Brgy. San Antonio',
            'city_municipality' => 'Manila',
            'province_state' => 'Metro Manila',
            'zip_code' => '1000',

            // Contact & Personal Info
            'mobile_no' => '09123456789',
            'email_address' => 'juan@example.com',
            'tin_sss_gsis_no' => '123-456-789-000',
            'gender' => 'male',
            'civil_status' => 'single',
            'date_of_birth' => '1990-01-15',
            'place_of_birth' => 'Manila',
            'citizenship_nationality' => 'Filipino',
            'source_of_funds' => 'salary',

            // Employment Information
            'name_of_employer_business' => 'Tech Company Inc.',
            'occupation' => 'Software Engineer',
            'occupational_classification' => 'class_1',
            'nature_of_employment_business' => 'Information Technology',
            'employer_business_address' => '456 Business District, Makati City',

            // Choice of Plan
            'choice_of_plan' => 'class_i',

            // Agreement and Privacy
            'agreement_accepted' => true,
            'data_privacy_consent' => true,
        ];
    }
}
