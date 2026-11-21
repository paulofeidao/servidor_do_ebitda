import { Router } from 'express';
import mercadoRoutes from './mercado.routes.js';
import noticiasRoutes from './noticias.routes.js';
import livroOrdensRoutes from './livro-ordens.routes.js';

const router = Router();

router.use('/mercado', mercadoRoutes);
router.use('/noticias', noticiasRoutes);
router.use('/livro-ordens', livroOrdensRoutes);

export default router;
