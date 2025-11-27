CREATE TABLE usuario (
cpf VARCHAR(11) PRIMARY KEY UNIQUE,
nome VARCHAR(100),
email VARCHAR(100),
senha VARCHAR,
ativo BOOLEAN,
data_delecao DATE
);
