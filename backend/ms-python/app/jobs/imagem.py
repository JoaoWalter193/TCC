import cv2
import numpy as np
from PIL import Image

def tem_fundo_colorido(imagem):
    hsv = imagem.convert("HSV")
    saturacao = np.array(hsv)[:, :, 1]
    return np.mean(saturacao) > 15

def tratar_imagem_pb(imagem):
    img = np.array(imagem)
    if len(img.shape) == 3:
        img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    _, thresh = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    abertura = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(abertura, connectivity=8)
    mask = np.zeros_like(abertura)
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] > 40:
            mask[labels == i] = 255

    return Image.fromarray(cv2.bitwise_not(mask))

def tratar_imagem_colorida(imagem):
    img = np.array(imagem)
    if len(img.shape) == 3:
        img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img = clahe.apply(img)
    img = cv2.medianBlur(img, 3)
    thresh = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 21, 15)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros(thresh.shape, dtype="uint8")
    for c in contours:
        if cv2.contourArea(c) > 20:
            cv2.drawContours(mask, [c], -1, 255, -1)

    mask = cv2.dilate(mask, np.ones((2, 2), np.uint8), iterations=1)
    return Image.fromarray(cv2.bitwise_not(mask))


def preprocessar(imagem):
    if tem_fundo_colorido(imagem):
        imagem = tratar_imagem_colorida(imagem)
    else:
        imagem = tratar_imagem_pb(imagem)
    return imagem.convert("RGB")
