import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Prioriza o .env da raiz; permite também a configuração histórica em src/.env.
const envRaiz = resolve(process.cwd(), '.env');
const envSrc = resolve(process.cwd(), 'src', '.env');

dotenv.config({
    path: existsSync(envRaiz) ? envRaiz : envSrc
});

function obterVariavel(nome, valorPadrao = undefined) {
    const valor = process.env[nome]?.trim();

    if (!valor && valorPadrao === undefined) {
        throw new Error(
            `A variável de ambiente ${nome} não está configurada.`
        );
    }

    return valor || valorPadrao;
}

const urlLivroOrdensPadrao = () => {
    try {
        return new URL('/api/livro-ordens', obterVariavel('API_URL')).toString();
    } catch {
        throw new Error('API_URL inválida. Configure uma URL válida no .env.');
    }
};

export const ambiente = Object.freeze({
    porta: Number(obterVariavel('PORT', '3001')),

    modo: obterVariavel('NODE_ENV', 'development'),

    api: {
        url: obterVariavel('API_URL'),
        urlLivroOrdens: obterVariavel('API_LIVRO_ORDENS_URL', urlLivroOrdensPadrao()),
        utilizador: obterVariavel('API_USER'),
        palavraPasse: obterVariavel('API_PASS')
    },

    cors: {
        origem: obterVariavel(
            'CORS_ORIGIN',
            'http://localhost:8081'
        )
    },

    noticias: {
        cacheTtlMs: Number(obterVariavel('NOTICIAS_CACHE_TTL_MS', '600000')),
        timeoutMs: Number(obterVariavel('NOTICIAS_TIMEOUT_MS', '15000')),
        maxPorFonte: Number(obterVariavel('NOTICIAS_MAX_POR_FONTE', '40'))
    }
});
