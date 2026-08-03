<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name).'-'.$this->faker->unique()->randomNumber(4),
            'description' => $this->faker->paragraphs(2, true),
            'price' => $this->faker->randomElement([49000, 99000, 149000, 199000, 299000, 399000, 499000]),
            'stock' => $this->faker->numberBetween(5, 100),
            'image' => null,
            'category' => $this->faker->randomElement(['Fashion', 'Electronics', 'Home & Living', 'Beauty', 'Sports']),
            'is_active' => true,
        ];
    }
}
