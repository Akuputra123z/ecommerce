<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Kemeja Premium Linen',
                'slug' => 'kemeja-premium-linen',
                'description' => 'Kemeja berbahan linen premium yang nyaman dipakai sepanjang hari. Tersedia dalam berbagai warna pilihan yang elegan dan modern. Cocok untuk acara formal maupun kasual.',
                'price' => 299000,
                'stock' => 50,
                'category' => 'Fashion',
                'image' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
                'is_active' => true,
            ],
            [
                'name' => 'Sneakers Urban Classic',
                'slug' => 'sneakers-urban-classic',
                'description' => 'Sepatu sneakers dengan desain urban yang timeless. Sol karet berkualitas tinggi untuk kenyamanan maksimal. Cocok untuk berbagai aktivitas sehari-hari.',
                'price' => 599000,
                'stock' => 30,
                'category' => 'Fashion',
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
                'is_active' => true,
            ],
            [
                'name' => 'Wireless Earbuds Pro',
                'slug' => 'wireless-earbuds-pro',
                'description' => 'Earbuds nirkabel dengan teknologi noise cancellation terdepan. Baterai tahan hingga 30 jam dengan case pengisi daya. Suara jernih dan bass yang memukau.',
                'price' => 499000,
                'stock' => 25,
                'category' => 'Electronics',
                'image' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop',
                'is_active' => true,
            ],
            [
                'name' => 'Smart Watch Series 5',
                'slug' => 'smart-watch-series-5',
                'description' => 'Smartwatch dengan layar AMOLED dan fitur kesehatan lengkap. Monitor detak jantung, kadar oksigen, dan pelacak tidur. Water resistant hingga 50 meter.',
                'price' => 899000,
                'stock' => 15,
                'category' => 'Electronics',
                'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
                'is_active' => true,
            ],
            [
                'name' => 'Tas Tote Canvas Premium',
                'slug' => 'tas-tote-canvas-premium',
                'description' => 'Tas tote berbahan canvas tebal yang kuat dan stylish. Kapasitas besar cocok untuk laptop 13 inch dan keperluan sehari-hari. Tersedia dalam 5 warna pilihan.',
                'price' => 199000,
                'stock' => 60,
                'category' => 'Fashion',
                'image' => 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&h=600&fit=crop',
                'is_active' => true,
            ],
            [
                'name' => 'Skincare Set Vitamin C',
                'slug' => 'skincare-set-vitamin-c',
                'description' => 'Paket perawatan kulit lengkap dengan kandungan Vitamin C yang mencerahkan. Set terdiri dari serum, moisturizer, dan eye cream. Cocok untuk semua jenis kulit.',
                'price' => 349000,
                'stock' => 40,
                'category' => 'Beauty',
                'image' => 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop',
                'is_active' => true,
            ],
            [
                'name' => 'Yoga Mat Anti-Slip',
                'slug' => 'yoga-mat-anti-slip',
                'description' => 'Matras yoga premium dengan permukaan anti-slip yang aman. Ketebalan 6mm memberikan kenyamanan optimal. Material eco-friendly dan mudah dibersihkan.',
                'price' => 249000,
                'stock' => 35,
                'category' => 'Sports',
                'image' => 'https://images.unsplash.com/photo-1601925228932-02c6e4c44e0e?w=600&h=600&fit=crop',
                'is_active' => true,
            ],
            [
                'name' => 'Lampu LED Aesthetic',
                'slug' => 'lampu-led-aesthetic',
                'description' => 'Lampu LED dekorasi dengan 16 pilihan warna yang dapat dikontrol via app. Desain minimalis yang cocok untuk kamar tidur, ruang kerja, maupun ruang tamu.',
                'price' => 149000,
                'stock' => 80,
                'category' => 'Home & Living',
                'image' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(['slug' => $product['slug']], $product);
        }
    }
}
