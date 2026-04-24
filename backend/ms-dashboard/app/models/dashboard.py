from sqlalchemy import Column, Integer, String, ForeignKey, BIGINT, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
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
    partido_id = Column(Integer, ForeignKey("partido.id"))
    genero = Column(String)
    cor = Column(String)

    partido = relationship("Partido")

class Proposicao(Base):
    __tablename__ = "proposicao"
    codigo = Column(BIGINT, primary_key=True)
    vereador_id = Column(Integer, ForeignKey("vereador.id"))
    data_envio = Column(DateTime)
    ementa = Column(Text)
    tag = Column(String)

    vereador = relationship("Vereador")

class Dashboard(Base):
    __tablename__ = "dashboards"
    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False)
    config = Column(JSONB)