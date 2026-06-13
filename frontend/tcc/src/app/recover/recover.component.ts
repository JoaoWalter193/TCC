import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { IonIcon, IonButton, IonBackButton, IonButtons } from "@ionic/angular/standalone";

type AcaoTipo = 'senha' | 'reativar';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss'],
  imports: [ReactiveFormsModule, IonIcon, IonButton, IonBackButton, IonButtons],
})
export class RecoverComponent implements OnInit {
  public acaoTipo: AcaoTipo = 'senha';
  public tituloTela: string = 'Processando Ação';
  public instrucaoTela: string = 'Aguardando contexto...';

  public formulario: FormGroup;
  public loading: boolean = false;
  public mensagemSucesso: string = '';
  public mensagemErro: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const tipo = params['tipo'] as AcaoTipo;

      if (tipo === 'senha' || tipo === 'reativar') {
        this.acaoTipo = tipo;
      } else {
        console.warn(
          `⚠️ [INIT] Parâmetro 'tipo' ausente ou inválido (${tipo}). Usando padrão: ${this.acaoTipo}`
        );
      }

      this.configurarConteudoTela();
    });
  }

  configurarConteudoTela(): void {
    if (this.acaoTipo === 'senha') {
      this.tituloTela = 'Esqueci minha senha';
      this.instrucaoTela =
        'Digite seu e-mail cadastrado para retornarmos uma nova senha para você';
    } else if (this.acaoTipo === 'reativar') {
      this.tituloTela = 'Recuperar conta';
      this.instrucaoTela =
        'Digite seu e-mail cadastrado para recuperarmos sua conta';
    }
  }

  enviarAcao(): void {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensagemErro = 'Por favor, insira um endereço de email válido';
      return;
    }

    this.loading = true;
    const email = this.formulario.value.email;

    this.usuarioService.recuperarContaSenha(email).subscribe({
      next: (response) => {
        this.mensagemSucesso =
          this.acaoTipo === 'senha'
            ? 'Instruções de redefinição de senha enviadas para o seu e-mail'
            : 'Conta recuperada. Verifique sua caixa de e-mail.';
        this.loading = false;
      },
      error: (error) => {
        this.mensagemErro =
          error.error?.message ||
          'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
        this.loading = false;
      },
    });
  }

    goToLogin() {
    this.router.navigate(['/login']);
  }
}
