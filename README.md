# CuritibAtiva: Sistema de Acompanhamento de Proposições e Atividades da Câmara Municipal de Curitiba

**Plataforma de Transparência e Acompanhamento Legislativo para a Câmara Municipal de Curitiba**

Sistema web e mobile para cidadãos acompanharem proposições legislativas, vereadores e indicadores da Câmara Municipal de Curitiba em tempo real, com dashboards interativos, busca semântica e classificação automatizada por inteligência artificial.

---

## Guia Rápido

```bash
# 1. Clone o repositório e acesse a pasta raiz
cd TCC

# 2. Configure a variável de ambiente obrigatória
cp .env.example .env
# Edite .env e preencha GROQ_API_KEY com sua chave da Groq (https://console.groq.com/keys e Create API Key)

# 3. Execute todos os serviços com Docker Compose
docker compose up --build
```

Após a inicialização completa (primeira execução leva alguns minutos para baixar dependências):

| Serviço | URL (Docker) | URL (Dev local) |
|---|---|---|
| Frontend (Angular) | [http://localhost:80](http://localhost:80) | [http://localhost:4200](http://localhost:4200) |
| Frontend (Ionic) | [http://localhost:8100](http://localhost:8100) | [http://localhost:8100](http://localhost:8100) |
| API Gateway | [http://localhost:3000](http://localhost:3000) | [http://localhost:3000](http://localhost:3000) |
| Swagger UI | [http://localhost:3000/api/v1/swagger-ui.html](http://localhost:3000/api/v1/swagger-ui.html) | — |
| Health Check | [http://localhost:3000/health](http://localhost:3000/health) | [http://localhost:3000/health](http://localhost:3000/health) |

---

## Objetivo do Projeto

**Problema:** Os cidadãos de Curitiba não dispõem de uma ferramenta unificada, acessível e intuitiva para acompanhar a produção legislativa da Câmara Municipal. As proposições (projetos de lei, requerimentos, indicações, moções e emendas) são publicadas em canais oficiais de baixa usabilidade, sem recursos de busca semântica, classificação inteligente, notificações personalizadas ou visualização analítica de dados.

**Objetivo:** Desenvolver uma plataforma multicamada que integre um aplicativo mobile e web responsivo, uma API de negócios, um serviço de inteligência artificial para classificação e sumarização de textos legislativos, e um dashboard analítico interativo — tudo orquestrado por um gateway central.

**Solução:** O **CuritibAtiva** permite que o cidadão:

1.  Navegue por proposições legislativas com filtros por tema e busca por similaridade semântica.
2.  Siga vereadores e favorite proposições para receber notificações em tempo real sobre alterações.
3.  Visualize dashboards interativos com gráficos (barras, pizza, sunburst) configuráveis pelo usuário.
4.  Consuma resumos em linguagem simples gerados por IA (Groq LLM) para cada proposição.

---

## Principais Funcionalidades

### Módulo de Autenticação e Usuário
- Cadastro com validação de CPF e e-mail.
- Login com JWT (validade de 2 horas).
- Atualização de perfil (nome, e-mail, senha).
- Exclusão de conta (soft delete com reativação em até 7 dias).
- Recuperação de senha via e-mail.

### Catálogo de Proposições Legislativas
- Listagem paginada com filtro por tag (saúde, educação, urbanismo, meio-ambiente, segurança, etc.).
- Detalhamento completo de cada proposição (tipo, vereador autor, ementa, texto, justificativa, tramitação, estado atual).
- Busca semântica: digite uma descrição em linguagem natural e encontre proposições relacionadas por similaridade vetorial (pgvector).

### Perfil de Vereadores
- Lista completa de vereadores com dados cadastrais (partido, gabinete, escolaridade, ocupação, etc.).
- Página individual com as proposições de cada vereador.

### Acompanhamento Personalizado
- Seguir vereadores para receber notificações sobre novas proposições.
- Favoritar proposições para acesso rápido.
- Central de notificações com contagem de não lidas.

### Notificações em Tempo Real
- Server-Sent Events (SSE): notificações instantâneas no navegador.
- Firebase Cloud Messaging (FCM): notificações push para dispositivos mobile (Android/iOS).
- PostgreSQL LISTEN/NOTIFY: gatilhos no banco de dados disparam eventos quando proposições são inseridas ou alteradas.

### Dashboard
- Dashboard padrão com ranking de vereadores por quantidade de proposições.
- Construtor de dashboards personalizados: selecione métricas e filtros para gerar gráficos dinâmicos.
- Suporte a gráficos de barra, pizza e hierárquico com AG Charts Enterprise.

### Inteligência Artificial (Groq LLM)
- Classificação automática de proposições (`/tag`): a IA analisa a ementa e a justificativa e atribui uma das 12 categorias temáticas.
- Sumarização em linguagem cidadã (`/resumo`): a IA gera um resumo de até 3 parágrafos explicando o propósito, a motivação e o impacto prático da proposição.
- Geração de embeddings (`/embedding`): conversão de texto em vetor 768-dimensional para busca semântica.

---

### Fluxo de Dados

1. O **frontend** (Angular) se comunica exclusivamente com o **API Gateway** na porta 3000, nunca diretamente com os microserviços.
2. O **gateway** roteia requisições baseado no prefixo da URL:
   - `/api/bi/*` → ms-dashboard (porta 8085)
   - `/api/v1/*` → clientes (porta 8080)
3. O **ms-dashboard** expõe três endpoints especiais que consomem a Groq API para classificação (`/tag`) e sumarização (`/resumo`) via LLM, além de gerar embeddings textuais (`/embedding`) com Sentence Transformers.
4. Quando uma proposição nova é inserida ou atualizada, o **PostgreSQL** dispara um gatilho `NOTIFY` que é capturado pelo serviço `ProposicaoListenerService`, que então:
   - Persiste a notificação no banco.
   - Envia evento SSE para conexões ativas.
   - Envia push notification via Firebase Cloud Messaging.
5. Para busca semântica, a Business API envia o texto da consulta para o endpoint `/embedding` do ms-dashboard, recebe o vetor resultante e executa uma busca por similaridade do cosseno no pgvector.

---

## Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Angular | 20 | Framework SPA com componentes standalone |
| Ionic | 8 | Componentes de interface mobile-first |
| Capacitor | 7 | Compilação para Android e iOS |
| AG Grid Community | 35 | Tabela de dados interativa |
| AG Charts Enterprise | 13 | Gráficos (barra, pizza, sunburst) |
| TypeScript | 5.9 | Linguagem principal |
| Karma + Jasmine | 6 / 5 | Testes unitários |
| ESLint | 9 | Análise estática de código |

### API Gateway
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Node.js | 22 | Runtime |
| Express | 4.21 | Servidor HTTP e roteamento |
| express-http-proxy | 2.1 | Proxy reverso para microserviços |
| tsx | 4.19 | Execução TypeScript com hot-reload |
| TypeScript | 5.6 | Linguagem principal |

### Business API (clientes_TCC)
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Spring Boot | 4.0.0 (parent) | Framework de aplicação |
| Java | 17 | Linguagem principal |
| Spring Security | (do Boot) | Autenticação e autorização JWT |
| Spring Data JPA | (do Boot) | ORM e acesso a dados |
| PostgreSQL Driver | (do Boot) | Conector do banco |
| Lombok | (do Boot) | Redução de boilerplate |
| Auth0 java-jwt | 4.4 | Geração e validação de tokens JWT |
| Firebase Admin SDK | 9.2 | Notificações push (FCM) |
| SpringDoc OpenAPI | 2.8 | Documentação Swagger |
| Spring Boot Mail | (do Boot) | Envio de e-mails transacionais |
| Asciidoctor | 2.2 | Geração de documentação REST |
| JUnit 5 + Spring Boot Test | — | Testes unitários e de integração |

### Dashboard BI (ms-dashboard)
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Python | 3.11 | Linguagem principal |
| FastAPI | — | Framework web assíncrono |
| Uvicorn | — | Servidor ASGI |
| SQLAlchemy | — | ORM e acesso a dados |
| Pandas | — | Agregação e transformação de dados |
| Sentence Transformers | — | Geração de embeddings textuais |
| Groq Python SDK | — | Consumo da API Groq (LLM) |
| psycopg2-binary | — | Conector PostgreSQL |
| Pydantic | — | Validação de schemas de dados |

### Infraestrutura
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Docker Compose | — | Orquestração multi-serviço |
| PostgreSQL | 15 | Banco de dados relacional |
| pgvector | (extensão pg15) | Armazenamento e busca de embeddings |
| Groq Cloud | — | API de inferência LLM |

---

## Autores e Informações Acadêmicas

**Curso:** Análise e Desenvolvimento de Sistemas

**Autores:**   
Joao Vitor Liskoski Walter  
Lucas Venturin Trindade  
Pedro Augusto Lemos  
Sophia Costa Soares e Silva  

**Orientador:** Prof. Dr. Razer Anthom Nizer Rojas Montaño

**Instituição:** Universidade Federal do Paraná

**Ano:** 2026
