"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductBySlug = exports.getAllProducts = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// GET /api/products
const getAllProducts = async (req, res) => {
    const products = await prisma_1.default.product.findMany({
        where: { isActive: true },
        include: {
            images: true,
            variants: true,
            collection: true,
        },
    });
    res.json(products);
};
exports.getAllProducts = getAllProducts;
// GET /api/products/:slug
const getProductBySlug = async (req, res) => {
    const slug = req.params.slug;
    const product = await prisma_1.default.product.findUnique({
        where: { slug },
        include: {
            images: true,
            variants: true,
            collection: true,
        },
    });
    if (!product)
        return res.status(404).json({ message: 'Product not found' });
    res.json(product);
};
exports.getProductBySlug = getProductBySlug;
// POST /api/products
const createProduct = async (req, res) => {
    const { name, slug, description, gender, collectionId, images, variants } = req.body;
    const product = await prisma_1.default.product.create({
        data: {
            name,
            slug,
            description,
            gender,
            collectionId,
            images: { create: images },
            variants: { create: variants },
        },
        include: {
            images: true,
            variants: true,
            collection: true,
        },
    });
    res.status(201).json(product);
};
exports.createProduct = createProduct;
// PATCH /api/products/:id
const updateProduct = async (req, res) => {
    const id = req.params.id;
    const product = await prisma_1.default.product.update({
        where: { id },
        data: req.body,
    });
    res.json(product);
};
exports.updateProduct = updateProduct;
// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    const id = req.params.id;
    await prisma_1.default.product.update({
        where: { id },
        data: { isActive: false },
    });
    res.json({ message: 'Product deactivated' });
};
exports.deleteProduct = deleteProduct;
