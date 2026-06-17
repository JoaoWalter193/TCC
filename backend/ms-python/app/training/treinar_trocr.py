import os

import torch
from PIL import Image
from torch.utils.data import Dataset
from transformers import (
    GenerationConfig,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    TrOCRProcessor,
    VisionEncoderDecoderModel,
    default_data_collator,
)

DIR_TREINO = "./captchas_treino/"
DIR_TESTE = "./captchas_teste/"
DIR_PSEUDO = "./captchas_pseudo/"
MODELO_BASE = "microsoft/trocr-base-printed"

BATCH_SIZE = 2
EPOCAS = 15


class CaptchaDataset(Dataset):
    def __init__(self, diretorios, processor):
        self.processor = processor
        self.arquivos = []

        if isinstance(diretorios, str):
            diretorios = [diretorios]

        for diretorio in diretorios:
            if os.path.exists(diretorio):
                arquivos = [f for f in os.listdir(diretorio) if f.endswith('.png')]
                for f in arquivos:
                    self.arquivos.append(os.path.join(diretorio, f))

    def __len__(self):
        return len(self.arquivos)

    def __getitem__(self, idx):
        caminho_completo = self.arquivos[idx]
        nome_arquivo = os.path.basename(caminho_completo)

        texto_real = nome_arquivo.split('_')[0].upper()

        imagem = Image.open(caminho_completo).convert("RGB")

        pixel_values = self.processor(imagem, return_tensors="pt").pixel_values.squeeze()

        labels = self.processor.tokenizer(
            texto_real,
            padding="max_length",
            max_length=8,
            truncation=True,
            return_tensors="pt"
        ).input_ids.squeeze()

        labels[labels == self.processor.tokenizer.pad_token_id] = -100

        return {"pixel_values": pixel_values, "labels": labels}


print("Carregando o processador do TrOCR...")
processor = TrOCRProcessor.from_pretrained(MODELO_BASE)

dataset_treino = CaptchaDataset([DIR_TREINO, DIR_PSEUDO], processor)
dataset_teste = CaptchaDataset([DIR_TESTE], processor)

print("Carregando o modelo pré-treinado...")
modelo = VisionEncoderDecoderModel.from_pretrained(MODELO_BASE)

modelo.config.decoder_start_token_id = processor.tokenizer.cls_token_id
modelo.config.pad_token_id = processor.tokenizer.pad_token_id
modelo.config.vocab_size = modelo.config.decoder.vocab_size

configuracao_geracao = GenerationConfig(
    eos_token_id=processor.tokenizer.sep_token_id,
    max_length=8,
    early_stopping=True,
    no_repeat_ngram_size=3,
    length_penalty=2.0,
    num_beams=4,
    decoder_start_token_id=processor.tokenizer.cls_token_id,
    pad_token_id=processor.tokenizer.pad_token_id
)
modelo.generation_config = configuracao_geracao


def compute_metrics(pred):
    labels_ids = pred.label_ids
    pred_ids = pred.predictions

    labels_ids[labels_ids == -100] = processor.tokenizer.pad_token_id

    pred_str = processor.batch_decode(pred_ids, skip_special_tokens=True)
    labels_str = processor.batch_decode(labels_ids, skip_special_tokens=True)

    acertos = 0
    for prev, real in zip(pred_str, labels_str):
        if prev.replace(" ", "").upper() == real.replace(" ", "").upper():
            acertos += 1

    taxa_acerto = acertos / len(labels_str)

    return {"taxa_acerto_exato": taxa_acerto}


training_args = Seq2SeqTrainingArguments(
    output_dir="./trocr_captcha_modelo",
    predict_with_generate=True,
    eval_strategy="epoch",
    save_strategy="epoch",
    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=4,
    learning_rate=4e-5,
    num_train_epochs=EPOCAS,
    fp16=True,
    logging_steps=10,
    save_total_limit=2,
    load_best_model_at_end=True,
    metric_for_best_model="taxa_acerto_exato",
)

trainer = Seq2SeqTrainer(
    model=modelo,
    tokenizer=processor.tokenizer,
    args=training_args,
    compute_metrics=compute_metrics,
    train_dataset=dataset_treino,
    eval_dataset=dataset_teste,
    data_collator=default_data_collator,
)

print("\nIniciando o Fine-Tuning do TrOCR...")
pasta_saida = "./trocr_captcha_modelo"

if os.path.exists(pasta_saida):
    checkpoints = [os.path.join(pasta_saida, d) for d in os.listdir(pasta_saida) if d.startswith("checkpoint-")]
else:
    checkpoints = []

if len(checkpoints) > 0:
    ultimo_checkpoint = max(checkpoints, key=lambda x: int(x.split("-")[-1]))
    print(f"\n>>> Retomando o treinamento do checkpoint mais recente: {ultimo_checkpoint}")
    trainer.train(resume_from_checkpoint=ultimo_checkpoint)
else:
    print("\n>>> Nenhum checkpoint encontrado. Iniciando o treinamento do zero...")
    trainer.train()

trainer.save_model("../modelo_captcha_trocr")
processor.save_pretrained("../modelo_captcha_trocr")

print("\nTreinamento finalizado! Modelo salvo em '../modelo_captcha_trocr'")
