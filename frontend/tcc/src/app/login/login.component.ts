import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ResponseDTO } from '../models/dto/response-dto';
import { LoginRequest } from '../models/dto/login-request';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,

  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  recoveryForm!: FormGroup;

  mensagemErro: string = '';
  mensagemSucesso: string = '';
  carregando: boolean = false;

  isRecoveryModalOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.recoveryForm = this.fb.group({
      recoveryEmail: ['', [Validators.required, Validators.email]],
    });
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get senhaControl() {
    return this.loginForm.get('senha');
  }

  get recoveryEmailControl() {
    return this.recoveryForm.get('recoveryEmail');
  }


  openRecoveryModal() {
    this.isRecoveryModalOpen = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.recoveryForm.reset();
  }

  closeRecoveryModal() {
    this.isRecoveryModalOpen = false;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  handleRecoverySubmit() {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      this.mensagemErro =
        'Por favor, informe um e-mail válido para recuperação.';
      return;
    }

    this.carregando = true;
    const email = this.recoveryForm.value.recoveryEmail;

    this.usuarioService
      .recuperarContaSenha(email)
      .pipe(
        catchError((error) => {
          this.carregando = false;
          console.error('Erro na recuperação:', error);
          this.mensagemErro =
            error.error?.mensagem ||
            'Falha ao enviar e-mail. Verifique o endereço.';
          return of(null);
        })
      )
      .subscribe((response: ResponseDTO | null) => {
        this.carregando = false;
        if (response) {
          this.mensagemSucesso =
            response.mensagem || 'E-mail de recuperação enviado com sucesso!';
          this.recoveryForm.reset();
        }
      });
  }

  onSubmitLogin() {
    this.mensagemErro = '';
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.mensagemErro =
        'Por favor, corrija os erros do formulário antes de prosseguir.';
      return;
    }

    this.carregando = true;
    const dadosLogin: LoginRequest = this.loginForm.value as LoginRequest;

    this.usuarioService
      .loginUsuario(dadosLogin)
      .pipe(
        catchError((error) => {
          this.carregando = false;
          console.error('Erro no login:', error);

          this.mensagemErro =
            error.error?.mensagem ||
            'Falha ao realizar login. Verifique suas credenciais.';
          return of(null);
        })
      )
      .subscribe((response: ResponseDTO | null) => {
        this.carregando = false;

        if (response && response.token) {
          localStorage.setItem('auth_token', response.token);
          if (response.usuario) {
            localStorage.setItem('user_info', JSON.stringify(response.usuario));
          }

          this.router.navigate(['/tabs/tab1']);
        } else if (response) {
          this.mensagemErro =
            response.mensagem || 'Resposta de login inválida ou incompleta.';
        }
      });
  }

  goToRecuperarSenha() {
    this.router.navigate(['/recover'], {
      queryParams: { tipo: 'senha' }
    });
  }

  goToReativarConta() {
    this.router.navigate(['/recover'], {
      queryParams: { tipo: 'reativar' }
    });
  }

  goToCadastro() {
    this.router.navigate(['/cadastro']);
  }
}
