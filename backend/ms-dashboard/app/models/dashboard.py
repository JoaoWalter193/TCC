from sqlalchemy import Column, Integer, String, ForeignKey, BigINT, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Partido(Base):
    __tablename__ = "partido"
    id = Column(Integer, primary_key=True)
    nomePartido = Column(String)

class Vereador(Base):
    __tablename__ = "vereador"
    id = Column(Integer, primary_key=True)
    nome = Column(String)
    partidoId = Column(Integer, ForeignKey("partido.id"))
    genero = Column(String)
    cor = Column(String)

    partido = relationship("Partido")

class Proposicao(Base):
    __tablename__ = "proposicao"
    codigo = Column(BigINT, primary_key=True)
    vereadorId = Column(Integer, ForeignKey("vereador.id"))
    data_envio = Column(DateTime)
    ementa = Column(Text)
    tag = Column(String)

    vereador = relationship("Vereador")
