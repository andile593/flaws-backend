import { Request, Response } from 'express'
import prisma from '../lib/prisma'

// GET /api/products
export const getAllProducts = async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: true,
      variants: true,
      collection: true,
    },
  })
  res.json(products)
}

// GET /api/products/:slug
export const getProductBySlug = async (req: Request, res: Response) => {
  const slug = req.params.slug as string
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      variants: true,
      collection: true,
    },
  })
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
}

// POST /api/products
export const createProduct = async (req: Request, res: Response) => {
  const { name, slug, description, gender, collectionId, images, variants } = req.body
  const product = await prisma.product.create({
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
  })
  res.status(201).json(product)
}


// PATCH /api/products/:id
export const updateProduct = async (req: Request, res: Response) => {
  const id = req.params.id as string
  const product = await prisma.product.update({
    where: { id },
    data: req.body,
  })
  res.json(product)
}


// DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
  const id = req.params.id as string
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  })
  res.json({ message: 'Product deactivated' })
}

export const searchProducts = async (req: Request, res: Response) => {
  const q = req.query.q as string
  if (!q || q.trim().length < 2) return res.json([])

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { collection: { name: { contains: q, mode: 'insensitive' } } },
        { variants: { some: { color: { contains: q, mode: 'insensitive' } } } },
      ],
    },
    include: {
      images: true,
      variants: { take: 1 },
      collection: { select: { name: true } },
    },
    take: 12,
  })

  res.json(products)
}

export const getRelatedProducts = async (req: Request, res: Response) => {
  const slug = req.params.slug as string

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, collectionId: true, gender: true },
  })

  if (!product) return res.json([])

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      OR: [
        { collectionId: product.collectionId },
        { gender: product.gender },
      ],
    },
    include: {
      images: true,
      variants: { take: 1 },
      collection: { select: { name: true } },
    },
    take: 4,
  })

  res.json(related)
}