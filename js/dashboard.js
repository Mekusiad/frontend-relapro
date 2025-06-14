import { getOsList, deleteOs as deleteOsFromStorage, getOsById } from './localStorageManager.js';
import { showToast } from './notifications.js';
import { OS_STATUS } from './constants.js';

let navigateToOsFormCallback;
let gerarRelatorioPDFCallbackGlobal;

export function getDashboardHTML() {
    return `
    <div class="dashboard-screen-container">
      <div class="container">
        <h1><span class="material-icons">dashboard</span> Dashboard</h1>
        <div class="hero-section">
          <div class="hero-content">
            <h2>Bem-vindo(a), <span id="dashboardUserName">Técnico</span>!</h2>
            <p>Visualize e gerencie suas Ordens de Serviço.</p>
            <div class="hero-actions">
              <button id="btnNovaOSHero" class="btn-primary"><span class="material-icons">add_circle</span> Nova OS</button>
            </div>
          </div>
        </div>
        <div class="stats-section">
          <div class="stats">
            <div class="stat-card"><h3>Total de OS</h3><p id="totalOS">0</p></div>
            <div class="stat-card"><h3>Em Andamento</h3><p id="osAndamento">0</p></div>
            <div class="stat-card"><h3>Finalizadas</h3><p id="osFinalizadas">0</p></div>
          </div>
        </div>
        <div class="filter-bar">
          <input type="text" id="searchOS" placeholder="Buscar por cliente, descrição..." class="filter-input">
          <select id="filterStatus" class="filter-select">
            <option value="all">Todos os Status</option>
            <option value="${OS_STATUS.ABERTA}">Aberta</option>
            <option value="${OS_STATUS.EM_ANDAMENTO}">Em Andamento</option>
            <option value="${OS_STATUS.AGUARDANDO_PECAS}">Aguardando Peças</option>
            <option value="${OS_STATUS.FINALIZADA}">Finalizada</option>
          </select>
        </div>
        <div class="os-list-container">
          <h2><span class="material-icons">assignment</span> Ordens de Serviço</h2>
          <ul id="osList" class="os-list"></ul>
        </div>
      </div>
    </div>`;
}

export function setupDashboard(navigateToOsFormCb, gerarRelatorioCb) {
    navigateToOsFormCallback = navigateToOsFormCb;
    gerarRelatorioPDFCallbackGlobal = gerarRelatorioCb;

    const osListUlElement = document.getElementById("osList");
    document.getElementById("searchOS").addEventListener("input", renderOSList);
    document.getElementById("filterStatus").addEventListener("change", renderOSList);
    document.getElementById("btnNovaOSHero").addEventListener("click", () => navigateToOsFormCallback(null));

    osListUlElement.addEventListener("click", (e) => {
        const button = e.target.closest("button");
        if (!button) return;

        const osId = parseInt(button.dataset.osId, 10);
        if (isNaN(osId)) return;

        if (button.classList.contains("edit-os-btn")) {
            if (typeof navigateToOsFormCallback === 'function') {
                navigateToOsFormCallback(osId);
            }
        } else if (button.classList.contains("report-os-btn")) {
            const osData = getOsById(osId);
            if (osData && typeof gerarRelatorioPDFCallbackGlobal === 'function') {
                button.classList.add('btn-loading');
                setTimeout(() => {
                    try {
                        gerarRelatorioPDFCallbackGlobal(osData);
                    } catch (error) {
                        showToast('Ocorreu um erro ao gerar o PDF.', 'error');
                        console.error(error);
                    } finally {
                        button.classList.remove('btn-loading');
                    }
                }, 50);
            }
        } else if (button.classList.contains("delete-os-btn")) {
            if (confirm(`Deseja realmente excluir a OS #${osId}?`)) {
                if (deleteOsFromStorage(osId)) {
                    showToast("OS excluída com sucesso!");
                    renderOSList();
                } else {
                    showToast("Erro ao excluir OS.", 'error');
                }
            }
        }
    });
}

export function renderOSList() {
    const osListUlElement = document.getElementById("osList");
    const searchOSInputElement = document.getElementById("searchOS");
    const filterStatusSelectElement = document.getElementById("filterStatus");

    let osList = getOsList() || [];
    osListUlElement.innerHTML = "";

    const searchTerm = searchOSInputElement.value.toLowerCase();
    const statusFilter = filterStatusSelectElement.value;

    const filteredOs = osList.filter(os => {
        const searchMatch = (
            os.cliente?.toLowerCase().includes(searchTerm) ||
            os.descricao?.toLowerCase().includes(searchTerm) ||
            (os.tecnicos || []).join(', ').toLowerCase().includes(searchTerm)
        );
        const statusMatch = statusFilter === "all" || os.status === statusFilter;
        return searchMatch && statusMatch;
    });

    filteredOs.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

    if (filteredOs.length === 0) {
        osListUlElement.innerHTML = '<li style="text-align: center; padding: 20px; color: var(--gray-dark);">Nenhuma OS encontrada.</li>';
    } else {
        filteredOs.forEach(os => {
            const li = document.createElement("li");
            const dataFormatada = os.dataCriacao ? new Date(os.dataCriacao + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A';
            li.innerHTML = `
                <div class="os-info">
                    <strong>OS #${os.id} - ${os.cliente || "N/A"}</strong>
                    <small>Criada em: ${dataFormatada}</small>
                    <p>${(os.descricao || "").substring(0, 100)}...</p>
                    <span class="os-status" data-status="${os.status || "N/A"}">${os.status || "N/A"}</span>
                </div>
                <div class="os-actions">
                    <button type="button" class="edit-os-btn" data-os-id="${os.id}"><i class="material-icons">edit</i> Editar</button>
                    <button type="button" class="report-os-btn" data-os-id="${os.id}"><i class="material-icons">picture_as_pdf</i> Relatório</button>
                    <button type="button" class="delete-os-btn" data-os-id="${os.id}"><i class="material-icons">delete</i> Excluir</button>
                </div>`;
            osListUlElement.appendChild(li);
        });
    }

    document.getElementById("totalOS").textContent = osList.length;
    document.getElementById("osAndamento").textContent = osList.filter(os => [OS_STATUS.ABERTA, OS_STATUS.EM_ANDAMENTO, OS_STATUS.AGUARDANDO_PECAS].includes(os.status)).length;
    document.getElementById("osFinalizadas").textContent = osList.filter(os => os.status === OS_STATUS.FINALIZADA).length;
}