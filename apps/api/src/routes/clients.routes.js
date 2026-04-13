import { Router } from "express";
import * as clientsController from '../controllers/clients.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all clients
router.get('/', clientsController.getClients);

// Get single client with invoice details
router.get('/:id', clientsController.getClientById);

// Create new client
router.post('/', clientsController.createClient);

// Update client
router.put('/:id', clientsController.updateClient);

// Archive client (soft delete)
router.post('/:id/archive', clientsController.archiveClient);

// Restore archived client
router.post('/:id/restore', clientsController.restoreClient);

export default router;
