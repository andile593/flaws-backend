"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCollection = exports.updateCollection = exports.createCollection = exports.getCollectionBySlug = exports.getAllCollections = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// GET /api/collections
const getAllCollections = async (req, res) => {
    const collections = await prisma_1.default.collection.findMany({
        include: { products: true },
    });
    res.json(collections);
};
exports.getAllCollections = getAllCollections;
// GET /api/collections/:slug
const getCollectionBySlug = async (req, res) => {
    const slug = req.params.slug;
    const collection = await prisma_1.default.collection.findUnique({
        where: { slug },
        include: {
            products: {
                where: { isActive: true },
                include: { images: true, variants: true },
            },
        },
    });
    if (!collection)
        return res.status(404).json({ message: 'Collection not found' });
    res.json(collection);
};
exports.getCollectionBySlug = getCollectionBySlug;
// POST /api/collections
const createCollection = async (req, res) => {
    const { name, slug, description, imageUrl, gender } = req.body;
    const collection = await prisma_1.default.collection.create({
        data: { name, slug, description, imageUrl, gender },
    });
    res.status(201).json(collection);
};
exports.createCollection = createCollection;
// PATCH /api/collections/:id
const updateCollection = async (req, res) => {
    const id = req.params.id;
    const collection = await prisma_1.default.collection.update({
        where: { id },
        data: req.body,
    });
    res.json(collection);
};
exports.updateCollection = updateCollection;
// DELETE /api/collections/:id
const deleteCollection = async (req, res) => {
    const id = req.params.id;
    await prisma_1.default.collection.delete({ where: { id } });
    res.json({ message: 'Collection deleted' });
};
exports.deleteCollection = deleteCollection;
