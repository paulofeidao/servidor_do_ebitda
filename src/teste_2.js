import 'dotenv/config';
import axios from 'axios';

async function testarAPI() {
    try {
        console.log('A conectar à API...\n');

        const response = await axios.get(process.env.API_URL, {
            auth: {
                username: process.env.API_USER,
                password: process.env.API_PASS
            },
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('HTTP Status:', response.status);
        console.log('Resposta da API:');
        console.log(JSON.stringify(response.data, null, 2));

        const dados = response.data;

        let resumoMercado = null;

        if (dados.success === true && dados.data?.mbtt) {
            resumoMercado = dados.data.mbtt;
        } else if (dados.success === true && dados.data) {
            resumoMercado = dados.data;
        } else if (dados.mbtt) {
            resumoMercado = dados.mbtt;
        }

        if (resumoMercado) {
            console.log('\nAPI FUNCIONOU!');
            console.log('Dados do mercado:');
            console.log(JSON.stringify(resumoMercado, null, 2));
        } else {
            console.log('\nA API respondeu, mas o formato não corresponde ao esperado.');
        }

    } catch (error) {
        console.error('\nERRO NA REQUISIÇÃO:');

        if (error.response) {
            console.error('HTTP Status:', error.response.status);
            console.error('Resposta:', error.response.data);
        } else if (error.code === 'ECONNABORTED') {
            console.error('Tempo limite da requisição excedido.');
        } else {
            console.error(error.message);
        }
    }
}

testarAPI();