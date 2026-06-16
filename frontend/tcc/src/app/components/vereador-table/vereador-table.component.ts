import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { VereadorService } from 'src/app/services/vereador';
import { VereadorDTO } from 'src/app/models/dto/vereador-dto';

@Component({
  selector: 'app-vereador-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="vereador-table">
      <h3 class="table-title">Vereadores</h3>
      <div class="table-list">
        @for (v of vereadores; track v.id) {
          <div class="table-item">
            <a class="item-link" [routerLink]="['/vereador', v.id]">
              <span class="avatar">{{ v.nome.charAt(0) }}</span>
              <div class="info">
                <span class="nome">{{ v.nome }}</span>
                <span class="partido">{{ v.partido }}</span>
              </div>
            </a>
            <button class="btn-seguir" [class.seguindo]="auth.isLoggedIn() && seguindoIds.has(v.id)" (click)="toggleSeguir($event, v.id)">
              {{ auth.isLoggedIn() && seguindoIds.has(v.id) ? 'Seguindo' : 'Seguir' }}
            </button>
          </div>
        }
      </div>
    </aside>
  `,
  styles: [`
    .vereador-table {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 20px 0;
    }
    .table-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--ion-color-step-500);
      margin: 0 16px 12px 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--ion-border-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .table-list {
      display: flex;
      flex-direction: column;
    }
    .table-item {
      display: flex;
      align-items: center;
      padding: 4px 12px 4px 16px;
      gap: 2px;
    }
    .table-item:hover {
      background: var(--ion-color-step-50);
    }
    .item-link {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex: 1;
      min-width: 0;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .nome {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--ion-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .partido {
      font-size: 0.72rem;
      color: var(--ion-color-step-500);
    }
    .btn-seguir {
      flex-shrink: 0;
      padding: 4px 12px;
      border-radius: 14px;
      border: 1px solid var(--ion-color-primary);
      background: transparent;
      color: var(--ion-color-primary);
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
      line-height: 1.4;
    }
    .btn-seguir:hover {
      background: rgba(var(--ion-color-primary-rgb), 0.08);
    }
    .btn-seguir.seguindo {
      background: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
      border-color: var(--ion-color-primary);
    }
    .btn-seguir.seguindo:hover {
      background: var(--ion-color-primary-shade);
    }
  `]
})
export class VereadorTableComponent implements OnInit, OnDestroy {
  vereadores: VereadorDTO[] = [];
  seguindoIds = new Set<number>();
  userId: number | null = null;
  auth = inject(AuthService);
  private destroyed = new Subject<void>();

  constructor(
    private vereadorService: VereadorService,
  ) {}

  ngOnInit() {
    this.sincronizarAuth();
    this.auth.authState$
      .pipe(takeUntil(this.destroyed))
      .subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          this.userId = this.auth.getUsuarioId();
          this.carregarSeguindo();
        } else {
          this.userId = null;
          this.seguindoIds.clear();
        }
      });

    this.auth.reset$
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        this.userId = null;
        this.seguindoIds.clear();
      });

    this.vereadorService.listarTopSeguidos().subscribe({
      next: (lista) => this.vereadores = lista,
      error: () => this.vereadores = []
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private sincronizarAuth(): void {
    this.userId = this.auth.getUsuarioId();
    if (this.userId) {
      this.carregarSeguindo();
    }
  }

  private carregarSeguindo(): void {
    const uid = this.userId;
    if (!uid) return;
    this.vereadorService.listarSeguindo(uid).subscribe({
      next: (lista) => {
        this.seguindoIds = new Set(lista.map(v => v.id));
      }
    });
  }

  toggleSeguir(event: Event, vereadorId: number) {
    event.preventDefault();
    event.stopPropagation();

    const uid = this.userId;
    if (!uid) { this.auth.showLoginPrompt(); return; }

    const seguindo = this.seguindoIds.has(vereadorId);

    if (seguindo) {
      this.seguindoIds.delete(vereadorId);
    } else {
      this.seguindoIds.add(vereadorId);
    }

    const obs = seguindo
      ? this.vereadorService.deixarDeSeguir(uid, vereadorId)
      : this.vereadorService.seguir(uid, vereadorId);

    obs.subscribe({ error: (err) => {
      if (err?.status === 403) {
        this.auth.showLoginPrompt();
        return;
      }
      if (seguindo) {
        this.seguindoIds.add(vereadorId);
      } else {
        this.seguindoIds.delete(vereadorId);
      }
    }});
  }
}
