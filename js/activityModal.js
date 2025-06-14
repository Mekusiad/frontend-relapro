import { renderPhotoPreview, renderSinglePhoto, updateFileCount, formatMaterialsString } from './utils.js';
import { getOsById, updateOs } from './localStorageManager.js';
import { getLoggedInUserName } from './auth.js';
import { osDataCache, renderActivities } from './osForm.js';

let activityModalOverlayElement = null;

function getActivityModalHTML(activityToEdit = null, osId = null) {
    const isEditMode = !!activityToEdit;
    const title = isEditMode ? "Editar Atividade" : "Adicionar Nova Atividade";
    const today = new Date();
    const localISOTime = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    return `
    <div class="modal-overlay" id="activityModalOverlay">
      <div class="modal-content">
        <span class="close-button material-icons" id="closeActivityModalBtn">close</span>
        <h2><span class="material-icons">${isEditMode ? 'edit_note' : 'add_task'}</span> ${title}</h2>
        <form id="activityFormModal">
          <input type="hidden" id="activityOsIdModal" value="${osId || ''}" />
          <input type="hidden" id="activityIdModal" value="${activityToEdit?.idAtividade || ''}" />
          <div class="form-group">
            <label for="activityDescricaoModal">Descrição da Tarefa</label>
            <textarea id="activityDescricaoModal" rows="3" required>${activityToEdit?.descricaoTarefa || ''}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="activityTecnicoModal">Técnico</label>
              <input type="text" id="activityTecnicoModal" value="${activityToEdit?.tecnico || getLoggedInUserName() || ''}" required readonly />
            </div>
            <div class="form-group">
              <label for="activityDataModal">Data</label>
              <input type="date" id="activityDataModal" value="${activityToEdit?.dataAtividade || localISOTime}" required />
            </div>
          </div>
          <div class="form-group">
            <label for="activityTempoModal">Tempo Gasto (h)</label>
            <input type="number" id="activityTempoModal" step="0.1" value="${activityToEdit?.tempoGasto || ''}" required />
          </div>
          <div class="form-group">
            <label for="activityMateriaisModal">Materiais</label>
            <textarea id="activityMateriaisModal">${(activityToEdit?.materiaisUsados || []).map(m => `${m.nome}(${m.quantidade}${m.unidade||''})`).join(', ')}</textarea>
            <small class="hint">Formato: Material(Qtd). Ex: Fio(10m)</small>
          </div>
          <div class="form-group">
            <label for="fotosAtividadeInputModal">Fotos</label>
            <div class="file-upload">
              <label for="fotosAtividadeInputModal" class="btn-upload"><i class="material-icons">cloud_upload</i> Selecionar</label>
              <input type="file" id="fotosAtividadeInputModal" multiple accept="image/*" style="display: none;">
              <span id="fileCountActivityModal">0 arquivos</span>
            </div>
            <div id="previewFotosAtividadeModal" class="fotos-preview"></div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" id="cancelActivityFormBtnModal"><i class="material-icons">close</i> Cancelar</button>
            <button type="submit" class="btn-submit"><i class="material-icons">save</i> Salvar</button>
          </div>
        </form>
      </div>
    </div>`;
}

function setupActivityModalEventListeners(osIdForActivity, activityBeingEdited = null) {
    const form = activityModalOverlayElement.querySelector("#activityFormModal");
    const closeButton = activityModalOverlayElement.querySelector("#closeActivityModalBtn");
    const cancelButton = activityModalOverlayElement.querySelector("#cancelActivityFormBtnModal");
    const fotosInput = activityModalOverlayElement.querySelector("#fotosAtividadeInputModal");
    const previewDiv = activityModalOverlayElement.querySelector("#previewFotosAtividadeModal");
    const fileCountSpan = activityModalOverlayElement.querySelector("#fileCountActivityModal");

    if (!form || !closeButton || !cancelButton || !fotosInput || !previewDiv || !fileCountSpan) {
        console.error("ActivityModal: Falha ao encontrar elementos internos para setup.");
        hideActivityModal();
        return;
    }

    previewDiv.innerHTML = "";
    fileCountSpan.textContent = "0 arquivos selecionados";

    if (activityBeingEdited?.fotosAtividade?.length) {
        activityBeingEdited.fotosAtividade.forEach(fotoBase64 => renderSinglePhoto(fotoBase64, previewDiv, fotosInput, fileCountSpan));
        updateFileCount(previewDiv, fileCountSpan);
    } else {
        previewDiv.innerHTML = "Nenhuma foto selecionada.";
    }

    closeButton.addEventListener("click", hideActivityModal);
    cancelButton.addEventListener("click", hideActivityModal);
    fotosInput.addEventListener("change", function() {
        renderPhotoPreview(this, previewDiv, fileCountSpan);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const activityId = activityModalOverlayElement.querySelector("#activityIdModal").value;
        const osId = parseInt(activityModalOverlayElement.querySelector("#activityOsIdModal").value, 10);

        const existingPhotosSrcs = Array.from(previewDiv.querySelectorAll('.img-container img')).map(img => img.src);
        const newFiles = Array.from(fotosInput.files);
        let newPhotosBase64 = [];

        if (newFiles.length > 0) {
            const promises = newFiles.map(file => new Promise(resolve => {
                if (file.type.match('image.*')) {
                    const reader = new FileReader();
                    reader.onload = event => resolve(event.target.result);
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                } else {
                    resolve(null);
                }
            }));
            newPhotosBase64 = (await Promise.all(promises)).filter(src => src);
        }

        const allPhotos = [...existingPhotosSrcs, ...newPhotosBase64];
        const activityData = {
            idAtividade: activityId ? parseInt(activityId, 10) : Date.now(),
            descricaoTarefa: activityModalOverlayElement.querySelector("#activityDescricaoModal").value.trim(),
            tecnico: activityModalOverlayElement.querySelector("#activityTecnicoModal").value,
            dataAtividade: activityModalOverlayElement.querySelector("#activityDataModal").value,
            tempoGasto: parseFloat(activityModalOverlayElement.querySelector("#activityTempoModal").value) || 0,
            materiaisUsados: formatMaterialsString(activityModalOverlayElement.querySelector("#activityMateriaisModal").value),
            fotosAtividade: allPhotos
        };

        if (!activityData.descricaoTarefa || !activityData.dataAtividade) {
            alert("Descrição e Data são obrigatórias.");
            return;
        }

        let osToUpdate = getOsById(osId);
        if (osToUpdate) {
            osToUpdate.atividades = osToUpdate.atividades || [];
            if (activityId) {
                const index = osToUpdate.atividades.findIndex(a => a.idAtividade === activityData.idAtividade);
                if (index !== -1) {
                    osToUpdate.atividades[index] = activityData;
                } else {
                    osToUpdate.atividades.push(activityData);
                }
            } else {
                osToUpdate.atividades.push(activityData);
            }
            updateOs(osToUpdate);
            osDataCache.atividades = osToUpdate.atividades;
            if (typeof renderActivities === 'function') {
                renderActivities(osId, osToUpdate.atividades);
            }
            hideActivityModal();
        } else {
            alert("Erro: OS não encontrada para salvar atividade.");
        }
    });
}

export function showActivityModal(editMode = false, activityToEdit = null, osIdToAssociate = null) {
    if (activityModalOverlayElement) {
        hideActivityModal();
    }

    if (osIdToAssociate === null || isNaN(parseInt(osIdToAssociate, 10))) {
        alert("Erro: ID da OS inválido para o modal de atividade.");
        return;
    }

    const modalHTML = getActivityModalHTML(activityToEdit, osIdToAssociate);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    activityModalOverlayElement = tempDiv.firstElementChild;

    document.body.appendChild(activityModalOverlayElement);
    document.body.style.overflow = 'hidden';
    setupActivityModalEventListeners(osIdToAssociate, activityToEdit);
}

export function hideActivityModal() {
    if (activityModalOverlayElement) {
        activityModalOverlayElement.remove();
        activityModalOverlayElement = null;
        document.body.style.overflow = 'auto';
    }
}