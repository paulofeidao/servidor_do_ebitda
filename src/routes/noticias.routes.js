import { Router } from 'express';

import {
    consultarNoticias,
    consultarDestaquesNoticias,
    consultarCategoriasNoticias,
    consultarEmpresasNoticias,
    consultarEstadoNoticias
} from '../controllers/noticias.controller.js';

const router = Router();

router.get('/', consultarNoticias);
router.get('/destaques', consultarDestaquesNoticias);
router.get('/categorias', consultarCategoriasNoticias);
router.get('/empresas', consultarEmpresasNoticias);
router.get('/status', consultarEstadoNoticias);

export default router;
