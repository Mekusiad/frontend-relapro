import {
    setupLoginForm,
    performUserLogout,
    checkAuthStatus,
    getLoggedInUserName,
    getLoginScreenHTML
} from './auth.js';
import {
    setupDashboard,
    getDashboardHTML,
    renderOSList as renderDashboardOSList
} from './dashboard.js';
import {
    setupOsForm,
    showForm as showOsFormScreen,
    getOsFormHTML
} from './osForm.js';
import {
    showActivityModal,
    hideActivityModal
} from './activityModal.js';
import {
    showMeasurementModal,
    hideMeasurementModal
} from './measurementModal.js';
import {
    gerarRelatorioPDF
} from './pdfGenerator.js';
import {
    getTechniciansScreenHTML,
    setupTechniciansScreen
} from './techniciansScreen.js';
import {
    getTechnicianAddScreenHTML,
    setupTechnicianAddScreen
} from './technicianAddScreen.js';
import {
    showTechnicianFormModal,
    hideTechnicianFormModal
} from './technicianFormModal.js';

const appContent = document.getElementById("app-content");
const navbar = document.querySelector(".navbar");
const userNameDisplayNav = document.getElementById("userName");

let currentScreen = null;
let currentModalType = null;

function clearModals() {
    if (currentModalType === 'activity') hideActivityModal();
    if (currentModalType === 'measurement') hideMeasurementModal();
    if (currentModalType === 'technicianForm') hideTechnicianFormModal();
    currentModalType = null;
}

function clearMainContent() {
    if (appContent) appContent.innerHTML = "";
}

function updateNavbarVisibility(screenName) {
    navbar.style.display = screenName === "login" ? "none" : "flex";
    const loggedInUser = getLoggedInUserName();
    if (loggedInUser) {
        userNameDisplayNav.textContent = loggedInUser;
    }
}

export const showScreen = (screenName, data = null) => {
    clearModals();
    clearMainContent();
    currentScreen = screenName;

    if (!appContent) {
        document.body.innerHTML = `<p style="color:red;text-align:center;">Erro crítico: #app-content não encontrado.</p>`;
        return;
    }

    updateNavbarVisibility(screenName);

    const screenActions = {
        navigateTo: (screen, screenData) => showScreen(screen, screenData),
        openModal: (type, modalData) => openModal(type, modalData)
    };

    switch (screenName) {
        case "login":
            appContent.innerHTML = getLoginScreenHTML();
            setupLoginForm(
                document.getElementById("loginForm"),
                document.getElementById("usuario"),
                document.getElementById("senha"),
                () => showScreen("dashboard")
            );
            break;

        case "dashboard":
            appContent.innerHTML = getDashboardHTML();
            setupDashboard(
                (osIdToEdit) => showScreen("osForm", osIdToEdit),
                gerarRelatorioPDF
            );
            const dashboardUser = document.getElementById("dashboardUserName");
            if (dashboardUser) dashboardUser.textContent = getLoggedInUserName();
            renderDashboardOSList();
            break;

        case "osForm":
            appContent.innerHTML = getOsFormHTML();
            setupOsForm(screenActions);
            showOsFormScreen(data);
            break;

        case "technicians":
            appContent.innerHTML = getTechniciansScreenHTML();
            setupTechniciansScreen(screenActions);
            break;

        case "addTechnician":
            appContent.innerHTML = getTechnicianAddScreenHTML();
            setupTechnicianAddScreen(screenActions.navigateTo);
            break;

        default:
            appContent.innerHTML = `<p style="color:red;">Erro: Tela '${screenName}' não encontrada.</p>`;
            navbar.style.display = "none";
    }
};

export const openModal = (modalType, data = null) => {
    clearModals();
    currentModalType = modalType;

    switch (modalType) {
        case 'activity':
            showActivityModal(data?.editMode, data?.activityToEdit, data?.osIdToAssociate);
            break;
        case 'measurement':
            showMeasurementModal(
                data?.osId,
                data?.subestacaoIndex,
                data?.equipmentName,
                data?.equipmentType,
                data?.unidade,
                data?.dadosMedicaoExistente
            );
            break;
        case 'technicianForm':
            showTechnicianFormModal(data);
            break;
        default:
            console.warn("main.js - openModal: Modal desconhecido:", modalType);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const btnLogout = document.getElementById("btnLogout");
    const btnDashboard = document.getElementById("btnDashboard");
    const btnNovaOS = document.getElementById("btnNovaOS");
    const btnTechnicians = document.getElementById("btnManageTechnicians");

    btnLogout.addEventListener("click", () => performUserLogout(() => showScreen("login")));
    btnDashboard.addEventListener("click", () => showScreen("dashboard"));
    btnNovaOS.addEventListener("click", () => showScreen("osForm", null));
    btnTechnicians.addEventListener("click", () => showScreen("technicians"));

    if (checkAuthStatus()) {
        showScreen("dashboard");
    } else {
        showScreen("login");
    }
});