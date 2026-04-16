import {Router} from "express";
import * as invoicesController from '../controllers/invoices.controller.js';
import { authenticate } from "../middlewares/authenticate";

const router = Router();
router.use(authenticate);

router.get('/api/invoices', invoicesController.getInvoices);
