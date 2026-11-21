import { obterLivroOrdens } from '../services/livro-ordens.service.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/livro-ordens
 * Proxy autenticado para o endpoint externo, sem expor credenciais.
 */
export async function consultarLivroOrdens(req, res) {
    try {
        const dados = await obterLivroOrdens();

        return res.status(200).json(dados);
    } catch (erro) {
        logger.erro(`Livro de ordens: ${erro.message}`);

        return res.status(erro.status || 502).json({
            sucesso: false,
            mensagem: erro.message,
            ...(erro.detalhes !== undefined ? { detalhes: erro.detalhes } : {})
        });
    }
}
