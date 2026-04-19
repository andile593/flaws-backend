import prisma from '../../lib/prisma'
import { Request, Response } from 'express'
 
export const adminGetWaitlist = async (req: Request, res: Response) => {
  const entries = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: 'desc' },
  })
 
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weekCount = entries.filter(e => new Date(e.createdAt) >= oneWeekAgo).length
 
  res.render('waitlist', { entries, weekCount })
}
 
export const adminExportWaitlistCSV = async (req: Request, res: Response) => {
  const entries = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: 'desc' },
  })
 
  const header = 'Name,Email,City,Province,Interests,Joined\n'
  const rows = entries.map(e =>
    `"${e.name}","${e.email}","${e.city}","${e.province}","${e.interests.join('|')}","${new Date(e.createdAt).toLocaleDateString('en-ZA')}"`
  ).join('\n')
 
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="flaws-waitlist.csv"')
  res.send(header + rows)
}
 