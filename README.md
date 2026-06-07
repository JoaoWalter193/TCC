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
