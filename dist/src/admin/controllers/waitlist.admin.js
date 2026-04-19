"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminExportWaitlistCSV = exports.adminGetWaitlist = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const adminGetWaitlist = async (req, res) => {
    const entries = await prisma_1.default.waitlistEntry.findMany({
        orderBy: { createdAt: 'desc' },
    });
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekCount = entries.filter(e => new Date(e.createdAt) >= oneWeekAgo).length;
    res.render('waitlist', { entries, weekCount });
};
exports.adminGetWaitlist = adminGetWaitlist;
const adminExportWaitlistCSV = async (req, res) => {
    const entries = await prisma_1.default.waitlistEntry.findMany({
        orderBy: { createdAt: 'desc' },
    });
    const header = 'Name,Email,City,Province,Interests,Joined\n';
    const rows = entries.map(e => `"${e.name}","${e.email}","${e.city}","${e.province}","${e.interests.join('|')}","${new Date(e.createdAt).toLocaleDateString('en-ZA')}"`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="flaws-waitlist.csv"');
    res.send(header + rows);
};
exports.adminExportWaitlistCSV = adminExportWaitlistCSV;
