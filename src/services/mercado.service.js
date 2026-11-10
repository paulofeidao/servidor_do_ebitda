
import axios from 'axios';
import { ambiente } from '../config/env.js';

const clienteAPI = axios.create({
    baseURL: ambiente.api.url,
    auth: {
        username: ambiente.api.utilizador,
        password: ambiente.api.palavraPasse
    },
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    },
    timeout: 30000
});

/**
 * Obtém o resumo dos mercados na API externa.
 */
export async function obterResumoMercado() {
    try {
        const resposta = await clienteAPI.get('');

        const dados = resposta.data;

        if (!dados || typeof dados !== 'object') {
            throw new Error('A API devolveu uma resposta inválida.');
        }

        let resumoMercado = null;

        if (dados.success === true && dados.data?.mbtt) {
            resumoMercado = dados.data.mbtt;
        } else if (dados.success === true && dados.data) {
            resumoMercado = dados.data;
        } else if (dados.mbtt) {
            resumoMercado = dados.mbtt;
        }

        if (!resumoMercado) {
            throw new Error(
                'A resposta da API não contém os dados esperados do mercado.'
            );
        }

        return resumoMercado;

    } catch (erro) {
        if (erro.response) {
            throw new Error(
                `API externa respondeu com HTTP ${erro.response.status}.`
            );
        }

        throw new Error(
            erro.message || 'Falha na comunicação com a API externa.'
        );
    }
}

/**
 * Verifica se a API externa está acessível.
 */
export async function verificarAPI() {
    try {
        await obterResumoMercado();

        return {
            disponivel: true,
            mensagem: 'Comunicação com a API externa estabelecida.'
        };

    } catch (erro) {
        return {
            disponivel: false,
            mensagem: erro.message
        };
    }
}
