CREATE TABLE usuario (
cpf VARCHAR(11) PRIMARY KEY UNIQUE,
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

-- nao sei se isso fez mto sentido ou se coloco do jeito que ta no site
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

-- tirei cargo por motivos de impossivel
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