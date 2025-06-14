import { renderPhotoPreview, renderSinglePhoto, updateFileCount } from './utils.js';
import { updateOs } from './localStorageManager.js';
import { osDataCache, formatNameForId } from './osForm.js';
let currentMode = 'full';
let measurementModalOverlayElement = null;
let currentOsId = null;
let currentSubestacaoIndex = null;
let currentEquipmentName = null;
let currentEquipmentType = null;
let currentUnidade = null;
function getFormattedDate(dateString) {
    if (!dateString || dateString === 'N/A') return new Date().toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
        return d.toISOString().slice(0, 10);
    } catch (e) {
        return new Date().toISOString().slice(0, 10);
    }
}
function addEquipamentoUtilizadoRow(container) {
    if (!container) return;
    const index = container.querySelectorAll('.equipamento-utilizado-item').length;
    const div = document.createElement('div');
    div.classList.add('equipamento-utilizado-item', 'form-row');
    div.dataset.index = index;
    div.innerHTML = `
        <div class="form-group"><input type="text" name="equipUtilizadoNome" placeholder="Nome do Equipamento"></div>
        <div class="form-group"><input type="text" name="equipUtilizadoModelo" placeholder="Modelo"></div>
        <div class="form-group"><input type="text" name="equipUtilizadoSerie" placeholder="N° Série/ID"></div>
        <button type="button" class="btn-remove-equip-utilizado btn-danger-sm">-</button>
    `;
    container.appendChild(div);
    div.querySelector('.btn-remove-equip-utilizado').addEventListener('click', function() {
        this.closest('.equipamento-utilizado-item').remove();
    });
}
function getMeasurementFormHTML(equipmentType, dadosMedicaoExistente = {}, mode) {
    let formContent = '';
    const data = dadosMedicaoExistente || {}; 
    const hoje = getFormattedDate(data.dataEnsaio);
    const responsavelEnsaio = data.responsavelEnsaio || "";
    const engenheiroResponsavel = data.engenheiroResponsavel || "";
    const isNaoConforme = data.naoConforme || false;
    const naoConformeDesc = data.naoConformeDescricao || '';
    let equipamentosUtilizadosHTML = `
        <h5>Equipamentos Utilizados no Ensaio</h5>
        <div id="equipamentosUtilizadosContainer" class="form-section-sm">`;
    const equipamentosSalvos = Array.isArray(data.equipamentosUtilizados) && data.equipamentosUtilizados.length > 0 
                             ? data.equipamentosUtilizados 
                             : [{ nome: '', modelo: '', serie: '' }];
    equipamentosSalvos.forEach((equip, index) => {
        equipamentosUtilizadosHTML += `
            <div class="equipamento-utilizado-item form-row" data-index="${index}">
                <div class="form-group"><input type="text" name="equipUtilizadoNome" placeholder="Nome do Equipamento" value="${equip.nome || ''}"></div>
                <div class="form-group"><input type="text" name="equipUtilizadoModelo" placeholder="Modelo" value="${equip.modelo || ''}"></div>
                <div class="form-group"><input type="text" name="equipUtilizadoSerie" placeholder="N° Série/ID" value="${equip.serie || ''}"></div>
                ${index > 0 ? '<button type="button" class="btn-remove-equip-utilizado btn-danger-sm">-</button>' : ''}
            </div>`;
    });
    equipamentosUtilizadosHTML += `
        </div>
        <button type="button" id="btnAddEquipamentoUtilizado" class="btn-secondary-sm">Adicionar Equipamento Utilizado</button>
    `;
    switch (equipmentType) {
case 'disjuntor_de_alta_tensao': {
            // Parte 1: HTML da Identificação (sempre visível)
            const identificacaoHTML = `
                <div class="identificacao-grid">
                    <div class="form-group"><label for="localizacaoDJAT">LOCALIZAÇÃO</label><input type="text" id="localizacaoDJAT" name="localizacaoDJAT" class="input" value="${data.localizacao || ''}"/></div>
                    <div class="form-group"><label for="tipoDJAT">TIPO</label><input type="text" id="tipoDJAT" name="tipoDJAT" class="input" value="${data.tipo || ''}"/></div>
                    <div class="form-group"><label for="fabricanteDJAT">FABRICANTE</label><input type="text" id="fabricanteDJAT" name="fabricanteDJAT" class="input" value="${data.fabricante || ''}"/></div>
                    <div class="form-group"><label for="numSerieDJAT">N° SÉRIE</label><input type="text" id="numSerieDJAT" name="numSerieDJAT" class="input" value="${data.numSerie || ''}"/></div>
                    <div class="form-group"><label for="meioIsolanteDJAT">MEIO ISOLANTE</label><input type="text" id="meioIsolanteDJAT" name="meioIsolanteDJAT" class="input" value="${data.meioIsolante || ''}"/></div>
                    <div class="form-group"><label for="tensaoNominalDJAT">TENSÃO NOMINAL (kV)</label><input type="number" id="tensaoNominalDJAT" name="tensaoNominalDJAT" class="input" step="any" value="${data.tensaoNominal || ''}"/></div>
                    <div class="form-group"><label for="correnteNominalDJAT">CORRENTE NOMINAL (A)</label><input type="number" id="correnteNominalDJAT" name="correnteNominalDJAT" class="input" step="any" value="${data.correnteNominal || ''}"/></div>
                    <div class="form-group"><label for="temperaturaEnsaioDJAT">TEMPERATURA DE ENSAIO (°C)</label><input type="number" id="temperaturaEnsaioDJAT" name="temperaturaEnsaioDJAT" class="input" step="0.1" value="${data.temperaturaEnsaio || ''}"/></div>
                    <div class="form-group"><label for="umidadeRelativaDJAT">UMIDADE RELATIVA AR (%)</label><input type="number" id="umidadeRelativaDJAT" name="umidadeRelativaDJAT" class="input" step="0.1" value="${data.umidadeRelativa || ''}"/></div>
                    <div class="form-group pressure-selection-group">
                        <label>PRESSÃO (MPa):</label>
                        <div class="pressure-options">
                            <div class="radio-option-group">
                                <label><input type="radio" name="pressaoTipoDJAT" value="gas" ${!data.pressao || data.pressao.tipo === 'gas' ? 'checked' : ''} /> Gás</label>
                                <label><input type="radio" name="pressaoTipoDJAT" value="oleo" ${data.pressao?.tipo === 'oleo' ? 'checked' : ''} /> Óleo</label>
                            </div>
                            <div class="pressure-value-input">
                                <input type="number" id="pressaoValorDJAT" name="pressaoValorDJAT" class="input" step="any" placeholder="Valor" value="${data.pressao?.valor || ''}"/>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Parte 2: HTML das Medições (visível apenas no modo 'full')
            let medicoesHTML = '';
            if (mode === 'full') {
                const polos = ['A', 'B', 'C'];
                let resContatoFechadoRows = '';
                polos.forEach((polo, i) => {
                    const item = data.resContatoFechado?.[i] || {};
                    resContatoFechadoRows += `<tr><td><input type="text" name="rcf_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly /></td><td><input type="text" name="rcf_disjuntor_fechado_${polo.toLowerCase()}" value="${item.disjuntor_fechado || 'Entrada - Saída'}" class="input" /></td><td><input type="number" name="rcf_corrente_aplicada_${polo.toLowerCase()}" class="input" value="${item.corrente_aplicada || ''}" step="any"/></td><td><input type="number" name="rcf_valor_medido_${polo.toLowerCase()}" class="input" step="any" value="${item.valor_medido || ''}"/></td><td><input type="text" name="rcf_valor_referencia_${polo.toLowerCase()}" class="input" value="${item.valor_referencia || '≤120'}"/></td><td><input type="number" name="rcf_tempo_${polo.toLowerCase()}" class="input" value="${item.tempo || '60'}" step="any"/></td></tr>`;
                });
                let resContatoAbertoRows = '';
                polos.forEach((polo, i) => {
                    const item = data.resContatoAberto?.[i] || {};
                    resContatoAbertoRows += `<tr><td><input type="text" name="rca_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly /></td><td><input type="text" name="rca_disjuntor_aberto_${polo.toLowerCase()}" value="${item.disjuntor_aberto || 'Entrada - Saída'}" class="input" /></td><td><input type="number" name="rca_tensao_aplicada_${polo.toLowerCase()}" class="input" value="${item.tensao_aplicada || '5000'}" step="any"/></td><td><input type="number" name="rca_valor_medido_${polo.toLowerCase()}" class="input" step="any" value="${item.valor_medido || ''}"/></td><td><input type="text" name="rca_valor_referencia_${polo.toLowerCase()}" class="input" value="${item.valor_referencia || '≥1000'}"/></td><td><input type="number" name="rca_tempo_${polo.toLowerCase()}" class="input" value="${item.tempo || '60'}" step="any"/></td></tr>`;
                });
                let resIsolamentoFechadoMassaRows = '';
                polos.forEach((polo, i) => {
                    const item = data.resIsolamentoFechado?.[i] || {};
                    resIsolamentoFechadoMassaRows += `<tr><td><input type="text" name="rifm_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly /></td><td><input type="text" name="rifm_disjuntor_fechado_${polo.toLowerCase()}" value="${item.disjuntor_fechado || (polo + ' x Massa')}" class="input" /></td><td><input type="number" name="rifm_tensao_aplicada_${polo.toLowerCase()}" class="input" value="${item.tensao_aplicada || '5000'}" step="any"/></td><td><input type="number" name="rifm_valor_medido_${polo.toLowerCase()}" class="input" step="any" value="${item.valor_medido || ''}"/></td><td><input type="text" name="rifm_valor_referencia_${polo.toLowerCase()}" class="input" value="${item.valor_referencia || '≥1000'}"/></td><td><input type="number" name="rifm_tempo_${polo.toLowerCase()}" class="input" value="${item.tempo || '60'}" step="any"/></td></tr>`;
                });
                let fpAbertoRows = '';
                polos.forEach((polo,i) => {
                    const item = data.fpAberto?.[i] || {};
                    fpAbertoRows += `<tr><td><input type="text" name="fpa_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly /></td><td><input type="text" name="fpa_hv_${i}" value="${item.hv || 'Entrada'}" class="input"/></td><td><input type="text" name="fpa_lv_r_${i}" value="${item.lv_r || 'Saída'}" class="input"/></td><td><input type="text" name="fpa_ch_posicao_${i}" value="${item.ch_posicao || 'UST'}" class="input"/></td><td><input type="number" name="fpa_ma_${i}" class="input" step="any" value="${item.ma || ''}"/></td><td><input type="number" name="fpa_watts_${i}" class="input" step="any" value="${item.watts || ''}"/></td><td><input type="number" name="fpa_fp_med_${i}" class="input" step="any" value="${item.fp_med || ''}"/></td><td><input type="number" name="fpa_fp_corr_${i}" class="input" step="any" value="${item.fp_corr || ''}"/></td><td><input type="number" name="fpa_capacitancia_${i}" class="input" step="any" value="${item.capacitancia || ''}"/></td></tr>`;
                });
                let fpFechadoRows = '';
                polos.forEach((polo,i) => {
                    const item = data.fpFechado?.[i] || {};
                    fpFechadoRows += `<tr><td><input type="text" name="fpf_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly /></td><td><input type="text" name="fpf_hv_${i}" value="${item.hv || 'Entrada'}" class="input"/></td><td><input type="text" name="fpf_lv_r_${i}" value="${item.lv_r || 'Massa'}" class="input"/></td><td><input type="text" name="fpf_ch_posicao_${i}" value="${item.ch_posicao || 'GSTg'}" class="input"/></td><td><input type="number" name="fpf_ma_${i}" class="input" step="any" value="${item.ma || ''}"/></td><td><input type="number" name="fpf_watts_${i}" class="input" step="any" value="${item.watts || ''}"/></td><td><input type="number" name="fpf_fp_med_${i}" class="input" step="any" value="${item.fp_med || ''}"/></td><td><input type="number" name="fpf_fp_corr_${i}" class="input" step="any" value="${item.fp_corr || ''}"/></td><td><input type="number" name="fpf_capacitancia_${i}" class="input" step="any" value="${item.capacitancia || ''}"/></td></tr>`;
                });
                const servicos = ["Limpeza geral", "Lubrificação dos componentes", "Testes de acionamento elétricos", "Reaperto das Conexões elétricas"];
                let servicosHTMLContent = '';
                servicos.forEach((servico, index) => {
                    const name = `servico_dj_at_${index}`;
                    const valorSalvo = data.servicos?.[index]?.valor;
                    servicosHTMLContent += `<div class="servico-item"><label>${servico}</label><div class="servico-options"><label><input type="radio" name="${name}" value="Sim" required ${valorSalvo === 'Sim' ? 'checked' : ''} /> Sim</label><label><input type="radio" name="${name}" value="Não" ${valorSalvo === 'Não' ? 'checked' : ''} /> Não</label><label><input type="radio" name="${name}" value="N/A" ${valorSalvo === 'N/A' || !valorSalvo ? 'checked' : ''} /> N/A</label></div></div>`;
                });

                medicoesHTML = `
                    <h4 class="section-title">RESISTÊNCIA DE CONTATO (µΩ)</h4>
                    <h5 class="subsection-title">Disjuntor Fechado</h5>
                    <div class="table-container"><table><thead><tr><th>Polos</th><th>Disjuntor Fechado</th><th>Corrente Aplicada (A)</th><th>Valores Medidos (µΩ)</th><th>Valores de Referência (µΩ)</th><th>Tempo (s)</th></tr></thead><tbody>${resContatoFechadoRows}</tbody></table></div>
                    <h5 class="subsection-title">Disjuntor Aberto (Isolamento entre contatos)</h5>
                    <div class="table-container"><table><thead><tr><th>Polos</th><th>Disjuntor Aberto</th><th>Tensão Aplicada (Vcc)</th><th>Valores Medidos (MΩ)</th><th>Valores de Referência (MΩ)</th><th>Tempo (s)</th></tr></thead><tbody>${resContatoAbertoRows}</tbody></table></div>
                    <h4 class="section-title">RESISTÊNCIA DE ISOLAMENTO (MΩ)</h4>
                    <h5 class="subsection-title">Disjuntor Fechado (Polos x Massa)</h5>
                    <div class="table-container"><table><thead><tr><th>Polos</th><th>Disjuntor Fechado</th><th>Tensão Aplicada (Vcc)</th><th>Valores Medidos (MΩ)</th><th>Valores de Referência (MΩ)</th><th>Tempo (s)</th></tr></thead><tbody>${resIsolamentoFechadoMassaRows}</tbody></table></div>
                    <h4 class="section-title">FATOR DE POTÊNCIA DE ISOLAMENTO A 10kV – DISJUNTOR ABERTO</h4>
                    <p class="table-note">FP% = (W x 10) / mA</p>
                    <div class="table-container"><table><thead><tr><th rowspan="2">Polos</th><th colspan="2">Configuração</th><th rowspan="2">CH Posição</th><th rowspan="2">mA</th><th rowspan="2">Watts</th><th colspan="2">FP%</th><th rowspan="2">Capacitância (pF)</th></tr><tr><th>HV</th><th>LV-R</th><th>Med.</th><th>Corr. 20°C</th></tr></thead><tbody>${fpAbertoRows}</tbody></table></div>
                    <h4 class="section-title">FATOR DE POTÊNCIA DE ISOLAMENTO A 10kV – DISJUNTOR FECHADO</h4>
                    <p class="table-note">FP% = (W x 10) / mA</p>
                    <div class="table-container"><table><thead><tr><th rowspan="2">Polos</th><th colspan="2">Configuração</th><th rowspan="2">CH Posição</th><th rowspan="2">mA</th><th rowspan="2">Watts</th><th colspan="2">FP%</th><th rowspan="2">Capacitância (pF)</th></tr><tr><th>HV</th><th>LV-R</th><th>Med.</th><th>Corr. 20°C</th></tr></thead><tbody>${fpFechadoRows}</tbody></table></div>
                    <h4 class="section-title">SERVIÇOS</h4>
                    <div class="servicos-list">${servicosHTMLContent}</div>
                `;
            }

            
            formContent = `
                <h3 class="main-title">DISJUNTOR DE ALTA TENSÃO</h3>
                ${identificacaoHTML}
                ${medicoesHTML}
                <div class="form-group" style="margin-top:24px;"><label for="observacoesDJAT">OBSERVAÇÕES</label><textarea id="observacoesDJAT" name="observacoesDJAT" class="input" rows="4">${data.observacoes || ''}</textarea></div>
                <div class="form-section-sm nao-conformidade-container" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    <div class="form-group-inline">
                        <input type="checkbox" id="naoConformeCheck" name="naoConformeCheck" class="nao-conforme-checkbox" ${isNaoConforme ? 'checked' : ''}>
                        <label for="naoConformeCheck" class="nao-conforme-label">EQUIPAMENTO NÃO CONFORME</label>
                    </div>
                    <div class="form-group full-width nao-conforme-descricao" style="display: ${isNaoConforme ? 'block' : 'none'}; margin-top: 10px;">
                        <label for="naoConformeDescricao">Descrever a Não Conformidade</label>
                        <textarea id="naoConformeDescricao" name="naoConformeDescricao" class="input" rows="3" placeholder="Ex: Isoladores trincados, vazamento de óleo, conexões oxidadas...">${naoConformeDesc}</textarea>
                    </div>
                </div>
            `;
            formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
            break;
        }
case 'disjuntor_de_media_tensao': {
            const polos = ['A', 'B', 'C'];
            
            // HTML da Identificação (sempre visível)
            const identificacaoHTML = `
                <div class="identificacao-grid">
                    <div class="form-group"><label for="localizacaoDJMT">LOCALIZAÇÃO</label><input type="text" id="localizacaoDJMT" name="localizacaoDJMT" class="input" value="${data.localizacao || ''}"/></div>
                    <div class="form-group"><label for="identificacaoDJMT">IDENTIFICAÇÃO</label><input type="text" id="identificacaoDJMT" name="identificacaoDJMT" class="input" value="${data.identificacao || ''}"/></div>
                    <div class="form-group"><label for="tagDJMT">TAG</label><input type="text" id="tagDJMT" name="tagDJMT" class="input" value="${data.tag || ''}"/></div>
                    <div class="form-group"><label for="tipoDJMT">TIPO</label><input type="text" id="tipoDJMT" name="tipoDJMT" class="input" value="${data.tipo || ''}"/></div>
                    <div class="form-group"><label for="fabricanteDJMT">FABRICANTE</label><input type="text" id="fabricanteDJMT" name="fabricanteDJMT" class="input" value="${data.fabricante || ''}"/></div>
                    <div class="form-group"><label for="numSerieDJMT">N° SÉRIE</label><input type="text" id="numSerieDJMT" name="numSerieDJMT" class="input" value="${data.numSerie || ''}"/></div>
                    <div class="form-group"><label for="meioIsolanteDJMT">MEIO ISOLANTE</label><input type="text" id="meioIsolanteDJMT" name="meioIsolanteDJMT" class="input" value="${data.meioIsolante || ''}"/></div>
                    <div class="form-group"><label for="tensaoNominalDJMT">TENSÃO NOMINAL (kV)</label><input type="number" id="tensaoNominalDJMT" name="tensaoNominalDJMT" class="input" step="any" value="${data.tensaoNominal || ''}"/></div>
                    <div class="form-group"><label for="correnteNominalDJMT">CORRENTE NOMINAL (A)</label><input type="number" id="correnteNominalDJMT" name="correnteNominalDJMT" class="input" step="any" value="${data.correnteNominal || ''}"/></div>
                    <div class="form-group"><label for="temperaturaEnsaioDJMT">TEMPERATURA DE ENSAIO (°C)</label><input type="number" id="temperaturaEnsaioDJMT" name="temperaturaEnsaioDJMT" class="input" step="0.1" value="${data.temperaturaEnsaio || ''}"/></div>
                    <div class="form-group"><label for="umidadeRelativaDJMT">UMIDADE RELATIVA AR (%)</label><input type="number" id="umidadeRelativaDJMT" name="umidadeRelativaDJMT" class="input" step="0.1" value="${data.umidadeRelativa || ''}"/></div>
                    <div class="form-group"><label for="anoFabricacaoDJMT">ANO FABRICAÇÃO</label><input type="number" id="anoFabricacaoDJMT" name="anoFabricacaoDJMT" class="input" min="1900" max="2100" value="${data.anoFabricacao || ''}"/></div>
                </div>
            `;

            // HTML das Medições (visível apenas no modo 'full')
            let medicoesHTML = '';
            if (mode === 'full') {
                let resContatosRows = '';
                polos.forEach((polo, i) => {
                    const item = data.resistenciaContatos?.[i] || {};
                    resContatosRows += `
                        <tr>
                            <td><input type="text" name="rc_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly /></td>
                            <td><input type="text" name="rc_disjuntor_fechado_${polo.toLowerCase()}" value="${item.disjuntor_fechado || 'Entrada - Saída'}" class="input" /></td>
                            <td><input type="number" name="rc_corrente_aplicada_${polo.toLowerCase()}" class="input" value="${item.corrente_aplicada || '10'}" step="any"/></td>
                            <td><input type="number" name="rc_valor_medido_${polo.toLowerCase()}" class="input" step="any" value="${item.valor_medido || ''}"/></td>
                            <td><input type="text" name="rc_valor_referencia_${polo.toLowerCase()}" class="input" value="${item.valor_referencia || '≤120'}"/></td>
                            <td><input type="number" name="rc_tempo_${polo.toLowerCase()}" class="input" value="${item.tempo || '60'}" step="any"/></td>
                        </tr>`;
                });

                let resIsolamentoAbertoRows = '';
                polos.forEach((polo, i) => {
                    const item = data.resIsolamentoAberto?.[i] || {};
                    resIsolamentoAbertoRows += `
                        <tr>
                            <td><input type="text" name="ria_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly /></td>
                            <td><input type="text" name="ria_disjuntor_aberto_${polo.toLowerCase()}" value="${item.disjuntor_aberto || 'Entrada - Saída'}" class="input" /></td>
                            <td><input type="number" name="ria_tensao_ensaio_${polo.toLowerCase()}" class="input" value="${item.tensao_ensaio || '5000'}" step="any"/></td>
                            <td><input type="number" name="ria_valor_medido_${polo.toLowerCase()}" class="input" step="any" value="${item.valor_medido || ''}"/></td>
                            <td><input type="text" name="ria_valor_referencia_${polo.toLowerCase()}" class="input" value="${item.valor_referencia || '≥1000'}"/></td>
                            <td><input type="number" name="ria_tempo_${polo.toLowerCase()}" class="input" value="${item.tempo || '60'}" step="any"/></td>
                        </tr>`;
                });

                let resIsolamentoFechadoRows = '';
                polos.forEach((polo, i) => {
                    const item = data.resIsolamentoFechado?.[i] || {};
                    resIsolamentoFechadoRows += `
                        <tr>
                            <td><input type="text" name="rif_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly /></td>
                            <td><input type="text" name="rif_disjuntor_fechado_${polo.toLowerCase()}" value="${item.disjuntor_fechado || (polo + ' x Massa')}" class="input" /></td>
                            <td><input type="number" name="rif_tensao_ensaio_${polo.toLowerCase()}" class="input" value="${item.tensao_ensaio || '5000'}" step="any"/></td>
                            <td><input type="number" name="rif_valor_medido_${polo.toLowerCase()}" class="input" step="any" value="${item.valor_medido || ''}"/></td>
                            <td><input type="text" name="rif_valor_referencia_${polo.toLowerCase()}" class="input" value="${item.valor_referencia || '≥1000'}"/></td>
                            <td><input type="number" name="rif_tempo_${polo.toLowerCase()}" class="input" value="${item.tempo || '60'}" step="any"/></td>
                        </tr>`;
                });

                medicoesHTML = `
                    <h4 class="section-title">RESISTÊNCIA DOS CONTATOS (μΩ)</h4>
                    <div class="table-container"><table><thead><tr><th>Polos</th><th>Disjuntor Fechado</th><th>Corrente Aplicada (A)</th><th>Valores Medidos (μΩ)</th><th>Valores de Referências (μΩ)</th><th>Tempo (s)</th></tr></thead><tbody>${resContatosRows}</tbody></table></div>
                    <h4 class="section-title">RESISTÊNCIA DO ISOLAMENTO (MΩ)</h4>
                    <h5 class="subsection-title">Disjuntor Aberto</h5>
                    <div class="table-container"><table><thead><tr><th>Polos</th><th>Disjuntor Aberto</th><th>Tensão Ensaio VCC</th><th>Valores Medidos (MΩ)</th><th>Valores de Referência (MΩ)</th><th>Tempo (s)</th></tr></thead><tbody>${resIsolamentoAbertoRows}</tbody></table></div>
                    <h5 class="subsection-title">Disjuntor Fechado</h5>
                    <div class="table-container"><table><thead><tr><th>Polos</th><th>Disjuntor Fechado</th><th>Tensão Ensaio VCC</th><th>Valores Medidos (MΩ)</th><th>Valores de Referência (MΩ)</th><th>Tempo (s)</th></tr></thead><tbody>${resIsolamentoFechadoRows}</tbody></table></div>
                `;
            }

            // Montagem final do conteúdo
            formContent = `
                <h3 class="main-title">DISJUNTOR DE MÉDIA TENSÃO</h3>
                ${identificacaoHTML}
                ${medicoesHTML}
                <div class="form-section-sm nao-conformidade-container" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    <div class="form-group-inline">
                        <input type="checkbox" id="naoConformeCheck" name="naoConformeCheck" class="nao-conforme-checkbox" ${isNaoConforme ? 'checked' : ''}>
                        <label for="naoConformeCheck" class="nao-conforme-label">EQUIPAMENTO NÃO CONFORME</label>
                    </div>
                    <div class="form-group full-width nao-conforme-descricao" style="display: ${isNaoConforme ? 'block' : 'none'}; margin-top: 10px;">
                        <label for="naoConformeDescricao">Descrever a Não Conformidade</label>
                        <textarea id="naoConformeDescricao" name="naoConformeDescricao" class="input" rows="3" placeholder="Ex: Isoladores trincados, vazamento de óleo, conexões oxidadas...">${naoConformeDesc}</textarea>
                    </div>
                </div>
                <div class="form-group" style="margin-top:24px;"><label for="observacoesDJMT">OBSERVAÇÕES</label><textarea id="observacoesDJMT" name="observacoesDJMT" class="input" rows="4">${data.observacoes || ''}</textarea></div>
            `;
            formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
            break;
        }

case 'pararaios_de_alta_tensao': {
            // Parte 1: HTML da Identificação (sempre visível)
            const identificacaoHTML = `
                <div class="identificacao-grid">
                    <div class="form-group"><label for="localizacaoPRAT">LOCALIZAÇÃO</label><input type="text" id="localizacaoPRAT" name="localizacaoPRAT" class="input" value="${data.localizacao || ''}"></div>
                    <div class="form-group"><label for="tagPRAT">TAG</label><input type="text" id="tagPRAT" name="tagPRAT" class="input" value="${data.tag || ''}"></div>
                    <div class="form-group"><label for="numSeriePRATPrincipal">Nº SÉRIE (Principal/Conjunto)</label><input type="text" id="numSeriePRATPrincipal" name="numSeriePRATPrincipal" class="input" value="${data.numSeriePrincipal || ''}"></div>
                    <div class="form-group"><label for="fabricantePRAT">FABRICANTE</label><input type="text" id="fabricantePRAT" name="fabricantePRAT" class="input" value="${data.fabricante || ''}"></div>
                    <div class="form-group"><label for="tensaoNominalPRAT">TENSÃO NOMINAL (kV)</label><input type="number" id="tensaoNominalPRAT" name="tensaoNominalPRAT" class="input" step="any" value="${data.tensaoNominal || ''}"></div>
                    <div class="form-group"><label for="curtoCircuitoPRAT">CURTO CIRCUITO (kA)</label><input type="text" id="curtoCircuitoPRAT" name="curtoCircuitoPRAT" class="input" value="${data.curtoCircuito || ''}"></div>
                    <div class="form-group"><label for="tempEnsaioPRAT">TEMP. ENSAIO (°C)</label><input type="number" id="tempEnsaioPRAT" name="tempEnsaioPRAT" class="input" step="0.1" value="${data.tempEnsaio || ''}"></div>
                    <div class="form-group"><label for="umidadeRelativaPRAT">UMIDADE RELATIVA (%)</label><input type="number" id="umidadeRelativaPRAT" name="umidadeRelativaPRAT" class="input" step="0.1" value="${data.umidadeRelativa || ''}"></div>
                </div>
            `;

            // Parte 2: HTML das Medições (visível apenas no modo 'full')
            let medicoesHTML = '';
            if (mode === 'full') {
                let resIsolamentoRows = '';
                for (let i = 0; i < 3; i++) {
                    const item = data.resistenciaIsolamento?.[i] || {};
                    resIsolamentoRows += `
                        <tr>
                            <td><input type="text" name="ri_numSerie_${i}" class="input" value="${item.numSerie || ''}"/></td>
                            <td><input type="text" name="ri_at_massa_${i}" class="input" value="${item.at_massa || 'AT x Massa'}" readonly /></td>
                            <td><input type="number" name="ri_tensao_ensaio_${i}" class="input" value="${item.tensao_ensaio || ''}" step="any"/></td>
                            <td><input type="number" name="ri_valor_medido_${i}" class="input" step="any" value="${item.valor_medido || ''}"/></td>
                            <td><input type="text" name="ri_valor_referencia_${i}" class="input" value="${item.valor_referencia || ''}"/></td>
                            <td><input type="number" name="ri_tempo_${i}" class="input" value="${item.tempo || '60'}" step="any"/></td>
                        </tr>
                    `;
                }
                medicoesHTML = `
                    <h4 class="section-title">RESISTÊNCIA DO ISOLAMENTO (MΩ)</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr><th>Nº Série (Individual)</th><th>Terminais de Medição</th><th>Tensão Ensaio VCC</th><th>Valores Medidos (MΩ)</th><th>Valores de Referência (MΩ)</th><th>Tempo (s)</th></tr>
                            </thead>
                            <tbody>${resIsolamentoRows}</tbody>
                        </table>
                    </div>
                `;
            }

            // Parte 3: Montagem Final
            formContent = `
                <h3 class="main-title">PÁRA-RAIOS DE ALTA TENSÃO</h3>
                ${identificacaoHTML}
                ${medicoesHTML}
                <div class="form-section-sm nao-conformidade-container" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    <div class="form-group-inline">
                        <input type="checkbox" id="naoConformeCheck" name="naoConformeCheck" class="nao-conforme-checkbox" ${isNaoConforme ? 'checked' : ''}>
                        <label for="naoConformeCheck" class="nao-conforme-label">EQUIPAMENTO NÃO CONFORME</label>
                    </div>
                    <div class="form-group full-width nao-conforme-descricao" style="display: ${isNaoConforme ? 'block' : 'none'}; margin-top: 10px;">
                        <label for="naoConformeDescricao">Descrever a Não Conformidade</label>
                        <textarea id="naoConformeDescricao" name="naoConformeDescricao" class="input" rows="3" placeholder="Ex: Isoladores trincados, vazamento de óleo, conexões oxidadas...">${naoConformeDesc}</textarea>
                    </div>
                </div>
                <div class="form-group" style="margin-top:24px;"><label for="observacoesPRAT">OBSERVAÇÕES</label><textarea id="observacoesPRAT" name="observacoesPRAT" class="input" rows="4">${data.observacoes || ''}</textarea></div>
            `;
            formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
            break;
        }

case 'tc_transformador_de_corrente': {
            // Parte 1: HTML da Identificação (sempre visível)
            const identificacaoHTML = `
                <div class="identificacao-grid">
                    <div class="form-group"><label for="localizacaoTC">LOCALIZAÇÃO</label><input type="text" id="localizacaoTC" name="localizacaoTC" class="input" value="${data.localizacao || ''}"></div>
                    <div class="form-group"><label for="tipoTC">TIPO</label><input type="text" id="tipoTC" name="tipoTC" class="input" value="${data.tipo || ''}"></div>
                    <div class="form-group"><label for="fabricanteTC">FABRICANTE</label><input type="text" id="fabricanteTC" name="fabricanteTC" class="input" value="${data.fabricante || ''}"></div>
                    <div class="form-group"><label for="numSerieTC_principal">N° SÉRIE</label><input type="text" id="numSerieTC_principal" name="numSerieTC_principal" class="input" value="${data.numSeriePrincipal || ''}"></div>
                    <div class="form-group"><label for="anoFabTC">ANO FAB.</label><input type="number" id="anoFabTC" name="anoFabTC" class="input" min="1900" max="2100" value="${data.anoFabricacao || ''}"></div>
                    <div class="form-group"><label for="meioIsolanteTC">MEIO ISOLANTE</label><input type="text" id="meioIsolanteTC" name="meioIsolanteTC" class="input" value="${data.meioIsolante || ''}"></div>
                    <div class="form-group"><label for="correnteNominalATTC">CORRENTE NOMINAL AT (A)</label><input type="number" id="correnteNominalATTC" name="correnteNominalATTC" class="input" step="any" value="${data.correnteNominalAT || ''}"></div>
                    <div class="form-group"><label for="correnteNominalBTTC">CORRENTE NOMINAL BT (A)</label><input type="number" id="correnteNominalBTTC" name="correnteNominalBTTC" class="input" step="any" value="${data.correnteNominalBT || ''}"></div>
                    <div class="form-group"><label for="temperaturaEnsaioTC_geral">TEMPERATURA DE ENSAIO (°C)</label><input type="number" id="temperaturaEnsaioTC_geral" name="temperaturaEnsaioTC_geral" class="input" step="0.1" value="${data.temperaturaEnsaioGeral || ''}"></div>
                    <div class="form-group"><label for="umidadeRelativaTC">UMIDADE RELATIVA AR (%)</label><input type="number" id="umidadeRelativaTC" name="umidadeRelativaTC" class="input" step="0.1" value="${data.umidadeRelativa || ''}"></div>
                    <div class="form-group"><label for="potenciaTC">POTÊNCIA (VA)</label><input type="number" id="potenciaTC" name="potenciaTC" class="input" step="any" value="${data.potencia || ''}"></div>
                    <div class="form-group"><label for="exatidaoTC_geral">EXATIDÃO</label><input type="text" id="exatidaoTC_geral" name="exatidaoTC_geral" class="input" value="${data.exatidaoGeral || ''}"></div>
                </div>
            `;

            // Parte 2: HTML das Medições (visível apenas no modo 'full')
            let medicoesHTML = '';
            if (mode === 'full') {
                let relacaoTCRows = '';
                for (let i = 0; i < 3; i++) { 
                    const item = data.relacaoTransformacao?.[i] || {};
                    relacaoTCRows += `<tr><td><input type="text" name="relTC_numSerie_${i}" class="input" value="${item.numSerie || ''}"></td><td><input type="number" name="relTC_correnteAT_${i}" class="input" step="any" value="${item.correnteAT || ''}"></td><td><input type="number" name="relTC_correnteBT_${i}" class="input" step="any" value="${item.correnteBT || ''}"></td><td><input type="text" name="relTC_terminais_${i}" class="input" value="${item.terminais || 'P1-P2/S1-S2'}"></td><td><input type="text" name="relTC_calculada_${i}" class="input" value="${item.calculada || ''}"></td><td><input type="text" name="relTC_medida_${i}" class="input" value="${item.medida || ''}"></td><td><input type="number" name="relTC_resistencia_${i}" class="input" step="any" value="${item.resistencia || ''}"></td><td><input type="text" name="relTC_exatidao_${i}" class="input" value="${item.exatidao || ''}"></td></tr>`;
                }
                
                let resIsolamentoSections = '';
                const terminaisIsolamento = ['P x S (M)', 'P x Massa (S)', 'S x Massa (P)'];
                for (let sectionIndex = 0; sectionIndex < 3; sectionIndex++) {
                    const numSerieSalvo = data.resistenciaIsolamento?.[sectionIndex]?.numSerie || '';
                    let rows = '';
                    terminaisIsolamento.forEach((terminal, rowIndex) => {
                        const medicaoSalva = data.resistenciaIsolamento?.[sectionIndex]?.medicoes?.[rowIndex] || {};
                        rows += `<tr>${rowIndex === 0 ? `<td rowspan="3"><input type="text" name="riTC_numSerie_${sectionIndex}" class="input" value="${numSerieSalvo}" /></td>` : ''}<td><input type="text" name="riTC_terminais_${sectionIndex}_${rowIndex}" class="input" value="${terminal}" readonly /></td><td><input type="number" name="riTC_valMedido_${sectionIndex}_${rowIndex}" class="input" step="any" value="${medicaoSalva.valMedido || ''}"/></td><td><input type="number" name="riTC_tempEnsaio_${sectionIndex}_${rowIndex}" class="input" step="0.1" value="${medicaoSalva.tempEnsaio || ''}"/></td></tr>`;
                    }); 
                    resIsolamentoSections += `<h4 class="section-title" style="margin-top: 30px; text-align:center; border-bottom:none;">RESISTÊNCIA DE ISOLAMENTO (MΩ)</h4><div class="table-container"><table><thead><tr><th>N° de Série</th><th>Terminais de Medição</th><th>Valores Medidos (MΩ)</th><th>Temperatura de Ensaio (°C)</th></tr></thead><tbody>${rows}</tbody></table></div>`;
                }

                medicoesHTML = `
                    <h4 class="section-title">RELAÇÃO DE TRANSFORMAÇÃO E RESISTÊNCIA ÔHMICA</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr><th rowspan="2">N° de Série</th><th colspan="2">Corrente (A)</th><th rowspan="2">Terminais</th><th rowspan="2">Relação Calculada IP/IS</th><th rowspan="2">Relação Medida</th><th rowspan="2">Resistência Ôhmica (mΩ)</th><th rowspan="2">Exatidão</th></tr>
                                <tr><th>AT</th><th>BT</th></tr>
                            </thead>
                            <tbody>${relacaoTCRows}</tbody>
                        </table>
                    </div>
                    ${resIsolamentoSections}
                `;
            }

            // Parte 3: Montagem Final
            formContent = `
                <h3 class="main-title">TRANSFORMADOR DE CORRENTE DE MÉDIA TENSÃO (TC)</h3>
                ${identificacaoHTML}
                ${medicoesHTML}
                <div class="form-section-sm nao-conformidade-container" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    <div class="form-group-inline">
                        <input type="checkbox" id="naoConformeCheck" name="naoConformeCheck" class="nao-conforme-checkbox" ${isNaoConforme ? 'checked' : ''}>
                        <label for="naoConformeCheck" class="nao-conforme-label">EQUIPAMENTO NÃO CONFORME</label>
                    </div>
                    <div class="form-group full-width nao-conforme-descricao" style="display: ${isNaoConforme ? 'block' : 'none'}; margin-top: 10px;">
                        <label for="naoConformeDescricao">Descrever a Não Conformidade</label>
                        <textarea id="naoConformeDescricao" name="naoConformeDescricao" class="input" rows="3" placeholder="Ex: Isoladores trincados, vazamento de óleo, conexões oxidadas...">${naoConformeDesc}</textarea>
                    </div>
                </div>
                <div class="form-group" style="margin-top:30px;"><label for="observacoesTC">OBSERVAÇÕES</label><textarea id="observacoesTC" name="observacoesTC" class="input" rows="3">${data.observacoes || ''}</textarea></div>
            `;
            formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
            break;
        }

case 'transformador_de_potencia_de_alta_tensao': {
    const servicos = [
        "Inspeção visual geral do equipamento", "Limpeza das Buchas", "Reaperto de todas as conexões",
        "Inspeção da fiação e parafusos quanto a corrosão e contato elétrico", "Inspeção do aterramento do transformador",
        "Atuação dos contatos do termômetro do óleo isolante – Alarme e Desligamento", "Atuação dos contatos do termômetro dos enrolamentos – VF, Alarme e Desligamento",
        "Atuação dos contatos do indicador de nível de óleo Máximo e Mínimo", "Atuação dos contatos do relé de gás – Alarme e Desligamento",
        "Atuação dos Contatos do Dispositivo de alivio de pressão", "Inspeção do sistema de ventilação forçada", "Substituição da sílica gel",
        "Complemento do nível do óleo, se necessário"
    ];
    let servicosHTML = '';
    servicos.forEach((servico, index) => {
        const name = `servico_tpat_${index}`;
        const valorSalvo = data.servicos?.[index]?.valor;
        servicosHTML += `
            <div class="servico-item">
                <label>${servico}</label>
                <div class="servico-options">
                    <label><input type="radio" name="${name}" value="Sim" required ${valorSalvo === 'Sim' ? 'checked' : ''} /> Sim</label>
                    <label><input type="radio" name="${name}" value="Não" ${valorSalvo === 'Não' ? 'checked' : ''} /> Não</label>
                    <label><input type="radio" name="${name}" value="N/A" ${valorSalvo === 'N/A' || !valorSalvo ? 'checked' : ''} /> N/A</label>
                </div>
            </div>`;
    });
    const rtItem = data.relacaoTransformacao?.[0] || {};
    let relacaoTransfRows = `
        <tr>
            <td><input type="text" name="rt_tap_comutador_at" class="input" value="${rtItem.tap_comutador_at || '3'}"/></td>
            <td><input type="text" name="rt_tap_comutador_bt" class="input" value="${rtItem.tap_comutador_bt || '-'}"/></td>
            <td><input type="number" name="rt_tensao_v_at" class="input" value="${rtItem.tensao_v_at || '69000'}" step="any"/></td>
            <td><input type="number" name="rt_tensao_v_bt" class="input" value="${rtItem.tensao_v_bt || '13800'}" step="any"/></td>
            <td><input type="text" name="rt_rel_calc" class="input" value="${rtItem.rel_calc || '8.66'}"/></td>
            <td><input type="text" name="rt_rel_med_h1h3x1x0" class="input" value="${rtItem.rel_med_h1h3x1x0 || ''}"/></td>
            <td><input type="text" name="rt_rel_med_h2h1x2x0" class="input" value="${rtItem.rel_med_h2h1x2x0 || ''}"/></td>
            <td><input type="text" name="rt_rel_med_h3h2x3x0" class="input" value="${rtItem.rel_med_h3h2x3x0 || ''}"/></td>
        </tr>`;
    const roatItem = data.resOhmicaAT?.[0] || {};
    let resOhmicaATRows = `
        <tr>
            <td><input type="text" name="roat_tap_comutador" class="input" value="${roatItem.tap_comutador || '3'}"/></td>
            <td><input type="number" name="roat_tensao_at" class="input" value="${roatItem.tensao_at || '69000'}" step="any"/></td>
            <td><input type="number" name="roat_h1h3" class="input" step="any" value="${roatItem.h1h3 || ''}"/></td>
            <td><input type="number" name="roat_h2h1" class="input" step="any" value="${roatItem.h2h1 || ''}"/></td>
            <td><input type="number" name="roat_h3h2" class="input" step="any" value="${roatItem.h3h2 || ''}"/></td>
        </tr>`;
    const robtItem = data.resOhmicaBT?.[0] || {};
    let resOhmicaBTRows = `
        <tr>
            <td><input type="text" name="robt_tap_comutador" class="input" value="${robtItem.tap_comutador || '-'}"/></td>
            <td><input type="number" name="robt_tensao_bt" class="input" value="${robtItem.tensao_bt || '13800'}" step="any"/></td>
            <td><input type="number" name="robt_x1x0" class="input" step="any" value="${robtItem.x1x0 || ''}"/></td>
            <td><input type="number" name="robt_x2x0" class="input" step="any" value="${robtItem.x2x0 || ''}"/></td>
            <td><input type="number" name="robt_x3x0" class="input" step="any" value="${robtItem.x3x0 || ''}"/></td>
        </tr>`;
    let resIsolamentoRows = '';
    const riTerminais = ["AT x BT", "AT x MASSA (BT)", "BT x MASSA (AT)"];
    riTerminais.forEach((terminal, i) => {
        const riItem = data.resIsolamento?.[i] || {};
        resIsolamentoRows += `
            <tr>
                <td><input type="text" name="ri_terminais_${i}" class="input" value="${terminal}" readonly/></td>
                <td><input type="number" name="ri_tensao_ensaio_${i}" class="input" value="${riItem.tensao_ensaio || '5000'}" step="any"/></td>
                <td><input type="number" name="ri_val_medido_${i}" class="input" step="any" value="${riItem.val_medido || ''}"/></td>
                <td><input type="number" name="ri_tempo_s_${i}" class="input" value="${riItem.tempo_s || '60'}" step="any"/></td>
            </tr>`;
    });
    let fpTrafoRows = '';
    const fpTrafoConfigs = [ 
        {n:1, hv:'AT', lv_r:'BT', guard:'M', ch_pos:'UST'}, {n:2, hv:'AT', lv_r:'BT', guard:'M', ch_pos:'GST'},
        {n:3, hv:'AT', lv_r:'BT+M', guard:'-', ch_pos:'GND'}, {n:4, hv:'BT', lv_r:'AT', guard:'M', ch_pos:'UST'},
        {n:5, hv:'BT', lv_r:'AT', guard:'M', ch_pos:'GST'}, {n:6, hv:'BT', lv_r:'AT+M', guard:'-', ch_pos:'GND'}
    ];
    fpTrafoConfigs.forEach((cfg, i) => {
        const fptItem = data.fpTrafo?.[i] || {};
         fpTrafoRows += `
            <tr>
                <td><input type="text" name="fpt_n_${i}" value="${cfg.n}" class="input" readonly/></td>
                <td><input type="text" name="fpt_hv_${i}" value="${fptItem.hv || cfg.hv}" class="input"/></td>
                <td><input type="text" name="fpt_lv_r_${i}" value="${fptItem.lv_r || cfg.lv_r}" class="input"/></td>
                <td><input type="text" name="fpt_guard_${i}" value="${fptItem.guard || cfg.guard}" class="input"/></td>
                <td><input type="text" name="fpt_ch_pos_${i}" value="${fptItem.ch_pos || cfg.ch_pos}" class="input"/></td>
                <td><input type="number" name="fpt_ma_${i}" class="input" step="any" value="${fptItem.ma || ''}"/></td>
                <td><input type="number" name="fpt_watts_${i}" class="input" step="any" value="${fptItem.watts || ''}"/></td>
                <td><input type="number" name="fpt_fp_med_${i}" class="input" step="any" value="${fptItem.fp_med || ''}"/></td>
                <td><input type="number" name="fpt_fp_corr_${i}" class="input" step="any" value="${fptItem.fp_corr || ''}"/></td>
                <td><input type="number" name="fpt_cap_med_${i}" class="input" step="any" value="${fptItem.cap_med || ''}"/></td>
                <td><input type="text" name="fpt_cap_fab_${i}" class="input" value="${fptItem.cap_fab || ''}"/></td>
            </tr>`;
    });
    let fpBuchasRows = '';
    const fpBuchasConfigs = ["H1", "H2", "H3"]; 
     fpBuchasConfigs.forEach((serie, i) => {
         const fpbItem = data.fpBuchas?.[i] || {};
         fpBuchasRows += `
            <tr>
                <td><input type="text" name="fpb_n_serie_${i}" value="${serie}" class="input" readonly/></td>
                <td><input type="text" name="fpb_hv_${i}" value="${fpbItem.hv || 'AT'}" class="input"/></td>
                <td><input type="text" name="fpb_lv_r_${i}" value="${fpbItem.lv_r || (serie === 'H3' ? 'BT+M' : 'BT')}" class="input"/></td>
                <td><input type="text" name="fpb_ch_pos_${i}" value="${fpbItem.ch_pos || 'UST'}" class="input"/></td>
                <td><input type="number" name="fpb_ma_${i}" class="input" step="any" value="${fpbItem.ma || ''}"/></td>
                <td><input type="number" name="fpb_watts_${i}" class="input" step="any" value="${fpbItem.watts || ''}"/></td>
                <td><input type="number" name="fpb_fp_med_${i}" class="input" step="any" value="${fpbItem.fp_med || ''}"/></td>
                <td><input type="number" name="fpb_fp_corr_${i}" class="input" step="any" value="${fpbItem.fp_corr || ''}"/></td>
                <td><input type="number" name="fpb_cap_med_${i}" class="input" step="any" value="${fpbItem.cap_med || ''}"/></td>
                <td><input type="text" name="fpb_cap_fab_${i}" class="input" value="${fpbItem.cap_fab || ''}"/></td>
            </tr>`;
    });
    let correnteExcitacaoRows = '';
    const ceFases = ["H1-H3", "H2-H1", "H3-H2"];
    ceFases.forEach((fase, i) => {
        const ceItem = data.correnteExcitacao?.[i] || {};
        correnteExcitacaoRows += `
            <tr>
                <td><input type="text" name="ce_fase_${i}" value="${fase}" class="input" readonly/></td>
                <td><input type="number" name="ce_tensao_kv_${i}" value="${ceItem.tensao_kv || '10'}" class="input" step="any"/></td>
                <td><input type="number" name="ce_ma_${i}" class="input" step="any" value="${ceItem.ma || ''}"/></td>
            </tr>`;
    });
    formContent = `
        <h3 class="main-title">TRANSFORMADOR DE POTÊNCIA DE ALTA TENSÃO</h3>
        <div class="identificacao-grid">
            <div class="form-group"><label for="localizacaoTPOT">LOCALIZAÇÃO</label><input type="text" id="localizacaoTPOT" name="localizacaoTPOT" class="input" value="${data.localizacao || ''}"></div>
            <div class="form-group"><label for="tipoTPOT">TIPO</label><input type="text" id="tipoTPOT" name="tipoTPOT" class="input" value="${data.tipo || ''}"></div>
            <div class="form-group"><label for="fabricanteTPOT">FABRICANTE</label><input type="text" id="fabricanteTPOT" name="fabricanteTPOT" class="input" value="${data.fabricante || ''}"></div>
            <div class="form-group"><label for="numSerieTPOT">N° SÉRIE</label><input type="text" id="numSerieTPOT" name="numSerieTPOT" class="input" value="${data.numSerie || ''}"></div>
            <div class="form-group"><label for="meioIsolanteTPOT">MEIO ISOLANTE</label><input type="text" id="meioIsolanteTPOT" name="meioIsolanteTPOT" class="input" value="${data.meioIsolante || 'ÓLEO MINERAL'}"></div>
            <div class="form-group"><label for="anoFabricacaoTPOT">ANO DE FABRICAÇÃO</label><input type="number" id="anoFabricacaoTPOT" name="anoFabricacaoTPOT" class="input" min="1900" max="2100" value="${data.anoFabricacao || ''}"></div>
            <div class="form-group"><label for="massaTPOT">Massa (Kg)</label><input type="number" id="massaTPOT" name="massaTPOT" class="input" step="any" value="${data.massa || ''}"></div>
            <div class="form-group"><label for="potenciaTPOT">POTÊNCIA (MVA)</label><input type="text" id="potenciaTPOT" name="potenciaTPOT" class="input" value="${data.potencia || ''}"></div>
            <div class="form-group"><label for="tensaoAT_X_TPOT">TENSÃO AT: Δ(X) (V)</label><input type="number" id="tensaoAT_X_TPOT" name="tensaoAT_X_TPOT" class="input" step="any" value="${data.tensaoAT_X || ''}"></div>
            <div class="form-group"><label for="tensaoAT_Y_TPOT">TENSÃO AT: Y( ) (V)</label><input type="number" id="tensaoAT_Y_TPOT" name="tensaoAT_Y_TPOT" class="input" step="any" value="${data.tensaoAT_Y || ''}"></div>
            <div class="form-group"><label for="tensaoBT_D_TPOT">TENSÃO BT: Δ( ) (V)</label><input type="number" id="tensaoBT_D_TPOT" name="tensaoBT_D_TPOT" class="input" step="any" value="${data.tensaoBT_D || ''}"></div>
            <div class="form-group"><label for="tensaoBT_Y_TPOT">TENSÃO BT: Y(X) (V)</label><input type="number" id="tensaoBT_Y_TPOT" name="tensaoBT_Y_TPOT" class="input" step="any" value="${data.tensaoBT_Y || ''}"></div>
            <div class="form-group"><label for="volumeOleoTPOT">VOLUME DO ÓLEO ISOLANTE (L)</label><input type="number" id="volumeOleoTPOT" name="volumeOleoTPOT" class="input" step="any" value="${data.volumeOleo || ''}"></div>
            <div class="form-group"><label for="temperaturaEnsaioTPOT">TEMPERATURA DE ENSAIO (°C)</label><input type="number" id="temperaturaEnsaioTPOT" name="temperaturaEnsaioTPOT" class="input" step="0.1" value="${data.temperaturaEnsaio || ''}"></div>
            <div class="form-group"><label for="umidadeRelativaTPOT">UMIDADE RELATIVA AR (%)</label><input type="number" id="umidadeRelativaTPOT" name="umidadeRelativaTPOT" class="input" step="0.1" value="${data.umidadeRelativa || ''}"></div>
            <div class="form-group"><label for="impedanciaTPOT">IMPEDÂNCIA A 75°C (%)</label><input type="text" id="impedanciaTPOT" name="impedanciaTPOT" class="input" value="${data.impedancia || ''}"></div>
        </div>
        <h4 class="section-title">SERVIÇOS</h4>
        <div class="servicos-list">${servicosHTML}</div>
        <h4 class="section-title">RELAÇÃO DE TRANSFORMAÇÃO</h4>
        <div class="table-container"><table><thead><tr><th colspan="2">Tap. Comutador</th><th colspan="2">Tensões (V)</th><th rowspan="2">Relação Calculada (AT/BT*√3)</th><th colspan="3">Relação Medida</th></tr><tr><th>AT</th><th>BT</th><th>AT</th><th>BT</th><th>H1-H3 / X1-X0</th><th>H2-H1 / X2-X0</th><th>H3-H2 / X3-X0</th></tr></thead><tbody>${relacaoTransfRows}</tbody></table></div>
        <h4 class="section-title">RESISTÊNCIA ÔHMICA DOS ENROLAMENTOS DE AT (Ω)</h4>
        <div class="table-container"><table><thead><tr><th>Tap Comutador</th><th>Tensão AT (V)</th><th>H1-H3</th><th>H2-H1</th><th>H3-H2</th></tr></thead><tbody>${resOhmicaATRows}</tbody></table></div>
        <h4 class="section-title">RESISTÊNCIA ÔHMICA DOS ENROLAMENTOS DE BT (mΩ)</h4>
        <div class="table-container"><table><thead><tr><th>Tap Comutador</th><th>Tensão BT (V)</th><th>X1-X0</th><th>X2-X0</th><th>X3-X0</th></tr></thead><tbody>${resOhmicaBTRows}</tbody></table></div>
        <h4 class="section-title">RESISTÊNCIA DE ISOLAMENTO (MΩ)</h4>
        <div class="table-container"><table><thead><tr><th>Terminais de Medição</th><th>Tensão de Ensaio (Vcc)</th><th>Valores Medidos (MΩ)</th><th>Tempo (s)</th></tr></thead><tbody>${resIsolamentoRows}</tbody></table></div>
        <h4 class="section-title">FATOR DE POTÊNCIA DE ISOLAMENTO DO TRANSFORMADOR À 10kV</h4>
        <p class="table-note">FP% = (W x 10) / mA</p>
        <div class="table-container"><table><thead><tr><th rowspan="2">N°</th><th colspan="3">Configuração</th><th rowspan="2">CH Posição</th><th rowspan="2">mA</th><th rowspan="2">Watts</th><th colspan="2">FP%</th><th colspan="2">Capacitância (pF)</th></tr><tr><th>HV</th><th>LV-R</th><th>Guard</th><th>Med.</th><th>Corr. 20°C</th><th>Medido</th><th>Fab.</th></tr></thead><tbody>${fpTrafoRows}</tbody></table></div>
        <h4 class="section-title">FATOR DE POTÊNCIA DE ISOLAMENTO DAS BUCHAS 10kV</h4>
        <p class="table-note">FP% = (W x 10) / mA</p>
        <div class="table-container"><table><thead><tr><th rowspan="2">N° Série</th><th colspan="2">Configuração</th><th rowspan="2">CH Posição</th><th rowspan="2">mA</th><th rowspan="2">Watts</th><th colspan="2">FP%</th><th colspan="2">Capacitância (pF)</th></tr><tr><th>HV</th><th>LV-R</th><th>Med.</th><th>Corr. 20°C</th><th>Medido</th><th>Fab.</th></tr></thead><tbody>${fpBuchasRows}</tbody></table></div>
        <h4 class="section-title">ENSAIO DE CORRENTE DE EXCITAÇÃO</h4>
        <div class="table-container"><table><thead><tr><th>Fase</th><th>Tensão (kV)</th><th>mA</th></tr></thead><tbody>${correnteExcitacaoRows}</tbody></table></div>
        <div class="form-section-sm nao-conformidade-container" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
    <div class="form-group-inline">
        <input type="checkbox" id="naoConformeCheck" name="naoConformeCheck" class="nao-conforme-checkbox" ${isNaoConforme ? 'checked' : ''}>
        <label for="naoConformeCheck" class="nao-conforme-label">EQUIPAMENTO NÃO CONFORME</label>
    </div>
    <div class="form-group full-width nao-conforme-descricao" style="display: ${isNaoConforme ? 'block' : 'none'}; margin-top: 10px;">
        <label for="naoConformeDescricao">Descrever a Não Conformidade</label>
        <textarea id="naoConformeDescricao" name="naoConformeDescricao" class="input" rows="3" placeholder="Ex: Isoladores trincados, vazamento de óleo, conexões oxidadas...">${naoConformeDesc}</textarea>
    </div>
</div>
        <div class="form-group" style="margin-top:24px;"><label for="observacoesTPOT">OBSERVAÇÕES</label><textarea id="observacoesTPOT" name="observacoesTPOT" class="input" rows="4">${data.observacoes || ''}</textarea></div>
    `;
    formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
    break;
}
case 'disjuntor_de_alta_tensao': {
            // Coleta dados de identificação em qualquer modo
            dadosMedicao.localizacao = form.querySelector("#localizacaoDJAT")?.value.trim();
            dadosMedicao.tipo = form.querySelector("#tipoDJAT")?.value.trim();
            dadosMedicao.fabricante = form.querySelector("#fabricanteDJAT")?.value.trim();
            dadosMedicao.numSerie = form.querySelector("#numSerieDJAT")?.value.trim();
            dadosMedicao.meioIsolante = form.querySelector("#meioIsolanteDJAT")?.value.trim();
            dadosMedicao.tensaoNominal = form.querySelector("#tensaoNominalDJAT")?.value;
            dadosMedicao.correnteNominal = form.querySelector("#correnteNominalDJAT")?.value;
            dadosMedicao.temperaturaEnsaio = form.querySelector("#temperaturaEnsaioDJAT")?.value;
            dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativaDJAT")?.value;
            const pressaoTipoSelecionado = form.querySelector('input[name="pressaoTipoDJAT"]:checked')?.value;
            dadosMedicao.pressao = {
                tipo: pressaoTipoSelecionado,
                valor: form.querySelector('#pressaoValorDJAT')?.value
            };
            dadosMedicao.observacoes = form.querySelector("#observacoesDJAT")?.value.trim();
            
            // Só coleta dados de medição no modo 'full'
            if (mode === 'full') {
                const polos = ['a', 'b', 'c'];
                dadosMedicao.resContatoFechado = [];
                polos.forEach(p => {
                    dadosMedicao.resContatoFechado.push({
                        polo: p.toUpperCase(),
                        disjuntor_fechado: form.querySelector(`input[name="rcf_disjuntor_fechado_${p}"]`)?.value,
                        corrente_aplicada: form.querySelector(`input[name="rcf_corrente_aplicada_${p}"]`)?.value,
                        valor_medido: form.querySelector(`input[name="rcf_valor_medido_${p}"]`)?.value,
                        valor_referencia: form.querySelector(`input[name="rcf_valor_referencia_${p}"]`)?.value,
                        tempo: form.querySelector(`input[name="rcf_tempo_${p}"]`)?.value,
                    });
                });
                dadosMedicao.resContatoAberto = [];
                polos.forEach(p => {
                    dadosMedicao.resContatoAberto.push({
                        polo: p.toUpperCase(),
                        disjuntor_aberto: form.querySelector(`input[name="rca_disjuntor_aberto_${p}"]`)?.value,
                        tensao_aplicada: form.querySelector(`input[name="rca_tensao_aplicada_${p}"]`)?.value,
                        valor_medido: form.querySelector(`input[name="rca_valor_medido_${p}"]`)?.value,
                        valor_referencia: form.querySelector(`input[name="rca_valor_referencia_${p}"]`)?.value,
                        tempo: form.querySelector(`input[name="rca_tempo_${p}"]`)?.value,
                    });
                });
                dadosMedicao.resIsolamentoFechado = [];
                polos.forEach(p => {
                    dadosMedicao.resIsolamentoFechado.push({
                        polo: p.toUpperCase(),
                        disjuntor_fechado: form.querySelector(`input[name="rifm_disjuntor_fechado_${p}"]`)?.value,
                        tensao_aplicada: form.querySelector(`input[name="rifm_tensao_aplicada_${p}"]`)?.value,
                        valor_medido: form.querySelector(`input[name="rifm_valor_medido_${p}"]`)?.value,
                        valor_referencia: form.querySelector(`input[name="rifm_valor_referencia_${p}"]`)?.value,
                        tempo: form.querySelector(`input[name="rifm_tempo_${p}"]`)?.value,
                    });
                });
                dadosMedicao.fpAberto = [];
                polos.forEach((p, i) => {
                    dadosMedicao.fpAberto.push({
                        polo: p.toUpperCase(),
                        hv: form.querySelector(`input[name="fpa_hv_${i}"]`)?.value,
                        lv_r: form.querySelector(`input[name="fpa_lv_r_${i}"]`)?.value,
                        ch_posicao: form.querySelector(`input[name="fpa_ch_posicao_${i}"]`)?.value,
                        ma: form.querySelector(`input[name="fpa_ma_${i}"]`)?.value,
                        watts: form.querySelector(`input[name="fpa_watts_${i}"]`)?.value,
                        fp_med: form.querySelector(`input[name="fpa_fp_med_${i}"]`)?.value,
                        fp_corr: form.querySelector(`input[name="fpa_fp_corr_${i}"]`)?.value,
                        capacitancia: form.querySelector(`input[name="fpa_capacitancia_${i}"]`)?.value,
                    });
                });
                dadosMedicao.fpFechado = [];
                polos.forEach((p, i) => {
                    dadosMedicao.fpFechado.push({
                        polo: p.toUpperCase(),
                        hv: form.querySelector(`input[name="fpf_hv_${i}"]`)?.value,
                        lv_r: form.querySelector(`input[name="fpf_lv_r_${i}"]`)?.value,
                        ch_posicao: form.querySelector(`input[name="fpf_ch_posicao_${i}"]`)?.value,
                        ma: form.querySelector(`input[name="fpf_ma_${i}"]`)?.value,
                        watts: form.querySelector(`input[name="fpf_watts_${i}"]`)?.value,
                        fp_med: form.querySelector(`input[name="fpf_fp_med_${i}"]`)?.value,
                        fp_corr: form.querySelector(`input[name="fpf_fp_corr_${i}"]`)?.value,
                        capacitancia: form.querySelector(`input[name="fpf_capacitancia_${i}"]`)?.value,
                    });
                });
                const servicosLabels = ["Limpeza geral", "Lubrificação dos componentes", "Testes de acionamento elétricos", "Reaperto das Conexões elétricas"];
                dadosMedicao.servicos = [];
                servicosLabels.forEach((label, index) => {
                    const name = `servico_dj_at_${index}`;
                    dadosMedicao.servicos.push({
                        label: label,
                        valor: form.querySelector(`input[name="${name}"]:checked`)?.value || 'N/A'
                    });
                });
            }

            // Coleta não conformidade em qualquer modo
            dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
            if (dadosMedicao.naoConforme) {
                dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
            } else {
                dadosMedicao.naoConformeDescricao = "";
            }
            break;
        }

        case 'chave_seccionadora_de_alta_tensao': {
    const polos = ['A', 'B', 'C'];
    
    let resContatosRows = '';
    polos.forEach((polo, i) => {
        const item = data.resistenciaContatos?.[i] || {};
        resContatosRows += `
            <tr>
                <td><input type="text" name="rc_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly /></td>
                <td><input type="text" name="rc_seccionadora_${polo.toLowerCase()}" value="${item.seccionadora || 'Entrada - Saída'}" class="input" /></td>
                <td><input type="number" name="rc_corrente_${polo.toLowerCase()}" class="input" value="${item.corrente || '10'}" step="any"/></td>
                <td><input type="number" name="rc_medido_${polo.toLowerCase()}" class="input" step="any" value="${item.medido || ''}"/></td>
                <td><input type="text" name="rc_referencia_${polo.toLowerCase()}" class="input" value="${item.referencia || '≤300'}"/></td>
                <td><input type="number" name="rc_tempo_${polo.toLowerCase()}" class="input" value="${item.tempo || '60'}" step="any"/></td>
            </tr>`;
    });

    let resIsolamentoRows = '';
    polos.forEach((polo, i) => {
        const item = data.resistenciaIsolamento?.[i] || {};
        resIsolamentoRows += `
            <tr>
                <td><input type="text" name="ri_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly /></td>
                <td><input type="text" name="ri_seccionadora_${polo.toLowerCase()}" value="${item.seccionadora || (polo + ' x Massa')}" class="input" /></td>
                <td><input type="number" name="ri_tensao_${polo.toLowerCase()}" class="input" value="${item.tensao || '5000'}" step="any"/></td>
                <td><input type="number" name="ri_medido_${polo.toLowerCase()}" class="input" step="any" value="${item.medido || ''}"/></td>
                <td><input type="text" name="ri_referencia_${polo.toLowerCase()}" class="input" value="${item.referencia || '≥1000'}"/></td>
                <td><input type="number" name="ri_tempo_${polo.toLowerCase()}" class="input" value="${item.tempo || '60'}" step="any"/></td>
            </tr>`;
    });
    
    const servicos = ["Limpeza geral", "Alinhamento dos contatos de abertura e fechamento", "Testes de acionamento elétricos", "Lubrificação dos mecanismos e reaperto das Conexões elétricas"];
    let servicosHTML = '';
    servicos.forEach((servico, index) => {
        const name = `servico_csat_${index}`;
        const valorSalvo = data.servicos?.[index]?.valor;
        servicosHTML += `
            <div class="servico-item">
                <label>${servico}</label>
                <div class="servico-options">
                    <label><input type="radio" name="${name}" value="Sim" required ${valorSalvo === 'Sim' ? 'checked' : ''}> Sim</label>
                    <label><input type="radio" name="${name}" value="Não" ${valorSalvo === 'Não' ? 'checked' : ''}> Não</label>
                    <label><input type="radio" name="${name}" value="N/A" ${valorSalvo === 'N/A' || !valorSalvo ? 'checked' : ''}> N/A</label>
                </div>
            </div>`;
    });

    formContent = `
        <h3 class="main-title">CHAVE SECCIONADORA DE ALTA TENSÃO</h3>
        <div class="identificacao-grid">
            <div class="form-group"><label for="localizacaoCSAT">LOCALIZAÇÃO</label><input type="text" id="localizacaoCSAT" value="${data.localizacao || ''}"></div>
            <div class="form-group"><label for="identificacaoCSAT">IDENTIFICAÇÃO</label><input type="text" id="identificacaoCSAT" value="${data.identificacao || ''}"></div>
            <div class="form-group"><label for="tipoCSAT">TIPO</label><input type="text" id="tipoCSAT" value="${data.tipo || ''}"></div>
            <div class="form-group"><label for="fabricanteCSAT">FABRICANTE</label><input type="text" id="fabricanteCSAT" value="${data.fabricante || ''}"></div>
            <div class="form-group"><label for="numSerieCSAT">N° SÉRIE</label><input type="text" id="numSerieCSAT" value="${data.numSerie || ''}"></div>
            <div class="form-group"><label for="tensaoNominalCSAT">TENSÃO NOMINAL (kV)</label><input type="text" id="tensaoNominalCSAT" value="${data.tensaoNominal || ''}"></div>
            <div class="form-group"><label for="correnteNominalCSAT">CORRENTE NOMINAL (A)</label><input type="text" id="correnteNominalCSAT" value="${data.correnteNominal || ''}"></div>
            <div class="form-group"><label for="temperaturaEnsaioCSAT">TEMPERATURA DE ENSAIO (°C)</label><input type="text" id="temperaturaEnsaioCSAT" value="${data.temperaturaEnsaio || ''}"></div>
            <div class="form-group"><label for="umidadeRelativaCSAT">UMIDADE RELATIVA AR (%)</label><input type="text" id="umidadeRelativaCSAT" value="${data.umidadeRelativa || ''}"></div>
        </div>

        <h4 class="section-title">RESISTÊNCIA DE CONTATO (µΩ)</h4>
        <div class="table-container"><table><thead><tr><th>Polos</th><th>Seccionadora fechada</th><th>Corrente Aplicada (A)</th><th>Valores medidos (µΩ)</th><th>Valores de referência (µΩ)</th><th>Tempo (s)</th></tr></thead><tbody>${resContatosRows}</tbody></table></div>
        
        <h4 class="section-title">RESISTÊNCIA DE ISOLAMENTO (MΩ)</h4>
        <div class="table-container"><table><thead><tr><th>Polos</th><th>Seccionadora fechada</th><th>Tensão Ensaio (Vcc)</th><th>Valores medidos (MΩ)</th><th>Valores de referência (MΩ)</th><th>Tempo (s)</th></tr></thead><tbody>${resIsolamentoRows}</tbody></table></div>
        
        <h4 class="section-title">SERVIÇOS</h4>
        <div class="servicos-list">${servicosHTML}</div>
        <div class="form-section-sm nao-conformidade-container" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
    <div class="form-group-inline">
        <input type="checkbox" id="naoConformeCheck" name="naoConformeCheck" class="nao-conforme-checkbox" ${isNaoConforme ? 'checked' : ''}>
        <label for="naoConformeCheck" class="nao-conforme-label">EQUIPAMENTO NÃO CONFORME</label>
    </div>
    <div class="form-group full-width nao-conforme-descricao" style="display: ${isNaoConforme ? 'block' : 'none'}; margin-top: 10px;">
        <label for="naoConformeDescricao">Descrever a Não Conformidade</label>
        <textarea id="naoConformeDescricao" name="naoConformeDescricao" class="input" rows="3" placeholder="Ex: Isoladores trincados, vazamento de óleo, conexões oxidadas...">${naoConformeDesc}</textarea>
    </div>
</div>
        <div class="form-group" style="margin-top:24px;"><label for="observacoesCSAT">OBSERVAÇÕES</label><textarea id="observacoesCSAT" rows="4">${data.observacoes || ''}</textarea></div>
    `;
    formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
    break;
}
        case 'chave_seccionadora_de_media_tensao': {
            // HTML da Identificação (sempre visível)
            const identificacaoHTML = `
                <div class="identificacao-grid">
                    <div class="form-group"><label for="localizacao">LOCALIZAÇÃO</label><input type="text" id="localizacao" name="localizacao" class="input" value="${data.localizacao || ''}"></div>
                    <div class="form-group"><label for="identificacao">IDENTIFICAÇÃO</label><input type="text" id="identificacao" name="identificacao" class="input" value="${data.identificacao || ''}"></div>
                    <div class="form-group"><label for="tipo">TIPO</label><input type="text" id="tipo" name="tipo" class="input" value="${data.tipo || ''}"></div>
                    <div class="form-group"><label for="fabricante">FABRICANTE</label><input type="text" id="fabricante" name="fabricante" class="input" value="${data.fabricante || ''}"></div>
                    <div class="form-group"><label for="numSerie">N° SÉRIE</label><input type="text" id="numSerie" name="numSerie" class="input" value="${data.numSerie || ''}"></div>
                    <div class="form-group"><label for="tag">TAG</label><input type="text" id="tag" name="tag" class="input" value="${data.tag || ''}"></div>
                    <div class="form-group"><label for="tensaoNominal">TENSÃO NOMINAL (kV)</label><input type="number" id="tensaoNominal" name="tensaoNominal" class="input" step="0.1" value="${data.tensaoNominal || ''}"></div>
                    <div class="form-group"><label for="correnteNominal">CORRENTE NOMINAL (A)</label><input type="number" id="correnteNominal" name="correnteNominal" class="input" value="${data.correnteNominal || ''}"></div>
                    <div class="form-group"><label for="temperaturaEnsaio">TEMPERATURA DE ENSAIO (°C)</label><input type="number" id="temperaturaEnsaio" name="temperaturaEnsaio" class="input" step="0.1" value="${data.temperaturaEnsaio || ''}"></div>
                    <div class="form-group"><label for="umidadeRelativa">UMIDADE RELATIVA AR (%)</label><input type="number" id="umidadeRelativa" name="umidadeRelativa" class="input" step="0.1" value="${data.umidadeRelativa || ''}"></div>
                    <div class="form-group"><label for="anoFabricacao">ANO FABRICAÇÃO</label><input type="number" id="anoFabricacao" name="anoFabricacao" class="input" min="1900" max="2100" value="${data.anoFabricacao || ''}"></div>
                </div>
            `;

            // HTML das Medições (visível apenas no modo 'full')
            let medicoesHTML = '';
            if (mode === 'full') {
                medicoesHTML = `
                    <h4 class="section-title">RESISTÊNCIA DOS CONTATOS (μΩ)</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr><th>Polos</th><th>Seccionadora Fechada</th><th>Corrente Aplicada (A)</th><th>Valores Medidos (μΩ)</th><th>Valores de Referências (μΩ)</th><th>Tempo (s)</th></tr>
                            </thead>
                            <tbody>
                                ${['A', 'B', 'C'].map((polo, i) => `
                                <tr>
                                    <td><input type="text" name="rc_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly /></td>
                                    <td><input type="text" name="rc_seccionadora_${polo.toLowerCase()}" value="${data.resistenciaContatos?.[i]?.seccionadora || 'Entrada - Saída'}" class="input" /></td>
                                    <td><input type="number" name="rc_corrente_${polo.toLowerCase()}" class="input" step="0.1" value="${data.resistenciaContatos?.[i]?.corrente || ''}"/></td>
                                    <td><input type="number" name="rc_medido_${polo.toLowerCase()}" class="input" step="0.01" value="${data.resistenciaContatos?.[i]?.medido || ''}"/></td>
                                    <td><input type="text" name="rc_referencia_${polo.toLowerCase()}" class="input" value="${data.resistenciaContatos?.[i]?.referencia || '≤300'}" /></td>
                                    <td><input type="number" name="rc_tempo_${polo.toLowerCase()}" class="input" value="${data.resistenciaContatos?.[i]?.tempo || '60'}" /></td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                    <h4 class="section-title">RESISTÊNCIA DO ISOLAMENTO (MΩ)</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr><th>Polos</th><th>Seccionadora Fechada</th><th>Tensão Ensaio VCC</th><th>Valores Medidos (MΩ)</th><th>Valores de Referências (MΩ)</th><th>Tempo (s)</th></tr>
                            </thead>
                            <tbody>
                                ${['A', 'B', 'C'].map((polo, i) => `
                                <tr>
                                    <td><input type="text" name="ri_polo_${polo.toLowerCase()}" value="${polo}" class="input" readonly/></td>
                                    <td><input type="text" name="ri_seccionadora_${polo.toLowerCase()}" value="${data.resistenciaIsolamento?.[i]?.seccionadora || (polo + ' x Massa')}" class="input" /></td>
                                    <td><input type="number" name="ri_tensao_${polo.toLowerCase()}" class="input" value="${data.resistenciaIsolamento?.[i]?.tensao || '5000'}" /></td>
                                    <td><input type="number" name="ri_medido_${polo.toLowerCase()}" class="input" step="0.1" value="${data.resistenciaIsolamento?.[i]?.medido || ''}"/></td>
                                    <td><input type="text" name="ri_referencia_${polo.toLowerCase()}" class="input" value="${data.resistenciaIsolamento?.[i]?.referencia || '≥1000'}" /></td>
                                    <td><input type="number" name="ri_tempo_${polo.toLowerCase()}" class="input" value="${data.resistenciaIsolamento?.[i]?.tempo || '60'}" /></td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }

            // Montagem final do conteúdo do formulário
            formContent = `
                <h3 class="main-title">CHAVE SECCIONADORA DE MÉDIA TENSÃO</h3>
                ${identificacaoHTML}
                ${medicoesHTML}
                <div class="form-section-sm nao-conformidade-container" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    <div class="form-group-inline">
                        <input type="checkbox" id="naoConformeCheck" name="naoConformeCheck" class="nao-conforme-checkbox" ${isNaoConforme ? 'checked' : ''}>
                        <label for="naoConformeCheck" class="nao-conforme-label">EQUIPAMENTO NÃO CONFORME</label>
                    </div>
                    <div class="form-group full-width nao-conforme-descricao" style="display: ${isNaoConforme ? 'block' : 'none'}; margin-top: 10px;">
                        <label for="naoConformeDescricao">Descrever a Não Conformidade</label>
                        <textarea id="naoConformeDescricao" name="naoConformeDescricao" class="input" rows="3" placeholder="Ex: Isoladores trincados, vazamento de óleo, conexões oxidadas...">${naoConformeDesc}</textarea>
                    </div>
                </div>
                <div class="form-group" style="margin-top:24px;"><label for="observacoes">OBSERVAÇÕES</label><textarea id="observacoes" name="observacoes" class="input" rows="4">${data.observacoes || ''}</textarea></div>
            `;
            formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
            break;
        }
        case 'tp_transformador_de_potencial':
        case 'transformadores_de_potencia':
        case 'transformador_de_potencia_de_alta_tensao': {
            // Parte 1: HTML da Identificação (sempre visível)
            const identificacaoHTML = `
                <div class="identificacao-grid">
                    <div class="form-group"><label for="localizacaoTPOT">LOCALIZAÇÃO</label><input type="text" id="localizacaoTPOT" name="localizacaoTPOT" class="input" value="${data.localizacao || ''}"></div>
                    <div class="form-group"><label for="tipoTPOT">TIPO</label><input type="text" id="tipoTPOT" name="tipoTPOT" class="input" value="${data.tipo || ''}"></div>
                    <div class="form-group"><label for="fabricanteTPOT">FABRICANTE</label><input type="text" id="fabricanteTPOT" name="fabricanteTPOT" class="input" value="${data.fabricante || ''}"></div>
                    <div class="form-group"><label for="numSerieTPOT">N° SÉRIE</label><input type="text" id="numSerieTPOT" name="numSerieTPOT" class="input" value="${data.numSerie || ''}"></div>
                    <div class="form-group"><label for="meioIsolanteTPOT">MEIO ISOLANTE</label><input type="text" id="meioIsolanteTPOT" name="meioIsolanteTPOT" class="input" value="${data.meioIsolante || 'ÓLEO MINERAL'}"></div>
                    <div class="form-group"><label for="anoFabricacaoTPOT">ANO DE FABRICAÇÃO</label><input type="number" id="anoFabricacaoTPOT" name="anoFabricacaoTPOT" class="input" min="1900" max="2100" value="${data.anoFabricacao || ''}"></div>
                    <div class="form-group"><label for="massaTPOT">Massa (Kg)</label><input type="number" id="massaTPOT" name="massaTPOT" class="input" step="any" value="${data.massa || ''}"></div>
                    <div class="form-group"><label for="potenciaTPOT">POTÊNCIA (MVA)</label><input type="text" id="potenciaTPOT" name="potenciaTPOT" class="input" value="${data.potencia || ''}"></div>
                    <div class="form-group"><label for="tensaoAT_X_TPOT">TENSÃO AT: Δ(X) (V)</label><input type="number" id="tensaoAT_X_TPOT" name="tensaoAT_X_TPOT" class="input" step="any" value="${data.tensaoAT_X || ''}"></div>
                    <div class="form-group"><label for="tensaoAT_Y_TPOT">TENSÃO AT: Y( ) (V)</label><input type="number" id="tensaoAT_Y_TPOT" name="tensaoAT_Y_TPOT" class="input" step="any" value="${data.tensaoAT_Y || ''}"></div>
                    <div class="form-group"><label for="tensaoBT_D_TPOT">TENSÃO BT: Δ( ) (V)</label><input type="number" id="tensaoBT_D_TPOT" name="tensaoBT_D_TPOT" class="input" step="any" value="${data.tensaoBT_D || ''}"></div>
                    <div class="form-group"><label for="tensaoBT_Y_TPOT">TENSÃO BT: Y(X) (V)</label><input type="number" id="tensaoBT_Y_TPOT" name="tensaoBT_Y_TPOT" class="input" step="any" value="${data.tensaoBT_Y || ''}"></div>
                    <div class="form-group"><label for="volumeOleoTPOT">VOLUME DO ÓLEO ISOLANTE (L)</label><input type="number" id="volumeOleoTPOT" name="volumeOleoTPOT" class="input" step="any" value="${data.volumeOleo || ''}"></div>
                    <div class="form-group"><label for="temperaturaEnsaioTPOT">TEMPERATURA DE ENSAIO (°C)</label><input type="number" id="temperaturaEnsaioTPOT" name="temperaturaEnsaioTPOT" class="input" step="0.1" value="${data.temperaturaEnsaio || ''}"></div>
                    <div class="form-group"><label for="umidadeRelativaTPOT">UMIDADE RELATIVA AR (%)</label><input type="number" id="umidadeRelativaTPOT" name="umidadeRelativaTPOT" class="input" step="0.1" value="${data.umidadeRelativa || ''}"></div>
                    <div class="form-group"><label for="impedanciaTPOT">IMPEDÂNCIA A 75°C (%)</label><input type="text" id="impedanciaTPOT" name="impedanciaTPOT" class="input" value="${data.impedancia || ''}"></div>
                </div>
            `;

            // Parte 2: HTML das Medições (visível apenas no modo 'full')
            let medicoesHTML = '';
            if (mode === 'full') {
                const servicos = ["Inspeção visual geral do equipamento", "Limpeza das Buchas", "Reaperto de todas as conexões", "Inspeção da fiação e parafusos quanto a corrosão e contato elétrico", "Inspeção do aterramento do transformador", "Atuação dos contatos do termômetro do óleo isolante – Alarme e Desligamento", "Atuação dos contatos do termômetro dos enrolamentos – VF, Alarme e Desligamento", "Atuação dos contatos do indicador de nível de óleo Máximo e Mínimo", "Atuação dos contatos do relé de gás – Alarme e Desligamento", "Atuação dos Contatos do Dispositivo de alivio de pressão", "Inspeção do sistema de ventilação forçada", "Substituição da sílica gel", "Complemento do nível do óleo, se necessário"];
                let servicosHTMLContent = '';
                servicos.forEach((servico, index) => {
                    const name = `servico_tpat_${index}`;
                    const valorSalvo = data.servicos?.[index]?.valor;
                    servicosHTMLContent += `<div class="servico-item"><label>${servico}</label><div class="servico-options"><label><input type="radio" name="${name}" value="Sim" required ${valorSalvo === 'Sim' ? 'checked' : ''} /> Sim</label><label><input type="radio" name="${name}" value="Não" ${valorSalvo === 'Não' ? 'checked' : ''} /> Não</label><label><input type="radio" name="${name}" value="N/A" ${valorSalvo === 'N/A' || !valorSalvo ? 'checked' : ''} /> N/A</label></div></div>`;
                });

                const rtItem = data.relacaoTransformacao?.[0] || {};
                let relacaoTransfRows = `<tr><td><input type="text" name="rt_tap_comutador_at" class="input" value="${rtItem.tap_comutador_at || ''}"/></td><td><input type="text" name="rt_tap_comutador_bt" class="input" value="${rtItem.tap_comutador_bt || ''}"/></td><td><input type="number" name="rt_tensao_v_at" class="input" value="${rtItem.tensao_v_at || ''}" step="any"/></td><td><input type="number" name="rt_tensao_v_bt" class="input" value="${rtItem.tensao_v_bt || ''}" step="any"/></td><td><input type="text" name="rt_rel_calc" class="input" value="${rtItem.rel_calc || ''}"/></td><td><input type="text" name="rt_rel_med_h1h3x1x0" class="input" value="${rtItem.rel_med_h1h3x1x0 || ''}"/></td><td><input type="text" name="rt_rel_med_h2h1x2x0" class="input" value="${rtItem.rel_med_h2h1x2x0 || ''}"/></td><td><input type="text" name="rt_rel_med_h3h2x3x0" class="input" value="${rtItem.rel_med_h3h2x3x0 || ''}"/></td></tr>`;

                const roatItem = data.resOhmicaAT?.[0] || {};
                let resOhmicaATRows = `<tr><td><input type="text" name="roat_tap_comutador" class="input" value="${roatItem.tap_comutador || ''}"/></td><td><input type="number" name="roat_tensao_at" class="input" value="${roatItem.tensao_at || ''}" step="any"/></td><td><input type="number" name="roat_h1h3" class="input" step="any" value="${roatItem.h1h3 || ''}"/></td><td><input type="number" name="roat_h2h1" class="input" step="any" value="${roatItem.h2h1 || ''}"/></td><td><input type="number" name="roat_h3h2" class="input" step="any" value="${roatItem.h3h2 || ''}"/></td></tr>`;

                const robtItem = data.resOhmicaBT?.[0] || {};
                let resOhmicaBTRows = `<tr><td><input type="text" name="robt_tap_comutador" class="input" value="${robtItem.tap_comutador || ''}"/></td><td><input type="number" name="robt_tensao_bt" class="input" value="${robtItem.tensao_bt || ''}" step="any"/></td><td><input type="number" name="robt_x1x0" class="input" step="any" value="${robtItem.x1x0 || ''}"/></td><td><input type="number" name="robt_x2x0" class="input" step="any" value="${robtItem.x2x0 || ''}"/></td><td><input type="number" name="robt_x3x0" class="input" step="any" value="${robtItem.x3x0 || ''}"/></td></tr>`;

                let resIsolamentoRows = '';
                const riTerminais = ["AT x BT", "AT x MASSA (BT)", "BT x MASSA (AT)"];
                riTerminais.forEach((terminal, i) => {
                    const riItem = data.resIsolamento?.[i] || {};
                    resIsolamentoRows += `<tr><td><input type="text" name="ri_terminais_${i}" class="input" value="${terminal}" readonly/></td><td><input type="number" name="ri_tensao_ensaio_${i}" class="input" value="${riItem.tensao_ensaio || ''}" step="any"/></td><td><input type="number" name="ri_val_medido_${i}" class="input" step="any" value="${riItem.val_medido || ''}"/></td><td><input type="number" name="ri_tempo_s_${i}" class="input" value="${riItem.tempo_s || '60'}" step="any"/></td></tr>`;
                });

                let fpTrafoRows = '';
                for(let i=0; i<6; i++) {
                    const fptItem = data.fpTrafo?.[i] || {};
                    fpTrafoRows += `<tr><td><input type="text" name="fpt_n_${i}" value="${i+1}" class="input" readonly/></td><td><input type="text" name="fpt_hv_${i}" value="${fptItem.hv || ''}" class="input"/></td><td><input type="text" name="fpt_lv_r_${i}" value="${fptItem.lv_r || ''}" class="input"/></td><td><input type="text" name="fpt_guard_${i}" value="${fptItem.guard || ''}" class="input"/></td><td><input type="text" name="fpt_ch_pos_${i}" value="${fptItem.ch_pos || ''}" class="input"/></td><td><input type="number" name="fpt_ma_${i}" class="input" step="any" value="${fptItem.ma || ''}"/></td><td><input type="number" name="fpt_watts_${i}" class="input" step="any" value="${fptItem.watts || ''}"/></td><td><input type="number" name="fpt_fp_med_${i}" class="input" step="any" value="${fptItem.fp_med || ''}"/></td><td><input type="number" name="fpt_fp_corr_${i}" class="input" step="any" value="${fptItem.fp_corr || ''}"/></td><td><input type="number" name="fpt_cap_med_${i}" class="input" step="any" value="${fptItem.cap_med || ''}"/></td><td><input type="text" name="fpt_cap_fab_${i}" class="input" value="${fptItem.cap_fab || ''}"/></td></tr>`;
                };

                let fpBuchasRows = '';
                const fpbuchasSeries = ["H1", "H2", "H3"]; 
                fpbuchasSeries.forEach((serie, i) => {
                    const fpbItem = data.fpBuchas?.[i] || {};
                    fpBuchasRows += `<tr><td><input type="text" name="fpb_n_serie_${i}" value="${serie}" class="input" readonly/></td><td><input type="text" name="fpb_hv_${i}" value="${fpbItem.hv || ''}" class="input"/></td><td><input type="text" name="fpb_lv_r_${i}" value="${fpbItem.lv_r || ''}" class="input"/></td><td><input type="text" name="fpb_ch_pos_${i}" value="${fpbItem.ch_pos || ''}" class="input"/></td><td><input type="number" name="fpb_ma_${i}" class="input" step="any" value="${fpbItem.ma || ''}"/></td><td><input type="number" name="fpb_watts_${i}" class="input" step="any" value="${fpbItem.watts || ''}"/></td><td><input type="number" name="fpb_fp_med_${i}" class="input" step="any" value="${fpbItem.fp_med || ''}"/></td><td><input type="number" name="fpb_fp_corr_${i}" class="input" step="any" value="${fpbItem.fp_corr || ''}"/></td><td><input type="number" name="fpb_cap_med_${i}" class="input" step="any" value="${fpbItem.cap_med || ''}"/></td><td><input type="text" name="fpb_cap_fab_${i}" class="input" value="${fpbItem.cap_fab || ''}"/></td></tr>`;
                });

                let correnteExcitacaoRows = '';
                const ceFases = ["H1-H3", "H2-H1", "H3-H2"];
                ceFases.forEach((fase, i) => {
                    const ceItem = data.correnteExcitacao?.[i] || {};
                    correnteExcitacaoRows += `<tr><td><input type="text" name="ce_fase_${i}" value="${fase}" class="input" readonly/></td><td><input type="number" name="ce_tensao_kv_${i}" value="${ceItem.tensao_kv || ''}" class="input" step="any"/></td><td><input type="number" name="ce_ma_${i}" class="input" step="any" value="${ceItem.ma || ''}"/></td></tr>`;
                });
                
                medicoesHTML = `
                    <h4 class="section-title">SERVIÇOS</h4>
                    <div class="servicos-list">${servicosHTMLContent}</div>
                    <h4 class="section-title">RELAÇÃO DE TRANSFORMAÇÃO</h4>
                    <div class="table-container"><table><thead><tr><th colspan="2">Tap. Comutador</th><th colspan="2">Tensões (V)</th><th rowspan="2">Relação Calculada (AT/BT*√3)</th><th colspan="3">Relação Medida</th></tr><tr><th>AT</th><th>BT</th><th>AT</th><th>BT</th><th>H1-H3 / X1-X0</th><th>H2-H1 / X2-X0</th><th>H3-H2 / X3-X0</th></tr></thead><tbody>${relacaoTransfRows}</tbody></table></div>
                    <h4 class="section-title">RESISTÊNCIA ÔHMICA DOS ENROLAMENTOS DE AT (Ω)</h4>
                    <div class="table-container"><table><thead><tr><th>Tap Comutador</th><th>Tensão AT (V)</th><th>H1-H3</th><th>H2-H1</th><th>H3-H2</th></tr></thead><tbody>${resOhmicaATRows}</tbody></table></div>
                    <h4 class="section-title">RESISTÊNCIA ÔHMICA DOS ENROLAMENTOS DE BT (mΩ)</h4>
                    <div class="table-container"><table><thead><tr><th>Tap Comutador</th><th>Tensão BT (V)</th><th>X1-X0</th><th>X2-X0</th><th>X3-X0</th></tr></thead><tbody>${resOhmicaBTRows}</tbody></table></div>
                    <h4 class="section-title">RESISTÊNCIA DE ISOLAMENTO (MΩ)</h4>
                    <div class="table-container"><table><thead><tr><th>Terminais de Medição</th><th>Tensão de Ensaio (Vcc)</th><th>Valores Medidos (MΩ)</th><th>Tempo (s)</th></tr></thead><tbody>${resIsolamentoRows}</tbody></table></div>
                    <h4 class="section-title">FATOR DE POTÊNCIA DE ISOLAMENTO DO TRANSFORMADOR À 10kV</h4>
                    <p class="table-note">FP% = (W x 10) / mA</p>
                    <div class="table-container"><table><thead><tr><th rowspan="2">N°</th><th colspan="3">Configuração</th><th rowspan="2">CH Posição</th><th rowspan="2">mA</th><th rowspan="2">Watts</th><th colspan="2">FP%</th><th colspan="2">Capacitância (pF)</th></tr><tr><th>HV</th><th>LV-R</th><th>Guard</th><th>Med.</th><th>Corr. 20°C</th><th>Medido</th><th>Fab.</th></tr></thead><tbody>${fpTrafoRows}</tbody></table></div>
                    <h4 class="section-title">FATOR DE POTÊNCIA DE ISOLAMENTO DAS BUCHAS 10kV</h4>
                    <p class="table-note">FP% = (W x 10) / mA</p>
                    <div class="table-container"><table><thead><tr><th rowspan="2">N° Série</th><th colspan="2">Configuração</th><th rowspan="2">CH Posição</th><th rowspan="2">mA</th><th rowspan="2">Watts</th><th colspan="2">FP%</th><th colspan="2">Capacitância (pF)</th></tr><tr><th>HV</th><th>LV-R</th><th>Med.</th><th>Corr. 20°C</th><th>Medido</th><th>Fab.</th></tr></thead><tbody>${fpBuchasRows}</tbody></table></div>
                    <h4 class="section-title">ENSAIO DE CORRENTE DE EXCITAÇÃO</h4>
                    <div class="table-container"><table><thead><tr><th>Fase</th><th>Tensão (kV)</th><th>mA</th></tr></thead><tbody>${correnteExcitacaoRows}</tbody></table></div>
                `;
            }

            // Parte 3: Montagem Final
            formContent = `
                <h3 class="main-title">TRANSFORMADOR DE POTÊNCIA</h3>
                ${identificacaoHTML}
                ${medicoesHTML}
                <div class="form-section-sm nao-conformidade-container" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    <div class="form-group-inline">
                        <input type="checkbox" id="naoConformeCheck" name="naoConformeCheck" class="nao-conforme-checkbox" ${isNaoConforme ? 'checked' : ''}>
                        <label for="naoConformeCheck" class="nao-conforme-label">EQUIPAMENTO NÃO CONFORME</label>
                    </div>
                    <div class="form-group full-width nao-conforme-descricao" style="display: ${isNaoConforme ? 'block' : 'none'}; margin-top: 10px;">
                        <label for="naoConformeDescricao">Descrever a Não Conformidade</label>
                        <textarea id="naoConformeDescricao" name="naoConformeDescricao" class="input" rows="3" placeholder="Ex: Isoladores trincados, vazamento de óleo, conexões oxidadas...">${naoConformeDesc}</textarea>
                    </div>
                </div>
                <div class="form-group" style="margin-top:24px;"><label for="observacoesTPOT">OBSERVAÇÕES</label><textarea id="observacoesTPOT" name="observacoesTPOT" class="input" rows="4">${data.observacoes || ''}</textarea></div>
            `;
            formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
            break;
        }

        case 'malha_de_aterramento': {
            // Este formulário é mais simples e não tem uma distinção clara
            // entre identificação e medição. Vamos exibi-lo por completo.
            formContent = `
                <h3 class="main-title">MALHA DE ATERRAMENTO</h3>
                <h4 class="subtitulo">Resistência da Malha de Aterramento</h4>
                <div class="form-group"><label>Descrição:</label><p>Resistência da malha de aterramento da subestação.</p></div>
                <div class="form-group">
                    <label for="valorResistencia">Valor da Resistência (Ω)</label>
                    <input type="number" id="valorResistencia" name="valorResistencia" step="0.01" required class="input" value="${data.valorResistencia || ''}" />
                </div>
                <div class="form-group">
                    <label>Avaliação:</label>
                    <div class="radio-group">
                        <label><input type="radio" name="avaliacao" value="Conforme" required ${data.avaliacao === 'Conforme' ? 'checked' : ''} /> Conforme</label>
                        <label><input type="radio" name="avaliacao" value="Não Conforme" ${data.avaliacao === 'Não Conforme' ? 'checked' : ''} /> Não Conforme</label>
                    </div>
                </div>
                <fieldset class="form-group">
                    <legend>Serviços</legend>
                    <div class="radio-line">
                        <label>Caixas de inspeção e descidas do sistema:</label>
                        <label><input type="radio" name="caixasInspecao" value="Sim" required ${data.caixasInspecao === 'Sim' ? 'checked' : ''} /> Sim</label>
                        <label><input type="radio" name="caixasInspecao" value="Não" ${data.caixasInspecao === 'Não' ? 'checked' : ''} /> Não</label>
                        <label><input type="radio" name="caixasInspecao" value="N/A" ${data.caixasInspecao === 'N/A' || !data.caixasInspecao ? 'checked' : ''} /> N/A</label>
                    </div>
                    <div class="radio-line">
                        <label>Integridade dos captores:</label>
                        <label><input type="radio" name="captores" value="Sim" required ${data.captores === 'Sim' ? 'checked' : ''} /> Sim</label>
                        <label><input type="radio" name="captores" value="Não" ${data.captores === 'Não' ? 'checked' : ''} /> Não</label>
                        <label><input type="radio" name="captores" value="N/A" ${data.captores === 'N/A' || !data.captores ? 'checked' : ''} /> N/A</label>
                    </div>
                </fieldset>
            `;
            formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
            break;
        }
        case 'tc__transformador_de_corrente_':
            let relacaoTCRows = '';
            for (let i = 0; i < 3; i++) {
                const item = data.relacaoTransformacao?.[i] || {};
                relacaoTCRows += `
                    <tr>
                        <td><input type="text" name="relTC_numSerie_${i}" class="input" value="${item.numSerie || ''}"></td>
                        <td><input type="number" name="relTC_correnteAT_${i}" class="input" step="any" value="${item.correnteAT || ''}"></td>
                        <td><input type="number" name="relTC_correnteBT_${i}" class="input" step="any" value="${item.correnteBT || ''}"></td>
                        <td><input type="text" name="relTC_terminais_${i}" class="input" value="${item.terminais || 'P1-P2/S1-S2'}"></td>
                        <td><input type="text" name="relTC_calculada_${i}" class="input" value="${item.calculada || ''}"></td>
                        <td><input type="text" name="relTC_medida_${i}" class="input" value="${item.medida || ''}"></td>
                        <td><input type="number" name="relTC_resistencia_${i}" class="input" step="any" value="${item.resistencia || ''}"></td>
                        <td><input type="text" name="relTC_exatidao_${i}" class="input" value="${item.exatidao || ''}"></td>
                    </tr>
                `;
            }
            let resIsolamentoRowsTC = '';
            const terminaisIsolamentoDefaultTC = ['P x S (M)', 'P x Massa (S)', 'S x Massa (P)'];
            for (let i = 0; i < 3; i++) {
                const item = data.resistenciaIsolamento?.[i] || {};
                resIsolamentoRowsTC += `
                     <tr>
                        <td><input type="text" name="riTC_terminais_${i}" class="input" value="${item.terminais || terminaisIsolamentoDefaultTC[i]}" /></td>
                        <td><input type="number" name="riTC_valMedido_${i}" class="input" step="any" value="${item.valMedido || ''}"/></td>
                        <td><input type="number" name="riTC_tempEnsaio_${i}" class="input" step="0.1" value="${item.tempEnsaio || ''}"/></td>
                    </tr>
                `;
            }
            formContent = `
                <h3 class="main-title" style="font-size: 1.2rem; text-align: left; border: none; padding-bottom: 0;">TRANSFORMADOR DE CORRENTE DE MÉDIA TENSÃO (TC)</h3>
                <hr style="margin-bottom: 1.5rem;">
                <div class="identificacao-grid">
                    <div class="form-group"><label for="localizacaoTC">LOCALIZAÇÃO</label><input type="text" id="localizacaoTC" name="localizacaoTC" class="input" value="${data.localizacao || ''}"></div>
                    <div class="form-group"><label for="tipoTC">TIPO</label><input type="text" id="tipoTC" name="tipoTC" class="input" value="${data.tipo || ''}"></div>
                    <div class="form-group"><label for="fabricanteTC">FABRICANTE</label><input type="text" id="fabricanteTC" name="fabricanteTC" class="input" value="${data.fabricante || ''}"></div>
                    <div class="form-group"><label for="numSerieTC_principal">N° SÉRIE</label><input type="text" id="numSerieTC_principal" name="numSerieTC_principal" class="input" value="${data.numSeriePrincipal || ''}"></div>
                    <div class="form-group"><label for="anoFabTC">ANO FAB.</label><input type="number" id="anoFabTC" name="anoFabTC" class="input" min="1900" max="2100" value="${data.anoFabricacao || ''}"></div>
                    <div class="form-group"><label for="meioIsolanteTC">MEIO ISOLANTE</label><input type="text" id="meioIsolanteTC" name="meioIsolanteTC" class="input" value="${data.meioIsolante || ''}"></div>
                    <div class="form-group"><label for="correnteNominalATTC">CORRENTE NOMINAL AT (A)</label><input type="number" id="correnteNominalATTC" name="correnteNominalATTC" class="input" step="any" value="${data.correnteNominalAT || ''}"></div>
                    <div class="form-group"><label for="correnteNominalBTTC">CORRENTE NOMINAL BT (A)</label><input type="number" id="correnteNominalBTTC" name="correnteNominalBTTC" class="input" step="any" value="${data.correnteNominalBT || ''}"></div>
                    <div class="form-group"><label for="temperaturaEnsaioTC_geral">TEMPERATURA DE ENSAIO (°C)</label><input type="number" id="temperaturaEnsaioTC_geral" name="temperaturaEnsaioTC_geral" class="input" step="0.1" value="${data.temperaturaEnsaioGeral || ''}"></div>
                    <div class="form-group"><label for="umidadeRelativaTC">UMIDADE RELATIVA AR (%)</label><input type="number" id="umidadeRelativaTC" name="umidadeRelativaTC" class="input" step="0.1" value="${data.umidadeRelativa || ''}"></div>
                    <div class="form-group"><label for="potenciaTC">POTÊNCIA (VA)</label><input type="number" id="potenciaTC" name="potenciaTC" class="input" step="any" value="${data.potencia || ''}"></div>
                    <div class="form-group"><label for="exatidaoTC_geral">EXATIDÃO</label><input type="text" id="exatidaoTC_geral" name="exatidaoTC_geral" class="input" value="${data.exatidaoGeral || ''}"></div>
                </div>
                <h4 class="section-title">RELAÇÃO DE TRANSFORMAÇÃO E RESISTÊNCIA ÔHMICA</h4>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th rowspan="2">N° de Série</th><th colspan="2">Corrente (A)</th><th rowspan="2">Terminais</th>
                                <th rowspan="2">Relação Calculada IP/IS</th><th rowspan="2">Relação Medida</th>
                                <th rowspan="2">Resistência Ôhmica (mΩ)</th><th rowspan="2">Exatidão</th>
                            </tr>
                            <tr><th>AT</th><th>BT</th></tr>
                        </thead>
                        <tbody>${relacaoTCRows}</tbody>
                    </table>
                </div>
                <h4 class="section-title">RESISTÊNCIA DE ISOLAMENTO (MΩ)</h4>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Terminais de Medição</th><th>Valores Medidos (MΩ)</th><th>Temperatura de Ensaio (°C)</th>
                            </tr>
                        </thead>
                        <tbody>${resIsolamentoRowsTC}</tbody>
                    </table>
                </div>
                <div class="form-section-sm nao-conformidade-container" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
    <div class="form-group-inline">
        <input type="checkbox" id="naoConformeCheck" name="naoConformeCheck" class="nao-conforme-checkbox" ${isNaoConforme ? 'checked' : ''}>
        <label for="naoConformeCheck" class="nao-conforme-label">EQUIPAMENTO NÃO CONFORME</label>
    </div>
    <div class="form-group full-width nao-conforme-descricao" style="display: ${isNaoConforme ? 'block' : 'none'}; margin-top: 10px;">
        <label for="naoConformeDescricao">Descrever a Não Conformidade</label>
        <textarea id="naoConformeDescricao" name="naoConformeDescricao" class="input" rows="3" placeholder="Ex: Isoladores trincados, vazamento de óleo, conexões oxidadas...">${naoConformeDesc}</textarea>
    </div>
</div>
                <div class="form-group" style="margin-top:30px;"><label for="observacoesTC">OBSERVAÇÕES</label><textarea id="observacoesTC" name="observacoesTC" class="input" rows="3">${data.observacoes || ''}</textarea></div>
            `;
            formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
            break;
        case 'cabos_e_muflas': {
            // Parte 1: HTML da Identificação (sempre visível)
            const identificacaoHTML = `
                <div class="identificacao-grid">
                    <div class="form-group"><label for="localizacaoCM">LOCALIZAÇÃO</label><input type="text" id="localizacaoCM" name="localizacaoCM" class="input" value="${data.localizacao || ''}"/></div>
                    <div class="form-group"><label for="identificacaoCM">IDENTIFICAÇÃO</label><input type="text" id="identificacaoCM" name="identificacaoCM" class="input" value="${data.identificacao || ''}"/></div>
                    <div class="form-group"><label for="circuitoCM">CIRCUITO</label><input type="text" id="circuitoCM" name="circuitoCM" class="input" value="${data.circuito || ''}"/></div>
                    <div class="form-group"><label for="tipoCM">TIPO</label><input type="text" id="tipoCM" name="tipoCM" class="input" value="${data.tipo || ''}"/></div>
                    <div class="form-group"><label for="fabricanteCM">FABRICANTE</label><input type="text" id="fabricanteCM" name="fabricanteCM" class="input" value="${data.fabricante || ''}"/></div>
                    <div class="form-group"><label for="tensaoCM">TENSÃO (kV)</label><input type="text" id="tensaoCM" name="tensaoCM" class="input" value="${data.tensao || ''}"/></div>
                    <div class="form-group"><label for="bitolaCaboCM">BITOLA DO CABO (mm²)</label><input type="text" id="bitolaCaboCM" name="bitolaCaboCM" class="input" value="${data.bitolaCabo || ''}"/></div>
                    <div class="form-group"><label for="tempAmbienteCM">TEMPERATURA AMBIENTE (°C)</label><input type="number" id="tempAmbienteCM" name="tempAmbienteCM" class="input" step="0.1" value="${data.tempAmbiente || ''}"/></div>
                    <div class="form-group"><label for="umidadeRelativaCM">UMIDADE RELATIVA AR (%)</label><input type="number" id="umidadeRelativaCM" name="umidadeRelativaCM" class="input" step="0.1" value="${data.umidadeRelativa || ''}"/></div>
                </div>
            `;

            // Parte 2: HTML das Medições (visível apenas no modo 'full')
            let medicoesHTML = '';
            if (mode === 'full') {
                let resIsolamentoRowsCM = '';
                const fasesCM = ['A', 'B', 'C', 'RESERVA'];
                fasesCM.forEach((fase, index) => {
                    const faseId = fase.toLowerCase().replace(/\s+/g, '');
                    const item = data.resistenciaIsolamento?.[index] || {};
                    resIsolamentoRowsCM += `
                        <tr>
                            <td><input type="text" name="ri_fase_${faseId}" value="${fase}" class="input" readonly /></td>
                            <td><input type="text" name="ri_condicao_${faseId}" class="input" value="${item.condicao || `${fase} x Massa`}"/></td>
                            <td><input type="number" name="ri_tensao_ensaio_${faseId}" class="input" value="${item.tensaoEnsaio || ''}" step="any"/></td>
                            <td><input type="number" name="ri_valor_medido_${faseId}" class="input" step="any" value="${item.valorMedido || ''}"/></td>
                            <td><input type="text" name="ri_valor_referencia_${faseId}" class="input" value="${item.valorReferencia || '≥1000'}"/></td>
                            <td><input type="number" name="ri_tempo_${faseId}" class="input" value="${item.tempo || '60'}" step="any"/></td>
                        </tr>
                    `;
                });

                const servicosLabelsCM = ["Inspeção visual", "Limpeza geral", "Reaperto, conexão da blindagem ao aterramento"];
                let servicosHTMLCM = '';
                servicosLabelsCM.forEach((servico, index) => {
                    const name = `servico_cm_${index}`;
                    const valorSalvo = data.servicos?.[index]?.valor || null;
                    servicosHTMLCM += `
                        <div class="servico-item">
                            <label>${servico}</label>
                            <div class="servico-options">
                                <label><input type="radio" name="${name}" value="Sim" required ${valorSalvo === 'Sim' ? 'checked' : ''} /> Sim</label>
                                <label><input type="radio" name="${name}" value="Não" ${valorSalvo === 'Não' ? 'checked' : ''} /> Não</label>
                                <label><input type="radio" name="${name}" value="N/A" ${valorSalvo === 'N/A' || valorSalvo === null ? 'checked' : ''} /> N/A</label>
                            </div>
                        </div>
                    `;
                });
                
                medicoesHTML = `
                    <h4 class="section-title">RESISTÊNCIA DO ISOLAMENTO (MΩ)</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>FASE</th><th>Condição de Medição</th><th>Tensão Ensaio Vcc</th>
                                    <th>Valores Medidos (MΩ)</th><th>Valores de Referência (MΩ)</th><th>Tempo (s)</th>
                                </tr>
                            </thead>
                            <tbody>${resIsolamentoRowsCM}</tbody>
                        </table>
                    </div>
                    <h4 class="section-title">SERVIÇOS</h4>
                    <div class="servicos-list">${servicosHTMLCM}</div>
                `;
            }

            // Parte 3: Montagem Final
            formContent = `
                <h3 class="main-title">CABOS E MUFLAS</h3>
                ${identificacaoHTML}
                ${medicoesHTML}
                <div class="form-section-sm nao-conformidade-container" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    <div class="form-group-inline">
                        <input type="checkbox" id="naoConformeCheck" name="naoConformeCheck" class="nao-conforme-checkbox" ${isNaoConforme ? 'checked' : ''}>
                        <label for="naoConformeCheck" class="nao-conforme-label">EQUIPAMENTO NÃO CONFORME</label>
                    </div>
                    <div class="form-group full-width nao-conforme-descricao" style="display: ${isNaoConforme ? 'block' : 'none'}; margin-top: 10px;">
                        <label for="naoConformeDescricao">Descrever a Não Conformidade</label>
                        <textarea id="naoConformeDescricao" name="naoConformeDescricao" class="input" rows="3" placeholder="Ex: Isoladores trincados, vazamento de óleo, conexões oxidadas...">${naoConformeDesc}</textarea>
                    </div>
                </div>
                <div class="form-group" style="margin-top:24px;"><label for="observacoesCM">OBSERVAÇÕES</label><textarea id="observacoesCM" name="observacoesCM" class="input" rows="4">${data.observacoes || ''}</textarea></div>
            `;
            formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
            break;
        }

        case 'resistor_de_aterramento': {
            // Parte 1: HTML da Identificação (sempre visível)
            const identificacaoHTML = `
                <div class="identificacao-grid">
                    <div class="form-group"><label for="localizacaoRA">LOCALIZAÇÃO</label><input type="text" id="localizacaoRA" name="localizacaoRA" class="input" value="${data.localizacao || ''}"/></div>
                    <div class="form-group"><label for="tagRA">TAG</label><input type="text" id="tagRA" name="tagRA" class="input" value="${data.tag || ''}"/></div>
                    <div class="form-group"><label for="tipoModeloRA">TIPO/MODELO</label><input type="text" id="tipoModeloRA" name="tipoModeloRA" class="input" value="${data.tipoModelo || ''}"/></div>
                    <div class="form-group"><label for="anoFabricacaoRA">ANO FABRICAÇÃO</label><input type="number" id="anoFabricacaoRA" name="anoFabricacaoRA" class="input" min="1900" max="2100" value="${data.anoFabricacao || ''}"/></div>
                    <div class="form-group"><label for="fabricanteRA">FABRICANTE</label><input type="text" id="fabricanteRA" name="fabricanteRA" class="input" value="${data.fabricante || ''}"/></div>
                    <div class="form-group"><label for="numSerieRA">Nº SÉRIE</label><input type="text" id="numSerieRA" name="numSerieRA" class="input" value="${data.numSerie || ''}"/></div>
                    <div class="form-group"><label for="classeTensaoRA">CLASSE DE TENSÃO (kV)</label><input type="text" id="classeTensaoRA" name="classeTensaoRA" class="input" value="${data.classeTensao || ''}"/></div>
                    <div class="form-group"><label for="correnteNominalRA">CORRENTE NOMINAL (A)</label><input type="text" id="correnteNominalRA" name="correnteNominalRA" class="input" value="${data.correnteNominal || ''}"/></div>
                    <div class="form-group"><label for="tempEnsaioRA">TEMP. ENSAIO (°C)</label><input type="number" id="tempEnsaioRA" name="tempEnsaioRA" class="input" step="0.1" value="${data.tempEnsaio || ''}"/></div>
                    <div class="form-group"><label for="umidadeRelativaRA">UMIDADE RELATIVA (%)</label><input type="number" id="umidadeRelativaRA" name="umidadeRelativaRA" class="input" step="0.1" value="${data.umidadeRelativa || ''}"/></div>
                    <div class="form-group"><label for="frequenciaRA">FREQUÊNCIA (Hz)</label><input type="text" id="frequenciaRA" name="frequenciaRA" class="input" value="${data.frequencia || ''}"/></div>
                    <div class="form-group"><label for="massaTotalRA">MASSA TOTAL (Kg)</label><input type="text" id="massaTotalRA" name="massaTotalRA" class="input" value="${data.massaTotal || ''}"/></div>
                </div>
            `;

            // Parte 2: HTML das Medições (visível apenas no modo 'full')
            let medicoesHTML = '';
            if (mode === 'full') {
                medicoesHTML = `
                    <h4 class="section-title">RESISTÊNCIA (Ω)</h4>
                    <div class="resistencia-grid">
                        <div class="form-group"><label for="resistenciaNominalRA">RESISTÊNCIA NOMINAL (Ω)</label><input type="number" id="resistenciaNominalRA" name="resistenciaNominalRA" class="input" step="any" value="${data.resistenciaNominal || ''}"/></div>
                        <div class="form-group"><label for="resistenciaMedidaRA">RESISTÊNCIA MEDIDA (Ω)</label><input type="number" id="resistenciaMedidaRA" name="resistenciaMedidaRA" class="input" step="any" value="${data.resistenciaMedida || ''}"/></div>
                    </div>
                `;
            }

            // Parte 3: Montagem Final
            formContent = `
                <h3 class="main-title">RESISTOR DE ATERRAMENTO</h3>
                ${identificacaoHTML}
                ${medicoesHTML}
               <div class="form-section-sm nao-conformidade-container" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    <div class="form-group-inline">
                        <input type="checkbox" id="naoConformeCheck" name="naoConformeCheck" class="nao-conforme-checkbox" ${isNaoConforme ? 'checked' : ''}>
                        <label for="naoConformeCheck" class="nao-conforme-label">EQUIPAMENTO NÃO CONFORME</label>
                    </div>
                    <div class="form-group full-width nao-conforme-descricao" style="display: ${isNaoConforme ? 'block' : 'none'}; margin-top: 10px;">
                        <label for="naoConformeDescricao">Descrever a Não Conformidade</label>
                        <textarea id="naoConformeDescricao" name="naoConformeDescricao" class="input" rows="3" placeholder="Ex: Isoladores trincados, vazamento de óleo, conexões oxidadas...">${naoConformeDesc}</textarea>
                    </div>
                </div>
                <div class="form-group" style="margin-top:24px;"><label for="observacoesRA">OBSERVAÇÕES</label><textarea id="observacoesRA" name="observacoesRA" class="input" rows="4">${data.observacoes || ''}</textarea></div>
            `;
            formContent += `
                <hr style="margin: 24px 0;">
                <h4 class="section-title" style="border:none; margin-bottom: 12px;">Fotos da Medição</h4>
                <div class="form-group full-width">
                  <div class="file-upload">
                    <label for="fotosMedicaoInput" class="btn-upload"><i class="material-icons">add_a_photo</i> Anexar Fotos</label>
                    <input type="file" id="fotosMedicaoInput" multiple accept="image/*" style="display: none;">
                    <span id="fileCountMedicao">0 arquivos</span>
                  </div>
                  <div id="previewFotosMedicao" class="fotos-preview-grid">
                      <p class="hint-details">Nenhuma foto selecionada.</p>
                  </div>
                </div>
            `;
            break;
        }
        default:
            formContent = `<p>Formulário de medição para "${currentEquipmentName}" (tipo normalizado: <strong>${equipmentType}</strong>) ainda não implementado.</p>`;
    }
    formContent += `
        <hr style="margin: 20px 0;">
        ${equipamentosUtilizadosHTML}
        <hr style="margin: 20px 0;">
        <div class="form-row">
            <div class="form-group"><label for="med_dataEnsaio">Data do Ensaio</label><input type="date" id="med_dataEnsaio" value="${hoje}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label for="med_responsavelEnsaio">Responsável pelos Ensaios</label><input type="text" id="med_responsavelEnsaio" value="${responsavelEnsaio}"></div>
            <div class="form-group"><label for="med_engenheiroResponsavel">Engenheiro Responsável</label><input type="text" id="med_engenheiroResponsavel" value="${engenheiroResponsavel}"></div>
        </div>
    `;
    return `
    <div class="modal-overlay" id="measurementModalOverlay">
      <div class="modal-content large">
        <span class="close-button material-icons" id="closeMeasurementModalBtn">close</span>
        <h2>Registrar Medições: ${currentEquipmentName || "Equipamento Desconhecido"}</h2>
        <form id="measurementFormModal">
            ${formContent.trim()} 
            <div class="form-actions">
                <button type="button" class="btn-cancel" id="cancelMeasurementFormBtnModal"><i class="material-icons">close</i> Cancelar</button>
                <button type="submit" class="btn-submit"><i class="material-icons">save</i> Salvar Medições</button>
            </div>
        </form>
      </div>
    </div>`.trim();
}
function collectMeasurementData(equipmentType, mode) {
    const form = document.getElementById("measurementFormModal");
    if (!form) return null;
    const dadosMedicao = {
        tipoEquip: equipmentType,
        dataEnsaio: form.querySelector("#med_dataEnsaio")?.value || null,
        responsavelEnsaio: form.querySelector("#med_responsavelEnsaio")?.value.trim() || null,
        engenheiroResponsavel: form.querySelector("#med_engenheiroResponsavel")?.value.trim() || null,
        equipamentosUtilizados: []
    };
    form.querySelectorAll("#equipamentosUtilizadosContainer .equipamento-utilizado-item").forEach(item => {
        const nome = item.querySelector('input[name="equipUtilizadoNome"]')?.value.trim();
        const modelo = item.querySelector('input[name="equipUtilizadoModelo"]')?.value.trim();
        const serie = item.querySelector('input[name="equipUtilizadoSerie"]')?.value.trim();
        if (nome) {
            dadosMedicao.equipamentosUtilizados.push({ nome, modelo, serie });
        }
    });
    switch (equipmentType) {

case 'chave_seccionadora_de_alta_tensao': {
            // Coleta dados de identificação em qualquer modo
            dadosMedicao.localizacao = form.querySelector("#localizacaoCSAT")?.value.trim();
            dadosMedicao.identificacao = form.querySelector("#identificacaoCSAT")?.value.trim();
            dadosMedicao.tipo = form.querySelector("#tipoCSAT")?.value.trim();
            dadosMedicao.fabricante = form.querySelector("#fabricanteCSAT")?.value.trim();
            dadosMedicao.numSerie = form.querySelector("#numSerieCSAT")?.value.trim();
            dadosMedicao.tensaoNominal = form.querySelector("#tensaoNominalCSAT")?.value.trim();
            dadosMedicao.correnteNominal = form.querySelector("#correnteNominalCSAT")?.value.trim();
            dadosMedicao.temperaturaEnsaio = form.querySelector("#temperaturaEnsaioCSAT")?.value.trim();
            dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativaCSAT")?.value.trim();
            
            // Só coleta dados de medição no modo 'full'
            if (mode === 'full') {
                dadosMedicao.resistenciaContatos = [];
                ['a', 'b', 'c'].forEach(p => {
                    dadosMedicao.resistenciaContatos.push({
                        polo: p.toUpperCase(),
                        seccionadora: form.querySelector(`input[name="rc_seccionadora_${p}"]`)?.value,
                        corrente: form.querySelector(`input[name="rc_corrente_${p}"]`)?.value,
                        medido: form.querySelector(`input[name="rc_medido_${p}"]`)?.value,
                        referencia: form.querySelector(`input[name="rc_referencia_${p}"]`)?.value,
                        tempo: form.querySelector(`input[name="rc_tempo_${p}"]`)?.value,
                    });
                });

                dadosMedicao.resistenciaIsolamento = [];
                ['a', 'b', 'c'].forEach(p => {
                    dadosMedicao.resistenciaIsolamento.push({
                        polo: p.toUpperCase(),
                        seccionadora: form.querySelector(`input[name="ri_seccionadora_${p}"]`)?.value,
                        tensao: form.querySelector(`input[name="ri_tensao_${p}"]`)?.value,
                        medido: form.querySelector(`input[name="ri_medido_${p}"]`)?.value,
                        referencia: form.querySelector(`input[name="ri_referencia_${p}"]`)?.value,
                        tempo: form.querySelector(`input[name="ri_tempo_${p}"]`)?.value,
                    });
                });

                const servicosLabels = ["Limpeza geral", "Alinhamento dos contatos de abertura e fechamento", "Testes de acionamento elétricos", "Lubrificação dos mecanismos e reaperto das Conexões elétricas"];
                dadosMedicao.servicos = [];
                servicosLabels.forEach((label, index) => {
                    const name = `servico_csat_${index}`;
                    dadosMedicao.servicos.push({
                        label: label,
                        valor: form.querySelector(`input[name="${name}"]:checked`)?.value || 'N/A'
                    });
                });
            }

            // Coleta observações e não conformidade em qualquer modo
            dadosMedicao.observacoes = form.querySelector("#observacoesCSAT")?.value.trim();
            dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
            if (dadosMedicao.naoConforme) {
                dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
            } else {
                dadosMedicao.naoConformeDescricao = "";
            }
            break;
        }

case 'disjuntor_de_alta_tensao': {
    dadosMedicao.localizacao = form.querySelector("#localizacaoDJAT")?.value.trim();
    dadosMedicao.tipo = form.querySelector("#tipoDJAT")?.value.trim();
    dadosMedicao.fabricante = form.querySelector("#fabricanteDJAT")?.value.trim();
    dadosMedicao.numSerie = form.querySelector("#numSerieDJAT")?.value.trim();
    dadosMedicao.meioIsolante = form.querySelector("#meioIsolanteDJAT")?.value.trim();
    dadosMedicao.tensaoNominal = form.querySelector("#tensaoNominalDJAT")?.value;
    dadosMedicao.correnteNominal = form.querySelector("#correnteNominalDJAT")?.value;
    dadosMedicao.temperaturaEnsaio = form.querySelector("#temperaturaEnsaioDJAT")?.value;
    dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativaDJAT")?.value;
    dadosMedicao.observacoes = form.querySelector("#observacoesDJAT")?.value.trim();
    const pressaoTipoSelecionado = form.querySelector('input[name="pressaoTipoDJAT"]:checked')?.value;
    dadosMedicao.pressao = {
        tipo: pressaoTipoSelecionado,
        valor: form.querySelector('#pressaoValorDJAT')?.value
    };
    const polos = ['a', 'b', 'c'];
    dadosMedicao.resContatoFechado = [];
    polos.forEach(p => {
        dadosMedicao.resContatoFechado.push({
            polo: p.toUpperCase(),
            disjuntor_fechado: form.querySelector(`input[name="rcf_disjuntor_fechado_${p}"]`)?.value,
            corrente_aplicada: form.querySelector(`input[name="rcf_corrente_aplicada_${p}"]`)?.value,
            valor_medido: form.querySelector(`input[name="rcf_valor_medido_${p}"]`)?.value,
            valor_referencia: form.querySelector(`input[name="rcf_valor_referencia_${p}"]`)?.value,
            tempo: form.querySelector(`input[name="rcf_tempo_${p}"]`)?.value,
        });
    });
    dadosMedicao.resContatoAberto = [];
    polos.forEach(p => {
        dadosMedicao.resContatoAberto.push({
            polo: p.toUpperCase(),
            disjuntor_aberto: form.querySelector(`input[name="rca_disjuntor_aberto_${p}"]`)?.value,
            tensao_aplicada: form.querySelector(`input[name="rca_tensao_aplicada_${p}"]`)?.value,
            valor_medido: form.querySelector(`input[name="rca_valor_medido_${p}"]`)?.value,
            valor_referencia: form.querySelector(`input[name="rca_valor_referencia_${p}"]`)?.value,
            tempo: form.querySelector(`input[name="rca_tempo_${p}"]`)?.value,
        });
    });
    dadosMedicao.resIsolamentoFechado = [];
    polos.forEach(p => {
        dadosMedicao.resIsolamentoFechado.push({
            polo: p.toUpperCase(),
            disjuntor_fechado: form.querySelector(`input[name="rifm_disjuntor_fechado_${p}"]`)?.value,
            tensao_aplicada: form.querySelector(`input[name="rifm_tensao_aplicada_${p}"]`)?.value,
            valor_medido: form.querySelector(`input[name="rifm_valor_medido_${p}"]`)?.value,
            valor_referencia: form.querySelector(`input[name="rifm_valor_referencia_${p}"]`)?.value,
            tempo: form.querySelector(`input[name="rifm_tempo_${p}"]`)?.value,
        });
    });
    dadosMedicao.fpAberto = [];
    polos.forEach((p, i) => {
        dadosMedicao.fpAberto.push({
            polo: p.toUpperCase(),
            hv: form.querySelector(`input[name="fpa_hv_${i}"]`)?.value,
            lv_r: form.querySelector(`input[name="fpa_lv_r_${i}"]`)?.value,
            ch_posicao: form.querySelector(`input[name="fpa_ch_posicao_${i}"]`)?.value,
            ma: form.querySelector(`input[name="fpa_ma_${i}"]`)?.value,
            watts: form.querySelector(`input[name="fpa_watts_${i}"]`)?.value,
            fp_med: form.querySelector(`input[name="fpa_fp_med_${i}"]`)?.value,
            fp_corr: form.querySelector(`input[name="fpa_fp_corr_${i}"]`)?.value,
            capacitancia: form.querySelector(`input[name="fpa_capacitancia_${i}"]`)?.value,
        });
    });
    dadosMedicao.fpFechado = [];
    polos.forEach((p, i) => {
        dadosMedicao.fpFechado.push({
            polo: p.toUpperCase(),
            hv: form.querySelector(`input[name="fpf_hv_${i}"]`)?.value,
            lv_r: form.querySelector(`input[name="fpf_lv_r_${i}"]`)?.value,
            ch_posicao: form.querySelector(`input[name="fpf_ch_posicao_${i}"]`)?.value,
            ma: form.querySelector(`input[name="fpf_ma_${i}"]`)?.value,
            watts: form.querySelector(`input[name="fpf_watts_${i}"]`)?.value,
            fp_med: form.querySelector(`input[name="fpf_fp_med_${i}"]`)?.value,
            fp_corr: form.querySelector(`input[name="fpf_fp_corr_${i}"]`)?.value,
            capacitancia: form.querySelector(`input[name="fpf_capacitancia_${i}"]`)?.value,
        });
    });
    const servicosLabels = ["Limpeza geral", "Lubrificação dos componentes", "Testes de acionamento elétricos", "Reaperto das Conexões elétricas"];
    dadosMedicao.servicos = [];
    servicosLabels.forEach((label, index) => {
        const name = `servico_dj_at_${index}`;
        dadosMedicao.servicos.push({
            label: label,
            valor: form.querySelector(`input[name="${name}"]:checked`)?.value || 'N/A'
        });
    });
     dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
    if (dadosMedicao.naoConforme) {
        dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
    } else {
        dadosMedicao.naoConformeDescricao = "";
    }
    break;
}
case 'disjuntor_de_media_tensao': {
            // Coleta dados de identificação em qualquer modo
            dadosMedicao.localizacao = form.querySelector("#localizacaoDJMT")?.value.trim();
            dadosMedicao.identificacao = form.querySelector("#identificacaoDJMT")?.value.trim();
            dadosMedicao.tag = form.querySelector("#tagDJMT")?.value.trim();
            dadosMedicao.tipo = form.querySelector("#tipoDJMT")?.value.trim();
            dadosMedicao.fabricante = form.querySelector("#fabricanteDJMT")?.value.trim();
            dadosMedicao.numSerie = form.querySelector("#numSerieDJMT")?.value.trim();
            dadosMedicao.meioIsolante = form.querySelector("#meioIsolanteDJMT")?.value.trim();
            dadosMedicao.tensaoNominal = form.querySelector("#tensaoNominalDJMT")?.value;
            dadosMedicao.correnteNominal = form.querySelector("#correnteNominalDJMT")?.value;
            dadosMedicao.temperaturaEnsaio = form.querySelector("#temperaturaEnsaioDJMT")?.value;
            dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativaDJMT")?.value;
            dadosMedicao.anoFabricacao = form.querySelector("#anoFabricacaoDJMT")?.value;
            
            // Só coleta dados de medição no modo 'full'
            if (mode === 'full') {
                const polos = ['a', 'b', 'c'];
                dadosMedicao.resistenciaContatos = [];
                polos.forEach(p => {
                    dadosMedicao.resistenciaContatos.push({
                        polo: p.toUpperCase(),
                        disjuntor_fechado: form.querySelector(`input[name="rc_disjuntor_fechado_${p}"]`)?.value,
                        corrente_aplicada: form.querySelector(`input[name="rc_corrente_aplicada_${p}"]`)?.value,
                        valor_medido: form.querySelector(`input[name="rc_valor_medido_${p}"]`)?.value,
                        valor_referencia: form.querySelector(`input[name="rc_valor_referencia_${p}"]`)?.value,
                        tempo: form.querySelector(`input[name="rc_tempo_${p}"]`)?.value,
                    });
                });
                dadosMedicao.resIsolamentoAberto = [];
                polos.forEach(p => {
                    dadosMedicao.resIsolamentoAberto.push({
                        polo: p.toUpperCase(),
                        disjuntor_aberto: form.querySelector(`input[name="ria_disjuntor_aberto_${p}"]`)?.value,
                        tensao_ensaio: form.querySelector(`input[name="ria_tensao_ensaio_${p}"]`)?.value,
                        valor_medido: form.querySelector(`input[name="ria_valor_medido_${p}"]`)?.value,
                        valor_referencia: form.querySelector(`input[name="ria_valor_referencia_${p}"]`)?.value,
                        tempo: form.querySelector(`input[name="ria_tempo_${p}"]`)?.value,
                    });
                });
                dadosMedicao.resIsolamentoFechado = [];
                polos.forEach(p => {
                    dadosMedicao.resIsolamentoFechado.push({
                        polo: p.toUpperCase(),
                        disjuntor_fechado: form.querySelector(`input[name="rif_disjuntor_fechado_${p}"]`)?.value,
                        tensao_ensaio: form.querySelector(`input[name="rif_tensao_ensaio_${p}"]`)?.value,
                        valor_medido: form.querySelector(`input[name="rif_valor_medido_${p}"]`)?.value,
                        valor_referencia: form.querySelector(`input[name="rif_valor_referencia_${p}"]`)?.value,
                        tempo: form.querySelector(`input[name="rif_tempo_${p}"]`)?.value,
                    });
                });
            }

            // Coleta observações e não conformidade em qualquer modo
            dadosMedicao.observacoes = form.querySelector("#observacoesDJMT")?.value.trim();
            dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
            if (dadosMedicao.naoConforme) {
                dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
            } else {
                dadosMedicao.naoConformeDescricao = "";
            }
            break;
        }
        
case 'pararaios_de_alta_tensao': {
            // Coleta dados de identificação em qualquer modo
            dadosMedicao.localizacao = form.querySelector("#localizacaoPRAT")?.value.trim();
            dadosMedicao.tag = form.querySelector("#tagPRAT")?.value.trim();
            dadosMedicao.numSeriePrincipal = form.querySelector("#numSeriePRATPrincipal")?.value.trim();
            dadosMedicao.fabricante = form.querySelector("#fabricantePRAT")?.value.trim();
            dadosMedicao.tensaoNominal = form.querySelector("#tensaoNominalPRAT")?.value;
            dadosMedicao.curtoCircuito = form.querySelector("#curtoCircuitoPRAT")?.value.trim();
            dadosMedicao.tempEnsaio = form.querySelector("#tempEnsaioPRAT")?.value;
            dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativaPRAT")?.value;
            
            // Só coleta dados de medição no modo 'full'
            if (mode === 'full') {
                dadosMedicao.resistenciaIsolamento = [];
                for (let i = 0; i < 3; i++) {
                    dadosMedicao.resistenciaIsolamento.push({
                        numSerie: form.querySelector(`input[name="ri_numSerie_${i}"]`)?.value.trim(),
                        at_massa: form.querySelector(`input[name="ri_at_massa_${i}"]`)?.value.trim(),
                        tensao_ensaio: form.querySelector(`input[name="ri_tensao_ensaio_${i}"]`)?.value,
                        valor_medido: form.querySelector(`input[name="ri_valor_medido_${i}"]`)?.value,
                        valor_referencia: form.querySelector(`input[name="ri_valor_referencia_${i}"]`)?.value.trim(),
                        tempo: form.querySelector(`input[name="ri_tempo_${i}"]`)?.value,
                    });
                }
            }

            // Coleta observações e não conformidade em qualquer modo
            dadosMedicao.observacoes = form.querySelector("#observacoesPRAT")?.value.trim();
            dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
            if (dadosMedicao.naoConforme) {
                dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
            } else {
                dadosMedicao.naoConformeDescricao = "";
            }
            break;
        }

case 'tc_transformador_de_corrente': {
            // Coleta dados de identificação em qualquer modo
            dadosMedicao.localizacao = form.querySelector("#localizacaoTC")?.value.trim();
            dadosMedicao.tipo = form.querySelector("#tipoTC")?.value.trim();
            dadosMedicao.fabricante = form.querySelector("#fabricanteTC")?.value.trim();
            dadosMedicao.numSeriePrincipal = form.querySelector("#numSerieTC_principal")?.value.trim();
            dadosMedicao.anoFabricacao = form.querySelector("#anoFabTC")?.value;
            dadosMedicao.meioIsolante = form.querySelector("#meioIsolanteTC")?.value.trim();
            dadosMedicao.correnteNominalAT = form.querySelector("#correnteNominalATTC")?.value;
            dadosMedicao.correnteNominalBT = form.querySelector("#correnteNominalBTTC")?.value;
            dadosMedicao.temperaturaEnsaioGeral = form.querySelector("#temperaturaEnsaioTC_geral")?.value;
            dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativaTC")?.value;
            dadosMedicao.potencia = form.querySelector("#potenciaTC")?.value;
            dadosMedicao.exatidaoGeral = form.querySelector("#exatidaoTC_geral")?.value.trim();
            
            // Só coleta dados de medição no modo 'full'
            if (mode === 'full') {
                dadosMedicao.relacaoTransformacao = [];
                for (let i = 0; i < 3; i++) {
                    dadosMedicao.relacaoTransformacao.push({
                        numSerie: form.querySelector(`input[name="relTC_numSerie_${i}"]`)?.value.trim(),
                        correnteAT: form.querySelector(`input[name="relTC_correnteAT_${i}"]`)?.value,
                        correnteBT: form.querySelector(`input[name="relTC_correnteBT_${i}"]`)?.value,
                        terminais: form.querySelector(`input[name="relTC_terminais_${i}"]`)?.value.trim(),
                        calculada: form.querySelector(`input[name="relTC_calculada_${i}"]`)?.value.trim(),
                        medida: form.querySelector(`input[name="relTC_medida_${i}"]`)?.value.trim(),
                        resistencia: form.querySelector(`input[name="relTC_resistencia_${i}"]`)?.value,
                        exatidao: form.querySelector(`input[name="relTC_exatidao_${i}"]`)?.value.trim(),
                    });
                }
                dadosMedicao.resistenciaIsolamento = [];
                const terminaisIsolamento = ['P x S (M)', 'P x Massa (S)', 'S x Massa (P)'];
                for (let sectionIndex = 0; sectionIndex < 3; sectionIndex++) {
                    const medicoesDaSecao = [];
                    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
                        medicoesDaSecao.push({
                            terminal: terminaisIsolamento[rowIndex],
                            valMedido: form.querySelector(`input[name="riTC_valMedido_${sectionIndex}_${rowIndex}"]`)?.value,
                            tempEnsaio: form.querySelector(`input[name="riTC_tempEnsaio_${sectionIndex}_${rowIndex}"]`)?.value,
                        });
                    }
                    dadosMedicao.resistenciaIsolamento.push({
                        numSerie: form.querySelector(`input[name="riTC_numSerie_${sectionIndex}"]`)?.value.trim(),
                        medicoes: medicoesDaSecao
                    });
                }
            }

            // Coleta observações e não conformidade em qualquer modo
            dadosMedicao.observacoes = form.querySelector("#observacoesTC")?.value.trim();
            dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
            if (dadosMedicao.naoConforme) {
                dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
            } else {
                dadosMedicao.naoConformeDescricao = "";
            }
            break;
        }

case 'transformador_de_potencia_de_alta_tensao': {
    dadosMedicao.localizacao = form.querySelector("#localizacaoTPOT")?.value.trim();
    dadosMedicao.tipo = form.querySelector("#tipoTPOT")?.value.trim();
    dadosMedicao.fabricante = form.querySelector("#fabricanteTPOT")?.value.trim();
    dadosMedicao.numSerie = form.querySelector("#numSerieTPOT")?.value.trim();
    dadosMedicao.meioIsolante = form.querySelector("#meioIsolanteTPOT")?.value.trim();
    dadosMedicao.anoFabricacao = form.querySelector("#anoFabricacaoTPOT")?.value;
    dadosMedicao.massa = form.querySelector("#massaTPOT")?.value;
    dadosMedicao.potencia = form.querySelector("#potenciaTPOT")?.value.trim();
    dadosMedicao.tensaoAT_X = form.querySelector("#tensaoAT_X_TPOT")?.value;
    dadosMedicao.tensaoAT_Y = form.querySelector("#tensaoAT_Y_TPOT")?.value;
    dadosMedicao.tensaoBT_D = form.querySelector("#tensaoBT_D_TPOT")?.value;
    dadosMedicao.tensaoBT_Y = form.querySelector("#tensaoBT_Y_TPOT")?.value;
    dadosMedicao.volumeOleo = form.querySelector("#volumeOleoTPOT")?.value;
    dadosMedicao.temperaturaEnsaio = form.querySelector("#temperaturaEnsaioTPOT")?.value;
    dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativaTPOT")?.value;
    dadosMedicao.impedancia = form.querySelector("#impedanciaTPOT")?.value.trim();
    dadosMedicao.observacoes = form.querySelector("#observacoesTPOT")?.value.trim();
    const servicosLabels = [
        "Inspeção visual geral do equipamento", "Limpeza das Buchas", "Reaperto de todas as conexões",
        "Inspeção da fiação e parafusos quanto a corrosão e contato elétrico", "Inspeção do aterramento do transformador",
        "Atuação dos contatos do termômetro do óleo isolante – Alarme e Desligamento", "Atuação dos contatos do termômetro dos enrolamentos – VF, Alarme e Desligamento",
        "Atuação dos contatos do indicador de nível de óleo Máximo e Mínimo", "Atuação dos contatos do relé de gás – Alarme e Desligamento",
        "Atuação dos Contatos do Dispositivo de alivio de pressão", "Inspeção do sistema de ventilação forçada", "Substituição da sílica gel",
        "Complemento do nível do óleo, se necessário"
    ];
    dadosMedicao.servicos = [];
    servicosLabels.forEach((label, index) => {
        const name = `servico_tpat_${index}`;
        dadosMedicao.servicos.push({
            label: label,
            valor: form.querySelector(`input[name="${name}"]:checked`)?.value || 'N/A'
        });
    });
    dadosMedicao.relacaoTransformacao = [{
        tap_comutador_at: form.querySelector(`input[name="rt_tap_comutador_at"]`)?.value,
        tap_comutador_bt: form.querySelector(`input[name="rt_tap_comutador_bt"]`)?.value,
        tensao_v_at: form.querySelector(`input[name="rt_tensao_v_at"]`)?.value,
        tensao_v_bt: form.querySelector(`input[name="rt_tensao_v_bt"]`)?.value,
        rel_calc: form.querySelector(`input[name="rt_rel_calc"]`)?.value,
        rel_med_h1h3x1x0: form.querySelector(`input[name="rt_rel_med_h1h3x1x0"]`)?.value,
        rel_med_h2h1x2x0: form.querySelector(`input[name="rt_rel_med_h2h1x2x0"]`)?.value,
        rel_med_h3h2x3x0: form.querySelector(`input[name="rt_rel_med_h3h2x3x0"]`)?.value,
    }];
    dadosMedicao.resOhmicaAT = [{
        tap_comutador: form.querySelector(`input[name="roat_tap_comutador"]`)?.value,
        tensao_at: form.querySelector(`input[name="roat_tensao_at"]`)?.value,
        h1h3: form.querySelector(`input[name="roat_h1h3"]`)?.value,
        h2h1: form.querySelector(`input[name="roat_h2h1"]`)?.value,
        h3h2: form.querySelector(`input[name="roat_h3h2"]`)?.value,
    }];
    dadosMedicao.resOhmicaBT = [{
        tap_comutador: form.querySelector(`input[name="robt_tap_comutador"]`)?.value,
        tensao_bt: form.querySelector(`input[name="robt_tensao_bt"]`)?.value,
        x1x0: form.querySelector(`input[name="robt_x1x0"]`)?.value,
        x2x0: form.querySelector(`input[name="robt_x2x0"]`)?.value,
        x3x0: form.querySelector(`input[name="robt_x3x0"]`)?.value,
    }];
    dadosMedicao.resIsolamento = [];
    for(let i=0; i<3; i++) {
        dadosMedicao.resIsolamento.push({
            terminais: form.querySelector(`input[name="ri_terminais_${i}"]`)?.value,
            tensao_ensaio: form.querySelector(`input[name="ri_tensao_ensaio_${i}"]`)?.value,
            val_medido: form.querySelector(`input[name="ri_val_medido_${i}"]`)?.value,
            tempo_s: form.querySelector(`input[name="ri_tempo_s_${i}"]`)?.value,
        });
    }
    dadosMedicao.fpTrafo = [];
    for(let i=0; i<6; i++) {
        dadosMedicao.fpTrafo.push({
            n: form.querySelector(`input[name="fpt_n_${i}"]`)?.value,
            hv: form.querySelector(`input[name="fpt_hv_${i}"]`)?.value,
            lv_r: form.querySelector(`input[name="fpt_lv_r_${i}"]`)?.value,
            guard: form.querySelector(`input[name="fpt_guard_${i}"]`)?.value,
            ch_pos: form.querySelector(`input[name="fpt_ch_pos_${i}"]`)?.value,
            ma: form.querySelector(`input[name="fpt_ma_${i}"]`)?.value,
            watts: form.querySelector(`input[name="fpt_watts_${i}"]`)?.value,
            fp_med: form.querySelector(`input[name="fpt_fp_med_${i}"]`)?.value,
            fp_corr: form.querySelector(`input[name="fpt_fp_corr_${i}"]`)?.value,
            cap_med: form.querySelector(`input[name="fpt_cap_med_${i}"]`)?.value,
            cap_fab: form.querySelector(`input[name="fpt_cap_fab_${i}"]`)?.value,
        });
    }
    dadosMedicao.fpBuchas = [];
    ["H1", "H2", "H3"].forEach((serie, i) => {
        dadosMedicao.fpBuchas.push({
            n_serie: serie,
            hv: form.querySelector(`input[name="fpb_hv_${i}"]`)?.value,
            lv_r: form.querySelector(`input[name="fpb_lv_r_${i}"]`)?.value,
            ch_pos: form.querySelector(`input[name="fpb_ch_pos_${i}"]`)?.value,
            ma: form.querySelector(`input[name="fpb_ma_${i}"]`)?.value,
            watts: form.querySelector(`input[name="fpb_watts_${i}"]`)?.value,
            fp_med: form.querySelector(`input[name="fpb_fp_med_${i}"]`)?.value,
            fp_corr: form.querySelector(`input[name="fpb_fp_corr_${i}"]`)?.value,
            cap_med: form.querySelector(`input[name="fpb_cap_med_${i}"]`)?.value,
            cap_fab: form.querySelector(`input[name="fpb_cap_fab_${i}"]`)?.value,
        });
    });
    dadosMedicao.correnteExcitacao = [];
    ["H1-H3", "H2-H1", "H3-H2"].forEach((fase, i) => {
        dadosMedicao.correnteExcitacao.push({
            fase: fase,
            tensao_kv: form.querySelector(`input[name="ce_tensao_kv_${i}"]`)?.value,
            ma: form.querySelector(`input[name="ce_ma_${i}"]`)?.value,
        });
    });
    dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
    if (dadosMedicao.naoConforme) {
        dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
    } else {
        dadosMedicao.naoConformeDescricao = "";
    }
    break;
}
        case 'chave_seccionadora_de_media_tensao': {
            // Coleta dados de identificação em qualquer modo
            dadosMedicao.localizacao = form.querySelector("#localizacao")?.value.trim();
            dadosMedicao.identificacao = form.querySelector("#identificacao")?.value.trim();
            dadosMedicao.tipo = form.querySelector("#tipo")?.value.trim();
            dadosMedicao.fabricante = form.querySelector("#fabricante")?.value.trim();
            dadosMedicao.numSerie = form.querySelector("#numSerie")?.value.trim();
            dadosMedicao.tag = form.querySelector("#tag")?.value.trim();
            dadosMedicao.tensaoNominal = form.querySelector("#tensaoNominal")?.value;
            dadosMedicao.correnteNominal = form.querySelector("#correnteNominal")?.value;
            dadosMedicao.temperaturaEnsaio = form.querySelector("#temperaturaEnsaio")?.value;
            dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativa")?.value;
            dadosMedicao.anoFabricacao = form.querySelector("#anoFabricacao")?.value;
            
            // Só coleta dados de medição no modo 'full'
            if (mode === 'full') {
                dadosMedicao.resistenciaContatos = [];
                ['a', 'b', 'c'].forEach(p => {
                    dadosMedicao.resistenciaContatos.push({
                        polo: p.toUpperCase(),
                        seccionadora: form.querySelector(`input[name="rc_seccionadora_${p}"]`)?.value,
                        corrente: form.querySelector(`input[name="rc_corrente_${p}"]`)?.value,
                        medido: form.querySelector(`input[name="rc_medido_${p}"]`)?.value,
                        referencia: form.querySelector(`input[name="rc_referencia_${p}"]`)?.value,
                        tempo: form.querySelector(`input[name="rc_tempo_${p}"]`)?.value,
                    });
                });
                dadosMedicao.resistenciaIsolamento = [];
                ['a', 'b', 'c'].forEach(p => {
                    dadosMedicao.resistenciaIsolamento.push({
                        polo: p.toUpperCase(),
                        seccionadora: form.querySelector(`input[name="ri_seccionadora_${p}"]`)?.value,
                        tensao: form.querySelector(`input[name="ri_tensao_${p}"]`)?.value,
                        medido: form.querySelector(`input[name="ri_medido_${p}"]`)?.value,
                        referencia: form.querySelector(`input[name="ri_referencia_${p}"]`)?.value,
                        tempo: form.querySelector(`input[name="ri_tempo_${p}"]`)?.value,
                    });
                });
            }

            // Coleta observações e não conformidade em qualquer modo
            dadosMedicao.observacoes = form.querySelector("#observacoes")?.value.trim();
            dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
            if (dadosMedicao.naoConforme) {
                dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
            } else {
                dadosMedicao.naoConformeDescricao = "";
            }
            break;
        }

case 'tp_transformador_de_potencial':
        case 'transformadores_de_potencia':
        case 'transformador_de_potencia_de_alta_tensao': {
            // Coleta dados de identificação em qualquer modo
            dadosMedicao.localizacao = form.querySelector("#localizacaoTPOT")?.value.trim();
            dadosMedicao.tipo = form.querySelector("#tipoTPOT")?.value.trim();
            dadosMedicao.fabricante = form.querySelector("#fabricanteTPOT")?.value.trim();
            dadosMedicao.numSerie = form.querySelector("#numSerieTPOT")?.value.trim();
            dadosMedicao.meioIsolante = form.querySelector("#meioIsolanteTPOT")?.value.trim();
            dadosMedicao.anoFabricacao = form.querySelector("#anoFabricacaoTPOT")?.value;
            dadosMedicao.massa = form.querySelector("#massaTPOT")?.value;
            dadosMedicao.potencia = form.querySelector("#potenciaTPOT")?.value.trim();
            dadosMedicao.tensaoAT_X = form.querySelector("#tensaoAT_X_TPOT")?.value;
            dadosMedicao.tensaoAT_Y = form.querySelector("#tensaoAT_Y_TPOT")?.value;
            dadosMedicao.tensaoBT_D = form.querySelector("#tensaoBT_D_TPOT")?.value;
            dadosMedicao.tensaoBT_Y = form.querySelector("#tensaoBT_Y_TPOT")?.value;
            dadosMedicao.volumeOleo = form.querySelector("#volumeOleoTPOT")?.value;
            dadosMedicao.temperaturaEnsaio = form.querySelector("#temperaturaEnsaioTPOT")?.value;
            dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativaTPOT")?.value;
            dadosMedicao.impedancia = form.querySelector("#impedanciaTPOT")?.value.trim();
            
            // Só coleta dados de medição no modo 'full'
            if (mode === 'full') {
                const servicosLabels = ["Inspeção visual geral do equipamento", "Limpeza das Buchas", "Reaperto de todas as conexões", "Inspeção da fiação e parafusos quanto a corrosão e contato elétrico", "Inspeção do aterramento do transformador", "Atuação dos contatos do termômetro do óleo isolante – Alarme e Desligamento", "Atuação dos contatos do termômetro dos enrolamentos – VF, Alarme e Desligamento", "Atuação dos contatos do indicador de nível de óleo Máximo e Mínimo", "Atuação dos contatos do relé de gás – Alarme e Desligamento", "Atuação dos Contatos do Dispositivo de alivio de pressão", "Inspeção do sistema de ventilação forçada", "Substituição da sílica gel", "Complemento do nível do óleo, se necessário"];
                dadosMedicao.servicos = [];
                servicosLabels.forEach((label, index) => {
                    const name = `servico_tpat_${index}`;
                    dadosMedicao.servicos.push({
                        label: label,
                        valor: form.querySelector(`input[name="${name}"]:checked`)?.value || 'N/A'
                    });
                });

                dadosMedicao.relacaoTransformacao = [{
                    tap_comutador_at: form.querySelector(`input[name="rt_tap_comutador_at"]`)?.value,
                    tap_comutador_bt: form.querySelector(`input[name="rt_tap_comutador_bt"]`)?.value,
                    tensao_v_at: form.querySelector(`input[name="rt_tensao_v_at"]`)?.value,
                    tensao_v_bt: form.querySelector(`input[name="rt_tensao_v_bt"]`)?.value,
                    rel_calc: form.querySelector(`input[name="rt_rel_calc"]`)?.value,
                    rel_med_h1h3x1x0: form.querySelector(`input[name="rt_rel_med_h1h3x1x0"]`)?.value,
                    rel_med_h2h1x2x0: form.querySelector(`input[name="rt_rel_med_h2h1x2x0"]`)?.value,
                    rel_med_h3h2x3x0: form.querySelector(`input[name="rt_rel_med_h3h2x3x0"]`)?.value,
                }];
                dadosMedicao.resOhmicaAT = [{
                    tap_comutador: form.querySelector(`input[name="roat_tap_comutador"]`)?.value,
                    tensao_at: form.querySelector(`input[name="roat_tensao_at"]`)?.value,
                    h1h3: form.querySelector(`input[name="roat_h1h3"]`)?.value,
                    h2h1: form.querySelector(`input[name="roat_h2h1"]`)?.value,
                    h3h2: form.querySelector(`input[name="roat_h3h2"]`)?.value,
                }];
                dadosMedicao.resOhmicaBT = [{
                    tap_comutador: form.querySelector(`input[name="robt_tap_comutador"]`)?.value,
                    tensao_bt: form.querySelector(`input[name="robt_tensao_bt"]`)?.value,
                    x1x0: form.querySelector(`input[name="robt_x1x0"]`)?.value,
                    x2x0: form.querySelector(`input[name="robt_x2x0"]`)?.value,
                    x3x0: form.querySelector(`input[name="robt_x3x0"]`)?.value,
                }];
                dadosMedicao.resIsolamento = [];
                for(let i=0; i<3; i++) {
                    dadosMedicao.resIsolamento.push({
                        terminais: form.querySelector(`input[name="ri_terminais_${i}"]`)?.value,
                        tensao_ensaio: form.querySelector(`input[name="ri_tensao_ensaio_${i}"]`)?.value,
                        val_medido: form.querySelector(`input[name="ri_val_medido_${i}"]`)?.value,
                        tempo_s: form.querySelector(`input[name="ri_tempo_s_${i}"]`)?.value,
                    });
                }
                dadosMedicao.fpTrafo = [];
                for(let i=0; i<6; i++) {
                    dadosMedicao.fpTrafo.push({
                        n: form.querySelector(`input[name="fpt_n_${i}"]`)?.value,
                        hv: form.querySelector(`input[name="fpt_hv_${i}"]`)?.value,
                        lv_r: form.querySelector(`input[name="fpt_lv_r_${i}"]`)?.value,
                        guard: form.querySelector(`input[name="fpt_guard_${i}"]`)?.value,
                        ch_pos: form.querySelector(`input[name="fpt_ch_pos_${i}"]`)?.value,
                        ma: form.querySelector(`input[name="fpt_ma_${i}"]`)?.value,
                        watts: form.querySelector(`input[name="fpt_watts_${i}"]`)?.value,
                        fp_med: form.querySelector(`input[name="fpt_fp_med_${i}"]`)?.value,
                        fp_corr: form.querySelector(`input[name="fpt_fp_corr_${i}"]`)?.value,
                        cap_med: form.querySelector(`input[name="fpt_cap_med_${i}"]`)?.value,
                        cap_fab: form.querySelector(`input[name="fpt_cap_fab_${i}"]`)?.value,
                    });
                }
                dadosMedicao.fpBuchas = [];
                ["H1", "H2", "H3"].forEach((serie, i) => {
                    dadosMedicao.fpBuchas.push({
                        n_serie: serie,
                        hv: form.querySelector(`input[name="fpb_hv_${i}"]`)?.value,
                        lv_r: form.querySelector(`input[name="fpb_lv_r_${i}"]`)?.value,
                        ch_pos: form.querySelector(`input[name="fpb_ch_pos_${i}"]`)?.value,
                        ma: form.querySelector(`input[name="fpb_ma_${i}"]`)?.value,
                        watts: form.querySelector(`input[name="fpb_watts_${i}"]`)?.value,
                        fp_med: form.querySelector(`input[name="fpb_fp_med_${i}"]`)?.value,
                        fp_corr: form.querySelector(`input[name="fpb_fp_corr_${i}"]`)?.value,
                        cap_med: form.querySelector(`input[name="fpb_cap_med_${i}"]`)?.value,
                        cap_fab: form.querySelector(`input[name="fpb_cap_fab_${i}"]`)?.value,
                    });
                });
                dadosMedicao.correnteExcitacao = [];
                ["H1-H3", "H2-H1", "H3-H2"].forEach((fase, i) => {
                    dadosMedicao.correnteExcitacao.push({
                        fase: fase,
                        tensao_kv: form.querySelector(`input[name="ce_tensao_kv_${i}"]`)?.value,
                        ma: form.querySelector(`input[name="ce_ma_${i}"]`)?.value,
                    });
                });
            }

            // Coleta observações e não conformidade em qualquer modo
            dadosMedicao.observacoes = form.querySelector("#observacoesTPOT")?.value.trim();
            dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
            if (dadosMedicao.naoConforme) {
                dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
            } else {
                dadosMedicao.naoConformeDescricao = "";
            }
            break;
        }

        case 'malha_de_aterramento':
            dadosMedicao.valorResistencia = form.querySelector("#valorResistencia")?.value || null;
            dadosMedicao.avaliacao = form.querySelector('input[name="avaliacao"]:checked')?.value || null;
            dadosMedicao.caixasInspecao = form.querySelector('input[name="caixasInspecao"]:checked')?.value || null;
            dadosMedicao.captores = form.querySelector('input[name="captores"]:checked')?.value || null;
            break;
    
    if (dadosMedicao.naoConforme) {
        dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
    } else {
        dadosMedicao.naoConformeDescricao = "";
    }
            break;
        case 'tc__transformador_de_corrente_':
            dadosMedicao.localizacao = form.querySelector("#localizacaoTC")?.value.trim();
            dadosMedicao.tipo = form.querySelector("#tipoTC")?.value.trim();
            dadosMedicao.fabricante = form.querySelector("#fabricanteTC")?.value.trim();
            dadosMedicao.numSeriePrincipal = form.querySelector("#numSerieTC_principal")?.value.trim();
            dadosMedicao.anoFabricacao = form.querySelector("#anoFabTC")?.value;
            dadosMedicao.meioIsolante = form.querySelector("#meioIsolanteTC")?.value.trim();
            dadosMedicao.correnteNominalAT = form.querySelector("#correnteNominalATTC")?.value;
            dadosMedicao.correnteNominalBT = form.querySelector("#correnteNominalBTTC")?.value;
            dadosMedicao.temperaturaEnsaioGeral = form.querySelector("#temperaturaEnsaioTC_geral")?.value;
            dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativaTC")?.value;
            dadosMedicao.potencia = form.querySelector("#potenciaTC")?.value;
            dadosMedicao.exatidaoGeral = form.querySelector("#exatidaoTC_geral")?.value.trim();
            dadosMedicao.observacoes = form.querySelector("#observacoesTC")?.value.trim();
            dadosMedicao.relacaoTransformacao = [];
            for (let i = 0; i < 3; i++) {
                dadosMedicao.relacaoTransformacao.push({
                    numSerie: form.querySelector(`input[name="relTC_numSerie_${i}"]`)?.value.trim(),
                    correnteAT: form.querySelector(`input[name="relTC_correnteAT_${i}"]`)?.value,
                    correnteBT: form.querySelector(`input[name="relTC_correnteBT_${i}"]`)?.value,
                    terminais: form.querySelector(`input[name="relTC_terminais_${i}"]`)?.value.trim(),
                    calculada: form.querySelector(`input[name="relTC_calculada_${i}"]`)?.value.trim(),
                    medida: form.querySelector(`input[name="relTC_medida_${i}"]`)?.value.trim(),
                    resistencia: form.querySelector(`input[name="relTC_resistencia_${i}"]`)?.value,
                    exatidao: form.querySelector(`input[name="relTC_exatidao_${i}"]`)?.value.trim(),
                });
            }
            dadosMedicao.resistenciaIsolamento = [];
            for (let i = 0; i < 3; i++) {
                dadosMedicao.resistenciaIsolamento.push({
                    terminais: form.querySelector(`input[name="riTC_terminais_${i}"]`)?.value.trim(),
                    valMedido: form.querySelector(`input[name="riTC_valMedido_${i}"]`)?.value,
                    tempEnsaio: form.querySelector(`input[name="riTC_tempEnsaio_${i}"]`)?.value,
                });
            }
           dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
    if (dadosMedicao.naoConforme) {
        dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
    } else {
        dadosMedicao.naoConformeDescricao = "";
    }
            break;
        case 'cabos_e_muflas': {
            // Coleta dados de identificação em qualquer modo
            dadosMedicao.localizacao = form.querySelector("#localizacaoCM")?.value.trim();
            dadosMedicao.identificacao = form.querySelector("#identificacaoCM")?.value.trim();
            dadosMedicao.circuito = form.querySelector("#circuitoCM")?.value.trim();
            dadosMedicao.tipo = form.querySelector("#tipoCM")?.value.trim();
            dadosMedicao.fabricante = form.querySelector("#fabricanteCM")?.value.trim();
            dadosMedicao.tensao = form.querySelector("#tensaoCM")?.value.trim();
            dadosMedicao.bitolaCabo = form.querySelector("#bitolaCaboCM")?.value.trim();
            dadosMedicao.tempAmbiente = form.querySelector("#tempAmbienteCM")?.value;
            dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativaCM")?.value;
            
            // Só coleta dados de medição no modo 'full'
            if (mode === 'full') {
                dadosMedicao.resistenciaIsolamento = [];
                const fasesCM = ['a', 'b', 'c', 'reserva'];
                fasesCM.forEach(faseId => {
                    dadosMedicao.resistenciaIsolamento.push({
                        fase: form.querySelector(`input[name="ri_fase_${faseId}"]`)?.value,
                        condicao: form.querySelector(`input[name="ri_condicao_${faseId}"]`)?.value,
                        tensaoEnsaio: form.querySelector(`input[name="ri_tensao_ensaio_${faseId}"]`)?.value,
                        valorMedido: form.querySelector(`input[name="ri_valor_medido_${faseId}"]`)?.value,
                        valorReferencia: form.querySelector(`input[name="ri_valor_referencia_${faseId}"]`)?.value,
                        tempo: form.querySelector(`input[name="ri_tempo_${faseId}"]`)?.value,
                    });
                });
                dadosMedicao.servicos = [];
                const servicosLabelsCM = ["Inspeção visual", "Limpeza geral", "Reaperto, conexão da blindagem ao aterramento"];
                servicosLabelsCM.forEach((label, index) => {
                    const name = `servico_cm_${index}`;
                    dadosMedicao.servicos.push({
                        label: label,
                        valor: form.querySelector(`input[name="${name}"]:checked`)?.value || 'N/A'
                    });
                });
            }

            // Coleta observações e não conformidade em qualquer modo
            dadosMedicao.observacoes = form.querySelector("#observacoesCM")?.value.trim();
            dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
            if (dadosMedicao.naoConforme) {
                dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
            } else {
                dadosMedicao.naoConformeDescricao = "";
            }
            break;
        }

        case 'resistor_de_aterramento': {
            // Coleta dados de identificação em qualquer modo
            dadosMedicao.localizacao = form.querySelector("#localizacaoRA")?.value.trim();
            dadosMedicao.tag = form.querySelector("#tagRA")?.value.trim();
            dadosMedicao.tipoModelo = form.querySelector("#tipoModeloRA")?.value.trim();
            dadosMedicao.anoFabricacao = form.querySelector("#anoFabricacaoRA")?.value;
            dadosMedicao.fabricante = form.querySelector("#fabricanteRA")?.value.trim();
            dadosMedicao.numSerie = form.querySelector("#numSerieRA")?.value.trim();
            dadosMedicao.classeTensao = form.querySelector("#classeTensaoRA")?.value.trim();
            dadosMedicao.correnteNominal = form.querySelector("#correnteNominalRA")?.value.trim();
            dadosMedicao.tempEnsaio = form.querySelector("#tempEnsaioRA")?.value;
            dadosMedicao.umidadeRelativa = form.querySelector("#umidadeRelativaRA")?.value;
            dadosMedicao.frequencia = form.querySelector("#frequenciaRA")?.value.trim();
            dadosMedicao.massaTotal = form.querySelector("#massaTotalRA")?.value.trim();
            
            // Só coleta dados de medição no modo 'full'
            if (mode === 'full') {
                dadosMedicao.resistenciaNominal = form.querySelector("#resistenciaNominalRA")?.value;
                dadosMedicao.resistenciaMedida = form.querySelector("#resistenciaMedidaRA")?.value;
            }
            
            // Coleta observações e não conformidade em qualquer modo
            dadosMedicao.observacoes = form.querySelector("#observacoesRA")?.value.trim();
            dadosMedicao.naoConforme = form.querySelector(".nao-conforme-checkbox")?.checked || false;
            if (dadosMedicao.naoConforme) {
                dadosMedicao.naoConformeDescricao = form.querySelector(".nao-conforme-descricao textarea")?.value.trim() || 'Descrição não fornecida.';
            } else {
                dadosMedicao.naoConformeDescricao = "";
            }
            break;
        }
    }

 
dadosMedicao.fotos = [];
form.querySelectorAll('.photo-preview-item').forEach(item => {
    const imgSrc = item.querySelector('img')?.src;
    const imgDesc = item.querySelector('.photo-description')?.value.trim();
    if (imgSrc) {
        dadosMedicao.fotos.push({ src: imgSrc, description: imgDesc || '' });
    }
});

    return dadosMedicao;
}
function setupMeasurementModalEventListeners() {

    const naoConformeCheck = measurementModalOverlayElement.querySelector(".nao-conforme-checkbox");
    const naoConformeDescricaoContainer = measurementModalOverlayElement.querySelector(".nao-conforme-descricao");
    
    if (naoConformeCheck && naoConformeDescricaoContainer) {
        naoConformeCheck.addEventListener('change', (e) => {
            if (e.target.checked) {
                naoConformeDescricaoContainer.style.display = 'block';
            } else {
                naoConformeDescricaoContainer.style.display = 'none';
            }
        });
    }
    if (!measurementModalOverlayElement) return;
   

const fotosInput = measurementModalOverlayElement.querySelector("#fotosMedicaoInput");
const previewDiv = measurementModalOverlayElement.querySelector("#previewFotosMedicao");
const fileCountSpan = measurementModalOverlayElement.querySelector("#fileCountMedicao");

if (fotosInput && previewDiv && fileCountSpan) {
    fotosInput.addEventListener("change", function() {
        renderPhotoPreview(this, previewDiv, fileCountSpan);
    });

   
    const dadosMedicao = osDataCache.subestacoes[currentSubestacaoIndex]?.equipamentos
        .find(e => e.nome === currentEquipmentName)?.dadosMedicao?.[currentUnidade] || {};
    if (dadosMedicao.fotos && dadosMedicao.fotos.length > 0) {
         dadosMedicao.fotos.forEach(foto => renderSinglePhoto(foto, previewDiv));
         updateFileCount(previewDiv, fileCountSpan);
    }
}
    const form = measurementModalOverlayElement.querySelector("#measurementFormModal");
    const closeButton = measurementModalOverlayElement.querySelector("#closeMeasurementModalBtn");
    const cancelButton = measurementModalOverlayElement.querySelector("#cancelMeasurementFormBtnModal");
    const btnAddEquipUtilizado = measurementModalOverlayElement.querySelector("#btnAddEquipamentoUtilizado");
    const equipamentosUtilizadosContainer = measurementModalOverlayElement.querySelector("#equipamentosUtilizadosContainer");
    if (!form || !closeButton || !cancelButton) {
        hideMeasurementModal(); return;
    }
    closeButton.addEventListener("click", hideMeasurementModal);
    cancelButton.addEventListener("click", hideMeasurementModal);
    if (btnAddEquipUtilizado && equipamentosUtilizadosContainer) {
        btnAddEquipUtilizado.addEventListener('click', () => addEquipamentoUtilizadoRow(equipamentosUtilizadosContainer));
        const removeButtons = equipamentosUtilizadosContainer.querySelectorAll('.btn-remove-equip-utilizado');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.equipamento-utilizado-item').remove();
            });
        });
    }
    

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dadosMedicaoColetados = collectMeasurementData(currentEquipmentType, currentMode);

    if (dadosMedicaoColetados) {
        if (!osDataCache || !osDataCache.subestacoes) {
            alert("Erro crítico: Cache da OS não disponível.");
            hideMeasurementModal();
            return;
        }

        const subestacaoAlvo = osDataCache.subestacoes[currentSubestacaoIndex];
        if (!subestacaoAlvo) {
            alert("Erro: Subestação não encontrada no cache.");
            hideMeasurementModal();
            return;
        }

        if (!subestacaoAlvo.equipamentos) {
            subestacaoAlvo.equipamentos = [];
        }

        const equipAlvo = subestacaoAlvo.equipamentos.find(eq => eq.nome === currentEquipmentName);

        if (equipAlvo) {
            if (!equipAlvo.dadosMedicao) {
                equipAlvo.dadosMedicao = {};
            }

            // --- INÍCIO DA CORREÇÃO ---
            // Em vez de substituir o objeto inteiro, o que pode causar perda de referência,
            // vamos mesclar os dados coletados no objeto existente.
            // Se não houver um objeto de medição para a unidade, criamos um.
            if (!equipAlvo.dadosMedicao[currentUnidade]) {
                equipAlvo.dadosMedicao[currentUnidade] = {};
            }

            // Mescla os novos dados (incluindo a não conformidade) com os dados existentes.
            Object.assign(equipAlvo.dadosMedicao[currentUnidade], dadosMedicaoColetados);
            // --- FIM DA CORREÇÃO ---

        } else {
            // Se o equipamento é novo, adiciona-o
            subestacaoAlvo.equipamentos.push({
                nome: currentEquipmentName,
                selecionado: true,
                quantidade: 1, // Assumindo quantidade 1
                dadosMedicao: { [currentUnidade]: dadosMedicaoColetados }
            });
        }
        
       
        updateOs(JSON.parse(JSON.stringify(osDataCache)));
        
       
        const btnMedicaoNoOsForm = document.querySelector(`#btn_med_${currentSubestacaoIndex + 1}_${formatNameForId(currentEquipmentName)}_${currentUnidade}`);
        if (btnMedicaoNoOsForm) {
            btnMedicaoNoOsForm.innerHTML = `<span class="material-icons">edit_note</span> Unidade ${currentUnidade}`;
            btnMedicaoNoOsForm.classList.add('tem-dados');
        }
        
        hideMeasurementModal();
    }
});
}
export function showMeasurementModal(osId, subestacaoIdx, equipmentName, equipmentType, unidade, dadosMedicaoExistente = {}, mode = 'full') {
    if (measurementModalOverlayElement) hideMeasurementModal();
    currentOsId = parseInt(osId, 10);
    currentSubestacaoIndex = subestacaoIdx;
    currentEquipmentName = equipmentName;
    currentEquipmentType = equipmentType;
    currentUnidade = unidade;
    currentMode = mode; 

    try {
        
        const modalHTML = getMeasurementFormHTML(equipmentType, dadosMedicaoExistente, currentMode); 
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        measurementModalOverlayElement = tempDiv.firstElementChild; 
        if (!measurementModalOverlayElement) throw new Error("Falha ao criar o elemento do modal.");
        document.body.appendChild(measurementModalOverlayElement);
        document.body.style.overflow = 'hidden';
        setupMeasurementModalEventListeners();
    } catch (error) {
        console.error("Erro crítico ao mostrar o modal de medição:", error);
        alert(`Erro ao abrir o modal: ${error.message}`);
        hideMeasurementModal(); 
    }
}
export function hideMeasurementModal() {
    if (measurementModalOverlayElement) {
        measurementModalOverlayElement.remove();
        measurementModalOverlayElement = null;
        document.body.style.overflow = 'auto';
    }
}