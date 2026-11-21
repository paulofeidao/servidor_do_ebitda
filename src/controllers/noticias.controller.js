import {
    obterNoticias,
    obterDestaques,
    obterCategorias,
    obterEmpresasMonitorizadas,
    obterEstadoRecolha
} from '../services/noticias.service.js';

function numeroLimite(valor, padrao = 50, maximo = 100) {
    const numero = Number.parseInt(valor, 10);

    if (!Number.isFinite(numero) || numero < 1) return padrao;

    return Math.min(numero, maximo);
}

/**
 * GET /api/noticias
 * Filtros opcionais: q, categoria, empresa, limite.
 */
export async function consultarNoticias(req, res, next) {
    try {
        const resultado = await obterNoticias({
            pesquisa: req.query.q,
            categoria: req.query.categoria,
            empresa: req.query.empresa,
            limite: numeroLimite(req.query.limite, 50, 100)
        });

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Notícias obtidas com sucesso.',
            data: resultado.noticias,
            meta: {
                total: resultado.total,
                origem: resultado.origem,
                ultimaAtualizacao: resultado.ultimaAtualizacao,
                fontesConsultadas: resultado.fontesConsultadas,
                fontesComErro: resultado.fontesComErro
            }
        });
    } catch (erro) {
        return next(erro);
    }
}

/**
 * GET /api/noticias/destaques
 */
export async function consultarDestaquesNoticias(req, res, next) {
    try {
        const resultado = await obterDestaques(
            numeroLimite(req.query.limite, 10, 30)
        );

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Destaques obtidos com sucesso.',
            data: resultado.noticias,
            meta: {
                total: resultado.total,
                ultimaAtualizacao: resultado.ultimaAtualizacao
            }
        });
    } catch (erro) {
        return next(erro);
    }
}

/**
 * GET /api/noticias/categorias
 */
export async function consultarCategoriasNoticias(req, res, next) {
    try {
        const categorias = await obterCategorias();

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Categorias obtidas com sucesso.',
            data: categorias
        });
    } catch (erro) {
        return next(erro);
    }
}

/**
 * GET /api/noticias/empresas
 */
export async function consultarEmpresasNoticias(req, res, next) {
    try {
        const empresas = await obterEmpresasMonitorizadas();

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Empresas monitorizadas obtidas com sucesso.',
            data: empresas
        });
    } catch (erro) {
        return next(erro);
    }
}

/**
 * GET /api/noticias/status
 */
export async function consultarEstadoNoticias(req, res) {
    const estado = obterEstadoRecolha();

    return res.status(200).json({
        sucesso: true,
        mensagem: 'Estado do serviço de notícias.',
        data: estado
    });
}
