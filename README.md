# CuritibAtiva

**Plataforma de Transparência e Acompanhamento Legislativo — Câmara Municipal de Curitiba**

Sistema web e mobile para cidadãos acompanharem proposições legislativas, vereadores e indicadores da Câmara Municipal de Curitiba em tempo real, com dashboards interativos, busca semântica e classificação automatizada por inteligência artificial.

---

## Sumário

- [Guia Rápido](#guia-rápido)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Frontend — Páginas e Rotas](#frontend--páginas-e-rotas)
- [Frontend — Componentes Compartilhados](#frontend--componentes-compartilhados)
- [Frontend — Serviços](#frontend--serviços)
- [Backend — Microserviços](#backend--microserviços)
- [Banco de Dados](#banco-de-dados)
- [Pipeline de Dados / ETL](#pipeline-de-dados--etl)
- [Treinamento de Machine Learning](#treinamento-de-machine-learning)
- [Autenticação e Estado Reativo](#autenticação-e-estado-reativo)
- [Infraestrutura](#infraestrutura)
- [Ambientes do Frontend](#ambientes-do-frontend)
- [Dados Mock](#dados-mock)
- [Testes](#testes)
- [Firebase Setup](#firebase-setup)
- [Troubleshooting](#troubleshooting)
- [Autores](#autores)

---

## Guia Rápido

```bash
# 1. Clone e acesse
cd TCC

# 2. Configure a chave da Groq (IA)
cp .env.example .env
# Edite .env e preencha GROQ_API_KEY
# Obtenha em: https://console.groq.com/keys

# 3. Suba todos os serviços
docker compose up --build
```

Após a inicialização completa:

| Serviço | URL |
|---|---|
| Frontend Web (Angular) | [http://localhost:80](http://localhost:80) |
| Frontend Mobile (Ionic) | [http://localhost:8100](http://localhost:8100) |
| API Gateway | [http://localhost:3000](http://localhost:3000) |
| Swagger UI | [http://localhost:3000/api/v1/swagger-ui.html](http://localhost:3000/api/v1/swagger-ui.html) |
| Health Check | [http://localhost:3000/health](http://localhost:3000/health) |

---

## Objetivo do Projeto

### Problema

Os cidadãos de Curitiba não dispõem de uma ferramenta unificada, acessível e intuitiva para acompanhar a produção legislativa da Câmara Municipal. As proposições (projetos de lei, requerimentos, indicações, moções e emendas) são publicadas em canais oficiais de baixa usabilidade, sem recursos de busca semântica, classificação inteligente, notificações personalizadas ou visualização analítica de dados. Além disso, não há um meio prático para o cidadão seguir vereadores específicos ou ser notificado sobre mudanças em proposições de seu interesse.

### Objetivo

Desenvolver uma plataforma multicamada — web responsiva e aplicativo mobile — que integre uma API de negócios, um serviço de inteligência artificial para classificação e sumarização de textos legislativos, e um dashboard analítico interativo. A plataforma deve permitir que o cidadão encontre, acompanhe e entenda proposições legislativas de forma simples, receba notificações em tempo real e visualize dados consolidados da atividade parlamentar.

### Solução

O **CuritibAtiva** oferece:

1. **Feed de proposições** com cards contendo título, vereador autor, tipo, categoria, ementa e engajamento (likes/dislikes) — filtro por tipo e busca semântica por similaridade vetorial.
2. **Acompanhamento personalizado** — seguir vereadores e favoritar proposições, com notificações em tempo real via SSE (web) e push (mobile) sobre novas proposições e alterações.
3. **Perfil de vereadores** com dados cadastrais, timeline de proposições e botão para seguir.
4. **Dashboards interativos** configuráveis pelo usuário com gráficos de barra, pizza e hierárquico, agrupados por data, categoria, vereador, gênero ou partido.
5. **Resumo inteligente por IA** (Groq LLM — Llama 3.3 70B) que traduz a linguagem rebuscada e complicada utilizada em proposições para linguagem cidadã e mais acessível.
6. **Autenticação segura** com JWT, proteção de rotas, e estado reativo que adapta a interface conforme o usuário esteja logado ou não.

---

## Arquitetura

```
[Browser / Mobile App]
       |
       | HTTP (porta 80 / 8100)
       v
[NGINX] — serve SPA, proxy /api/* → Gateway
       |
       | porta 3000
       v
[API Gateway (Express / TypeScript)]
  /api/bi/*  ──────→  [ms-python (FastAPI / Python)]  :8085
  /api/v1/*  ──────→  [ms-java (Spring Boot / Java)] :8080
                            |
                            | PostgreSQL LISTEN/NOTIFY
                            v
                      [PostgreSQL 15 + pgvector]

                      [CMC Portal] ←── [Scraper Jobs (ms-python)]
                           |
                      TrOCR CAPTCHA solver
                           |
                      Dados extraídos → PostgreSQL
```

### Fluxo de Dados

1. **Frontend** (Angular) comunica-se exclusivamente com o **API Gateway** — nunca diretamente com os microserviços.
2. **Gateway** roteia por prefixo: `/api/bi/*` → ms-python, `/api/v1/*` → ms-java.
3. **ms-python** consome a Groq API para classificação (`/tag`) e sumarização (`/resumo`) via LLM, e gera embeddings com Sentence Transformers (`/embedding`).
4. **PostgreSQL** dispara gatilhos `NOTIFY` em inserts/updates de proposições. O `ProposicaoListenerService` captura esses eventos, persiste notificações e envia SSE + push (FCM).
5. **Busca semântica**: o frontend envia o texto para `/embedding` no ms-python, recebe o vetor 768d, e a Business API executa similaridade do cosseno no pgvector.
6. **Scraping**: jobs ETL no ms-python extraem dados do portal da CMC utilizando TrOCR para resolver CAPTCHA, processam e classificam proposições e geram embeddings automaticamente.

---

## Funcionalidades

### Autenticação e Usuário
- Cadastro em 3 etapas com validação de CPF e e-mail
- Login com JWT (validade 2h), protegido por interceptor HTTP
- **Estado reativo global** — `BehaviorSubject<boolean>` + `signal` no `AuthService`; serviços e guards reagem a login/logout sem refresh
- **Auth guard** em 5 rotas protegidas (`/perfil`, `/historico`, `/configuracoes`, `/editar-perfil`, `/seguindo`)
- **Redirecionamento automático** ao deslogar em rota protegida (via `authState$` no `AppComponent`)
- **Reset de estado** no logout — `NotificacaoService` limpa cache, fecha SSE, etc. via `reset$`
- Atualização de perfil (nome, e-mail, senha)
- Exclusão de conta (soft delete com reativação em até 7 dias)
- Recuperação de senha via e-mail

### Feed de Proposições (Home)
- Listagem paginada com cards contendo: título, vereador, tipo, tag, ementa (truncada em 3 linhas), likes/dislikes
- Filtro por tipo de proposição ao clicar na chip
- Busca semântica por similaridade vetorial em linguagem natural
- **Pull-to-refresh** mobile nas abas Home, Pesquisa e Favoritos/Seguindo

### Perfil de Vereadores
- Página individual com dados cadastrais (partido, gabinete, telefone, e-mail, site)
- Timeline de proposições do vereador
- Botão "Seguir" com verificação de autenticação
- **Tabela lateral** (sidebar desktop) com top vereadores e follow toggle reativo

### Acompanhamento Personalizado
- Seguir vereadores com notificações de novas proposições
- Favoritar proposições para acesso rápido
- Aba unificada com modo "Favoritos" e "Seguindo" (navegação via query params + `Tab5ModoService`)
- Central de notificações com badge de não lidas

### Notificações em Tempo Real
- **SSE** (Server-Sent Events): notificações instantâneas no navegador
- **FCM** (Firebase Cloud Messaging): push notifications para Android/iOS
- **PostgreSQL LISTEN/NOTIFY**: triggers disparam eventos em inserts/updates (com filtro de colunas para evitar disparos em likes/dislikes)
- **Driver dedicado** para o listener (`DriverManager.getConnection()`) — não consome pool HikariCP

### Dashboard e BI
- Dashboard padrão com ranking de vereadores por proposições
- Construtor de dashboards personalizados (métricas + filtros → gráficos dinâmicos)
- Dimensões: Data de Envio, Categoria, Vereador, Gênero, Partido
- Gráficos: barra, pizza, sunburst com AG Charts Enterprise
- Dois modos: "Dashboard" (padrão) e "Meus Dashboards" (salvos pelo usuário)

### Inteligência Artificial (Groq LLM — Llama 3.3 70B)
- **Classificação** (`/tag`): analisa ementa + justificativa e atribui uma das 12 categorias
- **Sumarização** (`/resumo`): gera resumo em linguagem cidadã (até 3 parágrafos)
- **Embeddings** (`/embedding`): Sentence Transformers (`paraphrase-multilingual-mpnet-base-v2`) → vetor 768d
- **Resolução de CAPTCHA**: modelo TrOCR fine-tuned para ler CAPTCHAs do portal da CMC

### UX / UI
- **Mobile-first** com breakpoints 768px, 1024px, 1400px
- **Layout desktop** (≥1024px): 3 colunas — `left-sidebar` (280px) + `content` (flex:1) + `right-sidebar` (280px), sidebars sticky
- **Feed centralizado** via `.feed-container` (680px → 720px → 780px)
- **Dark mode** via `ThemeService` com classe `.ion-palette-dark` no `<html>`, persistência em localStorage e fallback para `prefers-color-scheme`
- **Botões reativos ao login**: curtir/descurtir/favoritar só mostram estado ativo (`[class.active]`, `color="warning"`, ícone preenchido) quando o usuário está logado; deslogado, sempre neutro
- **Pull-to-refresh** (mobile) nas 3 abas principais com spinner crescent
- **Back button global** redireciona para Home
- **Login prompt modal** com verificação de dark mode
- **Menu lateral** com itens condicionais: acesso a Perfil/Histórico/Meus Dashboards/Configurações requer login

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend Web/Mobile | Angular 20, Ionic 8, Capacitor 7, TypeScript 5.9 |
| Backend (Business) | Spring Boot 4, Java 17, Maven |
| Backend (BI/IA) | FastAPI, Python 3.11, Uvicorn |
| API Gateway | Node.js 22, Express 4, TypeScript |
| Banco | PostgreSQL 15 + pgvector |
| Orquestração | Docker Compose (dev + prod) |
| IA | Groq Cloud (Llama 3.3 70B), Sentence Transformers |
| CAPTCHA | TrOCR (Transformers) fine-tuned |
| Visualização | AG Grid Community, AG Charts Enterprise |
| Autenticação | JWT (Auth0 java-jwt), BCrypt |
| Push | Firebase Cloud Messaging (FCM) |
| Testes | JUnit 5 (backend), Jasmine + Karma (frontend) |
| CI/CD | GitHub Actions (self-hosted runner) |

### Frontend — Dependências Principais

| Pacote | Finalidade |
|---|---|
| `@ionic/angular` | Componentes UI mobile-first (header, content, cards, buttons, modais, refresher, searchbar) |
| `@capacitor/*` | Acesso nativo: push, local notifications, share, filesystem, haptics, keyboard, status bar |
| `ag-charts-angular` / `ag-grid-angular` | Dashboards e visualização de dados |
| `rxjs` | Programação reativa (BehaviorSubject, forkJoin, Subjects) |
| `dom-to-image-more` / `html2canvas` | Exportação de gráficos |

### Backend (ms-java) — Dependências Principais

| Framework | Finalidade |
|---|---|
| Spring Boot Data JPA | ORM, repositórios, `@EntityGraph` para N+1 |
| Spring Security | Filtro JWT, CORS |
| Firebase Admin SDK | Push notifications |
| Auth0 java-jwt | Geração/validação de tokens JWT |
| Lombok | Redução de boilerplate |
| Springdoc OpenAPI | Swagger UI |
| HikariCP | Pool de conexões (max 15, timeout 15s) |

### Backend (ms-python) — Dependências Principais

| Pacote | Finalidade |
|---|---|
| `fastapi` / `uvicorn` | Servidor ASGI |
| `sqlalchemy` | ORM para consultas BI |
| `pandas` | Agregação dinâmica de dados |
| `sentence-transformers` | Geração de embeddings 768d |
| `groq` | Cliente Groq Cloud API |
| `transformers` / `torch` | TrOCR para CAPTCHA |
| `httpx` | Requisições HTTP ao portal CMC |
| `Pillow` | Processamento de imagens CAPTCHA |

---

## Estrutura do Projeto

```
TCC/
├── backend/
│   ├── api-gateway/              # Express + TypeScript — proxy reverso
│   │   └── server.ts             # Entry point, rotas, CORS
│   ├── ms-java/                  # Spring Boot + Java 17 — negócios
│   │   └── src/main/java/com/clientes/clientes_TCC/
│   │       ├── controller/       # 10 REST controllers
│   │       ├── service/          # 14 services (incl. ProposicaoListenerService)
│   │       ├── repositories/     # 16 JPA repositories
│   │       ├── domain/           # 9 pacotes de entidades
│   │       ├── config/           # Security, Firebase, Swagger
│   │       └── exceptions/       # 17 exceções customizadas
│   └── ms-python/                # FastAPI + Python — BI e IA
│       ├── modelo_captcha_trocr/ # TrOCR fine-tuned model
│       ├── gerar_embeddings.py   # Script standalone para backfill de embeddings
│       └── app/
│           ├── api/              # endpoints.py, resumo.py, tag.py, embedding.py
│           ├── services/         # pandas_engine.py, repository.py
│           ├── models/           # SQLAlchemy models
│           ├── schemas/          # Pydantic models
│           ├── jobs/             # Scraping + ETL (scraper, proposicoes, tags, etc.)
│           └── training/         # Treinamento TrOCR (coleta, rotulagem, treino)
├── frontend/
│   ├── nginx.conf                # Nginx config for SPA + API proxy
│   └── tcc/                      # Angular 20 + Ionic 8
│       └── src/
│           ├── environments/     # environment.ts, .prod.ts, .device.ts
│           ├── assets/mock-api/  # Mock data para desenvolvimento offline
│           └── app/
│               ├── components/   # card, card-vereador, dashboard-view,
│               │                 # login-prompt, menu, menu-panel, my-dashboard-view,
│               │                 # vereador-search-card, vereador-table
│               ├── guards/       # auth.guard.ts
│               ├── mock/         # proposicoes.mock.ts, vereadores.mock.ts
│               ├── models/       # DTOs, interfaces
│               ├── services/     # 21 services
│               ├── tabs/         # Navegação por abas
│               ├── tab1..tab6/   # Páginas do tab navigation
│               ├── cadastro/     # Registro em 3 etapas
│               ├── login/        # Login com formulário
│               ├── recover/      # Recuperação de senha
│               ├── perfil/       # Perfil do usuário
│               ├── configuracao/ # Configurações
│               ├── historico/    # Histórico de navegação
│               ├── seguindo/     # Seguindo (redirect)
│               ├── post/         # Detalhe da proposição
│               └── vereador/     # Detalhe do vereador
├── bancosDeDados/
│   └── postgres/
│       └── init.sql              # Schema completo + triggers + seed
├── .github/
│   └── workflows/
│       └── main.yml              # CI/CD: deploy on push to main
├── compose.yaml                  # Docker Compose (dev)
├── compose.prod.yaml             # Overrides de produção
└── .env.example                  # Template de variáveis de ambiente
```

---

## Frontend — Páginas e Rotas

| Rota | Componente | Descrição | Protegida |
|---|---|---|---|
| `/` | redirect | Redireciona para `/tabs/tab2` | |
| `/tabs/tab2` | `Tab2Page` | Home / feed de proposições | |
| `/tabs/tab3` | `Tab3Page` | Central de notificações | |
| `/tabs/tab4` | `Tab4Page` | Busca semântica + destaques | |
| `/tabs/tab5` | `Tab5Page` | Favoritos + Vereadores seguidos | |
| `/tabs/tab6` | `Tab6Page` | Dashboard / BI | |
| `/login` | `LoginComponent` | Formulário de login | |
| `/cadastro` | `CadastroComponent` | Registro em 3 etapas | |
| `/recover` | `RecoverComponent` | Recuperação de senha / reativação | |
| `/perfil` | `PerfilComponent` | Perfil do usuário | ✅ |
| `/historico` | `HistoricoComponent` | Histórico de navegação | ✅ |
| `/configuracoes` | `ConfiguracoesComponent` | Dark mode, logout, configurações | ✅ |
| `/editar-perfil` | `Tab1Page` | Editar dados do perfil | ✅ |
| `/seguindo` | — | Redireciona para `/tabs/tab5` | ✅ |
| `/proposicao/:id` | `PostComponent` | Detalhe da proposição + likes/favoritar/compartilhar + resumo IA | |
| `/vereador/:id` | `VereadorComponent` | Perfil do vereador + proposições | |

---

## Frontend — Componentes Compartilhados

| Componente | Descrição |
|---|---|
| `card` | Card de proposição no feed — razao, ementa, chips, likes/dislikes, favoritar, compartilhar |
| `card-vereador` | Card de vereador |
| `dashboard-view` | Dashboard padrão com gráficos (barra, pizza, sunburst) |
| `my-dashboard-view` | Dashboards personalizados salvos pelo usuário |
| `login-prompt` | Modal de login para ações não autenticadas |
| `menu` | Menu lateral (ion-menu) |
| `menu-panel` | Painel de navegação na sidebar — Perfil, Histórico, Meus Dashboards, Configurações |
| `vereador-table` | Tabela lateral com top vereadores e follow reativo ao auth |
| `vereador-search-card` | Card de busca de vereadores |

---

## Frontend — Serviços

| Serviço | Responsabilidade |
|---|---|
| `auth.service.ts` | Estado de autenticação (signal + BehaviorSubject), `saveAuthData()`, `refreshAuthState()`, `reset$` para reset global no logout |
| `api-gateway.service.ts` | Cliente HTTP central com prefixos `.v1.*` e `.bi.*` |
| `auth.interceptor.ts` | Interceptor HTTP que anexa token JWT |
| `proposicao.ts` | CRUD de proposições, merge de favoritos, busca por similaridade |
| `vereador.ts` | CRUD de vereadores, listar/seguir/deixar de seguir |
| `usuario.service.ts` | Login, criar usuário, perfil, recuperar senha |
| `reacao.service.ts` | Like/dislike em proposições |
| `reacao-event.service.ts` | Event bus para notificar mudanças de reação entre componentes |
| `favoritos.service.ts` | Favoritar/desfavoritar/listar proposições |
| `notificacao.service.ts` | Notificações com badge, SSE integration, reset no logout |
| `sse.service.ts` | Server-Sent Events (conectar/desconectar) |
| `push.service.ts` | Firebase Cloud Messaging — registro e init |
| `theme.service.ts` | Dark mode toggle com persistência (localStorage + prefers-color-scheme) |
| `dashboard.ts` | Dados de BI/dashboard |
| `dashboard-mode.ts` | Modo selecionado do dashboard (BehaviorSubject) |
| `tab5-modo.service.ts` | Modo selecionado da aba Favoritos/Seguindo (BehaviorSubject) |
| `ia.service.ts` | Resumo inteligente via IA — chama `/api/bi/resumo` para obter sumário em linguagem cidadã |
| `share.service.ts` | Compartilhamento nativo (Capacitor Share) |
| `local-notification.service.ts` | Agendamento de notificações locais |
| `historico.service.ts` | Histórico de navegação do usuário |

---

## Backend — Microserviços

### API Gateway (`backend/api-gateway`)
- Express 4 + TypeScript
- Proxy: `/api/v1/*` → `ms-java:8080`, `/api/bi/*` → `ms-python:8085`
- Timeout: 30s em ambos os proxies
- CORS configurável por ambiente
- Health check em `/health`
- Endpoint de teste `/playground/notificar/:usuarioId`

### ms-java (`backend/ms-java`)
- Spring Boot 4 + Java 17 + Maven
- **10 Controllers**: Usuario, Vereador, Proposicao, Notificacao, Reacao, FavoritarProposicao, SeguirVereador, Historico, Dispositivo, Sse
- **16 Repositórios JPA** com `@EntityGraph` para otimização N+1
- **HikariCP**: `maximum-pool-size=15`, `connection-timeout=15000`
- **ProposicaoListenerService**: usa `DriverManager.getConnection()` (não consome pool) para escutar `NOTIFY` do PostgreSQL
- **Triggers**: `notify_proposicao_insert` (AFTER INSERT) e `notify_proposicao_update` (AFTER UPDATE OF colunas estruturais) — updates de likes/dislikes NÃO disparam NOTIFY
- **17 exceções customizadas** para tratamento granular de erros
- Swagger disponível em `/api/v1/swagger-ui.html`
- **Firebase Admin SDK** para envio de push notifications
- **Spring Mail** para recuperação de senha via e-mail

### ms-python (`backend/ms-python`)
- FastAPI + Python 3.11 + Uvicorn
- **Endpoints BI**: CRUD de dashboards, ranking preview, metadata
- **IA**: `/tag` (classificação Groq), `/resumo` (sumarização Groq), `/embedding` (Sentence Transformers 768d)
- **Pandas Engine**: agregação dinâmica com `LABEL_MAP` rotulando dimensões ("Tag" → "Categoria")
- **Modelos SQLAlchemy**: partido, vereador, proposicao, usuario_dashboard
- **Jobs ETL**: scraping do portal CMC com resolução de CAPTCHA via TrOCR
- **Treinamento TrOCR**: pipeline de coleta, rotulagem e fine-tuning

---

## Banco de Dados

**PostgreSQL 15 + pgvector** — extensão vetorial para busca semântica (768 dimensões). A similaridade do cosseno entre o embedding da consulta do usuário e os embeddings armazenados é calculada diretamente no banco via `pgvector`.

### Tabelas

| Tabela | Finalidade |
|---|---|
| `usuario` | Contas (CPF, nome, email, senha BCrypt, soft delete) |
| `partido` | Partidos políticos |
| `comissao` | Comissões da Câmara |
| `vereador` | Vereadores (com ENUMs: ativo, escolaridade, cor, genero) |
| `vereador_comissao` | Associação M:N vereador ↔ comissão |
| `tipo_proposicao` | Tipos (Projeto de Lei, Requerimento, Indicação, Emenda, Moção) |
| `estado_proposicao` | Estados (74 valores: "Em tramitação", "Aprovado", "Rejeitado", etc.) |
| `proposicao` | Tabela principal — `embedding vector(768)`, likes, dislikes, tag |
| `tramitacao` | Histórico de tramitação |
| `usuario_vereador_seguindo` | M:N usuário segue vereador |
| `usuario_proposicao_favorita` | M:N usuário favorita proposição |
| `notificacao` | Notificações por usuário |
| `reacao` | Likes/dislikes (tipo LIKE/DISLIKE) |
| `dispositivo_usuario` | Tokens FCM para push |
| `historico_proposicao` / `historico_vereador` | Histórico de navegação |
| `usuario_dashboard` | Dashboards salvos (JSONB com chart_type, config) |

### Triggers

- `notify_proposicao_insert` — AFTER INSERT → `pg_notify('proposicao_change', row_to_json(NEW))`
- `notify_proposicao_update` — AFTER UPDATE OF (estado_id, localizacao, ultimo_tramite, razao, ementa, texto, encerrou_tramitacao) → `pg_notify(...)`

---

## Pipeline de Dados / ETL

O sistema conta com jobs automatizados em `backend/ms-python/app/jobs/` que extraem dados do portal da Câmara Municipal de Curitiba (CMC), processam e alimentam o banco de dados.

### Fluxo de Extração

```
[CMC Portal] → Scraper HTTP → TrOCR CAPTCHA Solver → Dados Brutos
                                                         |
                                                         v
                                              Proposições Processadas
                                                         |
                                               ┌────────┴────────┐
                                               v                 v
                                          Tags (Groq)     Embeddings (768d)
                                               |                 |
                                               v                 v
                                          PostgreSQL ←──────────┘
```

### Jobs

| Script | Função |
|---|---|
| `scraper.py` | Cliente HTTP base para o portal CMC — gerencia sessão, cookies, rate limit e resolução de CAPTCHA |
| `captcha.py` | Solucionador de CAPTCHA usando TrOCR — baixa imagem, executa inferência, retorna texto |
| `imagem.py` | Processamento de imagem (pré-processamento para TrOCR) |
| `modelo.py` | Carrega o modelo TrOCR fine-tuned do diretório `modelo_captcha_trocr/` |
| `proposicoes.py` | Pipeline principal de extração de proposições — navega páginas, extrai detalhes, persiste |
| `tags.py` | Enriquece proposições com classificação de tags via Groq LLM |
| `gerar_embeddings.py` | Gera embeddings 768d para proposições sem embedding via Sentence Transformers |
| `obter_vereadores.py` | Extrai dados dos vereadores a partir de PDFs e páginas da CMC |
| `banco.py` | Utilitários de conexão e persistência no banco |
| `config.py` | Configurações centralizadas (timeouts, delays, URLs) |

### Script Standalone

`backend/ms-python/gerar_embeddings.py` — script para backfill de embeddings em lote para todas as proposições que ainda não possuem vetor, útil em migrações ou recarga de dados.

---

## Treinamento de Machine Learning

O diretório `backend/ms-python/app/training/` contém o pipeline de treinamento do modelo TrOCR para resolução de CAPTCHAs do portal CMC.

### Etapas

| Script | Função |
|---|---|
| `coleta_captchas.py` | Baixa amostras de CAPTCHA do portal CMC para compor dataset de treino |
| `rotular_imagens.py` | Interface/script para rotulação manual das imagens baixadas |
| `treinar_trocr.py` | Fine-tuning do modelo TrOCR da Microsoft no dataset rotulado |

### Modelo Treinado

O modelo fine-tuned está em `backend/ms-python/modelo_captcha_trocr/` com os arquivos:
- `config.json` / `preprocessor_config.json` / `generation_config.json`
- `model.safetensors` (pesos treinados)
- `tokenizer.json`, `vocab.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer_config.json`

---

## Autenticação e Estado Reativo

### Fluxo
1. `AuthService` mantém um `signal<boolean>` (síncrono para templates) e um `BehaviorSubject<boolean>` (observável para serviços/guards)
2. `saveAuthData(token, usuario)` persiste no `localStorage` e chama `refreshAuthState()`
3. `logout()` limpa `localStorage`, emite `false` no `authState$` e dispara `reset$`
4. Serviços como `NotificacaoService` se inscrevem em `reset$` para limpar cache no logout
5. `AppComponent` observa `authState$` — se o usuário deslogar enquanto estiver em rota protegida, redireciona automaticamente para Home
6. `auth.guard.ts` usa `isLoggedIn()` (signal) para proteger 5 rotas

### Botões Sensíveis ao Auth
- Curtir/descurtir: ícone só fica preenchido (`thumbs-up`/`thumbs-down`) e azul se logado
- Favoritar: estrela só fica preenchida (`star`) e amarela se logado
- Seguir: texto "Seguindo" e estilo `.seguindo` só aparecem se logado (guarda explícito no template + service reativo)

---

## Infraestrutura

### Docker Compose (dev) — 5 serviços

| Serviço | Imagem | Porta |
|---|---|---|
| `frontend` | Ubuntu + Node 20 + Android SDK + Ionic CLI (custom) | 80, 8100 |
| `clientes` | `maven:3.8.4-openjdk-17-slim` | 8080 |
| `ms-python` | Python (Dockerfile custom) | 8085 |
| `api-gateway` | `node:22-alpine` | 3000 |
| `postgres` | `pgvector/pgvector:pg15` | 5432 |

### Produção (`compose.prod.yaml`)
- Frontend servido via Nginx (multi-stage build: `node:20-alpine` → `nginx:alpine`)
- Gateway sem `--watch`, CORS restrito ao domínio de produção
- Spring profile `prod`

### Nginx
- Arquivo: `frontend/nginx.conf`
- Porta 4200 (interna)
- Proxy `/api/` → `http://api-gateway:3000`
- SPA fallback — todo `index.html` exceto `/api/`

### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Chave da API Groq Cloud (https://console.groq.com) |
| `GATEWAY_PORT` | | Porta do API Gateway (default: 3000) |
| `BI_MS_URL` | | URL do ms-python (default: `http://ms-python:8085`) |
| `BUSINESS_MS_URL` | | URL do ms-java (default: `http://ms-java:8080`) |
| `CORS_ORIGINS` | | Origens CORS permitidas |
| `DATABASE_URL` | | Connection string PostgreSQL para Python |
| `SPRING_DATASOURCE_*` | | Configurações de conexão JDBC |
| `POSTGRES_*` | | Configurações do banco PostgreSQL |

### CI/CD (`.github/workflows/main.yml`)
- **Trigger**: push à branch `main`
- **Runner**: self-hosted
- **Ação**: `docker compose -f compose.yaml -f compose.prod.yaml down && up -d --build`

---

## Ambientes do Frontend

O Angular possui três arquivos de ambiente em `frontend/tcc/src/environments/`:

| Arquivo | `gatewayUrl` | Uso |
|---|---|---|
| `environment.ts` | `http://localhost:3000` | Desenvolvimento local (`ng serve`) |
| `environment.prod.ts` | `''` (mesma origem) | Produção (Nginx faz proxy) |
| `environment.device.ts` | `https://app.curitibativa.online` | Build para dispositivo mobile |

Para build mobile com ambiente de device:
```bash
cd frontend/tcc
ng build --configuration=device
ionic cap copy
ionic cap sync
```

---

## Dados Mock

Para desenvolvimento offline, o frontend inclui dados mock em:
- `frontend/tcc/src/app/mock/proposicoes.mock.ts` — proposições simuladas
- `frontend/tcc/src/app/mock/vereadores.mock.ts` — vereadores simulados
- `frontend/tcc/src/assets/mock-api/` — respostas mock de API

---

## Testes

| Camada | Framework | Comando |
|---|---|---|
| Frontend (Angular) | Jasmine + Karma | `cd frontend/tcc && npm test` |
| Backend (ms-java) | JUnit 5 | `cd backend/ms-java && ./mvnw test` |

---

## Firebase Setup

O sistema utiliza Firebase Cloud Messaging (FCM) para notificações push. É necessário configurar:

1. **Backend (ms-java)**: colocar o arquivo `firebase-service-account.json` na raiz de `backend/ms-java/` (baixado do console Firebase > Configurações do projeto > Contas de serviço)
2. **Android**: colocar `google-services.json` em `frontend/tcc/android/app/` (baixado do console Firebase > Configurações do projeto > Geral > Seu app Android)

Ambos os arquivos estão no `.gitignore` e não devem ser commitados.

---

## Troubleshooting

| Problema | Causa Provável | Solução |
|---|---|---|
| `GROQ_API_KEY` não configurada | `.env` não criado ou vazio | `cp .env.example .env` e preencha a chave |
| PostgreSQL não conecta | Serviço `postgres` ainda iniciando | Aguarde 10-15s e tente novamente |
| CAPTCHA falha repetidamente | Modelo TrOCR não carregado ou portal alterou CAPTCHA | Verifique `modelo_captcha_trocr/`; re-treine se necessário |
| CORS bloqueando requisições | `CORS_ORIGINS` não configurado | Adicione a origem no `.env` ou `compose.yaml` |
| Push notification não chega | `firebase-service-account.json` ausente | Siga o [Firebase Setup](#firebase-setup) |
| Página não encontrada (404) | Rota SPA sem fallback | NGINX deve redirecionar tudo exceto `/api/` para `index.html` |

---

## Autores

**Curso:** Análise e Desenvolvimento de Sistemas — UFPR

| Autor |
|---|
| Joao Vitor Liskoski Walter |
| Lucas Venturin Trindade |
| Pedro Augusto Lemos |
| Sophia Costa Soares e Silva |

**Orientador:** Prof. Dr. Razer Anthom Nizer Rojas Montaño

**Ano:** 2026
