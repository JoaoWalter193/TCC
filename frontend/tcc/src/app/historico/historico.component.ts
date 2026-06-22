import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBackButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonSpinner, IonButton, AlertController,
} from "@ionic/angular/standalone";
import { HistoricoItem } from '../models/historico.model';
import { HistoricoService } from '../services/historico.service';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.scss'],
  standalone: true,
  imports: [
    IonBackButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonSpinner, IonButton, RouterLink,
  ],
})
export class HistoricoComponent implements OnInit {
  historico: HistoricoItem[] = [];
  carregando = true;

  constructor(
    private historicoService: HistoricoService,
    private alertCtrl: AlertController,
  ) {}

  ngOnInit() {
    this.carregar();
  }

  formatarData(data: string): string {
    if (!data) return '';
    const d = new Date(data);
    const agora = new Date();
    const diffMs = Math.abs(agora.getTime() - d.getTime());
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffDias === 0) return 'Hoje';
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `Há ${diffDias} dias`;

    const dia = String(d.getDate()).padStart(2, '0');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mes = meses[d.getMonth()];
    const ano = d.getFullYear();
    const anoAtual = agora.getFullYear();

    return ano === anoAtual ? `${dia} ${mes}` : `${dia} ${mes} ${ano}`;
  }

  async excluirTudo(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Limpar histórico',
      message: 'Tem certeza que deseja excluir todo o histórico de navegação? Esta ação não pode ser desfeita.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir tudo',
          role: 'destructive',
          handler: () => {
            const usuarioId = Number(localStorage.getItem('usuario_id') || 1);
            this.historicoService.excluirTudo(usuarioId).subscribe({
              next: () => {
                this.historico = [];
                this.carregando = false;
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private carregar(): void {
    this.historicoService.listar().subscribe({
      next: (items) => {
        this.historico = items.sort(
          (a, b) => new Date(b.dataAcesso).getTime() - new Date(a.dataAcesso).getTime(),
        );
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      },
    });
  }
}
