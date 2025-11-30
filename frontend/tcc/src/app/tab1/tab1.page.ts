import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { AlterarUsuarioDTO } from '../models/dto/alterar-usuario-dto';
import { UsuarioDTO } from '../models/dto/usuario-dto';

interface FormularioPerfil extends AlterarUsuarioDTO {
  senhaNovaNovamente: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class Tab1Page implements OnInit {
  perfilAtual: UsuarioDTO = { cpf: '', nome: '', email: '' };

  dadosFormulario: FormularioPerfil = {
    nome: '',
    email: '',
    senhaAntiga: '',
    senhaNova: '',
    senhaNovaNovamente: '',
  };

  mensagemSucesso: string = '';
  mensagemErro: string = '';
  carregando: boolean = false;
  cpfUsuarioLogado: string = '';

  mostraConfirmacaoDelecao: boolean = false;
  mostraModalDeletado: boolean = false;

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  ngOnInit() {
    this.carregarDadosDoPerfil();
  }

  carregarDadosDoPerfil() {
    this.carregando = true;
    const userInfoString = localStorage.getItem('user_info');

    if (userInfoString) {
      const userInfo: UsuarioDTO = JSON.parse(userInfoString);
      this.cpfUsuarioLogado = userInfo.cpf;

      this.usuarioService.pegarUsuario(this.cpfUsuarioLogado).subscribe({
        next: (data) => {
          this.perfilAtual = data;
          // Pré-preenche o formulário com dados atuais (garantindo que os inputs sejam preenchidos)
          this.dadosFormulario.nome = data.nome;
          this.dadosFormulario.email = data.email;
          this.carregando = false;
        },
        error: (error) => {
          console.error('Erro ao carregar perfil:', error);
          this.mensagemErro = 'Não foi possível carregar os dados do perfil.';
          this.carregando = false;
        },
      });
    } else {
      this.router.navigate(['/login']);
      this.carregando = false;
    }
  }

  senhasNaoConferem(): boolean {
    if (
      this.dadosFormulario.senhaNova ||
      this.dadosFormulario.senhaNovaNovamente
    ) {
      return (
        this.dadosFormulario.senhaNova !==
        this.dadosFormulario.senhaNovaNovamente
      );
    }
    return false;
  }

  estaTentandoMudarSenha(): boolean {
    return (
      !!this.dadosFormulario.senhaNova ||
      !!this.dadosFormulario.senhaNovaNovamente
    );
  }

  salvarAlteracoes() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    // ... (Validações de senha)

    // 🟢 FUNÇÃO DE LIMPEZA
    const limparCamposSenha = () => {
      this.dadosFormulario.senhaAntiga = '';
      this.dadosFormulario.senhaNova = '';
      this.dadosFormulario.senhaNovaNovamente = '';
    };

    const dadosParaBackend: AlterarUsuarioDTO = {
      nome: this.dadosFormulario.nome,
      email: this.dadosFormulario.email,
    };


    if (this.dadosFormulario.senhaNova) {
      dadosParaBackend.senhaNova = this.dadosFormulario.senhaNova;
      dadosParaBackend.senhaAntiga = this.dadosFormulario.senhaAntiga;
      dadosParaBackend.senhaNovaNovamente = this.dadosFormulario.senhaNovaNovamente;
    }

    this.carregando = true;

    this.usuarioService
      .atualizarUsuario(this.cpfUsuarioLogado, dadosParaBackend)
      .subscribe({
        next: (response) => {
          this.mensagemSucesso = 'Perfil atualizado com sucesso!';
          this.perfilAtual = response;

          limparCamposSenha();
          this.carregando = false;

          localStorage.setItem('user_info', JSON.stringify(response));
        },
        error: (error) => {
          const errorDetails =
            error.error?.desc || error.error?.message || 'Erro desconhecido.';
          console.error('❌ Erro na submissão:', error.status, errorDetails);

          this.mensagemErro =
            error.error?.desc ||
            'Falha ao atualizar o perfil. Tente novamente.';

          limparCamposSenha();
          this.carregando = false;
        },
      });
  }

  iniciarDelecao() {
    this.mostraConfirmacaoDelecao = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  cancelarDelecao() {
    this.mostraConfirmacaoDelecao = false;
  }

  confirmarDelecao() {
    if (!this.cpfUsuarioLogado) {
      this.mensagemErro = 'Erro: CPF do usuário não encontrado.';
      this.mostraConfirmacaoDelecao = false;
      return;
    }

    this.carregando = true;
    this.mostraConfirmacaoDelecao = false;

    this.usuarioService.deletarUsuario(this.cpfUsuarioLogado).subscribe({
      next: (response) => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        this.carregando = false;
        this.mensagemSucesso =
          response.mensagem || 'você tem sete dias para recuperar sua conta.';
        this.mostraModalDeletado = true;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.carregando = false;
        this.mensagemErro =
          error.error?.mensagem || 'Falha ao deletar a conta. Tente novamente.';
        console.error('Erro ao deletar conta:', error);
      },
    });
  }
}
