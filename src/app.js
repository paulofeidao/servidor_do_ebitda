
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { ambiente } from './config/env.js';
import rotas from './routes/index.js';

import { rotaNaoEncontrada } from './middlewares/not-found.middleware.js';
import { tratamentoDeErros } from './middlewares/error.middleware.js';

const app = express();

// Segurança HTTP
app.use(helmet());

// Configuração CORS
const origensPermitidas = ambiente.cors.origem
    .split(',')
    .map(origem => origem.trim());

app.use(cors({
    origin(origem, callback) {
        if (!origem || origensPermitidas.includes(origem)) {
            return callback(null, true);
        }

        return callback(new Error('Origem não autorizada pelo servidor.'));
    }
}));

// Leitura de JSON
app.use(express.json());

// Rota de saúde
app.get('/api/saude', (req, res) => {
    res.status(200).json({
        sucesso: true,
        mensagem: 'Servidor EBITDA SOFTWARE operacional.',
        ambiente: ambiente.modo
    });
});

// Rotas principais
app.use('/api', rotas);

// Tratamento de rotas inexistentes
app.use(rotaNaoEncontrada);

// Tratamento global de erros
app.use(tratamentoDeErros);

export default app;
