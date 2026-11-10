
import { Router } from 'express';

import {
    consultarResumoMercado,
    consultarEstadoAPI
} from '../controllers/mercado.controller.js';

const router = Router();

router.get('/resumo', consultarResumoMercado);
router.get('/status', consultarEstadoAPI);

export default router;
