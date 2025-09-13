<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Merchant>
 */
class MerchantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'business_name' => $this->faker->company(),
            'business_type' => $this->faker->randomElement(['LLC', 'Corporation', 'Sole Proprietorship', 'Partnership']),
            'tax_id' => $this->faker->numerify('##-#######'),
            'business_description' => $this->faker->paragraph(),
            'phone' => $this->faker->phoneNumber(),
            'website' => $this->faker->optional()->url(),
            'address_line_1' => $this->faker->streetAddress(),
            'address_line_2' => $this->faker->optional()->secondaryAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => 'USA',
            'bank_account_holder' => $this->faker->name(),
            'bank_account_number' => $this->faker->bankAccountNumber(),
            'bank_routing_number' => $this->faker->numerify('#########'),
            'bank_name' => $this->faker->company().' Bank',
            'status' => 'approved', // Default to approved for testing
            'approved_at' => now(),
        ];
    }

    /**
     * Create a merchant for an existing user
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
            'approved_by' => User::factory()->admin()->create()->id,
        ]);
    }

    /**
     * Create a pending merchant
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'approved_at' => null,
            'approved_by' => null,
        ]);
    }

    /**
     * Create a suspended merchant
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
            'rejection_reason' => 'Suspended for violations',
        ]);
    }

    /**
     * Create a rejected merchant
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'rejection_reason' => 'Application does not meet requirements',
            'approved_at' => null,
            'approved_by' => null,
        ]);
    }
}
