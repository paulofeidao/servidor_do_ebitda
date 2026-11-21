import axios from 'axios';
import { ambiente } from '../config/env.js';

const clienteLivroOrdens = axios.create({
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
 * Consulta o livro de ordens da API externa com as credenciais já configuradas.
 * Devolve o payload original sem alterar o seu formato.
 */
export async function obterLivroOrdens() {
    try {
        const resposta = await clienteLivroOrdens.get(ambiente.api.urlLivroOrdens);
        return resposta.data;
    } catch (erro) {
        const erroIntegracao = new Error(
            erro.response
                ? `API do livro de ordens respondeu com HTTP ${erro.response.status}.`
                : erro.code === 'ECONNABORTED'
                    ? 'Tempo limite ao consultar o livro de ordens.'
                    : 'Falha de comunicação com a API do livro de ordens.'
        );

        erroIntegracao.status = erro.code === 'ECONNABORTED' ? 504 : 502;
        erroIntegracao.detalhes = erro.response?.data;
        throw erroIntegracao;
    }
}
