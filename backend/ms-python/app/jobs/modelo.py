import os
import torch
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel

from . import config

def _resolver_caminho_modelo():
    caminho = config.MODELO_PATH
    if not os.path.isabs(caminho):
        caminho = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", caminho))
    if not os.path.isdir(caminho):
        print(f"Modelo não encontrado em: {caminho}")
        print("Execute 'python -m app.training.treinar_trocr' para treinar ou copie o diretório.")
        raise FileNotFoundError(f"Diretório do modelo não encontrado: {caminho}")
    return caminho


def carregar_modelo():
    print("Inicializando modelo de IA...")
    caminho_modelo = _resolver_caminho_modelo()

    if config.FORCE_CPU:
        device = torch.device("cpu")
    else:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    original_isin = torch.isin
    def isin_patch(elements, test_elements, *, assume_unique=False, invert=False):
        return original_isin(elements.cpu(), test_elements.cpu(), assume_unique=assume_unique, invert=invert).to(elements.device)
    torch.isin = isin_patch

    processor = TrOCRProcessor.from_pretrained(caminho_modelo, local_files_only=True)
    model = VisionEncoderDecoderModel.from_pretrained(caminho_modelo, local_files_only=True)

    model.config.pad_token_id = processor.tokenizer.pad_token_id
    model.config.eos_token_id = processor.tokenizer.sep_token_id
    model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
    model.to(device)
    model.eval()

    print(f"Modelo carregado em {device}")
    return processor, model, device
