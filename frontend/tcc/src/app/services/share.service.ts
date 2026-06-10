import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class ShareService {
  private platform = inject(Platform);

  async compartilharGrafico(elemento: HTMLElement, titulo: string): Promise<void> {
    const domtoimage = await import('dom-to-image-more');

    if (this.platform.is('capacitor')) {
      const blob = await domtoimage.toBlob(elemento, {
        bgcolor: '#ffffff',
        scale: 2,
      });
      if (!blob) return;
      await this.compartilharMobile(blob, titulo);
    } else {
      const dataUrl = await domtoimage.toPng(elemento, {
        bgcolor: '#ffffff',
        scale: 2,
      });
      await this.baixarImagem(dataUrl, titulo);
    }
  }

  private async compartilharMobile(blob: Blob, titulo: string): Promise<void> {
    const { Share } = await import('@capacitor/share');
    const { Filesystem, Directory } = await import('@capacitor/filesystem');

    const base64 = await this.blobToBase64(blob);
    const nomeArquivo = `dashboard-${Date.now()}.png`;

    await Filesystem.writeFile({
      path: nomeArquivo,
      data: base64,
      directory: Directory.Cache,
    });

    await Share.share({
      title: titulo,
      text: 'Confira este dashboard do CuritibAtiva',
      url: nomeArquivo,
      dialogTitle: 'Compartilhar dashboard',
    });
  }

  private async baixarImagem(dataUrl: string, titulo: string): Promise<void> {
    const link = document.createElement('a');
    link.download = `${titulo.replace(/\s+/g, '_').toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
