CREATE EXTENSION IF NOT EXISTS vector;


CREATE TABLE usuario (
id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
cpf VARCHAR(11) UNIQUE,
nome VARCHAR(100),
email VARCHAR(100),
senha VARCHAR,
ativo BOOLEAN,
data_delecao DATE
);
CREATE TABLE partido (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nomePartido VARCHAR(255) UNIQUE NOT NULL
);
 
CREATE TABLE comissao (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nomeComissao VARCHAR(255) UNIQUE NOT NULL
);
 
CREATE TYPE vereador_ativo AS ENUM ('licenciado', 'ativo', 'inativo');
 
CREATE TYPE vereador_escolaridade AS ENUM (
    'sup_comp', 'sup_incomp', 'ens_fund_comp', 'ens_fund_incomp'
);
 
CREATE TYPE vereador_cor AS ENUM ('branca', 'parda', 'preta', 'amarela');
 
CREATE TABLE tipoProposicao (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL
);
 
CREATE TABLE estadoProposicao (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    estado VARCHAR(100) NOT NULL
);
 
CREATE TABLE vereador (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    partido_id INTEGER,
    email VARCHAR(255) UNIQUE NOT NULL,
    legislaturas VARCHAR(255) NOT NULL,
    gabinete VARCHAR(255) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    site VARCHAR(100) NOT NULL,
    ativo vereador_ativo NOT NULL,
    genero VARCHAR(50) NOT NULL,
    nascimento DATE NOT NULL,
    cor vereador_cor NOT NULL,
    ocupacao VARCHAR(255) NOT NULL,
    escolaridade vereador_escolaridade NOT NULL,
 
    CONSTRAINT fk_partido_id
        FOREIGN KEY(partido_id)
            REFERENCES partido(id)
);
 
CREATE TABLE vereadorComissao (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    comissao_id INTEGER NOT NULL,
    vereador_id INTEGER NOT NULL,
 
    CONSTRAINT fk_comissao_id
        FOREIGN KEY(comissao_id)
            REFERENCES comissao(id),
    CONSTRAINT fk_vereador_id
        FOREIGN KEY(vereador_id)
            REFERENCES vereador(id)
);
 
 
CREATE TABLE proposicao (
    codigo BIGINT PRIMARY KEY,
    tipo_id INTEGER NOT NULL,
    vereador_id INTEGER NOT NULL,
    data_envio TIMESTAMP NOT NULL,
    data_efetivo TIMESTAMP NOT NULL,
    estado_id INTEGER NOT NULL,
    localizacao VARCHAR(100) NOT NULL,
    ultimo_tramite TIMESTAMP NOT NULL,
    razao VARCHAR(255) NOT NULL,
    tramite_alternativo BOOLEAN NOT NULL,
    encerrou_tramitacao BOOLEAN NOT NULL,
    leis_similares VARCHAR(255) NOT NULL,
    ementa TEXT NOT NULL,
    texto TEXT NOT NULL,
    justificativa TEXT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    embedding vector(768),
 
    CONSTRAINT fk_tipo_proposicao
        FOREIGN KEY(tipo_id)
            REFERENCES tipoProposicao(id),
    CONSTRAINT fk_vereador_proposicao
        FOREIGN KEY(vereador_id)
            REFERENCES vereador(id),
    CONSTRAINT fk_estado_proposicao
        FOREIGN KEY(estado_id)
            REFERENCES estadoProposicao(id)
);
 
CREATE TABLE tramitacao (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_proposicao BIGINT NOT NULL,
    origem VARCHAR(255) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    razaoEnvio VARCHAR(100) NOT NULL,
    remetente VARCHAR(100) NOT NULL,
    pendente BOOLEAN NOT NULL,
    observacao VARCHAR(255) NOT NULL,
 
    CONSTRAINT fk_cod_proposicao
        FOREIGN KEY(cod_proposicao)
            REFERENCES proposicao(codigo)
);


-- Inserir partidos
INSERT INTO partido (nomePartido) VALUES
('PSD'),
('União Brasil'),
('PT'),
('PL'),
('MDB');

-- Inserir comissões
INSERT INTO comissao (nomeComissao) VALUES
('Saúde'),
('Educação'),
('Urbanismo'),
('Meio Ambiente'),
('Segurança Pública');

-- Inserir vereadores
INSERT INTO vereador (
nome, partido_id, email, legislaturas, gabinete, telefone, site,
ativo, genero, nascimento, cor, ocupacao, escolaridade
) VALUES
('Carlos Silva', 1, 'carlos.silva@cwb.br', '2021-2024', 'Gab 101', '41999990001', 'carlossilva.com',
'ativo', 'masculino', '1980-05-10', 'branca', 'Advogado', 'sup_comp'),
('Ana Souza', 2, 'ana.souza@cwb.br', '2021-2024', 'Gab 102', '41999990002', 'anasouza.com',
'ativo', 'feminino', '1985-03-22', 'parda', 'Professora', 'sup_comp'),
('João Pereira', 3, 'joao.pereira@cwb.br', '2021-2024', 'Gab 103', '41999990003', 'joaopereira.com',
'licenciado', 'masculino', '1975-11-02', 'preta', 'Sindicalista', 'ens_fund_comp'),
('Mariana Lima', 4, 'mariana.lima@cwb.br', '2021-2024', 'Gab 104', '41999990004', 'marianalima.com',
'ativo', 'feminino', '1990-07-15', 'branca', 'Empresária', 'sup_comp'),
('Ricardo Alves', 5, 'ricardo.alves@cwb.br', '2021-2024', 'Gab 105', '41999990005', 'ricardoalves.com',
'inativo', 'masculino', '1968-09-30', 'amarela', 'Engenheiro', 'sup_incomp');

-- Inserir associações vereador-comissão
INSERT INTO vereadorComissao (comissao_id, vereador_id) VALUES
(1, 1),
(2, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- Inserir tipos de proposição
INSERT INTO tipoProposicao (tipo) VALUES
('Projeto de Lei'),
('Requerimento'),
('Indicação'),
('Moção'),
('Emenda');

-- Inserir estados de proposição
INSERT INTO estadoProposicao (estado) VALUES
('Em tramitação'),
('Aprovado'),
('Rejeitado'),
('Arquivado'),
('Retirado');

-- Inserir proposições
INSERT INTO proposicao (
    codigo, tipo_id, vereador_id, data_envio, data_efetivo, estado_id,
    localizacao, ultimo_tramite, razao, tramite_alternativo,
    encerrou_tramitacao, leis_similares, ementa, texto, justificativa, tag
) VALUES
(1001, 1, 1, '2024-01-10 09:00:00', '2024-01-15 10:00:00', 1,
 'Comissão de Saúde', '2024-02-01 08:30:00', 'Interesse público',
 false, false, 'Lei 1234/2020',
 'Dispõe sobre a criação de postos de saúde nos bairros periféricos.',
 'Art. 1º Fica criado o programa municipal de expansão dos postos de saúde nos bairros periféricos do município.',
 'A população dos bairros periféricos carece de atendimento básico de saúde.',
 'saude'),

(1002, 2, 2, '2024-02-05 10:30:00', '2024-02-10 14:00:00', 2,
 'Plenário', '2024-03-01 09:00:00', 'Demanda da comunidade escolar',
 false, true, 'Lei 5678/2019',
 'Requer informações sobre a situação das escolas municipais.',
 'Art. 1º Fica requerido ao Poder Executivo informações sobre a infraestrutura das escolas municipais.',
 'As condições das escolas municipais necessitam de acompanhamento legislativo.',
 'educacao'),

(1003, 1, 3, '2024-03-12 11:00:00', '2024-03-20 16:00:00', 3,
 'Comissão de Urbanismo', '2024-04-05 10:00:00', 'Proposta de melhoria urbana',
 true, true, 'Lei 9012/2018',
 'Institui normas para calçadas acessíveis em vias públicas.',
 'Art. 1º Todas as calçadas do município deverão seguir as normas de acessibilidade previstas na ABNT.',
 'A acessibilidade urbana é direito de todos os cidadãos.',
 'urbanismo'),

(1004, 3, 4, '2024-04-01 08:00:00', '2024-04-08 09:00:00', 1,
 'Comissão de Meio Ambiente', '2024-04-20 11:00:00', 'Preservação ambiental',
 false, false, 'Lei 3456/2021',
 'Indica ao Executivo a criação de programa de arborização urbana.',
 'Art. 1º Fica indicado ao Poder Executivo a criação do programa Curitiba Verde de arborização urbana.',
 'A arborização urbana contribui para a qualidade de vida e redução de ilhas de calor.',
 'meio-ambiente'),

(1005, 4, 5, '2024-05-15 14:00:00', '2024-05-20 15:00:00', 2,
 'Plenário', '2024-06-01 10:00:00', 'Reconhecimento de mérito',
 false, true, '',
 'Moção de aplauso aos profissionais de segurança pública.',
 'Art. 1º A Câmara Municipal expressa moção de aplauso aos profissionais de segurança pública do município.',
 'Os profissionais de segurança pública merecem reconhecimento pelos serviços prestados à população.',
 'seguranca'),

(1006, 1, 1, '2024-06-10 09:30:00', '2024-06-18 11:00:00', 4,
 'Comissão de Educação', '2024-07-01 09:00:00', 'Melhoria educacional',
 false, true, 'Lei 7890/2017',
 'Dispõe sobre a implantação de bibliotecas comunitárias nos bairros.',
 'Art. 1º Fica autorizado o Poder Executivo a implantar bibliotecas comunitárias nos bairros do município.',
 'O acesso à leitura é fundamental para o desenvolvimento social e educacional.',
 'educacao'),

(1007, 2, 2, '2024-07-22 10:00:00', '2024-07-30 14:30:00', 1,
 'Comissão de Saúde', '2024-08-10 08:00:00', 'Fiscalização de serviços',
 false, false, '',
 'Requer auditoria nos contratos de saúde do município.',
 'Art. 1º Fica requerida auditoria nos contratos firmados pela Secretaria Municipal de Saúde.',
 'A transparência nos contratos de saúde é essencial para o controle social.',
 'saude');
