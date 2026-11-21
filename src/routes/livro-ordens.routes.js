import { Router } from 'express';
import { consultarLivroOrdens } from '../controllers/livro-ordens.controller.js';

const router = Router();

router.get('/', consultarLivroOrdens);

export default router;
