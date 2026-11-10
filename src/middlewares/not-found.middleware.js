
export function rotaNaoEncontrada(req, res) {
    return res.status(404).json({
        sucesso: false,
        mensagem: 'O endereço solicitado não existe.',
        caminho: req.originalUrl
    });
}
