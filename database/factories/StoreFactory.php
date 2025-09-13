<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Store>
 */
class StoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'user_id' => User::factory()->merchant(),
            'name' => $name,
            'description' => fake()->paragraph(),
            'logo' => null,
            'banner' => null,
            'status' => 'pending',
            'settings' => null,
        ];
    }

    /**
     * Configure the model factory to set both user_id and merchant_id.
     */
    public function configure()
    {
        return $this->afterMaking(function ($store) {
            if ($store->user_id && $store->user && $store->user->merchant) {
                $store->merchant_id = $store->user->merchant->id;
            }
        });
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
        ]);
    }
}
