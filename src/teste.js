
import express from 'express';
import cors from 'cors';

const app = express();
const PORTA = 3002;

app.use(cors());
app.use(express.json());

// Dados simulados da BODIVA.
// Estrutura compatível com a resposta do backend real.
const ativos = [
    ['BAIAAAAA', 'Shares', '97050.00', '-0.46', 9, 30, '2916889.00'],
    ['BAIODOFA', 'Obrigações Ordinárias', '108.50', '-6.50', 9, 116, '3391484.25'],
    ['BCGAAAAA', 'Shares', '19001.00', '-2.56', 39, 394, '7486096.00'],
    ['BDVAAAAA', 'Shares', '99050.00', '-0.95', 7, 140, '13928750.00'],
    ['BFAAAAAA', 'Shares', '100000.00', '0.00', 23, 441, '44036500.00'],
    ['ENSAAAAA', 'Shares', '22800.00', '0.88', 12, 44, '1003592.05'],
    ['OG13M29A', 'OT-NR', '100.26', '0.00', 1, 1964, '2015725.63'],
    ['OH15G30A', 'OT-NR', '96.00', '0.00', 1, 100, '98997.15'],
    ['OH15I30C', 'OT-NR', '97.75', '0.00', 1, 90, '93558.06'],
    ['OH15M29B', 'OT-NR', '99.00', '9.00', 2, 473, '479103.59'],
    ['OH15M30A', 'OT-NR', '98.60', '-0.40', 13, 1019220, '1030400748.49'],
    ['OH15U30A', 'OT-NR', '101.00', '0.00', 1, 100, '107054.71'],
    ['OH19N27A', 'OT-NR', '102.50', '0.00', 1, 150, '164792.85'],
    ['OI15A30A', 'OT-NR', '100.00', '0.00', 2, 220, '222311.81'],
    ['OI15D30A', 'OT-NR', '100.00', '0.00', 1, 14847414, '15746382320.47'],
    ['OI15F30A', 'OT-NR', '105.00', '0.00', 2, 110, '119490.94'],
    ['OJ05G29D', 'OT-NR', '108.00', '0.00', 1, 1000, '1124960.87'],
    ['OJ08M30A', 'OT-NR', '104.00', '4.00', 1, 532, '567220.75'],
    ['OJ10G28B', 'OT-NR', '97.70', '-0.30', 7, 15063, '1525297877.73'],
    ['OJ10M28A', 'OT-NR', '103.00', '4.00', 8, 294, '30364198.90'],
    ['OJ10O31A', 'OT-NR', '101.90', '0.00', 1, 48, '49526.18'],
    ['OJ15G30A', 'OT-NR', '100.00', '0.00', 1, 4364891, '4000000878.44'],
    ['OJ15G31A', 'OT-NR', '102.00', '2.00', 7, 30060, '31732694.38'],
    ['OJ15L31B', 'OT-NR', '102.00', '-3.00', 2, 254, '274617.28'],
    ['OJ15N31B', 'OT-NR', '103.00', '0.00', 3, 1577, '1742732.84'],
    ['OJ15O31A', 'OT-NR', '102.00', '0.00', 2, 8960, '9253938.46'],
    ['OJ15S31B', 'OT-NR', '100.00', '0.00', 1, 22271122, '22796446713.66'],
    ['OJ15U30A', 'OT-NR', '102.00', '0.00', 2, 1084, '1172292.69'],
    ['OL01U31A', 'OT-NR', '110.00', '-15.00', 10, 2235, '2667616.43'],
    ['OL01U31A', 'OT-NR', '125.00', '0.00', 1, 10004717, '11000000190.48'],
    ['OL07A30A', 'OT-NR', '105.00', '-1.00', 1, 11, '1172950.55'],
    ['ON07A32A', 'OT-NR', '111.00', '0.05', 18, 744, '80889265.42'],
    ['ON30J33A', 'OT-NR', '101.50', '0.00', 3, 6, '634444.57'],
    ['OO01I34A', 'OT-NR', '138.00', '0.00', 6, 1936, '2680536.40'],
    ['SBAOAAAA', 'Shares', '59000.00', '-1.67', 31, 406, '24174296.60'],
    ['SNLEDOFB', 'Obrigações Ordinárias', '101.00', '-1.00', 3, 28, '293566.03'],
    ['UNTLAAAA', 'Shares', '28400.00', '0.00', 51, 874, '24599283.00']
].map(([symbol, typology, closePrice, changePrice, tradesCount, turnover, turnoverValue]) => ({
    symbol,
    typology,
    closE_PRICE: closePrice,
    changE_PRICE: changePrice,
    changE_PRICE_MANU: null,
    isiN_AUX: symbol,
    typologY_AUX: typology,
    turnover: String(turnover),
    turnoveR_VALUE: turnoverValue,
    tradeS_COUNT: String(tradesCount),
    tranS_DATE: null
}));

// Endpoint de simulação
app.get('/api/mercado/resumo', (req, res) => {
    res.status(200).json({
        sucesso: true,
        mensagem: 'Dados simulados do mercado obtidos com sucesso.',
        data: ativos
    });
});

// Rota de saúde do servidor de testes
app.get('/api/saude', (req, res) => {
    res.status(200).json({
        sucesso: true,
        mensagem: 'Servidor de simulação EBITDA SOFTWARE operacional.',
        ambiente: 'teste'
    });
});

app.listen(PORTA, '0.0.0.0', () => {
    console.log('==========================================');
    console.log(' EBITDA SOFTWARE | SERVIDOR DE TESTES');
    console.log('==========================================');
    console.log(`Servidor iniciado na porta ${PORTA}`);
    console.log(`Endpoint: http://localhost:${PORTA}/api/mercado/resumo`);
    console.log(`Total de instrumentos: ${ativos.length}`);
});
