import { Component, inject, OnInit } from '@angular/core';
import { CardComponent } from '../components/card/card.component';
import { IonContent, IonButtons, IonMenuButton, IonBackButton, IonHeader, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { VereadorDTO } from '../models/dto/vereador-dto';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { ActivatedRoute, Router } from '@angular/router';
import { VereadorService } from '../services/vereador';
import { ProposicaoService } from '../services/proposicao';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-vereador',
  templateUrl: './vereador.component.html',
  styleUrls: ['./vereador.component.scss'],
  imports: [
    CardComponent,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonBackButton,
    IonHeader,
    IonToolbar,
    IonButton
],
})
export class VereadorComponent implements OnInit {
  auth = inject(AuthService);
  vereador!: VereadorDTO;
  proposicoes: ProposicaoDTO[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private vereadorService: VereadorService,
    private proposicaoService: ProposicaoService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.carregarVereador(id);
    this.carregarProposicoes(id);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  carregarVereador(id: number) {
    this.vereadorService.buscarPorId(id).subscribe({
      next: (data) => {
        if (data) {
          this.vereador = data;
        }
      },
    });
  }

  carregarProposicoes(id: number) {
    this.proposicaoService.listar().subscribe({
      next: (data) => {
        this.proposicoes = data.filter((p) => p.vereador.id === id);
      },
    });
  }
}
