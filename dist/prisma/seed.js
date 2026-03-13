"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // Collections
    const mensCollection = await prisma.collection.create({
        data: {
            name: "Men's Essentials",
            slug: 'mens-essentials',
            description: 'Core wardrobe pieces for men',
            gender: client_1.Gender.MEN,
        },
    });
    const womensCollection = await prisma.collection.create({
        data: {
            name: "Women's Essentials",
            slug: 'womens-essentials',
            description: 'Core wardrobe pieces for women',
            gender: client_1.Gender.WOMEN,
        },
    });
    // Products
    await prisma.product.create({
        data: {
            name: 'Classic White Tee',
            slug: 'classic-white-tee',
            description: 'A clean, minimal white t-shirt. A wardrobe staple.',
            gender: client_1.Gender.MEN,
            collectionId: mensCollection.id,
            isFeatured: true,
            images: {
                create: [
                    { url: 'https://placehold.co/600x800?text=White+Tee', isPrimary: true, position: 0 },
                ],
            },
            variants: {
                create: [
                    { size: client_1.Size.S, color: 'White', colorHex: '#FFFFFF', sku: 'CWT-S-WHT', price: 299.99, stock: 20 },
                    { size: client_1.Size.M, color: 'White', colorHex: '#FFFFFF', sku: 'CWT-M-WHT', price: 299.99, stock: 30 },
                    { size: client_1.Size.L, color: 'White', colorHex: '#FFFFFF', sku: 'CWT-L-WHT', price: 299.99, stock: 25 },
                ],
            },
        },
    });
    await prisma.product.create({
        data: {
            name: 'Black Slim Joggers',
            slug: 'black-slim-joggers',
            description: 'Slim fit joggers for everyday wear.',
            gender: client_1.Gender.MEN,
            collectionId: mensCollection.id,
            images: {
                create: [
                    { url: 'https://placehold.co/600x800?text=Black+Joggers', isPrimary: true, position: 0 },
                ],
            },
            variants: {
                create: [
                    { size: client_1.Size.S, color: 'Black', colorHex: '#000000', sku: 'BSJ-S-BLK', price: 499.99, stock: 15 },
                    { size: client_1.Size.M, color: 'Black', colorHex: '#000000', sku: 'BSJ-M-BLK', price: 499.99, stock: 20 },
                    { size: client_1.Size.L, color: 'Black', colorHex: '#000000', sku: 'BSJ-L-BLK', price: 499.99, stock: 10 },
                ],
            },
        },
    });
    await prisma.product.create({
        data: {
            name: 'Floral Wrap Dress',
            slug: 'floral-wrap-dress',
            description: 'Elegant floral wrap dress, perfect for any occasion.',
            gender: client_1.Gender.WOMEN,
            collectionId: womensCollection.id,
            isFeatured: true,
            images: {
                create: [
                    { url: 'https://placehold.co/600x800?text=Floral+Dress', isPrimary: true, position: 0 },
                ],
            },
            variants: {
                create: [
                    { size: client_1.Size.XS, color: 'Coral Pink', colorHex: '#FF6B6B', sku: 'FWD-XS-CRL', price: 799.99, stock: 10 },
                    { size: client_1.Size.S, color: 'Coral Pink', colorHex: '#FF6B6B', sku: 'FWD-S-CRL', price: 799.99, stock: 15 },
                    { size: client_1.Size.M, color: 'Coral Pink', colorHex: '#FF6B6B', sku: 'FWD-M-CRL', price: 799.99, stock: 12 },
                ],
            },
        },
    });
    await prisma.product.create({
        data: {
            name: 'High Waist Cargo Pants',
            slug: 'high-waist-cargo-pants',
            description: 'Trendy high waist cargo pants with side pockets.',
            gender: client_1.Gender.WOMEN,
            collectionId: womensCollection.id,
            images: {
                create: [
                    { url: 'https://placehold.co/600x800?text=Cargo+Pants', isPrimary: true, position: 0 },
                ],
            },
            variants: {
                create: [
                    { size: client_1.Size.XS, color: 'Khaki', colorHex: '#C3B091', sku: 'HCP-XS-KHK', price: 649.99, stock: 8 },
                    { size: client_1.Size.S, color: 'Khaki', colorHex: '#C3B091', sku: 'HCP-S-KHK', price: 649.99, stock: 12 },
                    { size: client_1.Size.M, color: 'Khaki', colorHex: '#C3B091', sku: 'HCP-M-KHK', price: 649.99, stock: 10 },
                ],
            },
        },
    });
    console.log('Seed complete');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
