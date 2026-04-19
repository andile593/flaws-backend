"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const waitlist_controller_1 = require("../controllers/waitlist.controller");
const router = (0, express_1.Router)();
router.post('/', waitlist_controller_1.joinWaitlist);
router.get('/', waitlist_controller_1.getWaitlistEntries); // protect with admin middleware if needed
exports.default = router;
