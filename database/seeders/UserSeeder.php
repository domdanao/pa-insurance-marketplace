<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create merchant users
        User::create([
            'name' => 'John Merchant',
            'email' => 'merchant1@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'merchant',
        ]);

        User::create([
            'name' => 'Jane Store',
            'email' => 'merchant2@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'merchant',
        ]);

        // Create buyer users
        User::create([
            'name' => 'Alice Buyer',
            'email' => 'buyer1@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'buyer',
        ]);

        User::create([
            'name' => 'Bob Customer',
            'email' => 'buyer2@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'buyer',
        ]);

        // Create additional users using factory
        User::factory(10)->create([
            'role' => 'buyer',
        ]);

        User::factory(5)->create([
            'role' => 'merchant',
        ]);
    }
}
