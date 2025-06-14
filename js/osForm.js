
import { renderPhotoPreview, renderSinglePhoto, updateFileCount } from './utils.js';
import { updateOs, getOsById, getTechnicians } from './localStorageManager.js';
import { showScreen, openModal } from './main.js';
let openActivityModalCallback;
export let osDataCache = { id: null, subestacoes: [] }; 
const EQUIPAMENTOS_PADRAO = [
    "Chave seccionadora de alta tensão",
    "Chave seccionadora de média tensão",
    "Disjuntor de média tensão",
    "Disjuntor de alta tensão",
    "TP (Transformador de Potencial)", 
    "TC (Transformador de Corrente)",
    "Transformador de potência de alta tensão", 
    "Transformadores de potência", 
    "Pára-raios de alta tensão",
    "Malha de aterramento", 
    "Resistor de aterramento", 
    "Cabos e muflas"
];
export function formatNameForId(name) {
    if (!name) return '';
    const normalized = name.toString().toLowerCase().normalize('NFD');
    const withoutAccents = normalized.replace(/[\u0300-\u036f]/g, '');
    return withoutAccents.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}
export function getOsFormHTML() {
    return `
    <div class="os-form-screen-container">
      <div class="container">
        <h1 id="formTituloOs"><span class="material-icons">assignment_add</span> Nova Ordem de Serviço</h1>
        <form id="osForm" class="os-form">
          <input type="hidden" id="osId" />
          <div class="form-section">
            <h3><span class="material-icons">info</span> Detalhes da OS</h3>
            <div class="form-row">
              <div class="form-group"><label for="cliente">Cliente</label><input type="text" id="cliente" required /></div>
              <div class="form-group"><label for="contato">Contato Principal (Telefone/Email)</label><input type="text" id="contato" /></div>
            </div>
            <div class="form-row">
              <div class="form-group full-width"><label for="acResponsavel">A/C Sr. (Responsável a receber o relatório)</label><input type="text" id="acResponsavel" /></div>
            </div>
            
            <div class="form-group full-width"><label for="endereco">Endereço</label><input type="text" id="endereco" required /></div>
            <div class="form-row">
    <div class="form-group">
        <label for="email">E-mail</label>
        <input type="email" id="email" />
    </div>
    <div class="form-group">
        <label for="telefone">Telefone</label>
        <input type="tel" id="telefone" />
    </div>
</div>
<div class="form-row">
    <div class="form-group">
        <label for="numOrcamento">N° do Orçamento</label>
        <input type="text" id="numOrcamento" />
    </div>
    <div class="form-group">
        <label for="tipoServico">Tipo de Serviço</label>
        <select id="tipoServico">
            <option value="" disabled selected>Selecione o tipo de serviço</option>
            <option value="Manutenção Preventiva">Manutenção Preventiva</option>
            <option value="Manutenção Corretiva">Manutenção Corretiva</option>
            <option value="Instalação">Instalação</option>
            <option value="Inspeção">Inspeção</option>
            <option value="Outro">Outro</option>
        </select>
    </div>
</div>



            <div class="form-row">
              <div class="form-group"><label for="dataCriacao">Data de Criação</label><input type="date" id="dataCriacao" required /></div>
              <div class="form-group"><label for="statusOs">Status</label>
                <select id="statusOs" required>
                  <option value="Aberta">Aberta</option><option value="Em andamento">Em Andamento</option>
                  <option value="Aguardando Peças">Aguardando Peças</option><option value="Finalizada">Finalizada</option>
                </select>
              </div>
            </div>
            <div class="form-group"><label>Técnico(s) Responsável(eis)</label><div class="checkbox-group" id="tecnicosCheckboxesContainer"></div></div>
            <div class="form-group full-width"><label for="descricaoOs">Descrição do Problema</label><textarea id="descricaoOs" rows="4" required></textarea></div>
            <div class="form-group full-width"><label for="observacoesOs">Observações (Internas)</label><textarea id="observacoesOs" rows="3"></textarea></div>
          </div>
          <div class="form-section">
            <h3><span class="material-icons">thermostat</span> Dados Ambientais</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="temperaturaLocal">
                  Temperatura do Local (°C)
                  <span class="material-icons tooltip-trigger" data-tooltip="Use termômetro à sombra. Valor entre -10°C e 50°C.">help_outline</span>
                </label>
                <input type="number" id="temperaturaLocal" step="0.1" placeholder="-10.0 a 50.0" />
                <small class="validation-message" id="temperaturaLocalError"></small>
              </div>
            </div>
          </div>
          <div class="form-section">
            <h3><span class="material-icons">photo_camera</span> Fotos Iniciais da OS</h3>
            <div class="form-group full-width">
              <label for="fotosIniciaisInput">Anexar Fotos</label>
              <div class="file-upload">
                <label for="fotosIniciaisInput" class="btn-upload"><i class="material-icons">cloud_upload</i> Selecionar Fotos</label>
                <input type="file" id="fotosIniciaisInput" multiple accept="image/*" style="display: none;">
                <span id="fileCountInitial">0 arquivos selecionados</span>
              </div>
              <div id="previewFotosIniciais" class="fotos-preview"></div>
              <small class="hint">Fotos da situação inicial</small>
            </div>
          </div>
          <div class="form-section">
            <h3><span class="material-icons">electric_bolt</span> Gestão de Subestações</h3>
            <div class="form-actions-flex" style="justify-content: flex-start; margin-bottom: 1.5rem;">
    <button type="button" id="btnAddSubestacao" class="btn-secondary">
        <span class="material-icons">add_business</span> Adicionar Subestação
    </button>
</div>
            <div id="subestacoesTabsContainer" class="tabs-container"></div>
            <div id="subestacoesFormsContainer" class="tab-forms-container"></div>
          </div>
          <div id="activitiesSection" class="form-section" style="display: none;">
          <div class="form-section">
            <h3><span class="material-icons">comment</span>Conclusão e Recomendações</h3>
            <div class="form-group full-width">
              <label for="conclusao">Conclusão dos Serviços</label>
              <textarea id="conclusao" class="input" rows="5" placeholder="Descreva a conclusão geral do serviço realizado, os resultados dos testes e o estado final dos equipamentos..."></textarea>
            </div>
            <div class="form-group full-width">
              <label for="recomendacoes">Recomendações Técnicas</label>
              <textarea id="recomendacoes" class="input" rows="5" placeholder="Liste as recomendações para o cliente (melhorias necessárias, próximos passos, manutenções futuras, etc.)..."></textarea>
            </div>
          </div>
            <h3><span class="material-icons">list_alt</span> Atividades Registradas</h3>
            <p id="noActivitiesMessageOsForm">Nenhuma atividade registrada.</p>
            <ul id="activitiesListOsForm" class="activity-list"></ul>
            <div class="form-actions-flex"><button type="button" id="btnAddActivity" class="btn-submit"><i class="material-icons">add_task</i> Adicionar Atividade</button></div>
          </div>
          <div class="form-actions">
            <button type="button" id="cancelOsForm" class="btn-cancel"><i class="material-icons">close</i> Cancelar</button>
            <button type="submit" class="btn-submit"><i class="material-icons">save</i> Salvar OS</button>
          </div>
        </form>
      </div>
    </div>`;
}
// SUBSTITUA A FUNÇÃO INTEIRA NO SEU ARQUIVO js/osForm.js POR ESTA VERSÃO:

export function setupOsForm(actions) {
    const osFormElement = document.getElementById("osForm");
    const btnAddSubestacao = document.getElementById("btnAddSubestacao");
    const formsContainer = document.getElementById("subestacoesFormsContainer");
    const btnAddAct = document.getElementById("btnAddActivity");
    const activitiesList = document.getElementById("activitiesListOsForm");
    const btnCancel = document.getElementById("cancelOsForm");
    const fotosInput = document.getElementById("fotosIniciaisInput");
    const tempInput = document.getElementById("temperaturaLocal");

    // Lógica para ADICIONAR uma subestação
    btnAddSubestacao.addEventListener('click', () => {
        if (!osDataCache.subestacoes) {
            osDataCache.subestacoes = [];
        }
        osDataCache.subestacoes.push({
            idSubestacao: `subestacao_${Date.now()}`,
            nomeIdentificacao: `Subestação ${osDataCache.subestacoes.length + 1}`,
            equipamentos: EQUIPAMENTOS_PADRAO.map(nome => ({ nome, selecionado: false, quantidade: 1, dadosMedicao: {} })),
            observacoesTecnicasSubestacao: "",
            fotosGeraisSubestacao: []
        });
        renderAbasESeformsSubestacoes(osDataCache.subestacoes);
    });

    // Lógica para REMOVER uma subestação
    formsContainer.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.btn-remover-subestacao');
        if (removeButton) {
            const subIndexToRemove = parseInt(removeButton.dataset.subIndex, 10);
            if (confirm(`Tem certeza que deseja remover a Subestação ${subIndexToRemove + 1}?`)) {
                osDataCache.subestacoes.splice(subIndexToRemove, 1);
                renderAbasESeformsSubestacoes(osDataCache.subestacoes);
            }
        }
    });

    // Lógica para os botões de EDITAR e EXCLUIR atividades
    if (activitiesList) {
        activitiesList.addEventListener("click", (e) => {
            const editButton = e.target.closest(".edit-activity-btn");
            const deleteButton = e.target.closest(".delete-activity-btn");
            const osId = parseInt(document.getElementById("osId").value || osDataCache.id, 10);

            if (editButton) {
                const activityId = parseInt(editButton.dataset.activityId, 10);
                const activityToEdit = osDataCache.atividades.find(act => act.idAtividade === activityId);
                if (activityToEdit) {
                    actions.openModal('activity', {
                        editMode: true,
                        activityToEdit: activityToEdit,
                        osIdToAssociate: osId
                    });
                }
            }

            if (deleteButton) {
                const activityId = parseInt(deleteButton.dataset.activityId, 10);
                const activityToDelete = osDataCache.atividades.find(act => act.idAtividade === activityId);
                if (activityToDelete && confirm(`Tem certeza que deseja excluir a atividade: "${activityToDelete.descricaoTarefa}"?`)) {
                    osDataCache.atividades = osDataCache.atividades.filter(act => act.idAtividade !== activityId);
                    updateOs(osDataCache);
                    renderActivities(osId, osDataCache.atividades);
                }
            }
        });
    }

    // Lógica para o botão ADICIONAR atividade
    if (btnAddAct) {
        btnAddAct.addEventListener("click", () => {
            const osIdHiddenInput = document.getElementById("osId");
            const currentOsId = osIdHiddenInput.value || osDataCache.id;
            if (currentOsId) {
                actions.openModal('activity', {
                    editMode: false,
                    activityToEdit: null,
                    osIdToAssociate: parseInt(currentOsId, 10)
                });
            } else {
                alert("É necessário um ID de OS para adicionar atividades. Salve a OS primeiro se for nova.");
            }
        });
    }

    // Lógica para o botão de CANCELAR o formulário
    if (btnCancel) {
        btnCancel.addEventListener("click", () => showScreen("dashboard"));
    }

    // Lógica para o input de FOTOS iniciais
    if (fotosInput) {
        fotosInput.addEventListener("change", function () {
            const previewDiv = document.getElementById("previewFotosIniciais");
            const countSpan = document.getElementById("fileCountInitial");
            if (typeof renderPhotoPreview === 'function') renderPhotoPreview(this, previewDiv, countSpan);
        });
    }

    // Lógica para o input de TEMPERATURA
    if (tempInput) {
        tempInput.addEventListener("input", () => {
            const valor = parseFloat(tempInput.value);
            const errorMsgElement = document.getElementById("temperaturaLocalError");
            if (tempInput.value === "" || (valor >= -10 && valor <= 50)) {
                if (errorMsgElement) errorMsgElement.textContent = "";
                tempInput.classList.remove('input-error');
            } else {
                if (errorMsgElement) errorMsgElement.textContent = "Valor deve ser entre -10 e 50°C.";
                tempInput.classList.add('input-error');
            }
        });
    }

    // Lógica para SALVAR a OS inteira
    const formSubmitHandler = async (e) => {
        e.preventDefault();
        console.log("OS_FORM: Formulário principal submetido.");

        const temperaturaLocalInput = document.getElementById("temperaturaLocal");
        const tempVal = parseFloat(temperaturaLocalInput.value);
        
        // ... (código para coletar todos os dados do formulário) ...
        const osIdHiddenInput = document.getElementById("osId");
        const previewFotosIniciaisDiv = document.getElementById("previewFotosIniciais");
        const tecnicosCheckboxesContainerDiv = document.getElementById("tecnicosCheckboxesContainer");
        let allPhotos = [];
        if (previewFotosIniciaisDiv) {
            allPhotos = Array.from(previewFotosIniciaisDiv.querySelectorAll('.img-container img')).map(img => img.src);
        }
        const currentOsIdValue = osIdHiddenInput.value || osDataCache.id;
        const osBeingEdited = currentOsIdValue ? getOsById(parseInt(currentOsIdValue, 10)) : null;
        
        const osData = {
            id: parseInt(currentOsIdValue, 10),
            cliente: document.getElementById("cliente").value.trim(),
            contato: document.getElementById("contato").value.trim(),
            acResponsavel: document.getElementById("acResponsavel").value.trim(),
            endereco: document.getElementById("endereco").value.trim(),
            email: document.getElementById("email").value.trim(),
            telefone: document.getElementById("telefone").value.trim(),
            numOrcamento: document.getElementById("numOrcamento").value.trim(),
            tipoServico: document.getElementById("tipoServico").value,
            dataCriacao: document.getElementById("dataCriacao").value,
            status: document.getElementById("statusOs").value,
            tecnicos: Array.from(tecnicosCheckboxesContainerDiv.querySelectorAll('input[name="tecnico"]:checked')).map(cb => cb.value),
            descricao: document.getElementById("descricaoOs").value.trim(),
            observacoes: document.getElementById("observacoesOs").value.trim(),
            conclusao: document.getElementById("conclusao").value.trim(),
            recomendacoes: document.getElementById("recomendacoes").value.trim(),
            fotosIniciais: allPhotos,
            atividades: osDataCache.atividades || osBeingEdited?.atividades || [],
            dadosAmbientais: {
                temperaturaLocal: temperaturaLocalInput.value !== "" ? tempVal : null
            },
            quantidadeSubestacoes: (osDataCache.subestacoes || []).length,
            subestacoes: []
        };
        
        osDataCache.subestacoes.forEach((sub, index) => {
            const formSubestacao = document.getElementById(`subestacaoForm_${index}`);
            if (formSubestacao) {
                const nomeIdentificacao = formSubestacao.querySelector(`#nomeSubestacao_${index}`).value.trim();
                const observacoes = formSubestacao.querySelector(`#obsSubestacao_${index}`).value.trim();
                const subestacaoData = { ...sub, nomeIdentificacao: nomeIdentificacao, observacoesTecnicasSubestacao: observacoes, equipamentos: [] };
                EQUIPAMENTOS_PADRAO.forEach(nomeEquip => {
                    const equipIdBase = formatNameForId(nomeEquip);
                    const checkbox = formSubestacao.querySelector(`#equip_${index}_${equipIdBase}`);
                    if (checkbox) {
                        const isSelected = checkbox.checked;
                        const qtdInput = formSubestacao.querySelector(`#equip_qtd_${index}_${equipIdBase}`);
                        const quantidade = isSelected && qtdInput ? parseInt(qtdInput.value, 10) || 1 : 1;
                        const equipCache = sub.equipamentos.find(ec => ec.nome === nomeEquip) || {};
                        subestacaoData.equipamentos.push({
                            nome: nomeEquip, selecionado: isSelected, quantidade: quantidade, dadosMedicao: isSelected ? (equipCache.dadosMedicao || {}) : {}
                        });
                    }
                });
                osData.subestacoes.push(subestacaoData);
            }
        });
        
        console.log("OS_FORM: Objeto completo a ser salvo:", JSON.stringify(osData, null, 2));
        updateOs(osData);
        alert("Ordem de Serviço salva!");
        showScreen("dashboard");
    };

    // Anexa o listener de submit ao formulário
    osFormElement.removeEventListener("submit", osFormElement.submitHandler);
    osFormElement.addEventListener("submit", formSubmitHandler);
    osFormElement.submitHandler = formSubmitHandler;
}


export function renderAbasESeformsSubestacoes(dadosSubestacoes) {
    const tabsContainer = document.getElementById("subestacoesTabsContainer");
    const formsContainer = document.getElementById("subestacoesFormsContainer");
    if (!tabsContainer || !formsContainer) return;

    tabsContainer.innerHTML = "";
    formsContainer.innerHTML = "";

    if (!dadosSubestacoes || dadosSubestacoes.length === 0) {
        formsContainer.innerHTML = '<p class="hint">Nenhuma subestação adicionada. Clique no botão acima para começar.</p>';
        return;
    }

    dadosSubestacoes.forEach((subestacaoData, index) => {
        const tabButton = document.createElement("button");
        tabButton.type = "button";
        tabButton.classList.add("tab-button");
        tabButton.dataset.tabTarget = `#subestacaoForm_${index}`;
        tabButton.dataset.tabIndex = index;
        tabButton.textContent = subestacaoData.nomeIdentificacao || `Subestação ${index + 1}`;

        if (index === 0) tabButton.classList.add("active");

        tabButton.addEventListener("click", (e) => handleTabClick(e, null));
        tabsContainer.appendChild(tabButton);

        const formDiv = document.createElement("div");
        formDiv.id = `subestacaoForm_${index}`;
        formDiv.classList.add("tab-content");
        formDiv.style.display = (index === 0) ? "block" : "none";

        const removerBtnHTML = `
            <div style="text-align: right; margin-bottom: 1rem;">
                <button type="button" class="btn-cancel btn-remover-subestacao" data-sub-index="${index}">
                    <span class="material-icons">delete_sweep</span> Remover esta Subestação
                </button>
            </div>`;

        renderizarFormularioSubestacaoInterno(formDiv, index, subestacaoData);
        formDiv.insertAdjacentHTML('afterbegin', removerBtnHTML);
        formsContainer.appendChild(formDiv);
    });
}

function handleTabClick(event, tabIndexToShow = null) {
    let targetTabButton;
    if (event) {
        targetTabButton = event.target.closest(".tab-button");
    } else if (tabIndexToShow) {
        targetTabButton = document.querySelector(`#subestacoesTabsContainer .tab-button[data-tab-index="${tabIndexToShow}"]`);
    }
    if (!targetTabButton) return;
    document.querySelectorAll("#subestacoesTabsContainer .tab-button").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll("#subestacoesFormsContainer .tab-content").forEach(content => content.style.display = "none");
    targetTabButton.classList.add("active");
    targetTabButton.classList.remove("tab-incomplete");
    const targetContent = document.querySelector(targetTabButton.dataset.tabTarget);
    if (targetContent) {
        targetContent.style.display = "block";
        const firstInput = targetContent.querySelector('input[type="text"], textarea');
        if (firstInput) firstInput.focus();
    }
}
function renderizarFormularioSubestacaoInterno(containerDiv, indiceSubestacao, dadosSubestacao = {}) {
    
    const nomeId = `nomeSubestacao_${indiceSubestacao}`;
    const obsId = `obsSubestacao_${indiceSubestacao}`;
    const fotosGeraisId = `fotosGeraisSubestacao_${indiceSubestacao}`;
    const previewFotosGeraisId = `previewFotosGeraisSubestacao_${indiceSubestacao}`;
    const nomeAtual = dadosSubestacao.nomeIdentificacao || `Subestação ${indiceSubestacao + 1}`;
    const equipamentosParaRender = EQUIPAMENTOS_PADRAO.map(nomePadrao => {
        const salvo = (dadosSubestacao.equipamentos || []).find(e => e.nome === nomePadrao);
        return salvo || { nome: nomePadrao, selecionado: false, quantidade: 1, dadosMedicao: {} };
    });
    containerDiv.innerHTML = `
        <h4>Detalhes da Subestação ${indiceSubestacao + 1}</h4>
        <div class="form-group">
            <label for="${nomeId}">Nome/Identificação da Subestação</label>
            <input type="text" id="${nomeId}" name="${nomeId}" value="${nomeAtual}" required />
            <small class="validation-message" id="${nomeId}Error"></small>
        </div>
        <h5>Equipamentos</h5>
        <div class="equipamentos-checklist" id="equipChecklist_${indiceSubestacao}">
            ${equipamentosParaRender.map(equipSalvo => {
                const equipNome = equipSalvo.nome;
                const equipIdBase = formatNameForId(equipNome);
                const checkboxId = `equip_${indiceSubestacao}_${equipIdBase}`;
                const quantidadeInputId = `equip_qtd_${indiceSubestacao}_${equipIdBase}`;
                const detalhesContainerId = `details_${indiceSubestacao}_${equipIdBase}`;
                const isChecked = equipSalvo.selecionado;
                const quantidadeSalva = equipSalvo.quantidade !== undefined ? equipSalvo.quantidade : 1;
                let botoesMedicaoHTML = '';
                for (let unidade = 1; unidade <= quantidadeSalva; unidade++) {
                    const btnMedicaoId = `btn_med_${indiceSubestacao}_${equipIdBase}_${unidade}`;
                    const dadosMedicaoUnidade = equipSalvo.dadosMedicao && equipSalvo.dadosMedicao[unidade];
                    const temMedicoesSalvas = dadosMedicaoUnidade && dadosMedicaoUnidade.localizacao; // Verifica se já foi identificado
                    
                    botoesMedicaoHTML += `
                        <button type="button" id="${btnMedicaoId}" class="btn-medicao btn-secondary-sm ${temMedicoesSalvas ? 'tem-dados' : ''}"
                                data-equip-name="${equipNome}"
                                data-equip-type="${equipIdBase}"
                                data-equip-index="${unidade}"
                                style="display: ${isChecked ? 'inline-flex' : 'none'};">
                            <span class="material-icons">${temMedicoesSalvas ? 'edit_note' : 'add_chart'}</span>
                            Unidade ${unidade}
                        </button>`;
                }
                return `
                <div class="equipamento-item-stub">
                    <div class="equipamento-selecao">
                        <input type="checkbox" id="${checkboxId}" name="${checkboxId}" 
                               data-equip-name="${equipNome}" 
                               data-target-qtd="#${quantidadeInputId}" 
                               data-target-details="#${detalhesContainerId}"
                               ${isChecked ? 'checked' : ''}>
                        <label for="${checkboxId}">${equipNome}</label>
                        <input type="number" id="${quantidadeInputId}" name="${quantidadeInputId}" 
                               class="equipamento-quantidade" min="1" value="${quantidadeSalva}" 
                               style="display: ${isChecked ? 'inline-block' : 'none'};" placeholder="Qtd">
                        ${botoesMedicaoHTML}
                    </div>
                    <div id="${detalhesContainerId}" class="equip-details" style="display: ${isChecked ? 'block' : 'none'};">
                        <p class="hint-details">
                            Preencha a quantidade e clique em "Unidade" para registrar as medições.
                        </p>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
        <div class="form-group">
            <label for="${obsId}">Observações Técnicas da Subestação</label>
            <textarea id="${obsId}" name="${obsId}" rows="3" maxlength="500">${dadosSubestacao.observacoesTecnicasSubestacao || ''}</textarea>
        </div>
        <div class="form-group">
            <label for="${fotosGeraisId}">Fotos Gerais da Subestação</label>
            <input type="file" id="${fotosGeraisId}" name="${fotosGeraisId}" multiple accept="image/*">
            <div class="fotos-preview" id="${previewFotosGeraisId}">
                ${(dadosSubestacao.fotosGeraisSubestacao || []).map(fotoBase64 => renderSinglePhotoPreviewHTML(fotoBase64, "Foto da subestação")).join('')}
            </div>
        </div>
    `;

    
    containerDiv.querySelectorAll('.btn-medicao').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const nomeEquip = btn.dataset.equipName;
        const equipType = btn.dataset.equipType;
        const unidade = parseInt(btn.dataset.equipIndex, 10);
        
        
        const subestacao = osDataCache.subestacoes[indiceSubestacao];
        const equip = subestacao?.equipamentos?.find(eq => eq.nome === nomeEquip);
        const dadosUnidade = equip?.dadosMedicao?.[unidade] || {};

       
        const isIdentified = dadosUnidade && dadosUnidade.localizacao;
        const modalMode = isIdentified ? 'full' : 'identification';
        
        const osIdInput = document.getElementById("osId");
        const osId = parseInt(osIdInput?.value || osDataCache.id, 10);
        
        
        openModal('measurement', {
            osId,
            subestacaoIndex: indiceSubestacao, // Usa o índice correto
            equipmentName: nomeEquip,
            equipmentType: equipType,
            unidade,
            dadosMedicaoExistente: dadosUnidade,
            mode: modalMode 
        });
    });
});
    
}

function renderSinglePhotoPreviewHTML(base64String, altText) {
    if (!base64String) return '';
    return `
        <div class="img-container">
            <img src="${base64String}" alt="${altText}">
        </div>`;
}
export function showForm(osIdToEdit = null) {
    console.log("OS_FORM: showForm chamado com osIdToEdit:", osIdToEdit);
    const osFormElement = document.getElementById("osForm");
    const osIdHiddenInput = document.getElementById("osId");
    osDataCache = { id: null, subestacoes: [] }; 
    if (osFormElement) osFormElement.reset();
    if (osIdHiddenInput) osIdHiddenInput.value = "";
    const formTituloElement = document.getElementById("formTituloOs");
    if(formTituloElement) formTituloElement.innerHTML = '<span class="material-icons">assignment_add</span> Nova Ordem de Serviço';
    const activitiesSectionDiv = document.getElementById("activitiesSection");
    if(activitiesSectionDiv) activitiesSectionDiv.style.display = "none";
    const btnAddActivityElement = document.getElementById("btnAddActivity");
    if(btnAddActivityElement) {
        btnAddActivityElement.disabled = true;
        btnAddActivityElement.title = "Salve a OS primeiro";
    }
    const previewFotosIniciaisDiv = document.getElementById("previewFotosIniciais");
    if(previewFotosIniciaisDiv) previewFotosIniciaisDiv.innerHTML = "Nenhuma foto selecionada.";
    const fileCountInitialSpan = document.getElementById("fileCountInitial");
    if(fileCountInitialSpan) fileCountInitialSpan.textContent = "0 arquivos selecionados";
    const temperaturaLocalInput = document.getElementById("temperaturaLocal");
    if(temperaturaLocalInput) temperaturaLocalInput.value = "";
    if(temperaturaLocalInput) temperaturaLocalInput.classList.remove('input-error');
    const temperaturaLocalError = document.getElementById("temperaturaLocalError");
    if(temperaturaLocalError) temperaturaLocalError.textContent = "";
    
    renderAbasESeformsSubestacoes([]);
    const today = new Date();
    const dataCriacaoInput = document.getElementById("dataCriacao");
    if(dataCriacaoInput) dataCriacaoInput.value = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    renderTechnicianCheckboxes([]);
    if (osIdToEdit !== null) {
        console.log("OS_FORM: Editando OS ID:", osIdToEdit);
        const os = getOsById(osIdToEdit);
        if (os) {
            if(osIdHiddenInput) osIdHiddenInput.value = os.id;
            osDataCache = JSON.parse(JSON.stringify(os)); 
            console.log("OS_FORM: osDataCache populado com OS existente:", JSON.parse(JSON.stringify(osDataCache)));
            if(formTituloElement) formTituloElement.innerHTML = `<span class="material-icons">edit</span> Editar OS #${os.id}`;
            document.getElementById("cliente").value = os.cliente || "";
            document.getElementById("contato").value = os.contato || "";
            document.getElementById("acResponsavel").value = os.acResponsavel || ""; 
            document.getElementById("email").value = os.email || ""; 
            document.getElementById("numOrcamento").value = os.numOrcamento || "";
            document.getElementById("tipoServico").value = os.tipoServico || "";
            document.getElementById("endereco").value = os.endereco || "";
            if(dataCriacaoInput) dataCriacaoInput.value = os.dataCriacao || dataCriacaoInput.value;
            document.getElementById("statusOs").value = os.status || "Aberta";
            document.getElementById("descricaoOs").value = os.descricao || "";
            document.getElementById("observacoesOs").value = os.observacoes || "";
            document.getElementById("conclusao").value = os.conclusao || "";       
            document.getElementById("recomendacoes").value = os.recomendacoes || ""; 
            renderTechnicianCheckboxes(os.tecnicos || []);
            if (os.dadosAmbientais && temperaturaLocalInput) {
                temperaturaLocalInput.value = os.dadosAmbientais.temperaturaLocal !== null && os.dadosAmbientais.temperaturaLocal !== undefined 
                                             ? os.dadosAmbientais.temperaturaLocal : "";
            }
            
            renderAbasESeformsSubestacoes(os.subestacoes || []);
            if(previewFotosIniciaisDiv){
                previewFotosIniciaisDiv.innerHTML = ""; 
                if (os.fotosIniciais && os.fotosIniciais.length > 0) {
                    os.fotosIniciais.forEach(fotoBase64 => {
                        if (typeof renderSinglePhoto === 'function') {
                            renderSinglePhoto(fotoBase64, previewFotosIniciaisDiv, document.getElementById("fotosIniciaisInput"), fileCountInitialSpan);
                        } else {
                            previewFotosIniciaisDiv.innerHTML += renderSinglePhotoPreviewHTML(fotoBase64, "Foto inicial");
                        }
                    });
                } else {
                    previewFotosIniciaisDiv.innerHTML = "Nenhuma foto selecionada.";
                }
                if (typeof updateFileCount === 'function' && fileCountInitialSpan) updateFileCount(previewFotosIniciaisDiv, fileCountInitialSpan);
            }
            if(activitiesSectionDiv) activitiesSectionDiv.style.display = "block";
            if(btnAddActivityElement) {
                btnAddActivityElement.disabled = false;
                btnAddActivityElement.title = "Adicionar atividade";
            }
            renderActivities(os.id, os.atividades || []);
        } else {
            alert(`OS com ID ${osIdToEdit} não encontrada!`);
            showScreen("dashboard"); return;
        }
    } else { 
        osDataCache.id = Date.now(); 
        if(osIdHiddenInput) osIdHiddenInput.value = osDataCache.id;
        console.log("OS_FORM: Nova OS, ID do cache definido:", osDataCache.id);
        if(activitiesSectionDiv) activitiesSectionDiv.style.display = "block";
        if(btnAddActivityElement) {
             btnAddActivityElement.disabled = false;
             btnAddActivityElement.title = "Adicionar atividade";
        }
    }
}
export function renderActivities(osId, activities) {
    const activitiesListUl = document.getElementById("activitiesListOsForm");
    const noActivitiesMessageParagraph = document.getElementById("noActivitiesMessageOsForm");
    if (!activitiesListUl || !noActivitiesMessageParagraph) {
        console.warn("renderActivities: Elementos da lista de atividades não encontrados no formulário OS.");
        return;
    }
    activitiesListUl.innerHTML = "";
    if (activities && activities.length > 0) {
        noActivitiesMessageParagraph.style.display = "none";
        activities.sort((a,b) => {
            const dateA = new Date(a.dataAtividade + 'T00:00:00Z');
            const dateB = new Date(b.dataAtividade + 'T00:00:00Z');
            if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            return dateB - dateA;
        });
        activities.forEach(activity => {
            const item = document.createElement("li");
            item.classList.add("activity-item");
            let dataAtivFormatada = 'N/A';
            if (activity.dataAtividade) {
                try { 
                    dataAtivFormatada = new Date(activity.dataAtividade + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'}); 
                } catch(e){ console.error("Erro formatando data da atividade:", e); }
            }
            const materiaisStr = activity.materiaisUsados?.map(m => `${m.nome || "?"}(${m.quantidade || 0}${m.unidade||''})`).join(', ') || 'Nenhum';
            item.innerHTML = `
                <h4>${activity.descricaoTarefa || "Sem descrição"}</h4>
                <p><strong>Técnico:</strong> ${activity.tecnico || "N/A"}</p>
                <p><strong>Tempo:</strong> ${activity.tempoGasto || 0}h</p>
                <p><strong>Materiais:</strong> ${materiaisStr}</p>
                <small>Registrado em: ${dataAtivFormatada}</small>
                <div class="activity-actions">
                    <button type="button" class="edit-activity-btn" data-activity-id="${activity.idAtividade}"><i class="material-icons">edit</i></button>
                    <button type="button" class="delete-activity-btn" data-activity-id="${activity.idAtividade}"><i class="material-icons">delete</i></button>
                </div>
                <div class="fotos-preview activity-photos-preview"></div>`;
            activitiesListUl.appendChild(item);
            const photoPreviewContainerForActivity = item.querySelector('.activity-photos-preview');
            if (activity.fotosAtividade && activity.fotosAtividade.length > 0) {
                activity.fotosAtividade.forEach(fotoSrc => {
                     if (typeof renderSinglePhoto === 'function' && photoPreviewContainerForActivity) {
                        renderSinglePhoto(fotoSrc, photoPreviewContainerForActivity, null, null)
                     } else if (photoPreviewContainerForActivity) {
                        photoPreviewContainerForActivity.innerHTML += renderSinglePhotoPreviewHTML(fotoSrc, "Foto da atividade");
                     }
                });
            } else if (photoPreviewContainerForActivity) {
                photoPreviewContainerForActivity.innerHTML = "<p style='font-size:0.85em;color:var(--gray-dark)'>Nenhuma foto para esta atividade.</p>";
            }
        });
    } else {
        noActivitiesMessageParagraph.style.display = "block";
        noActivitiesMessageParagraph.textContent = "Nenhuma atividade registrada para esta OS ainda.";
    }
}
function renderTechnicianCheckboxes(selectedTechniciansNames = []) {
    const container = document.getElementById("tecnicosCheckboxesContainer");
    if (!container) return;
    container.innerHTML = '';
    const technicians = getTechnicians();
    if (technicians.length === 0) {
        container.innerHTML = '<p class="hint">Nenhum técnico cadastrado.</p>'; return;
    }
    technicians.forEach(tech => {
        const div = document.createElement('div');
        div.classList.add('checkbox-item');
        const inputId = `tecnico-os-${formatNameForId(tech.usuario || String(tech.id))}`;
        const input = document.createElement('input');
        input.type = 'checkbox'; input.id = inputId; input.name = 'tecnico';
        input.value = tech.nome; input.checked = selectedTechniciansNames.includes(tech.nome);
        const label = document.createElement('label');
        label.htmlFor = inputId; label.textContent = tech.nome;
        div.appendChild(input); div.appendChild(label); container.appendChild(div);
    });
}