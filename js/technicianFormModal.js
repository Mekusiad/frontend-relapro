import {
    getTechnicianById,
    updateTechnician
} from './localStorageManager.js';
import {
    showToast
} from './notifications.js';

let technicianFormModalOverlay = null;

function hideModal() {
    if (technicianFormModalOverlay) {
        technicianFormModalOverlay.remove();
        technicianFormModalOverlay = null;
        document.body.style.overflow = 'auto';
    }
}

function getModalHTML(technician) {
    const title = 'Editar Cadastro de Funcionário';
    return `
    <div class="modal-overlay" id="technicianFormModalOverlay">
      <div class="modal-content large-form-modal">
        <span class="close-button material-icons" id="closeTechnicianFormModal">close</span>
        <form id="employee-form-modal" novalidate>
            <input type="hidden" id="technicianId" value="${technician?.id || ''}">
            <div class="form-header"><h1>${title}</h1></div>
            <div class="form-body">
                <div class="form-group">
                    <label for="fullName">Nome Completo</label>
                    <input type="text" id="fullName" name="nome" class="input" required value="${technician?.nome || ''}">
                </div>
                <div class="form-group">
                    <label for="username">Usuário (para login)</label>
                    <input type="text" id="username" name="usuario" class="input" required value="${technician?.usuario || ''}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="matricula">Matrícula</label>
                        <input type="text" id="matricula" name="matricula" class="input" required value="${technician?.matricula || ''}">
                    </div>
                    <div class="form-group">
                        <label for="cargo">Cargo</label>
                        <input type="text" id="cargo" name="cargo" class="input" required value="${technician?.cargo || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="accessLevel">Nível de Acesso</label>
                    <select id="accessLevel" name="nivelAcesso" class="input" required>
                        <option value="tecnico" ${technician?.nivelAcesso === 'tecnico' ? 'selected' : ''}>Técnico</option>
                        <option value="supervisor" ${technician?.nivelAcesso === 'supervisor' ? 'selected' : ''}>Supervisor</option>
                        <option value="adm" ${technician?.nivelAcesso === 'adm' ? 'selected' : ''}>Administrador (ADM)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="password">Nova Senha</label>
                    <input type="password" id="password" name="senha" class="input" placeholder="Deixe em branco para não alterar">
                </div>
            </div>
            <div class="form-footer">
                <button type="button" class="btn-cancel" id="cancelTechnicianForm"><i class="material-icons">close</i> Cancelar</button>
                <button type="submit" class="btn-submit"><i class="material-icons">save</i> Salvar Alterações</button>
            </div>
        </form>
      </div>
    </div>`;
}

function setupEventListeners() {
    const form = document.getElementById('employee-form-modal');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const technicianData = Object.fromEntries(formData.entries());
        technicianData.id = document.getElementById('technicianId').value;

        if (!technicianData.senha) {
            delete technicianData.senha;
        }

        try {
            const result = updateTechnician(technicianData);
            if (result) {
                showToast('Técnico atualizado com sucesso!', 'success');
                hideModal();
                document.dispatchEvent(new CustomEvent('techniciansUpdated'));
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('closeTechnicianFormModal')?.addEventListener('click', hideModal);
    document.getElementById('cancelTechnicianForm')?.addEventListener('click', hideModal);
    technicianFormModalOverlay.addEventListener('click', (e) => {
        if (e.target === technicianFormModalOverlay) {
            hideModal();
        }
    });
}

export function showTechnicianFormModal(technicianId) {
    if (!technicianId) {
        return;
    }
    hideTechnicianFormModal();

    const technicianToEdit = getTechnicianById(technicianId);
    if (!technicianToEdit) {
        showToast('Técnico não encontrado.', 'error');
        return;
    }

    const modalHTML = getModalHTML(technicianToEdit);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    technicianFormModalOverlay = tempDiv.firstChild;

    document.body.appendChild(technicianFormModalOverlay);
    document.body.style.overflow = 'hidden';
    setupEventListeners();
}

export function hideTechnicianFormModal() {
    if (technicianFormModalOverlay) {
        technicianFormModalOverlay.remove();
        technicianFormModalOverlay = null;
        document.body.style.overflow = 'auto';
    }
}