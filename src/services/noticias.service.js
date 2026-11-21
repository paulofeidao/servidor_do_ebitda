import axios from 'axios';
import { createHash } from 'node:crypto';

import { ambiente } from '../config/env.js';
import { logger } from '../utils/logger.js';

// ============================================================
// FONTES RSS
// A lista mantém a intenção do código de referência fornecido.
// "filtrar: true" aplica a triagem temática económica/financeira.
// ============================================================

const FONTES_RSS = [
    {
        nome: 'Notícias de Angola — BODIVA',
        feed: 'https://noticiasdeangola.co.ao/etiquetas/bodiva/feed/',
        filtrar: false
    },
    {
        nome: 'Notícias de Angola — Economia',
        feed: 'https://noticiasdeangola.co.ao/feed/',
        filtrar: true
    },
    {
        nome: 'Expansão',
        feed: 'https://expansao.co.ao/feed/',
        filtrar: true
    },
    {
        nome: 'Valor Económico',
        feed: 'https://valoreconomico.co.ao/feed/',
        filtrar: true
    },
    {
        nome: 'O Telegrama',
        feed: 'https://www.otelegrama.ao/feed/',
        filtrar: true
    },
    {
        nome: 'Mercado',
        feed: 'https://mercado.co.ao/feed/',
        filtrar: true
    },
    {
        nome: 'Jornal de Angola',
        feed: 'https://www.jornaldeangola.ao/feed/',
        filtrar: true
    },
    {
        nome: 'Economia & Mercado',
        feed: 'https://economiaemercado.com/feed/',
        filtrar: true
    },
    {
        nome: 'O País — Economia',
        feed: 'https://opais.co.ao/feed/',
        filtrar: true
    }
];

const EMPRESAS_RSS = {
    BODIVA: ['bodiva', 'bolsa de dívida e valores de angola'],
    BAI: ['bai', 'banco angolano de investimentos'],
    BFA: ['bfa', 'banco de fomento angola'],
    BCGA: ['bcga', 'banco caixa geral angola', 'caixa angola'],
    ENSA: ['ensa', 'seguros de angola'],
    SBA: ['sba', 'standard bank angola'],
    Unitel: ['unitel'],
    CMC: ['cmc', 'caixa de mercado e comercio']
};

const PALAVRAS_ECONOMICAS = [
    'economia', 'económico', 'economico', 'financeiro', 'finanças', 'financas',
    'mercado', 'bolsa', 'ações', 'accoes', 'obrigações', 'obrigacoes',
    'investimento', 'investimentos', 'banco', 'bancário', 'bancario',
    'crédito', 'credito', 'inflação', 'inflacao', 'juros', 'câmbio', 'cambio',
    'kwanza', 'divisas', 'exportação', 'exportacao', 'importação', 'importacao',
    'petróleo', 'petroleo', 'brent', 'gás', 'gas', 'diamante', 'ouro',
    'mineração', 'mineracao', 'empresa', 'empresas', 'negócios', 'negocios',
    'receita', 'lucro', 'prejuízo', 'prejuizo', 'dividendos', 'capital',
    'indústria', 'industria', 'comércio', 'comercio', 'produção', 'producao',
    'agricultura', 'orçamento', 'orcamento', 'estado', 'tesouro', 'dívida',
    'divida', 'cmc', 'bodiva', 'ensa', 'unitel'
];

const CATEGORIAS = [
    { nome: 'Banca', termos: ['banco', 'bancário', 'bancario', 'crédito', 'credito', 'depósito', 'deposito'] },
    { nome: 'Mercado de Capitais', termos: ['bodiva', 'bolsa', 'ações', 'accoes', 'obrigações', 'obrigacoes', 'valores mobiliários'] },
    { nome: 'Seguros', termos: ['seguro', 'seguros', 'ensa', 'apólice', 'apolice'] },
    { nome: 'Energia e Petróleo', termos: ['petróleo', 'petroleo', 'brent', 'gás', 'gas natural', 'energia'] },
    { nome: 'Commodities', termos: ['ouro', 'diamante', 'cobre', 'brent', 'wti', 'petróleo', 'petroleo', 'café', 'cafe'] },
    { nome: 'Telecomunicações', termos: ['unitel', 'telecomunicações', 'telecomunicacoes', 'telecom'] },
    { nome: 'Economia', termos: ['economia', 'inflação', 'inflacao', 'kwanza', 'câmbio', 'cambio', 'orçamento', 'orcamento'] }
];

const clienteRSS = axios.create({
    timeout: ambiente.noticias.timeoutMs,
    responseType: 'text',
    headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'User-Agent': 'EBITDA-Software-NewsMonitor/1.0'
    },
    maxContentLength: 5 * 1024 * 1024,
    maxBodyLength: 5 * 1024 * 1024
});

// Cache por fonte: uma fonte com erro não elimina as notícias das outras.
const cachePorFonte = new Map();
const estadoFontes = new Map();

let ultimaAtualizacaoGlobal = null;
let ultimaVerificacao = 0;
let atualizacaoEmAndamento = null;

// ============================================================
// UTILITÁRIOS XML / TEXTO
// ============================================================

function descodificarEntidades(texto = '') {
    return String(texto)
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&apos;/gi, "'")
        .replace(/&#(\d+);/g, (_, codigo) => {
            try { return String.fromCodePoint(Number(codigo)); } catch { return ''; }
        })
        .replace(/&#x([0-9a-f]+);/gi, (_, codigo) => {
            try { return String.fromCodePoint(parseInt(codigo, 16)); } catch { return ''; }
        });
}

function extrairTag(xml, nomes) {
    for (const nome of nomes) {
        const tag = nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(
            `<(?:[\\w.-]+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${tag}\\s*>`,
            'i'
        );
        const correspondencia = xml.match(regex);

        if (correspondencia) {
            return descodificarEntidades(
                correspondencia[1]
                    .replace(/^\s*<!\[CDATA\[/i, '')
                    .replace(/\]\]>\s*$/i, '')
                    .trim()
            );
        }
    }

    return '';
}

function textoLimpo(valor = '') {
    return descodificarEntidades(String(valor))
        .replace(/<!\[CDATA\[|\]\]>/gi, '')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extrairImagem(itemXml, conteudo = '') {
    const candidatos = [
        /<enclosure\b[^>]*url=["']([^"']+)["'][^>]*>/i,
        /<(?:media:content|media:thumbnail)\b[^>]*url=["']([^"']+)["'][^>]*>/i,
        /<img\b[^>]*src=["']([^"']+)["'][^>]*>/i
    ];

    for (const regex of candidatos) {
        const resultado = itemXml.match(regex) || conteudo.match(regex);
        if (resultado?.[1]) return descodificarEntidades(resultado[1]);
    }

    return '';
}

function extrairUrl(itemXml) {
    const link = extrairTag(itemXml, ['link']);
    if (link && /^https?:\/\//i.test(link)) return link;

    const atomLink = itemXml.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
    return atomLink?.[1] ? descodificarEntidades(atomLink[1]) : '';
}

function normalizarData(valor) {
    if (!valor) return null;

    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data.toISOString();
}

function criarIdentificador(url, titulo, fonte) {
    const base = url || `${fonte}:${titulo}`;
    return createHash('sha1').update(base.toLowerCase()).digest('hex');
}

// ============================================================
// IDENTIFICAÇÃO DE EMPRESAS E CATEGORIAS
// ============================================================

function normalizarParaPesquisa(texto = '') {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function identificarEmpresas(texto) {
    const base = normalizarParaPesquisa(texto);
    const encontradas = [];

    for (const [empresa, aliases] of Object.entries(EMPRESAS_RSS)) {
        const encontrada = aliases.some((alias) => {
            const termo = normalizarParaPesquisa(alias);
            const regex = new RegExp(
                `(^|[^a-z0-9])${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`,
                'i'
            );
            return regex.test(base);
        });

        if (encontrada) encontradas.push(empresa);
    }

    return encontradas;
}

function identificarCategoria(texto) {
    const base = normalizarParaPesquisa(texto);

    for (const categoria of CATEGORIAS) {
        if (categoria.termos.some((termo) =>
            base.includes(normalizarParaPesquisa(termo))
        )) {
            return categoria.nome;
        }
    }

    return 'Geral';
}

function eNoticiaEconomica(texto) {
    const base = normalizarParaPesquisa(texto);

    return PALAVRAS_ECONOMICAS.some((termo) =>
        base.includes(normalizarParaPesquisa(termo))
    );
}

// ============================================================
// LEITURA E NORMALIZAÇÃO DE FEEDS
// ============================================================

function analisarFeed(xml, fonte) {
    if (typeof xml !== 'string' || !xml.trim()) {
        throw new Error('O feed devolveu conteúdo vazio.');
    }

    const blocosRSS = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
        .map((resultado) => resultado[1]);

    const blocosAtom = [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)]
        .map((resultado) => resultado[1]);

    const blocos = blocosRSS.length ? blocosRSS : blocosAtom;

    if (!blocos.length) {
        throw new Error('Não foram encontrados artigos RSS ou Atom no feed.');
    }

    return blocos.slice(0, ambiente.noticias.maxPorFonte).map((itemXml) => {
        const titulo = textoLimpo(extrairTag(itemXml, ['title']));
        const conteudoOriginal = extrairTag(itemXml, [
            'encoded', 'description', 'summary', 'content'
        ]);
        const resumo = textoLimpo(conteudoOriginal).slice(0, 600);
        const url = extrairUrl(itemXml);
        const data = normalizarData(
            extrairTag(itemXml, ['pubDate', 'published', 'updated', 'date'])
        );

        const textoPesquisa = `${titulo} ${resumo}`;
        const empresas = identificarEmpresas(textoPesquisa);
        const categoria = identificarCategoria(textoPesquisa);

        return {
            id: criarIdentificador(url, titulo, fonte.nome),
            titulo,
            resumo,
            imagem: extrairImagem(itemXml, conteudoOriginal),
            fonte: fonte.nome,
            url_original: url,
            data_publicacao: data,
            categoria,
            empresas,
            destaque: false,
            visualizacoes: 0,
            indicadores: []
        };
    }).filter((noticia) => noticia.titulo);
}

async function recolherFonte(fonte) {
    const resposta = await clienteRSS.get(fonte.feed);
    const noticias = analisarFeed(resposta.data, fonte);

    return fonte.filtrar
        ? noticias.filter((noticia) =>
            eNoticiaEconomica(`${noticia.titulo} ${noticia.resumo}`) ||
            noticia.empresas.length > 0
        )
        : noticias;
}

// ============================================================
// CACHE E ATUALIZAÇÃO
// ============================================================

function ordenarNoticias(lista) {
    return [...lista].sort((a, b) => {
        const dataA = a.data_publicacao ? new Date(a.data_publicacao).getTime() : 0;
        const dataB = b.data_publicacao ? new Date(b.data_publicacao).getTime() : 0;
        return dataB - dataA;
    });
}

function agregarNoticias() {
    const porId = new Map();

    for (const noticias of cachePorFonte.values()) {
        for (const noticia of noticias) {
            if (!porId.has(noticia.id)) {
                porId.set(noticia.id, noticia);
            }
        }
    }

    return ordenarNoticias([...porId.values()]);
}

async function atualizarFeeds(forcar = false) {
    const agora = Date.now();
    const cacheAindaValida =
        ultimaVerificacao > 0 &&
        agora - ultimaVerificacao < ambiente.noticias.cacheTtlMs;

    if (!forcar && cacheAindaValida && cachePorFonte.size > 0) {
        return;
    }

    if (atualizacaoEmAndamento) {
        return atualizacaoEmAndamento;
    }

    atualizacaoEmAndamento = (async () => {
        const resultados = await Promise.all(
            FONTES_RSS.map(async (fonte) => {
                try {
                    const noticias = await recolherFonte(fonte);
                    cachePorFonte.set(fonte.nome, noticias);
                    estadoFontes.set(fonte.nome, {
                        disponivel: true,
                        total: noticias.length,
                        ultimaConsulta: new Date().toISOString(),
                        erro: null
                    });

                    return { sucesso: true, fonte: fonte.nome };
                } catch (erro) {
                    const mensagem = erro.response
                        ? `HTTP ${erro.response.status}`
                        : erro.message;

                    estadoFontes.set(fonte.nome, {
                        disponivel: false,
                        total: cachePorFonte.get(fonte.nome)?.length || 0,
                        ultimaConsulta: new Date().toISOString(),
                        erro: mensagem
                    });

                    logger.erro(`RSS ${fonte.nome}: ${mensagem}`);

                    return { sucesso: false, fonte: fonte.nome, erro: mensagem };
                }
            })
        );

        ultimaVerificacao = Date.now();

        if (resultados.some((resultado) => resultado.sucesso)) {
            ultimaAtualizacaoGlobal = new Date().toISOString();
        }

        const sucessos = resultados.filter((resultado) => resultado.sucesso).length;
        const falhas = resultados.length - sucessos;

        logger.info(
            `Recolha RSS concluída: ${sucessos}/${resultados.length} fontes disponíveis; ${agregarNoticias().length} notícias em cache.`
        );

        // Se todas falharem e nunca houve dados, a consulta será considerada indisponível.
        if (sucessos === 0 && cachePorFonte.size === 0) {
            throw new Error('Não foi possível obter notícias de nenhuma fonte RSS.');
        }

        return { sucessos, falhas };
    })();

    try {
        return await atualizacaoEmAndamento;
    } finally {
        atualizacaoEmAndamento = null;
    }
}

async function garantirDados() {
    await atualizarFeeds(false);

    if (cachePorFonte.size === 0) {
        throw new Error('Ainda não existem notícias disponíveis.');
    }
}

// ============================================================
// API INTERNA DO SERVIÇO
// ============================================================

export async function obterNoticias(filtros = {}) {
    await garantirDados();

    let noticias = agregarNoticias();

    if (filtros.pesquisa) {
        const pesquisa = normalizarParaPesquisa(filtros.pesquisa);
        noticias = noticias.filter((noticia) =>
            normalizarParaPesquisa(
                `${noticia.titulo} ${noticia.resumo} ${noticia.fonte} ${noticia.empresas.join(' ')}`
            ).includes(pesquisa)
        );
    }

    if (filtros.categoria) {
        const categoria = normalizarParaPesquisa(filtros.categoria);
        noticias = noticias.filter((noticia) =>
            normalizarParaPesquisa(noticia.categoria) === categoria
        );
    }

    if (filtros.empresa) {
        const empresa = normalizarParaPesquisa(filtros.empresa);
        noticias = noticias.filter((noticia) =>
            noticia.empresas.some((nome) => normalizarParaPesquisa(nome) === empresa)
        );
    }

    const total = noticias.length;
    const limite = Math.max(1, Math.min(Number(filtros.limite) || 50, 100));

    return {
        noticias: noticias.slice(0, limite),
        total,
        origem: 'rss',
        ultimaAtualizacao: ultimaAtualizacaoGlobal,
        fontesConsultadas: FONTES_RSS.length,
        fontesComErro: [...estadoFontes.values()].filter((item) => !item.disponivel).length
    };
}


export async function obterDestaques(limite = 10) {
    await garantirDados();

    const quantidade = Math.max(
        1,
        Math.min(Number(limite) || 10, 30)
    );

    // Considerar apenas notícias com fotografias válidas.
    const noticias = agregarNoticias()
        .filter((noticia) => {
            const imagem = String(noticia.imagem || '').trim();

            return /^https?:\/\/[^\s]+$/i.test(imagem);
        })
        .sort((a, b) => {
            const dataA = new Date(a.data_publicacao || 0).getTime() || 0;
            const dataB = new Date(b.data_publicacao || 0).getTime() || 0;

            return dataB - dataA;
        })
        .slice(0, quantidade);

    return {
        noticias,
        total: noticias.length,
        ultimaAtualizacao: ultimaAtualizacaoGlobal
    };
}

export async function obterCategorias() {
    await garantirDados();

    const contagem = new Map();

    for (const noticia of agregarNoticias()) {
        const categoria = noticia.categoria || 'Geral';
        contagem.set(categoria, (contagem.get(categoria) || 0) + 1);
    }

    return [...contagem.entries()]
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total);
}

export async function obterEmpresasMonitorizadas() {
    await garantirDados();

    const noticias = agregarNoticias();

    return Object.keys(EMPRESAS_RSS).map((empresa) => ({
        nome: empresa,
        total: noticias.filter((noticia) => noticia.empresas.includes(empresa)).length
    }));
}

export function obterEstadoRecolha() {
    return {
        fontesConfiguradas: FONTES_RSS.length,
        fontes: FONTES_RSS.map((fonte) => ({
            nome: fonte.nome,
            estado: estadoFontes.get(fonte.nome) || {
                disponivel: false,
                total: 0,
                ultimaConsulta: null,
                erro: 'A fonte ainda não foi consultada.'
            }
        })),
        totalNoticiasEmCache: agregarNoticias().length,
        ultimaAtualizacao: ultimaAtualizacaoGlobal,
        proximaAtualizacaoEmMs: ultimaVerificacao
            ? Math.max(0, ambiente.noticias.cacheTtlMs - (Date.now() - ultimaVerificacao))
            : null
    };
}
