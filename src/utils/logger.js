
const dataAtual = () => new Date().toLocaleString('pt-PT');

export const logger = {
    info(mensagem) {
        console.log(`[INFO] [${dataAtual()}] ${mensagem}`);
    },

    erro(mensagem) {
        console.error(`[ERRO] [${dataAtual()}] ${mensagem}`);
    },

    sucesso(mensagem) {
        console.log(`[SUCESSO] [${dataAtual()}] ${mensagem}`);
    }
};
