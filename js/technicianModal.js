// js/technicianModal.js
import { getTechnicians, addTechnician, updateTechnician, deleteTechnician } from './localStorageManager.js';
import { getLoggedInUserName } from './auth.js';
// DENTRO DE: js/technicianFormModal.js
import { showToast } from './notifications.js'; // Adicione este import
//...
// Dentro do 'submit' event listener
if (result) {
    // SUBSTITUA a linha do alert por esta:
    showToast(`Técnico ${techId ? 'atualizado' : 'cadastrado'} com sucesso!`);
    hideModal();
    document.dispatchEvent(new CustomEvent('techniciansUpdated'));
}

let technicianModalOverlayElement = null; // Referência ao DOM do modal

function getTechnicianModalHTML(technicianToEdit = null) {
    const isEditMode = !!technicianToEdit;
    const formTitle = isEditMode ? "Editar Técnico" : "Adicionar Novo Técnico";
    return `
    <div class="modal-overlay" id="technicianModalOverlay">
      <div class="modal-content technician-list-modal">
        <span class="close-button material-icons" id="closeTechnicianModalBtn">close</span>
        <h2><span class="material-icons">engineering</span> Gerenciar Técnicos</h2>
        <form id="technicianFormModal" class="form-section"> {/* ID Diferente */}
          <h3 id="technicianFormTitleModal">${formTitle}</h3>
          <input type="hidden" id="technicianIdModal" value="${technicianToEdit?.id || ''}" />
          <div class="form-group">
            <label for="technicianNameModal">Nome Completo:</label>
            <input type="text" id="technicianNameModal" value="${technicianToEdit?.nome || ''}" required>
          </div>
          <div class="form-group">
            <label for="technicianUserModal">Usuário (login):</label>
            <input type="text" id="technicianUserModal" value="${technicianToEdit?.usuario || ''}" required>
            <small class="hint">Senha padrão: 1234</small>
          </div>
          <div class="form-actions">
            <button type="button" id="cancelTechnicianFormBtnModal" class="btn-cancel"><i class="material-icons">cancel</i> Limpar</button>
            <button type="submit" class="btn-submit"><i class="material-icons">save</i> ${isEditMode ? 'Atualizar' : 'Salvar'}</button>
          </div>
        </form>
        <div class="form-section" style="margin-top: 2rem;">
          <h3>Técnicos Cadastrados</h3>
          <ul id="technicianListModal" class="activity-list"><li class="no-items-message">Nenhum técnico cadastrado.</li></ul>
        </div>
      </div>
    </div>`;
}

function setupTechnicianModalEventListeners() {
    // Seleciona elementos DENTRO do modal recém-criado
    const form = technicianModalOverlayElement.querySelector("#technicianFormModal");
    const closeButton = technicianModalOverlayElement.querySelector("#closeTechnicianModalBtn");
    const cancelButton = technicianModalOverlayElement.querySelector("#cancelTechnicianFormBtnModal");
    const technicianListUl = technicianModalOverlayElement.querySelector("#technicianListModal");

    if (!form || !closeButton || !cancelButton || !technicianListUl) {
        console.error("TechnicianModal: Falha ao encontrar elementos internos para setup.");
        hideTechnicianModal(); return;
    }

    const resetForm = () => {
        form.reset();
        technicianModalOverlayElement.querySelector("#technicianIdModal").value = "";
        technicianModalOverlayElement.querySelector("#technicianFormTitleModal").textContent = "Adicionar Novo Técnico";
        form.querySelector(".btn-submit").innerHTML = '<i class="material-icons">save</i> Salvar';
    };

    closeButton.addEventListener("click", hideTechnicianModal);
    cancelButton.addEventListener("click", resetForm);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const idInput = technicianModalOverlayElement.querySelector("#technicianIdModal");
        const name = technicianModalOverlayElement.querySelector("#technicianNameModal").value.trim();
        const user = technicianModalOverlayElement.querySelector("#technicianUserModal").value.trim();
        const id = idInput.value ? parseInt(idInput.value, 10) : null;

        if (!name || !user) { alert("Nome e Usuário são obrigatórios."); return; }
        let success = false;
        if (id) { // Editando
            if (updateTechnician({ id, nome: name, usuario: user })) success = true;
        } else { // Adicionando
            if (addTechnician({ nome: name, usuario: user })) success = true;
        }
        if (success) {
            resetForm();
            renderTechnicianListInternal(technicianListUl); // Passa o elemento UL
        }
    });

    technicianListUl.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".edit-technician-btn");
        const deleteBtn = e.target.closest(".delete-technician-btn");
        const techIdStr = editBtn?.dataset.technicianId || deleteBtn?.dataset.technicianId;
        if (!techIdStr) return;
        const techId = parseInt(techIdStr, 10);

        if (editBtn) {
            const tech = getTechnicians().find(t => t.id === techId);
            if (tech) {
                technicianModalOverlayElement.querySelector("#technicianIdModal").value = tech.id;
                technicianModalOverlayElement.querySelector("#technicianNameModal").value = tech.nome;
                technicianModalOverlayElement.querySelector("#technicianUserModal").value = tech.usuario;
                technicianModalOverlayElement.querySelector("#technicianFormTitleModal").textContent = "Editar Técnico";
                form.querySelector(".btn-submit").innerHTML = '<i class="material-icons">save</i> Atualizar';
            }
        } else if (deleteBtn) {
            const tech = getTechnicians().find(t => t.id === techId);
            if (tech && tech.nome === getLoggedInUserName()) {
                alert("Não é possível excluir o técnico logado."); return;
            }
            if (confirm(`Excluir técnico "${tech?.nome || techId}"?`)) {
                if (deleteTechnician(techId)) {
                    renderTechnicianListInternal(technicianListUl);
                    resetForm();
                }
            }
        }
    });
    renderTechnicianListInternal(technicianListUl); // Renderiza a lista ao abrir
}

function renderTechnicianListInternal(ulElement) {
    if (!ulElement) { // Se por acaso ulElement não for passado ou for null
        if(technicianModalOverlayElement) {
            ulElement = technicianModalOverlayElement.querySelector("#technicianListModal");
        }
        if (!ulElement) {
            console.warn("renderTechnicianListInternal: Elemento UL da lista de técnicos não encontrado.");
            return;
        }
    }
    ulElement.innerHTML = "";
    const technicians = getTechnicians();
    if (technicians.length === 0) {
        ulElement.innerHTML = '<li class="no-items-message">Nenhum técnico cadastrado.</li>'; return;
    }
    technicians.forEach(tech => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${tech.nome} (Usuário: ${tech.usuario})</span>
            <div class="technician-actions">
                <button type="button" class="edit-technician-btn" data-technician-id="${tech.id}"><i class="material-icons">edit</i></button>
                <button type="button" class="delete-technician-btn" data-technician-id="${tech.id}"><i class="material-icons">delete</i></button>
            </div>`;
        ulElement.appendChild(li);
    });
}

export function showTechnicianModal() {
    if (technicianModalOverlayElement) hideTechnicianModal();

    const modalHTML = getTechnicianModalHTML();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    technicianModalOverlayElement = tempDiv.firstChild;

    document.body.appendChild(technicianModalOverlayElement);
    document.body.style.overflow = 'hidden';
    setupTechnicianModalEventListeners();
}

export function hideTechnicianModal() {
    if (technicianModalOverlayElement) {
        technicianModalOverlayElement.remove();
        technicianModalOverlayElement = null;
        document.body.style.overflow = 'auto';
    }
}