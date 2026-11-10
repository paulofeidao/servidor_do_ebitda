
import {
    obterResumoMercado,
    verificarAPI
} from '../services/mercado.service.js';

/**
 * Devolve o resumo dos mercados.
 */
export async function consultarResumoMercado(req, res, next) {
    try {
        const dados = await obterResumoMercado();

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Dados do mercado obtidos com sucesso.',
            data: dados
        });

    } catch (erro) {
        next(erro);
    }
}

/**
 * Verifica a comunicação com a API externa.
 */
export async function consultarEstadoAPI(req, res) {
    const resultado = await verificarAPI();

    return res.status(
        resultado.disponivel ? 200 : 503
    ).json({
        sucesso: resultado.disponivel,
        mensagem: resultado.mensagem
    });
}
