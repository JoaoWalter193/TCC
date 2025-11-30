import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CriarUsuarioDTO } from '../models/dto/criar-usuario-dto';
import { ResponseDTO } from '../models/dto/response-dto';


export const PasswordsMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const senha = control.get('senha');
  const senhaNovamente = control.get('senhaNovamente');

  if (!senha || !senhaNovamente) {
    return null;
  }

  return senha.value === senhaNovamente.value
    ? null
    : { passwordsMismatch: true };
};

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class CadastroComponent implements OnInit {
  cadastroForm!: FormGroup;

  currentStep: number = 1;

  mensagemSucesso: string = '';
  mensagemErro: string = '';
  carregando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cadastroForm = this.fb.group({
      stepOneGroup: this.fb.group({
        nome: ['', [Validators.required]],

        cpf: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{11}$/),
          ],
        ],

        email: ['', [Validators.required, Validators.email]],
      }),

      stepTwoGroup: this.fb.group(
        {
          senha: ['', [Validators.required, Validators.minLength(6)]],
          senhaNovamente: ['', [Validators.required]],
        },
        { validators: PasswordsMatchValidator }
      ),
    });
  }

  get stepOneGroup(): FormGroup {
    return this.cadastroForm.get('stepOneGroup') as FormGroup;
  }

  get stepTwoGroup(): FormGroup {
    return this.cadastroForm.get('stepTwoGroup') as FormGroup;
  }


  goToStepTwo() {
    this.mensagemErro = '';
    this.stepOneGroup.markAllAsTouched();

    if (this.stepOneGroup.invalid) {
      this.mensagemErro =
        'Por favor, preencha corretamente todos os campos da Etapa 1.';
      return;
    }

    this.currentStep = 2;
  }


  goToStepOne() {
    this.currentStep = 1;
    this.mensagemErro = '';
  }

  onSubmit() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    this.stepTwoGroup.markAllAsTouched();

    if (this.cadastroForm.invalid) {
      this.mensagemErro =
        'Por favor, corrija os erros do formulário e verifique as senhas.';
      this.currentStep = 2;
      return;
    }

    this.carregando = true;

    const stepOneValue = this.stepOneGroup.value;
    const stepTwoValue = this.stepTwoGroup.value;

    const dadosParaBackend: CriarUsuarioDTO = {
      cpf: stepOneValue.cpf,
      nome: stepOneValue.nome,
      email: stepOneValue.email,
      senha: stepTwoValue.senha,
      senhaNovamente: stepTwoValue.senhaNovamente,
    };

    this.usuarioService
      .criarUsuario(dadosParaBackend)
      .pipe(
        catchError((error) => {
          this.carregando = false;
          console.error('Erro no cadastro:', error);

          this.mensagemErro =
            error.error?.mensagem || 'Erro desconhecido ao cadastrar usuário.';
          return of(null);
        })
      )
      .subscribe((response: ResponseDTO | null) => {
        this.carregando = false;

        if (response) {
          this.mensagemSucesso =
            response.mensagem || 'Usuário cadastrado com sucesso!';

          this.cadastroForm.reset();
          this.currentStep = 1;
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
