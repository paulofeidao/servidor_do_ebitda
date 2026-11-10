
import app from './app.js';
import { ambiente } from './config/env.js';
import { logger } from './utils/logger.js';

const servidor = app.listen(ambiente.porta, () => {
    logger.sucesso(
        `EBITDA SOFTWARE BACKEND iniciado na porta ${ambiente.porta}.`
    );

    logger.info(
        `Ambiente de execução: ${ambiente.modo}`
    );

    logger.info(
        `Endereço local: http://localhost:${ambiente.porta}`
    );
});

// Encerramento controlado
function encerrarServidor(sinal) {
    logger.info(`Recebido sinal ${sinal}. A encerrar servidor...`);

    servidor.close(() => {
        logger.sucesso('Servidor encerrado correctamente.');
        process.exit(0);
    });
}

process.on('SIGINT', () => encerrarServidor('SIGINT'));
process.on('SIGTERM', () => encerrarServidor('SIGTERM'));
