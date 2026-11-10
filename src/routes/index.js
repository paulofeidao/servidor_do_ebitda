
import { Router } from 'express';
import mercadoRoutes from './mercado.routes.js';

const router = Router();

router.use('/mercado', mercadoRoutes);

export default router;
