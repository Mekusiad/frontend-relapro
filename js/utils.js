// SUBSTITUA TODO O CONTEÚDO DO SEU ARQUIVO js/utils.js POR ESTE CÓDIGO:

export function renderPhotoPreview(inputElement, previewContainer, fileCountSpan) {
    if (!inputElement || !previewContainer || !fileCountSpan) {
        console.warn("renderPhotoPreview: Elementos ausentes.");
        return;
    }

    const files = inputElement.files;
    if (files.length === 0) return;

    // Limpa a mensagem "Nenhuma foto..." se ela existir
    if (previewContainer.querySelector('.hint-details')) {
        previewContainer.innerHTML = '';
    }

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Chama a nova função que cria a foto com campo de descrição
                renderSinglePhoto({ src: e.target.result, description: '' }, previewContainer);
                updateFileCount(previewContainer, fileCountSpan);
            };
            reader.readAsDataURL(file);
        }
    });

    // Limpa o valor do input para permitir que o usuário selecione o mesmo arquivo novamente
    inputElement.value = '';
}

export function renderSinglePhoto(photo, previewContainer) {
    if (!photo || !photo.src || !previewContainer) {
        console.warn("renderSinglePhoto: photo.src ou previewContainer ausente.");
        return;
    }

    const container = document.createElement('div');
    container.className = 'photo-preview-item'; // Classe usada para contagem e coleta de dados
    container.innerHTML = `
        <div class="img-container">
            <img src="${photo.src}" alt="Pré-visualização da foto">
            <button type="button" class="remove-img-btn" title="Remover foto">&times;</button>
        </div>
        <div class="form-group" style="margin-top: 5px;">
            <input type="text" class="input input-sm photo-description" placeholder="Descrição da foto..." value="${photo.description || ''}">
        </div>
    `;

    // Botão de remover, que também atualiza a contagem
    container.querySelector('.remove-img-btn').addEventListener('click', () => {
        container.remove();
        const fileCountSpan = document.getElementById('fileCountMedicao') || document.getElementById('fileCountInitial');
        if (fileCountSpan) {
             updateFileCount(previewContainer, fileCountSpan);
        }
    });

    if (previewContainer.querySelector('.hint-details')) {
        previewContainer.innerHTML = '';
    }
    previewContainer.appendChild(container);
}

export function updateFileCount(previewContainer, fileCountSpan) {
    if (!previewContainer || !fileCountSpan) {
        console.warn("updateFileCount: Elementos ausentes.");
        return;
    }
    // A contagem agora é baseada no número de itens de pré-visualização
    const imageCount = previewContainer.querySelectorAll('.photo-preview-item').length;
    fileCountSpan.textContent = `${imageCount} arquivo(s) selecionado(s)`;

    if (imageCount === 0) {
        previewContainer.innerHTML = "<p class='hint-details'>Nenhuma foto selecionada.</p>";
    }
}

export function formatMaterialsString(materialsText) {
    if (!materialsText || materialsText.trim() === "") {
        return [];
    }
    const materials = [];
    const items = materialsText.split(',');
    items.forEach(item => {
        const match = item.trim().match(/(.+)\s\((\d+.*)\)/);
        if (match && match.length === 3) {
            materials.push({
                nome: match[1].trim(),
                quantidade: match[2].trim(),
                unidade: ''
            });
        } else if (item.trim()) {
            materials.push({
                nome: item.trim(),
                quantidade: 1,
                unidade: ''
            });
        }
    });
    return materials;
}

export function initTooltips() {
    document.body.addEventListener('mouseover', function(e) {
        const trigger = e.target.closest('.tooltip-trigger');
        if (trigger) {
            const tooltipText = trigger.dataset.tooltip;
            if (tooltipText && !document.querySelector('.tooltip-popup-active')) {
                const tooltipPopup = document.createElement('div');
                tooltipPopup.className = 'tooltip-popup tooltip-popup-active';
                tooltipPopup.textContent = tooltipText;
                document.body.appendChild(tooltipPopup);
                const triggerRect = trigger.getBoundingClientRect();
                tooltipPopup.style.left = `${triggerRect.left + window.scrollX}px`;
                tooltipPopup.style.top = `${triggerRect.bottom + window.scrollY + 5}px`;
            }
        }
    });

    document.body.addEventListener('mouseout', function(e) {
        const trigger = e.target.closest('.tooltip-trigger');
        if (trigger) {
            const activeTooltip = document.querySelector('.tooltip-popup-active');
            if (activeTooltip) {
                activeTooltip.remove();
            }
        }
    });
}