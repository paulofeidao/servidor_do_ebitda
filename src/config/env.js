
import dotenv from 'dotenv';

dotenv.config();

function obterVariavel(nome, valorPadrao = undefined) {
    const valor = process.env[nome]?.trim();

    if (!valor && valorPadrao === undefined) {
        throw new Error(
            `A variável de ambiente ${nome} não está configurada.`
        );
    }

    return valor || valorPadrao;
}

export const ambiente = Object.freeze({
    porta: Number(obterVariavel('PORT', '3001')),

    modo: obterVariavel('NODE_ENV', 'development'),

    api: {
        url: obterVariavel('API_URL'),
        utilizador: obterVariavel('API_USER'),
        palavraPasse: obterVariavel('API_PASS')
    },

    cors: {
        origem: obterVariavel(
            'CORS_ORIGIN',
            'http://localhost:8081'
        )
    }
});
