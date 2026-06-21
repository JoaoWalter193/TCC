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
import { IonContent, IonButtons, IonBackButton, IonButton } from "@ionic/angular/standalone";


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
  imports: [ReactiveFormsModule, CommonModule, IonContent, IonButtons, IonBackButton, IonButton],
})
export class CadastroComponent implements OnInit {
  cadastroForm!: FormGroup;

  currentStep: number = 1;

  mensagemSucesso: string = '';
  mensagemErro: string = '';
  carregando: boolean = false;

  escolaridadeOptions = [
    'Ensino Fundamental Incompleto',
    'Ensino Fundamental Completo',
    'Ensino Médio Incompleto',
    'Ensino Médio Completo',
    'Ensino Superior Incompleto',
    'Ensino Superior Completo',
    'Pós-Graduação',
    'Mestrado',
    'Doutorado',
  ];

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
            Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
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

      stepThreeGroup: this.fb.group({
        cep: ['', [Validators.pattern(/^\d{5}-\d{3}$/)]],
        escolaridade: [''],
        profissao: [''],
      }),
    });
  }

  get stepOneGroup(): FormGroup {
    return this.cadastroForm.get('stepOneGroup') as FormGroup;
  }

  get stepTwoGroup(): FormGroup {
    return this.cadastroForm.get('stepTwoGroup') as FormGroup;
  }

  get stepThreeGroup(): FormGroup {
    return this.cadastroForm.get('stepThreeGroup') as FormGroup;
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

  goToStepThree() {
    this.mensagemErro = '';
    this.stepTwoGroup.markAllAsTouched();

    if (this.stepTwoGroup.invalid || this.stepTwoGroup.hasError('passwordsMismatch')) {
      this.mensagemErro =
        'Por favor, corrija os erros de senha antes de prosseguir.';
      return;
    }

    this.currentStep = 3;
  }

  goToStepTwoBack() {
    this.currentStep = 2;
    this.mensagemErro = '';
  }

  onSubmit() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (this.cadastroForm.invalid) {
      this.mensagemErro =
        'Por favor, corrija os erros do formulário.';
      return;
    }

    this.carregando = true;

    const stepOneValue = this.stepOneGroup.value;
    const stepTwoValue = this.stepTwoGroup.value;
    const stepThreeValue = this.stepThreeGroup.value;

    const dadosParaBackend: CriarUsuarioDTO = {
      cpf: stepOneValue.cpf.replace(/\D/g, ''),
      nome: stepOneValue.nome,
      email: stepOneValue.email,
      senha: stepTwoValue.senha,
      senhaNovamente: stepTwoValue.senhaNovamente,
      cep: stepThreeValue.cep ? stepThreeValue.cep.replace(/\D/g, '') : undefined,
      escolaridade: stepThreeValue.escolaridade || undefined,
      profissao: stepThreeValue.profissao || undefined,
    };

    this.usuarioService
      .criarUsuario(dadosParaBackend)
      .pipe(
        catchError((error) => {
          this.carregando = false;
          console.error('Erro no cadastro:', error);

          this.mensagemErro =
            error.error?.message ||
            error.error?.desc ||
            'Erro desconhecido ao cadastrar usuário.';
          return of(null);
        })
      )
      .subscribe((response: ResponseDTO | null) => {
        this.carregando = false;

        if (response) {
          this.mensagemSucesso = 'Usuário cadastrado com sucesso!';

          this.cadastroForm.reset();
          this.currentStep = 1;
          setTimeout(() => this.router.navigate(['/login']), 1000);
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onCpfInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.stepOneGroup.get('cpf')?.setValue(value, { emitEvent: false });
  }

  onCepInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 8);
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    this.stepThreeGroup.get('cep')?.setValue(value, { emitEvent: false });
  }
}
