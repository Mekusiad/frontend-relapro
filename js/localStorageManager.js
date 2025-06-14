import { ACCESS_LEVELS } from './constants.js';


const OS_KEY = 'ordensDeServico_RELAPRO_v1';
const TECHNICIANS_KEY = 'technicians_RELAPRO_v1';

function parseJSONSafely(item) {
    if (item === null) {
        return [];
    }
    try {
        const parsed = JSON.parse(item);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Erro ao analisar JSON do localStorage:", e);
        return [];
    }
}

export function getOsList() {
    const osListRaw = localStorage.getItem(OS_KEY);
    return parseJSONSafely(osListRaw);
}

export function getOsById(id) {
    const osList = getOsList();
    const osId = parseInt(id, 10);
    return osList.find(os => os.id === osId) || null;
}

export function updateOs(osToUpdate) {
    let osList = getOsList();
    let currentId = parseInt(osToUpdate.id, 10);

    if (isNaN(currentId)) {
        currentId = Date.now();
    }
    osToUpdate.id = currentId;

    const index = osList.findIndex(os => os.id === osToUpdate.id);

    if (index !== -1) {
        osList[index] = osToUpdate;
    } else {
        osList.push(osToUpdate);
    }
    localStorage.setItem(OS_KEY, JSON.stringify(osList));
}

export function deleteOs(osId) {
    let osList = getOsList();
    const idToDelete = parseInt(osId, 10);
    const initialLength = osList.length;
    osList = osList.filter(os => os.id !== idToDelete);

    if (osList.length < initialLength) {
        localStorage.setItem(OS_KEY, JSON.stringify(osList));
        return true;
    }
    return false;
}

export function getTechnicians() {
    const techniciansRaw = localStorage.getItem(TECHNICIANS_KEY);
    let technicians = parseJSONSafely(techniciansRaw).map(tech => ({
        ...tech,
        nome: tech.nome || 'Nome Inválido',
        usuario: tech.usuario || 'usuario_invalido'
    }));

    if (technicians.length === 0) {
        const adminUser = {
            id: 1,
            nome: 'Administrador do Sistema',
            usuario: 'admin',
            matricula: '000001',
            cargo: 'Administrador',
            nivelAcesso: ACCESS_LEVELS.ADMIN
        };
        technicians.push(adminUser);
        localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
    }
    return technicians;
}

export function getTechnicianById(id) {
    const technicians = getTechnicians();
    return technicians.find(t => t.id === parseInt(id, 10)) || null;
}

export function addTechnician(technicianData) {
    const technicians = getTechnicians();
    if (technicians.some(t => t.usuario.toLowerCase() === technicianData.usuario.toLowerCase())) {
        throw new Error(`O usuário "${technicianData.usuario}" já existe.`);
    }

    delete technicianData.senha;
    const newTechnician = {
        id: Date.now(),
        ...technicianData
    };
    technicians.push(newTechnician);
    localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
    return newTechnician;
}

export function updateTechnician(technicianData) {
    let technicians = getTechnicians();
    const techId = parseInt(technicianData.id, 10);
    const index = technicians.findIndex(tech => tech.id === techId);

    if (index !== -1) {
        if (technicians.some(t => t.usuario.toLowerCase() === technicianData.usuario.toLowerCase() && t.id !== techId)) {
            throw new Error(`O usuário "${technicianData.usuario}" já está em uso.`);
        }

        delete technicianData.senha;
        technicians[index] = { ...technicians[index],
            ...technicianData
        };
        localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
        return technicianData;
    }
    return null;
}

export function deleteTechnician(technicianId) {
    let technicians = getTechnicians();
    const idToDelete = parseInt(technicianId, 10);
    const initialLength = technicians.length;
    technicians = technicians.filter(tech => tech.id !== idToDelete);

    if (technicians.length < initialLength) {
        localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
        return true;
    }
    return false;
}