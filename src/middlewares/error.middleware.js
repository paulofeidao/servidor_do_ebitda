
export function tratamentoDeErros(erro, req, res, next) {
    console.error('[ERRO BACKEND]', erro.message);

    if (res.headersSent) {
        return next(erro);
    }

    return res.status(500).json({
        sucesso: false,
        mensagem: 'Ocorreu um erro interno no servidor.'
    });
}
