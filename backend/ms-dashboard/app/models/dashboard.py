from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base


class Partido(Base):
    __tablename__ = "partido"
    id = Column(Integer, primary_key=True)
    nomepartido = Column(String)


class Vereador(Base):
    __tablename__ = "vereador"
    id = Column(Integer, primary_key=True)
    nome = Column(String)
    partido_id = Column(Integer)
    genero = Column(String)
    cor = Column(String)


class Proposicao(Base):
    __tablename__ = "proposicao"
    codigo = Column(Integer, primary_key=True)
    vereador_id = Column(Integer)
    data_envio = Column(DateTime)
    ementa = Column(String)
    tag = Column(String)


class Dashboard(Base):
    __tablename__ = "usuario_dashboard"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, nullable=False)
    titulo = Column(String(150), nullable=False)
    chart_type = Column(String(20), nullable=False)
    config = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
