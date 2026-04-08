import { Component, inject, Input, OnInit } from '@angular/core';
import { IonHeader, IonButtons, IonBackButton, IonButton, IonMenuButton, IonContent, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProposicaoDTO } from '../models/dto/proposicao-dto';
import { ProposicaoService } from '../services/proposicao';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  imports: [
    IonHeader,
    IonButtons,
    IonBackButton,
    IonButton,
    IonMenuButton,
    IonContent,
    IonIcon,
    IonTitle,
    IonToolbar
],
})
export class PostComponent implements OnInit {
  auth = inject(AuthService);
  post!: ProposicaoDTO;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private proposicaoService: ProposicaoService
  ) {}

  ngOnInit() {
    this.carregarPost();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  carregarPost() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.proposicaoService.buscarPorId(id).subscribe({
      next: (data) => {
        if (data) {
          this.post = data;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar proposição', err);
      },
    });
  }
}
