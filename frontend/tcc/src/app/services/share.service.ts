import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class ShareService {
  private platform = inject(Platform);

  async compartilharGrafico(elemento: HTMLElement, titulo: string): Promise<void> {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(elemento, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    if (this.platform.is('capacitor')) {
      await this.compartilharMobile(canvas, titulo);
    } else {
      await this.baixarImagem(canvas, titulo);
    }
  }

  private async compartilharMobile(canvas: HTMLCanvasElement, titulo: string): Promise<void> {
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(b => resolve(b), 'image/png'),
    );
    if (!blob) return;

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

  private async baixarImagem(canvas: HTMLCanvasElement, titulo: string): Promise<void> {
    const link = document.createElement('a');
    link.download = `${titulo.replace(/\s+/g, '_').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
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
