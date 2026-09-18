<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\DeliveryZone;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate([
            'email' => 'admin@237gentleman.cm',
        ], [
            'name' => 'Administrateur 237 Gentleman',
            'phone' => '237600000000',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        User::query()->updateOrCreate([
            'email' => 'fokoa@237gentleman.cm',
        ], [
            'name' => 'FOKOA',
            'phone' => '237600000001',
            'email_verified_at' => now(),
            'password' => Hash::make('FOKOUAsteve'),
            'role' => 'seller',
            'is_active' => true,
        ]);

        $categories = collect([
            ['name' => 'Costumes', 'slug' => 'costumes'],
            ['name' => 'Chaussures', 'slug' => 'chaussures'],
            ['name' => 'Accessoires', 'slug' => 'accessoires'],
            ['name' => 'Chemises', 'slug' => 'chemises'],
        ])->mapWithKeys(fn (array $category, int $index) => [
            $category['slug'] => Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                [...$category, 'sort_order' => $index + 1, 'is_active' => true],
            ),
        ]);

        collect([
            ['name' => 'Centre-ville', 'fee_cents' => 150000],
            ['name' => 'Bastos', 'fee_cents' => 200000],
            ['name' => 'Odza', 'fee_cents' => 250000],
        ])->each(fn (array $zone, int $index) => DeliveryZone::query()->updateOrCreate(
            ['city' => 'Yaounde', 'name' => $zone['name']],
            [...$zone, 'city' => 'Yaounde', 'sort_order' => $index + 1, 'is_active' => true],
        ));

        $products = [
            [
                'category' => 'costumes',
                'name' => 'Costume croise anthracite',
                'slug' => 'costume-croise-anthracite',
                'reference' => '237-CST-001',
                'description' => 'Coupe moderne, finition premium et tombé net pour rendez-vous, ceremonies et soirees.',
                'base_price_cents' => 9500000,
                'sale_price_cents' => 8500000,
                'image' => 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=900&q=80',
                'variants' => [
                    ['color_name' => 'Anthracite', 'color_hex' => '#2f3237', 'size' => '50', 'stock_quantity' => 3],
                    ['color_name' => 'Noir', 'color_hex' => '#0f0f10', 'size' => '52', 'stock_quantity' => 2],
                ],
            ],
            [
                'category' => 'chaussures',
                'name' => 'Richelieu cuir noir',
                'slug' => 'richelieu-cuir-noir',
                'reference' => '237-SHO-014',
                'description' => 'Chaussure habillee en cuir, sobre et brillante, pensée pour accompagner les tenues formelles.',
                'base_price_cents' => 4500000,
                'sale_price_cents' => 3500000,
                'image' => 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80',
                'variants' => [
                    ['color_name' => 'Noir', 'color_hex' => '#0f0f10', 'size' => '42', 'stock_quantity' => 2],
                    ['color_name' => 'Noir', 'color_hex' => '#0f0f10', 'size' => '43', 'stock_quantity' => 4],
                ],
            ],
            [
                'category' => 'chemises',
                'name' => 'Chemise blanche premium',
                'slug' => 'chemise-blanche-premium',
                'reference' => '237-SHT-008',
                'description' => 'Chemise blanche respirante avec col structure, ideale sous veste ou portee seule.',
                'base_price_cents' => 2800000,
                'sale_price_cents' => null,
                'image' => 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
                'variants' => [
                    ['color_name' => 'Blanc', 'color_hex' => '#f8f8f5', 'size' => 'M', 'stock_quantity' => 6],
                    ['color_name' => 'Blanc', 'color_hex' => '#f8f8f5', 'size' => 'L', 'stock_quantity' => 5],
                ],
            ],
            [
                'category' => 'accessoires',
                'name' => 'Ceinture cuir doree',
                'slug' => 'ceinture-cuir-doree',
                'reference' => '237-ACC-021',
                'description' => 'Ceinture en cuir noir avec boucle doree, signature discrete pour tenue elegante.',
                'base_price_cents' => 1800000,
                'sale_price_cents' => null,
                'image' => 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=80',
                'variants' => [
                    ['color_name' => 'Noir', 'color_hex' => '#0f0f10', 'size' => 'Unique', 'stock_quantity' => 8],
                ],
            ],
        ];

        foreach ($products as $index => $data) {
            $product = Product::query()->updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'category_id' => $categories[$data['category']]->id,
                    'name' => $data['name'],
                    'reference' => $data['reference'],
                    'description' => $data['description'],
                    'base_price_cents' => $data['base_price_cents'],
                    'sale_price_cents' => $data['sale_price_cents'],
                    'status' => 'published',
                    'is_featured' => $index < 4,
                    'published_at' => now(),
                ],
            );

            $product->media()->updateOrCreate(
                ['path' => $data['image']],
                ['type' => 'image', 'alt_text' => $data['name'], 'sort_order' => 1, 'is_primary' => true],
            );

            foreach ($data['variants'] as $variant) {
                $product->variants()->updateOrCreate(
                    ['color_name' => $variant['color_name'], 'size' => $variant['size']],
                    [
                        ...$variant,
                        'sku' => "{$data['reference']}-{$variant['size']}",
                        'low_stock_threshold' => 2,
                        'status' => $variant['stock_quantity'] > 0 ? 'available' : 'out_of_stock',
                    ],
                );
            }
        }
    }
}
