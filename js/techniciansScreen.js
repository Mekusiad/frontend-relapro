import {
    getTechnicians,
    deleteTechnician
} from './localStorageManager.js';
import {
    getLoggedInUserName
} from './auth.js';
import {
    showToast
} from './notifications.js';

function renderTechnicianList() {
    const listContainer = document.getElementById('techniciansListContainer');
    if (!listContainer) return;

    const technicians = getTechnicians();
    listContainer.innerHTML = '';

    if (technicians.length === 0) {
        listContainer.innerHTML = '<p class="no-items-message">Nenhum técnico cadastrado.</p>';
        return;
    }

    technicians.forEach(tech => {
        const card = document.createElement('div');
        card.className = 'technician-card';
        card.innerHTML = `
            <div class="technician-card-header">
                <span class="technician-avatar">${tech.nome.charAt(0).toUpperCase()}</span>
                <div class="technician-info">
                    <h3 class="technician-name">${tech.nome}</h3>
                    <p class="technician-role">${tech.cargo || 'N/A'}</p>
                </div>
            </div>
            <div class="technician-card-body">
                <p><strong>Usuário:</strong> ${tech.usuario}</p>
                <p><strong>Matrícula:</strong> ${tech.matricula || 'N/A'}</p>
                <p><strong>Nível:</strong> <span class="access-level-badge level-${tech.nivelAcesso || 'tecnico'}">${tech.nivelAcesso || 'Técnico'}</span></p>
            </div>
            <div class="technician-card-footer">
                <button class="btn-edit-tech" data-id="${tech.id}"><i class="material-icons">edit</i> Editar</button>
                <button class="btn-delete-tech" data-id="${tech.id}"><i class="material-icons">delete</i> Excluir</button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

export function setupTechniciansScreen(actions) {
    const btnAddNew = document.getElementById('btnAddNewTechnician');
    if (btnAddNew) {
        btnAddNew.addEventListener('click', () => {
            actions.navigateTo('addTechnician');
        });
    }

    document.addEventListener('techniciansUpdated', renderTechnicianList, {
        once: true
    });

    const listContainer = document.getElementById('techniciansListContainer');
    if (listContainer) {
        listContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const techId = parseInt(button.dataset.id, 10);
            if (!techId) return;

            if (button.classList.contains('btn-edit-tech')) {
                actions.openModal('technicianForm', techId);
            }

            if (button.classList.contains('btn-delete-tech')) {
                const tech = getTechnicians().find(t => t.id === techId);
                if (tech && tech.nome === getLoggedInUserName()) {
                    showToast("Não é possível excluir o técnico logado.", 'warning');
                    return;
                }
                if (confirm(`Tem certeza que deseja excluir o técnico "${tech?.nome || 'N/A'}"?`)) {
                    if (deleteTechnician(techId)) {
                        showToast("Técnico excluído com sucesso.", "success");
                        renderTechnicianList();
                    } else {
                        showToast('Erro ao excluir técnico.', 'error');
                    }
                }
            }
        });
    }

    renderTechnicianList();
}

export function getTechniciansScreenHTML() {
    return `
    <div class="technicians-screen-container container">
      <div class="screen-header">
        <h1><span class="material-icons">engineering</span> Gestão de Técnicos</h1>
        <button id="btnAddNewTechnician" class="btn-primary">
          <span class="material-icons">add</span> Cadastrar Novo Técnico
        </button>
      </div>
      <div id="techniciansListContainer" class="technicians-grid">
      </div>
    </div>
    `;
}