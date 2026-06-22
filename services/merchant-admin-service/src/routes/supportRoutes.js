import express from 'express';
import { createTicket, getTickets, getTicketById, addMessage, updateTicketStatus } from '../controllers/supportController.js';

const router = express.Router();

router.route('/')
    .get(getTickets)
    .post(createTicket);

router.route('/:id')
    .get(getTicketById)
    .put(updateTicketStatus);

router.route('/:id/messages')
    .post(addMessage);

export default router;
