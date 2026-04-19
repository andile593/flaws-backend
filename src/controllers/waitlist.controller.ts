import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { sendWaitlistConfirmation } from '../lib/email'

// POST /waitlist
export const joinWaitlist = async (req: Request, res: Response) => {
  try {
    const { name, email, city, province, interests } = req.body

    if (!name || !email || !city || !province) {
      return res.status(400).json({ message: 'Name, email, city and province are required' })
    }

    // Check for existing entry
    const existing = await prisma.waitlistEntry.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ message: 'You\'re already on the list' })
    }

    const entry = await prisma.waitlistEntry.create({
      data: {
        name,
        email,
        city,
        province,
        interests: interests || [],
      },
    })

    // Send confirmation email — non-blocking
    sendWaitlistConfirmation({ to: email, customerName: name }).catch(console.error)

    res.status(201).json({ message: 'You\'re on the list', id: entry.id })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// GET /waitlist — admin only
export const getWaitlistEntries = async (req: Request, res: Response) => {
  try {
    const entries = await prisma.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(entries)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}