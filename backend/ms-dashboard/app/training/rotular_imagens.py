import os
import tkinter as tk
from tkinter import messagebox

import cv2
from PIL import Image, ImageTk


class RotuladorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Rotular captchas")
        self.root.geometry("500x400")

        self.PASTA_BRUTOS = "captchas_brutos"
        self.PASTA_TREINO = "captchas_treino"
        if not os.path.exists(self.PASTA_TREINO):
            os.makedirs(self.PASTA_TREINO)

        self.arquivos = [
            f
            for f in os.listdir(self.PASTA_BRUTOS)
            if f.lower().endswith((".png", ".jpg", ".jpeg"))
        ]
        self.indice = 0

        self.label_progresso = tk.Label(root, text="", font=("Arial", 10))
        self.label_progresso.pack(pady=5)

        self.canvas_img = tk.Label(root)
        self.canvas_img.pack(pady=10)

        self.entry_var = tk.StringVar()
        self.entry = tk.Entry(
            root, textvariable=self.entry_var, font=("Arial", 18), justify="center"
        )
        self.entry.pack(pady=10)
        self.entry.bind("<Return>", lambda e: self.salvar())
        self.entry.bind("<Escape>", lambda e: self.pular())
        self.entry.focus_set()

        btn_frame = tk.Frame(root)
        btn_frame.pack(pady=10)

        tk.Button(
            btn_frame, text="Pular (Esc)", command=self.pular, bg="#f44336", fg="white"
        ).pack(side=tk.LEFT, padx=5)
        tk.Button(
            btn_frame,
            text="Salvar (Enter)",
            command=self.salvar,
            bg="#4CAF50",
            fg="white",
        ).pack(side=tk.LEFT, padx=5)

        self.carregar_proxima()

    def carregar_proxima(self):
        if self.indice >= len(self.arquivos):
            messagebox.showinfo("Fim", "Todas as imagens foram rotuladas!")
            self.root.quit()
            return

        self.label_progresso.config(
            text=f"Imagem {self.indice + 1} de {len(self.arquivos)}"
        )
        self.caminho_atual = os.path.join(self.PASTA_BRUTOS, self.arquivos[self.indice])

        img = cv2.imread(self.caminho_atual)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_pil = Image.fromarray(img_rgb)

        img_pil = img_pil.resize((300, 100), Image.LANCZOS)

        self.img_tk = ImageTk.PhotoImage(image=img_pil)
        self.canvas_img.config(image=self.img_tk)
        self.entry_var.set("")

    def salvar(self):
        label = self.entry_var.get().strip().upper()
        if label:
            arquivo_atual = self.arquivos[self.indice]
            ext = arquivo_atual.split(".")[-1]

            novo_nome = f"{label}.{ext}"

            os.rename(self.caminho_atual, os.path.join(self.PASTA_TREINO, novo_nome))

            self.indice += 1
            self.carregar_proxima()

    def pular(self):
        self.indice += 1
        self.carregar_proxima()


if __name__ == "__main__":
    root = tk.Tk()
    app = RotuladorApp(root)
    root.mainloop()
