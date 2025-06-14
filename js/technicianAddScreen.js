import {
    addTechnician
} from './localStorageManager.js';
import {
    showToast
} from './notifications.js';

export function getTechnicianAddScreenHTML() {
    return `
    <div class="container technician-form-container">
      <div class="screen-header">
        <h1><span class="material-icons">person_add</span> Cadastrar Novo Técnico</h1>
      </div>

      <form id="new-technician-form" class="form-card" novalidate>
        <div class="form-body">
          <div class="form-group">
            <label for="fullName">Nome Completo</label>
            <input type="text" id="fullName" name="nome" class="input" placeholder="Digite o nome completo do funcionário" required>
            <div class="validation-message"></div>
          </div>
          <div class="form-group">
            <label for="username">Usuário (para login)</label>
            <input type="text" id="username" name="usuario" class="input" placeholder="Digite um nome de usuário único" required>
            <div class="validation-message"></div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="cargo">Cargo</label>
              <input type="text" id="cargo" name="cargo" class="input" placeholder="Ex: Técnico Eletricista" required>
              <div class="validation-message"></div>
            </div>
            <div class="form-group">
              <label for="matricula">Matrícula</label>
              <input type="text" id="matricula" name="matricula" class="input" placeholder="Ex: 987654" required>
              <div class="validation-message"></div>
            </div>
          </div>
          <div class="form-group">
            <label for="accessLevel">Nível de Acesso</label>
            <select id="accessLevel" name="nivelAcesso" class="input" required>
              <option value="" disabled selected>Selecione o nível de acesso</option>
              <option value="tecnico">Técnico</option>
              <option value="supervisor">Supervisor</option>
              <option value="adm">Administrador (ADM)</option>
            </select>
            <div class="validation-message"></div>
          </div>
          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" name="senha" class="input" placeholder="••••••••">
            <small class="hint">A senha padrão para novos usuários é "admin". Deixe em branco para usar a padrão.</small>
            <div class="validation-message"></div>
          </div>
        </div>
        <div class="form-footer">
          <button type="button" class="btn-cancel" id="cancelTechnicianForm">
            <i class="material-icons">close</i> Cancelar
          </button>
          <button type="submit" class="btn-submit">
            <i class="material-icons">save</i> Salvar Cadastro
          </button>
        </div>
      </form>
    </div>`;
}

export function setupTechnicianAddScreen(navigateTo) {
    const form = document.getElementById('new-technician-form');
    const cancelBtn = document.getElementById('cancelTechnicianForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm(form)) {
            const formData = new FormData(form);
            const technicianData = {
                nome: formData.get('nome'),
                usuario: formData.get('usuario'),
                cargo: formData.get('cargo'),
                matricula: formData.get('matricula'),
                nivelAcesso: formData.get('nivelAcesso'),
                senha: formData.get('senha')
            };

            if (!technicianData.senha) {
                technicianData.senha = 'admin';
            }

            try {
                const result = addTechnician(technicianData);
                if (result) {
                    showToast('Técnico cadastrado com sucesso!', 'success');
                    navigateTo('technicians');
                }
            } catch (error) {
                showToast(error.message, 'error');
            }
        } else {
            showToast('Por favor, corrija os erros no formulário.', 'error');
        }
    });

    cancelBtn.addEventListener('click', () => {
        navigateTo('technicians');
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required]');

    inputs.forEach(input => {
        const parent = input.parentElement;
        const errorDiv = parent.querySelector('.validation-message');

        if (input.value.trim() === '') {
            isValid = false;
            parent.classList.add('input-error');
            errorDiv.textContent = 'Este campo é obrigatório.';
        } else {
            parent.classList.remove('input-error');
            errorDiv.textContent = '';
        }
    });

    return isValid;
}