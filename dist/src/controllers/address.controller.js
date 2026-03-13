"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAddresses = exports.addAddress = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const addAddress = async (req, res) => {
    const userId = req.user.id;
    const { fullName, street, city, province, postalCode, country } = req.body;
    const address = await prisma_1.default.address.create({
        data: { userId, fullName, street, city, province, postalCode, country },
    });
    res.status(201).json(address);
};
exports.addAddress = addAddress;
const getUserAddresses = async (req, res) => {
    const userId = req.user.id;
    const addresses = await prisma_1.default.address.findMany({ where: { userId } });
    res.json(addresses);
};
exports.getUserAddresses = getUserAddresses;
