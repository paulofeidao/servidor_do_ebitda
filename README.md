# EBITDA SOFTWARE — Backend

Backend Node.js / Express do EBITDA SOFTWARE.

## Requisitos
- Node.js 20 ou superior recomendado.
- npm.

## Instalação
1. Copiar `.env.example` para `.env`.
2. Preencher `API_URL`, `API_LIVRO_ORDENS_URL`, `API_USER` e `API_PASS` com as configurações reais. `API_LIVRO_ORDENS_URL` é opcional: por padrão, o servidor deriva `/api/livro-ordens` a partir do domínio de `API_URL`.
3. Ajustar `CORS_ORIGIN` à origem autorizada da aplicação.
4. Instalar dependências com `npm install`.
5. Iniciar em desenvolvimento com `npm run dev` ou em produção com `npm start`.

## Rotas
- `GET /api/saude`
- `GET /api/mercado/resumo`
- `GET /api/mercado/status`
- `GET /api/livro-ordens` (consulta autenticada ao livro de ordens)
- `GET /api/noticias`
- `GET /api/noticias?limite=30`
- `GET /api/noticias?q=BAI`
- `GET /api/noticias?empresa=BODIVA`
- `GET /api/noticias?categoria=Banca`
- `GET /api/noticias/destaques`
- `GET /api/noticias/categorias`
- `GET /api/noticias/empresas`
- `GET /api/noticias/status`

## Livro de ordens

O endpoint `GET /api/livro-ordens` consulta a API externa com as credenciais já configuradas (`API_USER`/`API_PASS`) e devolve o payload original, sem transformação. O endpoint externo pode ser configurado com `API_LIVRO_ORDENS_URL`; se não for definido, é derivado do domínio de `API_URL`.

## Cache e fontes
A recolha RSS é feita no backend. O cache é mantido em memória por fonte, com validade configurável por `NOTICIAS_CACHE_TTL_MS`. Se uma fonte falhar, os últimos dados dessa fonte são preservados enquanto as restantes continuam a ser atualizadas.

O cache em memória é reiniciado quando o processo do servidor reinicia. Para persistência entre reinícios ou múltiplas instâncias, será necessária uma camada persistente (por exemplo, Redis ou base de dados), que não foi adicionada nesta integração.

## Segurança
Não publicar o ficheiro `.env`, credenciais, tokens ou segredos. O `.env` privado não faz parte deste pacote.
