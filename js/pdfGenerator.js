function renderCoverPage(doc, os) {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    const COLORS = {
        emerald900: '#064e3b',
        amber400: '#fbbf24',
        slate800: '#1e293b',
        slate700: '#334155',
        slate500: '#64748b',
        gray900: '#1e293b',
        watermarkGray: '#e5e7eb'
    };

function renderSignaturePage(doc, pageWidth) {
    const margin = 20;
    // Posição vertical para começar a assinatura (mais ou menos no meio da página)
    let y = 120;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor('#333333');
    doc.text("Atenciosamente,", pageWidth / 2, y, { align: 'center' });
    y += 30; // Aumenta o espaço para a assinatura física

    doc.setDrawColor('#333333');
    doc.setLineWidth(0.3);
    doc.line(margin + 40, y, pageWidth - margin - 40, y); // Linha da assinatura
    y += 7;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Wesley Vinicius Neves Alves", pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFont(undefined, 'normal');
    doc.text("Engenheiro Eletricista", pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text("CREA-AM 34991", pageWidth / 2, y, { align: 'center' });
}
    
    const headerY = 35;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.slate500);
    const detailsText = `OS Nº ${os.id} / Orçamento Nº ${os.numOrcamento || 'N/A'} | REV. 02`;
    doc.text(detailsText, pageWidth / 2, headerY, { align: 'center' });
    
    doc.setDrawColor(COLORS.amber400);
    doc.setLineWidth(0.5);
    const lineLength = 80;
    doc.line((pageWidth - lineLength) / 2, headerY + 5, (pageWidth + lineLength) / 2, headerY + 5);

    
    const contentCenterY = 145;
    doc.setFontSize(150);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.watermarkGray);
    doc.text("ITAM", pageWidth / 2, contentCenterY, { align: 'center' });

    const subtitleY = 100; 
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.emerald900);
    doc.text("RELATÓRIO DE SERVIÇOS TÉCNICOS", pageWidth / 2, subtitleY, { align: 'center', charSpace: 0.5 });
    
    const titleY = contentCenterY + 25;
    doc.setFontSize(48);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.slate800);
    const title = os.tipoServico || "Manutenção Corretiva";
    doc.text(title, pageWidth / 2, titleY, { align: 'center' });
    
   
    const clientInfoY_start = pageHeight - 80;
    doc.setDrawColor(COLORS.amber400);
    doc.setLineWidth(0.8);
    doc.line(margin, clientInfoY_start, margin + 50, clientInfoY_start);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.slate700);
    doc.text("Preparado para", margin, clientInfoY_start + 10);
    
    const col1X = margin;
    const col2X = pageWidth / 2;
    let clientTextY = clientInfoY_start + 20;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.slate800);
    doc.text(os.cliente || "Cliente Exemplo", col1X, clientTextY);
    
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.slate500);
    doc.text(`A/C Sr. ${os.acResponsavel || os.contato || 'N/A'}`, col1X, clientTextY + 5);
    
    doc.text(os.email || "email@exemplo.com", col2X, clientTextY);
    doc.text(os.telefone || "(XX) XXXX-XXXX", col2X, clientTextY + 5);

    clientTextY += 15;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.slate700);
    
    
    doc.text("Data de Realização do Serviço:", col1X, clientTextY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.slate500);
    
    const dataServico = os.dataCriacao ? new Date(os.dataCriacao + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A';
    doc.text(dataServico, col1X + 58, clientTextY);
}
const EQUIPMENT_TYPE_NAMES = {
    chave_seccionadora_de_alta_tensao: 'Chave Seccionadora de Alta Tensão',
    disjuntor_de_alta_tensao: 'Disjuntor de Alta Tensão',
    disjuntor_de_media_tensao: 'Disjuntor de Média Tensão',
    pararaios_de_alta_tensao: 'Pára-raios de Alta Tensão',
    tc_transformador_de_corrente: 'Transformador de Corrente (TC)',
    transformador_de_potencia_de_alta_tensao: 'Transformador de Potência de Alta Tensão',
    chave_seccionadora_de_media_tensao: 'Chave Seccionadora de Média Tensão',
    transformadores_de_potencia: 'Transformadores de Potência',
    malha_de_aterramento: 'Malha de Aterramento',
    cabos_e_muflas: 'Cabos e Muflas',
    resistor_de_aterramento: 'Resistor de Aterramento',
    tp_transformador_de_potencial: 'Transformador de Potencial (TP)',
};

function addText(doc, text, x, y, options) {
    const {
        maxWidth,
        fontSize = 10,
        fontStyle = 'normal',
        color = '#333333',
        lineHeightFactor = 1.15,
        align = 'left'
    } = options;
    doc.setFontSize(fontSize);
    doc.setFont(undefined, fontStyle);
    doc.setTextColor(color);
    const splitText = doc.splitTextToSize(String(text || 'N/A'), maxWidth);
    doc.text(splitText, x, y, {
        align: align
    });
    return y + (splitText.length * fontSize * 0.352778 * lineHeightFactor);
}

function checkPageBreak(doc, currentY, spaceNeeded = 30) {
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    if (currentY + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        return margin;
    }
    return currentY;
}

function renderNaoConformidades(doc, os, y, contentWidth) {
    const naoConformidades = [];

    // Coleta todas as não conformidades do objeto OS
    if (os.subestacoes && os.subestacoes.length > 0) {
        os.subestacoes.forEach((sub, subIndex) => {
            sub.equipamentos.forEach(equip => {
                if (equip.selecionado && equip.dadosMedicao) {
                    Object.keys(equip.dadosMedicao).forEach(unidade => {
                        const medicao = equip.dadosMedicao[unidade];
                        if (medicao.naoConforme && medicao.naoConformeDescricao) {
                            naoConformidades.push({
                                subestacao: sub.nomeIdentificacao || `Subestação ${subIndex + 1}`,
                                equipamento: equip.nome,
                                unidade: unidade,
                                descricao: medicao.naoConformeDescricao
                            });
                        }
                    });
                }
            });
        });
    }

    if (naoConformidades.length === 0) {
        return y; // Pula se não houver não conformidades
    }

    y = checkPageBreak(doc, y, 30);
    y = addSectionTitle(doc, "Resumo de Não Conformidades", y);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    
    naoConformidades.forEach(item => {
        y = checkPageBreak(doc, y, 15);
        
        doc.setTextColor('#c0392b'); // Cor de Perigo (Vermelho)
        doc.setFont(undefined, 'bold');
        const tituloItem = `${item.subestacao} - ${item.equipamento} (Unidade ${item.unidade})`;
        doc.text(tituloItem, 14, y);
        y += 5;

        doc.setTextColor('#333333');
        doc.setFont(undefined, 'normal');
        const descricaoLines = doc.splitTextToSize(item.descricao, contentWidth);
        doc.text(descricaoLines, 14, y);
        y += (descricaoLines.length * 4) + 8;
    });

    return y;
}

function renderConclusaoRecomendacoes(doc, os, y, contentWidth) {
    if (!os.conclusao && !os.recomendacoes) {
        return y; 
    }

    y = checkPageBreak(doc, y, 30);
    y = addSectionTitle(doc, "Conclusão e Recomendações", y);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#333333');

    if (os.conclusao) {
        y = checkPageBreak(doc, y, 15);
        doc.setFont(undefined, 'bold');
        doc.text("Conclusão dos Serviços:", 14, y);
        y += 5;

        doc.setFont(undefined, 'normal');
        const conclusaoLines = doc.splitTextToSize(os.conclusao, contentWidth);
        doc.text(conclusaoLines, 14, y);
        y += (conclusaoLines.length * 4) + 8; 
    }

    if (os.recomendacoes) {
        y = checkPageBreak(doc, y, 15);
        doc.setFont(undefined, 'bold');
        doc.text("Recomendações Técnicas:", 14, y);
        y += 5;

        doc.setFont(undefined, 'normal');
        const recomendacoesLines = doc.splitTextToSize(os.recomendacoes, contentWidth);
        doc.text(recomendacoesLines, 14, y);
        y += (recomendacoesLines.length * 4) + 8;
    }

    return y;
}



function renderFinalConclusion(doc, os, y, contentWidth, pageWidth, title = "CONCLUSÃO") {
    y = addSectionTitle(doc, title, y, pageWidth, { align: 'center' });

    const margin = 20;
    const textWidth = contentWidth - 10;

    // Helper interno para renderizar texto longo com quebra de página segura
    const renderSafeTextBlock = (text, options) => {
        const {
            fontSize,
            fontStyle,
            color,
            align
        } = {
            fontSize: 10,
            fontStyle: 'normal',
            color: '#333333',
            align: 'left',
            ...options
        };
        y = checkPageBreak(doc, y, 20);
        doc.setFontSize(fontSize);
        doc.setFont(undefined, fontStyle);
        doc.setTextColor(color);
        const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
        const lines = doc.splitTextToSize(text, textWidth);
        for (const line of lines) {
            y = checkPageBreak(doc, y, lineHeight);
            let xPos = (align === 'left') ? margin : (doc.internal.pageSize.width / 2);
            doc.text(line, xPos, y, { align: align });
            y += lineHeight;
        }
        return y + 5;
    };

    // Renderiza o texto da Conclusão
    if (os.conclusao) {
        y = renderSafeTextBlock(os.conclusao);
        y += 5;
    }

    // Renderiza o texto das Recomendações
    if (os.recomendacoes) {
        y = renderSafeTextBlock(os.recomendacoes.toUpperCase(), {
            fontSize: 11,
            fontStyle: 'bold',
            color: '#064e3b',
            align: 'center'
        });
    }

    // Renderiza a tabela de Não Conformidades
    const naoConformidades = [];
    if (os.subestacoes) {
        os.subestacoes.forEach((sub) => {
            if (sub.equipamentos) {
                sub.equipamentos.forEach(equip => {
                    if (equip.selecionado && equip.dadosMedicao) {
                        Object.values(equip.dadosMedicao).forEach(medicao => {
                            if (medicao.naoConforme && medicao.naoConformeDescricao) {
                                naoConformidades.push({
                                    nome: EQUIPMENT_TYPE_NAMES[medicao.tipoEquip] || equip.nome,
                                    descricao: medicao.naoConformeDescricao
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    if (naoConformidades.length > 0) {
        y = checkPageBreak(doc, y, 35);
        const head = [['Equipamento Não Conforme', 'Descrição Detalhada da Não Conformidade']];
        const body = naoConformidades.map(item => [item.nome, item.descricao]);
        doc.autoTable({
            startY: y,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: '#c0392b', textColor: '#ffffff', fontStyle: 'bold' },
            columnStyles: { 0: { fontStyle: 'bold' } },
        });
        y = doc.autoTable.previous.finalY + 10;
    }

    // O BLOCO DE ASSINATURA FOI REMOVIDO DAQUI
    return y;
}
function renderClientInfo(doc, os, y, contentWidth) {
    y = addKeyValue(doc, 'OS Nº:', os.id, 14, y, { valueMaxWidth: contentWidth - 30 });
    y = addKeyValue(doc, 'Status:', os.status, 14, y, { valueMaxWidth: contentWidth - 30 });
    y = addKeyValue(doc, 'Data de Criação:', new Date(os.dataCriacao + 'T00:00:00').toLocaleDateString('pt-BR'), 14, y, { valueMaxWidth: contentWidth - 30 });
    y = addKeyValue(doc, 'Cliente:', os.cliente, 14, y, { valueMaxWidth: contentWidth - 30 });
    y = addKeyValue(doc, 'Endereço:', os.endereco, 14, y, { valueMaxWidth: contentWidth - 30 });
    y = addKeyValue(doc, 'Contato:', os.contato, 14, y, { valueMaxWidth: contentWidth - 30 });
    y = addKeyValue(doc, 'E-mail:', os.email, 14, y, { valueMaxWidth: contentWidth - 30 });
    y = addKeyValue(doc, 'N° Orçamento:', os.numOrcamento, 14, y, { valueMaxWidth: contentWidth - 30 });
    y = addKeyValue(doc, 'Tipo de Serviço:', os.tipoServico, 14, y, { valueMaxWidth: contentWidth - 30 });
    y = addKeyValue(doc, 'Técnicos:', (os.tecnicos || []).join(', '), 14, y, { valueMaxWidth: contentWidth - 30 });
    y = addKeyValue(doc, 'Descrição do Problema:', os.descricao, 14, y, { valueMaxWidth: contentWidth - 30 });
    y = addKeyValue(doc, 'Observações Gerais:', os.observacoes, 14, y, { valueMaxWidth: contentWidth - 30 });
    return y + 5;
}

function renderSignaturePage(doc, pageWidth) {
    const margin = 20;
    // Posição vertical para começar a assinatura (mais ou menos no meio da página)
    let y = 120;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor('#333333');
    doc.text("Atenciosamente,", pageWidth / 2, y, { align: 'center' });
    y += 30; // Aumenta o espaço para a assinatura física

    doc.setDrawColor('#333333');
    doc.setLineWidth(0.3);
    doc.line(margin + 40, y, pageWidth - margin - 40, y); // Linha da assinatura
    y += 7;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Wesley Vinicius Neves Alves", pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFont(undefined, 'normal');
    doc.text("Engenheiro Eletricista", pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text("CREA-AM 34991", pageWidth / 2, y, { align: 'center' });
}

function addSectionTitle(doc, title, y, pageWidth, options = {}) {
    const { backgroundColor = '#064e3b', textColor = '#ffffff', align = 'left' } = options;
    
    y = checkPageBreak(doc, y, 20);
    
    const titleHeight = 8;
    const titleYPos = y - 5;
    
    let rectWidth = pageWidth - 28;
    let rectX = 14;
    
    doc.setFillColor(backgroundColor);
    doc.rect(rectX, titleYPos, rectWidth, titleHeight, 'F');
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(textColor);
    
    let textX = (align === 'center') ? pageWidth / 2 : rectX + 5;
    let textAlign = (align === 'center') ? 'center' : 'left';
    
    doc.text(title, textX, y, { align: textAlign });
    
    y += 10;
    return y;
}

function addKeyValue(doc, key, value, x, y, options = {}) {
    const {
        keyWidth = 50,
        valueMaxWidth = 130,
        fontSize = 9
    } = options;

    y = checkPageBreak(doc, y, 10);
    doc.setFontSize(fontSize);
    doc.setTextColor('#555555');
    doc.setFont(undefined, 'bold');
    doc.text(key, x, y);

    doc.setTextColor('#333333');
    doc.setFont(undefined, 'normal');
    const splitValue = doc.splitTextToSize(String(value || 'N/A'), valueMaxWidth);
    doc.text(splitValue, x + keyWidth, y);
    const lineHeight = fontSize * 0.352778 * 1.15;
    return y + (splitValue.length * lineHeight) + 2;
}




function renderMeasurementData(doc, data, y, contentWidth) {
    if (!data || !data.tipoEquip) return y;

    const equipmentName = EQUIPMENT_TYPE_NAMES[data.tipoEquip] || "Equipamento Desconhecido";
    y = checkPageBreak(doc, y, 20);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor('#2a7a4f');
    doc.text(equipmentName, 14, y);
    y += 8;

    const idFields = [
        { label: 'Localização', value: data.localizacao }, { label: 'Identificação', value: data.identificacao },
        { label: 'TAG', value: data.tag }, { label: 'Fabricante', value: data.fabricante },
        { label: 'N° Série', value: data.numSerie || data.numSeriePrincipal }, { label: 'Tipo', value: data.tipo },
        { label: 'Meio Isolante', value: data.meioIsolante }, { label: 'Tensão Nominal (kV)', value: data.tensaoNominal },
        { label: 'Corrente Nominal (A)', value: data.correnteNominal },
    ].filter(f => f.value);

    if (idFields.length > 0) {
        doc.autoTable({
            startY: y, body: idFields.map(f => [f.label, f.value]), theme: 'grid',
            styles: { fontSize: 8, cellPadding: 1.5, lineColor: '#ccc', lineWidth: 0.1 },
            columnStyles: { 0: { fontStyle: 'bold', fillColor: '#f8fcf8', cellWidth: 50 }, 1: { cellWidth: 'auto' } },
            tableWidth: contentWidth
        });
        y = doc.autoTable.previous.finalY + 8;
    }

    const tableOptions = {
        theme: 'grid',
        headStyles: { fillColor: '#3ea765', fontSize: 7, halign: 'center' },
        styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' }
    };

    const sanitize = (text) => {
        if (typeof text !== 'string') return text;
        return text.replace(/≤/g, '<=').replace(/≥/g, '>=');
    };

    switch (data.tipoEquip) {

        case 'chave_seccionadora_de_alta_tensao': {
    // Tabela de Identificação Específica
    const csatIdFields = [
        { label: 'Identificação', value: data.identificacao },
        { label: 'Tipo', value: data.tipo },
        { label: 'Temperatura de Ensaio (°C)', value: data.temperaturaEnsaio },
        { label: 'Umidade Relativa (%)', value: data.umidadeRelativa },
    ].filter(f => f.value);

    if (csatIdFields.length > 0) {
        doc.autoTable({
            startY: y, body: csatIdFields.map(f => [f.label, f.value]), theme: 'grid',
            styles: { fontSize: 8, cellPadding: 1.5, lineColor: '#ccc', lineWidth: 0.1 },
            columnStyles: { 0: { fontStyle: 'bold', fillColor: '#f8fcf8', cellWidth: 'wrap' }, 1: { cellWidth: 'auto' } },
        });
        y = doc.autoTable.previous.finalY + 8;
    }

    // Tabela 1: Resistência de Contato
    if (data.resistenciaContatos?.length) {
        y = checkPageBreak(doc, y, 15);
        addText(doc, 'Resistência de Contato (uOhms)', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
        y += 5;
        const colWidths = [15, 40, 25, 28, 32, 20];
        const tableWidth = colWidths.reduce((a, b) => a + b, 0);
        const hMargin = (doc.internal.pageSize.width - tableWidth) / 2;
        doc.autoTable({
            ...tableOptions, startY: y,
            head: [['Polo', 'Seccionadora Fechada', 'Corrente (A)', 'Medido (uOhms)', 'Referência (uOhms)', 'Tempo (s)']],
            body: data.resistenciaContatos.map(item => [item.polo, item.seccionadora, item.corrente, item.medido, sanitize(item.referencia), item.tempo]),
            margin: { left: hMargin, right: hMargin },
            columnStyles: {
                0: { cellWidth: colWidths[0], halign: 'center' }, 1: { cellWidth: colWidths[1], halign: 'left' },
                2: { cellWidth: colWidths[2], halign: 'center' }, 3: { cellWidth: colWidths[3], halign: 'center' },
                4: { cellWidth: colWidths[4], halign: 'center' }, 5: { cellWidth: colWidths[5], halign: 'center' }
            }
        });
        y = doc.autoTable.previous.finalY + 10;
    }

    // Tabela 2: Resistência de Isolamento
    if (data.resistenciaIsolamento?.length) {
        y = checkPageBreak(doc, y, 15);
        addText(doc, 'Resistência de Isolamento (MOhms)', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
        y += 5;
        const colWidths = [15, 35, 30, 28, 32, 20];
        const tableWidth = colWidths.reduce((a, b) => a + b, 0);
        const hMargin = (doc.internal.pageSize.width - tableWidth) / 2;
        doc.autoTable({
            ...tableOptions, startY: y,
            head: [['Polo', 'Seccionadora Fechada', 'Tensão Ensaio (Vcc)', 'Medido (MOhms)', 'Referência (MOhms)', 'Tempo (s)']],
            body: data.resistenciaIsolamento.map(item => [item.polo, item.seccionadora, item.tensao, item.medido, sanitize(item.referencia), item.tempo]),
            margin: { left: hMargin, right: hMargin },
            columnStyles: {
                0: { cellWidth: colWidths[0], halign: 'center' }, 1: { cellWidth: colWidths[1], halign: 'left' },
                2: { cellWidth: colWidths[2], halign: 'center' }, 3: { cellWidth: colWidths[3], halign: 'center' },
                4: { cellWidth: colWidths[4], halign: 'center' }, 5: { cellWidth: colWidths[5], halign: 'center' }
            }
        });
        y = doc.autoTable.previous.finalY + 10;
    }

    // Tabela 3: Serviços
    if (data.servicos?.length) {
        y = checkPageBreak(doc, y, 15);
        addText(doc, 'Serviços Realizados', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
        y += 5;
        doc.autoTable({
            ...tableOptions, startY: y,
            head: [['Serviço', 'Resultado']],
            body: data.servicos.map(item => [item.label, item.valor]),
            columnStyles: {
                0: { halign: 'left', cellWidth: 'auto' }, 1: { halign: 'center', cellWidth: 30 }
            }
        });
        y = doc.autoTable.previous.finalY + 10;
    }
    break;
}

        case 'resistor_de_aterramento': {
            y = checkPageBreak(doc, y, 15);
            addText(doc, 'Medições do Resistor de Aterramento', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
            y += 8;
            const renderField = (label, value, unit = '') => {
                if (value) {
                    const displayValue = unit ? `${value} ${unit}` : value;
                    y = addKeyValue(doc, label, displayValue, 14, y, { valueMaxWidth: contentWidth - 50 });
                }
            };
            renderField('TAG:', data.tag);
            renderField('Tipo/Modelo:', data.tipoModelo);
            renderField('Ano Fabricação:', data.anoFabricacao);
            renderField('Classe de Tensão (kV):', data.classeTensao);
            renderField('Corrente Nominal (A):', data.correnteNominal);
            renderField('Frequência (Hz):', data.frequencia);
            renderField('Massa Total (Kg):', data.massaTotal);
            renderField('Temp. Ensaio (°C):', data.tempEnsaio);
            renderField('Umidade Relativa (%):', data.umidadeRelativa);
            renderField('Resistência Nominal (Ohms):', data.resistenciaNominal);
            renderField('Resistência Medida (Ohms):', data.resistenciaMedida);
            y += 5;
            break;
        }

        case 'cabos_e_muflas': {
            const cabosIdFields = [
                { label: 'Circuito', value: data.circuito }, { label: 'Tensão (kV)', value: data.tensao },
                { label: 'Bitola do Cabo (mm²)', value: data.bitolaCabo }, { label: 'Temp. Ambiente (°C)', value: data.tempAmbiente },
                { label: 'Umidade Relativa (%)', value: data.umidadeRelativa },
            ].filter(f => f.value);

            if (cabosIdFields.length > 0) {
                doc.autoTable({
                    startY: y, body: cabosIdFields.map(f => [f.label, f.value]), theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 1.5, lineColor: '#ccc', lineWidth: 0.1 },
                    columnStyles: { 0: { fontStyle: 'bold', fillColor: '#f8fcf8', cellWidth: 'wrap' }, 1: { cellWidth: 'auto' } },
                });
                y = doc.autoTable.previous.finalY + 8;
            }
            
            if (data.resistenciaIsolamento?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência do Isolamento (MOhms)', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                const colWidths = [25, 40, 30, 28, 32, 20];
                const tableWidth = colWidths.reduce((a, b) => a + b, 0);
                const hMargin = (doc.internal.pageSize.width - tableWidth) / 2;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Fase', 'Condição de Medição', 'Tensão Ensaio VCC', 'Medido (MOhms)', 'Referência (MOhms)', 'Tempo (s)']],
                    body: data.resistenciaIsolamento.map(item => [item.fase, item.condicao, item.tensaoEnsaio, item.valorMedido, sanitize(item.valorReferencia), item.tempo]),
                    margin: { left: hMargin, right: hMargin },
                    columnStyles: {
                        0: { cellWidth: colWidths[0], halign: 'center' }, 1: { cellWidth: colWidths[1], halign: 'left' },
                        2: { cellWidth: colWidths[2], halign: 'center' }, 3: { cellWidth: colWidths[3], halign: 'center' },
                        4: { cellWidth: colWidths[4], halign: 'center' }, 5: { cellWidth: colWidths[5], halign: 'center' }
                    }
                });
                y = doc.autoTable.previous.finalY + 10;
            }

            if (data.servicos?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Serviços Realizados', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Serviço', 'Resultado']],
                    body: data.servicos.map(item => [item.label, item.valor]),
                     columnStyles: { 0: { halign: 'left', cellWidth: 'auto' }, 1: { halign: 'center', cellWidth: 30 } }
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            break;
        }

        case 'malha_de_aterramento': {
            y = checkPageBreak(doc, y, 15);
            addText(doc, 'Medições da Malha de Aterramento', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
            y += 8;
            const renderField = (label, value) => {
                if (value) {
                    y = addKeyValue(doc, label, value, 14, y, { valueMaxWidth: contentWidth - 50 });
                }
            };
            renderField('Resistência da Malha (Ohms):', data.valorResistencia);
            renderField('Avaliação:', data.avaliacao);
            renderField('Caixas de inspeção e descidas:', data.caixasInspecao);
            renderField('Integridade dos captores:', data.captores);
            y += 5;
            break;
        }

        case 'tc_transformador_de_corrente': {
            if (data.relacaoTransformacao?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Relação de Transformação e Resistência Ôhmica', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, styles: { ...tableOptions.styles, fontSize: 6 },
                    startY: y,
                    head: [['N° Série', 'Corrente AT (A)', 'Corrente BT (A)', 'Terminais', 'Relação Calc.', 'Relação Med.', 'Resist. (mOhms)', 'Exatidão']],
                    body: data.relacaoTransformacao.map(item => [item.numSerie, item.correnteAT, item.correnteBT, item.terminais, item.calculada, item.medida, item.resistencia, item.exatidao]),
                });
                y = doc.autoTable.previous.finalY + 10;
            }

            if (data.resistenciaIsolamento?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência de Isolamento (MOhms)', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                let tableBody = [];
                data.resistenciaIsolamento.forEach(section => {
                    if (section.medicoes && section.medicoes.length > 0) {
                        tableBody.push([{ 
                            content: `N° Série: ${section.numSerie || 'N/A'}`, 
                            colSpan: 3, 
                            styles: { fontStyle: 'bold', fillColor: '#f0f0f0', textColor: '#333' } 
                        }]);
                        section.medicoes.forEach(med => {
                            tableBody.push([med.terminal, med.valMedido, med.tempEnsaio]);
                        });
                    }
                });
                doc.autoTable({
                    ...tableOptions,
                    startY: y,
                    head: [['Terminais de Medição', 'Valor Medido (MOhms)', 'Temp. Ensaio (°C)']],
                    body: tableBody,
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            break;
        }

        case 'pararaios_de_alta_tensao': {
            const paraRaiosIdFields = [
                { label: 'TAG', value: data.tag }, { label: 'Curto Circuito (kA)', value: data.curtoCircuito },
                { label: 'Temp. Ensaio (°C)', value: data.tempEnsaio }, { label: 'Umidade Relativa (%)', value: data.umidadeRelativa },
            ].filter(f => f.value);

            if (paraRaiosIdFields.length > 0) {
                doc.autoTable({
                    startY: y, body: paraRaiosIdFields.map(f => [f.label, f.value]), theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 1.5, lineColor: '#ccc', lineWidth: 0.1 },
                    columnStyles: { 0: { fontStyle: 'bold', fillColor: '#f8fcf8', cellWidth: 'wrap' }, 1: { cellWidth: 'auto' } },
                });
                y = doc.autoTable.previous.finalY + 8;
            }

            if (data.resistenciaIsolamento?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência do Isolamento (MOhms)', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                const colWidths = [30, 35, 30, 28, 32, 20];
                const tableWidth = colWidths.reduce((a, b) => a + b, 0);
                const hMargin = (doc.internal.pageSize.width - tableWidth) / 2;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['N° Série (Individual)', 'Terminais de Medição', 'Tensão Ensaio VCC', 'Medido (MOhms)', 'Referência (MOhms)', 'Tempo (s)']],
                    body: data.resistenciaIsolamento.map(item => [item.numSerie, item.at_massa, item.tensao_ensaio, item.valor_medido, sanitize(item.valor_referencia), item.tempo]),
                    margin: { left: hMargin, right: hMargin },
                    columnStyles: {
                        0: { cellWidth: colWidths[0], halign: 'center' }, 1: { cellWidth: colWidths[1], halign: 'left' },
                        2: { cellWidth: colWidths[2], halign: 'center' }, 3: { cellWidth: colWidths[3], halign: 'center' },
                        4: { cellWidth: colWidths[4], halign: 'center' }, 5: { cellWidth: colWidths[5], halign: 'center' }
                    }
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            break;
        }

        case 'tp_transformador_de_potencial':
        case 'transformadores_de_potencia':
        case 'transformador_de_potencia_de_alta_tensao': {
            if (data.servicos?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Serviços Realizados', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Serviço', 'Resultado']],
                    body: data.servicos.map(item => [item.label, item.valor]),
                     columnStyles: { 0: { halign: 'left', cellWidth: 'auto' }, 1: { halign: 'center', cellWidth: 30 } }
                });
                y = doc.autoTable.previous.finalY + 10;
            }

            if (data.relacaoTransformacao?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Relação de Transformação', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Tap AT', 'Tap BT', 'Tensão AT(V)', 'Tensão BT(V)', 'Relação Calc.', 'Med. H1-H3', 'Med. H2-H1', 'Med. H3-H2']],
                    body: data.relacaoTransformacao.map(item => [item.tap_comutador_at, item.tap_comutador_bt, item.tensao_v_at, item.tensao_v_bt, item.rel_calc, item.rel_med_h1h3x1x0, item.rel_med_h2h1x2x0, item.rel_med_h3h2x3x0]),
                });
                y = doc.autoTable.previous.finalY + 10;
            }

            if (data.resOhmicaAT?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência Ôhmica dos Enrolamentos de AT (Ohms)', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Tap Comutador', 'Tensão AT (V)', 'H1-H3', 'H2-H1', 'H3-H2']],
                    body: data.resOhmicaAT.map(item => [item.tap_comutador, item.tensao_at, item.h1h3, item.h2h1, item.h3h2]),
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            
             if (data.resOhmicaBT?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência Ôhmica dos Enrolamentos de BT (mOhms)', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Tap Comutador', 'Tensão BT (V)', 'X1-X0', 'X2-X0', 'X3-X0']],
                    body: data.resOhmicaBT.map(item => [item.tap_comutador, item.tensao_bt, item.x1x0, item.x2x0, item.x3x0]),
                });
                y = doc.autoTable.previous.finalY + 10;
            }

            if (data.resIsolamento?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência de Isolamento (MOhms)', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Terminais de Medição', 'Tensão de Ensaio (Vcc)', 'Valores Medidos (MOhms)', 'Tempo (s)']],
                    body: data.resIsolamento.map(item => [item.terminais, item.tensao_ensaio, item.val_medido, item.tempo_s]),
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            
            if (data.fpTrafo?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Fator de Potência de Isolamento do Transformador a 10kV', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, styles: { ...tableOptions.styles, fontSize: 6 },
                    startY: y,
                    head: [['#', 'HV', 'LV-R', 'Guard', 'CH Pos.', 'mA', 'Watts', 'FP% Med.', 'FP% Corr.', 'Cap. Med. (pF)', 'Cap. Fab.']],
                    body: data.fpTrafo.map(item => [item.n, item.hv, item.lv_r, item.guard, item.ch_pos, item.ma, item.watts, item.fp_med, item.fp_corr, item.cap_med, item.cap_fab]),
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            
            if (data.fpBuchas?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Fator de Potência de Isolamento das Buchas 10kV', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, styles: { ...tableOptions.styles, fontSize: 6 },
                    startY: y,
                    head: [['N° Série', 'HV', 'LV-R', 'CH Pos.', 'mA', 'Watts', 'FP% Med.', 'FP% Corr.', 'Cap. Med. (pF)', 'Cap. Fab.']],
                    body: data.fpBuchas.map(item => [item.n_serie, item.hv, item.lv_r, item.ch_pos, item.ma, item.watts, item.fp_med, item.fp_corr, item.cap_med, item.cap_fab]),
                });
                y = doc.autoTable.previous.finalY + 10;
            }

            if (data.correnteExcitacao?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Ensaio de Corrente de Excitação', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Fase', 'Tensão (kV)', 'mA']],
                    body: data.correnteExcitacao.map(item => [item.fase, item.tensao_kv, item.ma]),
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            break;
        }

        case 'disjuntor_de_alta_tensao': {
            const djAtIdFields = [
                { label: 'Temperatura de Ensaio (°C)', value: data.temperaturaEnsaio },
                { label: 'Umidade Relativa AR (%)', value: data.umidadeRelativa },
                { label: 'Pressão do Gás (MPa)', value: data.pressao?.tipo === 'gas' ? data.pressao.valor : 'N/A' },
                { label: 'Pressão do Óleo (MPa)', value: data.pressao?.tipo === 'oleo' ? data.pressao.valor : 'N/A' },
            ].filter(f => f.value);

            if (djAtIdFields.length > 0) {
                doc.autoTable({
                    startY: y, body: djAtIdFields.map(f => [f.label, f.value]), theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 1.5, lineColor: '#ccc', lineWidth: 0.1 },
                    columnStyles: { 0: { fontStyle: 'bold', fillColor: '#f8fcf8', cellWidth: 'wrap' }, 1: { cellWidth: 'auto' } },
                });
                y = doc.autoTable.previous.finalY + 8;
            }
            
            if (data.resContatoFechado?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência de Contato (uOhms) - Disjuntor Fechado', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                const colWidths = [15, 35, 30, 30, 35, 20];
                const tableWidth = colWidths.reduce((a, b) => a + b, 0);
                const hMargin = (doc.internal.pageSize.width - tableWidth) / 2;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Polo', 'Disjuntor Fechado', 'Corrente (A)', 'Medido (uOhms)', 'Referência (uOhms)', 'Tempo (s)']],
                    body: data.resContatoFechado.map(item => [item.polo, item.disjuntor_fechado, item.corrente_aplicada, item.valor_medido, sanitize(item.valor_referencia), item.tempo]),
                    margin: { left: hMargin, right: hMargin },
                    columnStyles: {
                        0: { cellWidth: colWidths[0], halign: 'center' }, 1: { cellWidth: colWidths[1], halign: 'left' },
                        2: { cellWidth: colWidths[2], halign: 'center' }, 3: { cellWidth: colWidths[3], halign: 'center' },
                        4: { cellWidth: colWidths[4], halign: 'center' }, 5: { cellWidth: colWidths[5], halign: 'center' }
                    }
                });
                y = doc.autoTable.previous.finalY + 10;
            }

            if (data.resContatoAberto?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência de Isolamento (MOhms) - Disjuntor Aberto', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                const colWidths = [15, 35, 30, 30, 35, 20];
                const tableWidth = colWidths.reduce((a, b) => a + b, 0);
                const hMargin = (doc.internal.pageSize.width - tableWidth) / 2;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Polo', 'Disjuntor Aberto', 'Tensão (Vcc)', 'Medido (MOhms)', 'Referência (MOhms)', 'Tempo (s)']],
                    body: data.resContatoAberto.map(item => [item.polo, item.disjuntor_aberto, item.tensao_aplicada, item.valor_medido, sanitize(item.valor_referencia), item.tempo]),
                    margin: { left: hMargin, right: hMargin },
                    columnStyles: {
                        0: { cellWidth: colWidths[0], halign: 'center' }, 1: { cellWidth: colWidths[1], halign: 'left' },
                        2: { cellWidth: colWidths[2], halign: 'center' }, 3: { cellWidth: colWidths[3], halign: 'center' },
                        4: { cellWidth: colWidths[4], halign: 'center' }, 5: { cellWidth: colWidths[5], halign: 'center' }
                    }
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            
            if (data.resIsolamentoFechado?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência de Isolamento (MOhms) - Polos x Massa', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                const colWidths = [15, 35, 30, 30, 35, 20];
                const tableWidth = colWidths.reduce((a, b) => a + b, 0);
                const hMargin = (doc.internal.pageSize.width - tableWidth) / 2;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Polo', 'Disjuntor Fechado', 'Tensão (Vcc)', 'Medido (MOhms)', 'Referência (MOhms)', 'Tempo (s)']],
                    body: data.resIsolamentoFechado.map(item => [item.polo, item.disjuntor_fechado, item.tensao_aplicada, item.valor_medido, sanitize(item.valor_referencia), item.tempo]),
                    margin: { left: hMargin, right: hMargin },
                    columnStyles: {
                        0: { cellWidth: colWidths[0], halign: 'center' }, 1: { cellWidth: colWidths[1], halign: 'left' },
                        2: { cellWidth: colWidths[2], halign: 'center' }, 3: { cellWidth: colWidths[3], halign: 'center' },
                        4: { cellWidth: colWidths[4], halign: 'center' }, 5: { cellWidth: colWidths[5], halign: 'center' }
                    }
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            
            if (data.fpAberto?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Fator de Potência (10kV) - Disjuntor Aberto', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Polo', 'HV', 'LV-R', 'Posição', 'mA', 'Watts', 'FP% Med', 'FP% Corr', 'Cap(pF)']],
                    body: data.fpAberto.map(item => [item.polo, item.hv, item.lv_r, item.ch_posicao, item.ma, item.watts, item.fp_med, item.fp_corr, item.capacitancia]),
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            
            if (data.fpFechado?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Fator de Potência (10kV) - Disjuntor Fechado', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Polo', 'HV', 'LV-R', 'Posição', 'mA', 'Watts', 'FP% Med', 'FP% Corr', 'Cap(pF)']],
                    body: data.fpFechado.map(item => [item.polo, item.hv, item.lv_r, item.ch_posicao, item.ma, item.watts, item.fp_med, item.fp_corr, item.capacitancia]),
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            
            if (data.servicos?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Serviços Realizados', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Serviço', 'Resultado']],
                    body: data.servicos.map(item => [item.label, item.valor]),
                     columnStyles: { 0: { halign: 'left', cellWidth: 'auto' }, 1: { halign: 'center', cellWidth: 30 } }
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            break;
        }

        case 'chave_seccionadora_de_media_tensao':
            if (data.resistenciaContatos?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência dos Contatos (uOhms)', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                const colWidthsContatos = [15, 35, 25, 30, 35, 20];
                const tableWidthContatos = colWidthsContatos.reduce((a, b) => a + b, 0);
                const hMarginContatos = (doc.internal.pageSize.width - tableWidthContatos) / 2;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Polo', 'Seccionadora Fechada', 'Corrente (A)', 'Medido (uOhms)', 'Referência (uOhms)', 'Tempo (s)']],
                    body: data.resistenciaContatos.map(item => [item.polo, item.seccionadora, item.corrente, item.medido, sanitize(item.referencia), item.tempo]),
                    margin: { left: hMarginContatos, right: hMarginContatos },
                    columnStyles: {
                        0: { cellWidth: colWidthsContatos[0], halign: 'center' }, 1: { cellWidth: colWidthsContatos[1], halign: 'left' },
                        2: { cellWidth: colWidthsContatos[2], halign: 'center' }, 3: { cellWidth: colWidthsContatos[3], halign: 'center' },
                        4: { cellWidth: colWidthsContatos[4], halign: 'center' }, 5: { cellWidth: colWidthsContatos[5], halign: 'center' }
                    }
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            if (data.resistenciaIsolamento?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência do Isolamento (MOhms)', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;

                const colWidthsIsolamento = [15, 35, 30, 30, 35, 20];
                const tableWidthIsolamento = colWidthsIsolamento.reduce((a, b) => a + b, 0);
                const hMarginIsolamento = (doc.internal.pageSize.width - tableWidthIsolamento) / 2;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Polo', 'Seccionadora Fechada', 'Tensão Ensaio VCC', 'Medido (MOhms)', 'Referência (MOhms)', 'Tempo (s)']],
                    body: data.resistenciaIsolamento.map(item => [item.polo, item.seccionadora, item.tensao, item.medido, sanitize(item.referencia), item.tempo]),
                    margin: { left: hMarginIsolamento, right: hMarginIsolamento },
                    columnStyles: {
                        0: { cellWidth: colWidthsIsolamento[0], halign: 'center' }, 1: { cellWidth: colWidthsIsolamento[1], halign: 'left' },
                        2: { cellWidth: colWidthsIsolamento[2], halign: 'center' }, 3: { cellWidth: colWidthsIsolamento[3], halign: 'center' },
                        4: { cellWidth: colWidthsIsolamento[4], halign: 'center' }, 5: { cellWidth: colWidthsIsolamento[5], halign: 'center' }
                    }
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            break;
            
        case 'disjuntor_de_media_tensao':
             if (data.resistenciaContatos?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência dos Contatos (uOhms)', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                const colWidths = [15, 40, 25, 28, 32, 20];
                const tableWidth = colWidths.reduce((a, b) => a + b, 0);
                const hMargin = (doc.internal.pageSize.width - tableWidth) / 2;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Polo', 'Disjuntor Fechado', 'Corrente (A)', 'Medido (uOhms)', 'Referência (uOhms)', 'Tempo (s)']],
                    body: data.resistenciaContatos.map(item => [item.polo, item.disjuntor_fechado, item.corrente_aplicada, item.valor_medido, sanitize(item.valor_referencia), item.tempo]),
                    margin: { left: hMargin, right: hMargin },
                    columnStyles: {
                        0: { cellWidth: colWidths[0], halign: 'center' }, 1: { cellWidth: colWidths[1], halign: 'left' },
                        2: { cellWidth: colWidths[2], halign: 'center' }, 3: { cellWidth: colWidths[3], halign: 'center' },
                        4: { cellWidth: colWidths[4], halign: 'center' }, 5: { cellWidth: colWidths[5], halign: 'center' }
                    }
                });
                y = doc.autoTable.previous.finalY + 10;
            }
             if (data.resIsolamentoAberto?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência do Isolamento (MOhms) - Disjuntor Aberto', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                const colWidths = [15, 35, 30, 28, 32, 20];
                const tableWidth = colWidths.reduce((a, b) => a + b, 0);
                const hMargin = (doc.internal.pageSize.width - tableWidth) / 2;
                doc.autoTable({
                    ...tableOptions, startY: y,
                    head: [['Polo', 'Disjuntor Aberto', 'Tensão Ensaio VCC', 'Medido (MOhms)', 'Referência (MOhms)', 'Tempo (s)']],
                    body: data.resIsolamentoAberto.map(item => [item.polo, item.disjuntor_aberto, item.tensao_ensaio, item.valor_medido, sanitize(item.valor_referencia), item.tempo]),
                    margin: { left: hMargin, right: hMargin },
                    columnStyles: {
                        0: { cellWidth: colWidths[0], halign: 'center' }, 1: { cellWidth: colWidths[1], halign: 'left' },
                        2: { cellWidth: colWidths[2], halign: 'center' }, 3: { cellWidth: colWidths[3], halign: 'center' },
                        4: { cellWidth: colWidths[4], halign: 'center' }, 5: { cellWidth: colWidths[5], halign: 'center' }
                    }
                });
                y = doc.autoTable.previous.finalY + 10;
            }
             if (data.resIsolamentoFechado?.length) {
                y = checkPageBreak(doc, y, 15);
                addText(doc, 'Resistência do Isolamento (MOhms) - Disjuntor Fechado', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
                y += 5;
                 const colWidths = [15, 35, 30, 28, 32, 20];
                 const tableWidth = colWidths.reduce((a, b) => a + b, 0);
                 const hMargin = (doc.internal.pageSize.width - tableWidth) / 2;
                doc.autoTable({
                     ...tableOptions, startY: y,
                    head: [['Polo', 'Disjuntor Fechado', 'Tensão Ensaio VCC', 'Medido (MOhms)', 'Referência (MOhms)', 'Tempo (s)']],
                    body: data.resIsolamentoFechado.map(item => [item.polo, item.disjuntor_fechado, item.tensao_ensaio, item.valor_medido, sanitize(item.valor_referencia), item.tempo]),
                    margin: { left: hMargin, right: hMargin },
                    columnStyles: {
                        0: { cellWidth: colWidths[0], halign: 'center' }, 1: { cellWidth: colWidths[1], halign: 'left' },
                        2: { cellWidth: colWidths[2], halign: 'center' }, 3: { cellWidth: colWidths[3], halign: 'center' },
                        4: { cellWidth: colWidths[4], halign: 'center' }, 5: { cellWidth: colWidths[5], halign: 'center' }
                    }
                });
                y = doc.autoTable.previous.finalY + 10;
            }
            break;
    }

    y = checkPageBreak(doc, y, 20);

    if (data.equipamentosUtilizados?.length) {
        y = checkPageBreak(doc, y, 15);
        addText(doc, 'Equipamentos Utilizados no Ensaio', doc.internal.pageSize.width / 2, y, { fontSize: 10, fontStyle: 'bold', align: 'center' });
        y += 5;
        doc.autoTable({
             ...tableOptions, startY: y,
            head: [['Nome', 'Modelo', 'N° Série/ID']],
            body: data.equipamentosUtilizados.map(item => [item.nome, item.modelo, item.serie]),
            headStyles: { fillColor: '#cccccc', textColor: '#333', fontSize: 7, halign: 'center' },
            columnStyles: { 0: {halign: 'left'}, 1: {halign: 'center'}, 2: {halign: 'center'} }
        });
        y = doc.autoTable.previous.finalY + 10;
    }

    y = addKeyValue(doc, 'Observações da Medição:', data.observacoes, 14, y, { valueMaxWidth: contentWidth - 50 });
    y = checkPageBreak(doc, y, 25);
    y = addKeyValue(doc, 'Data do Ensaio:', data.dataEnsaio ? new Date(data.dataEnsaio + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A', 14, y, { valueMaxWidth: contentWidth - 50 });
    y = addKeyValue(doc, 'Responsável pelos Ensaios:', data.responsavelEnsaio, 14, y, { valueMaxWidth: contentWidth - 50 });
    y = addKeyValue(doc, 'Engenheiro Responsável:', data.engenheiroResponsavel, 14, y, { valueMaxWidth: contentWidth - 50 });
    
if (data.fotos && data.fotos.length > 0) {
    y = checkPageBreak(doc, y, 25);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor('#333333');
    doc.text('Fotos da Medição:', 14, y);
    y += 8;

    data.fotos.forEach((foto) => {
        y = checkPageBreak(doc, y, 75); 
        try {
            const imgProps = doc.getImageProperties(foto.src);
            const imgWidth = 90;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            const xPos = (doc.internal.pageSize.width - imgWidth) / 2;

            doc.addImage(foto.src, imgProps.fileType, xPos, y, imgWidth, imgHeight);
            y += imgHeight + 4;

            if (foto.description) {
                y = checkPageBreak(doc, y, 10);
                doc.setFontSize(8);
                doc.setFont(undefined, 'italic');
                doc.setTextColor('#555555');
                const descLines = doc.splitTextToSize(foto.description, imgWidth);
                doc.text(descLines, xPos, y, { align: 'center' });
                y += (descLines.length * 3.5) + 6;
            } else {
                 y += 6;
            }
        } catch (e) {
            console.error("PDFGEN: Erro ao adicionar imagem ao PDF:", e);
            y = checkPageBreak(doc, y, 10);
            doc.setFontSize(9);
            doc.setTextColor('#c0392b');
            doc.text(`[Erro ao carregar imagem: ${foto.description || ''}]`, 14, y);
            y += 7;
        }
    });
}
    return y + 5;
}


export function gerarRelatorioPDF(os) {
    if (!os) {
        console.error("Não é possível gerar PDF: dados da OS não fornecidos.");
        return;
    }

    const {
        jsPDF
    } = window.jspdf;
    if (!jsPDF) {
        console.error("jsPDF not loaded!");
        return;
    }

    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    if (typeof doc.autoTable !== 'function') {
        console.error("jsPDF-AutoTable not loaded!");
        return;
    }

    const tocEntries = [];
    let mainSectionCounter = 1;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);

    // 1. Renderiza a capa (Página 1)
    renderCoverPage(doc, os);

    const hasContentAfterCover = (os.subestacoes && os.subestacoes.length > 0) || (os.atividades && os.atividades.length > 0) || os.conclusao || os.recomendacoes;
    if (!hasContentAfterCover) {
        doc.save(`Relatorio_OS_${os.id || 'TEMP'}.pdf`);
        return;
    }

    // Inicia o conteúdo na página 2
    doc.addPage();
    let y = 15;

    // --- INÍCIO DA GERAÇÃO DO CONTEÚDO (COM A NOVA ORDEM) ---

    // Seção 1: Conclusão
    y = checkPageBreak(doc, y, 20);
    const titleConclusao = `${mainSectionCounter}. CONCLUSÃO`;
    tocEntries.push({ title: titleConclusao, page: doc.internal.getCurrentPageInfo().pageNumber, level: 0 });
    y = renderFinalConclusion(doc, os, y, contentWidth, pageWidth, titleConclusao);
    mainSectionCounter++;

    // Seção 2: Dados da OS
    y = checkPageBreak(doc, y, 20);
    const titleDadosOS = `${mainSectionCounter}. DADOS DA ORDEM DE SERVIÇO`;
    tocEntries.push({ title: titleDadosOS, page: doc.internal.getCurrentPageInfo().pageNumber, level: 0 });
    y = addSectionTitle(doc, titleDadosOS, y, pageWidth);
    y = renderClientInfo(doc, os, y, contentWidth);
    mainSectionCounter++;

    // Seção 3: Medições
    const hasAnySelectedEquipment = os.subestacoes && os.subestacoes.some(s => s.equipamentos.some(e => e.selecionado && e.dadosMedicao && Object.keys(e.dadosMedicao).length > 0));
    if (hasAnySelectedEquipment) {
        y = checkPageBreak(doc, y, 20);
        const titleMedicoes = `${mainSectionCounter}. MEDIÇÕES DOS EQUIPAMENTOS`;
        tocEntries.push({ title: titleMedicoes, page: doc.internal.getCurrentPageInfo().pageNumber, level: 0 });
        y = addSectionTitle(doc, titleMedicoes, y, pageWidth);
        mainSectionCounter++;

        os.subestacoes.forEach((sub, subIndex) => {
            const equipamentosSelecionados = sub.equipamentos.filter(e => e.selecionado && e.dadosMedicao && Object.keys(e.dadosMedicao).length > 0);
            if (equipamentosSelecionados.length > 0) {
                y = checkPageBreak(doc, y, 15);
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.setTextColor('#1a4729');
                doc.text(`Subestação ${subIndex + 1}: ${sub.nomeIdentificacao}`, margin, y);
                y += 10;
                equipamentosSelecionados.forEach((equip, equipIndex) => {
                    const measurementData = equip.dadosMedicao[Object.keys(equip.dadosMedicao)[0]];
                    const equipmentName = EQUIPMENT_TYPE_NAMES[measurementData.tipoEquip] || equip.nome;
                    y = checkPageBreak(doc, y, 15);
                    tocEntries.push({ title: equipmentName, page: doc.internal.getCurrentPageInfo().pageNumber, level: 1 });
                    y = renderMeasurementData(doc, measurementData, y, contentWidth);
                    const isLastSubstation = subIndex === os.subestacoes.length - 1;
                    const isLastEquipmentInSubstation = equipIndex === equipamentosSelecionados.length - 1;
                    if (!isLastSubstation || !isLastEquipmentInSubstation) {
                        doc.addPage();
                        y = 15;
                    }
                });
            }
        });
    }

    // Seção 4: Atividades
    if (os.atividades && os.atividades.length > 0) {
        y = checkPageBreak(doc, y, 40);
        const titleAtividades = `${mainSectionCounter}. REGISTRO DE ATIVIDADES GERAIS`;
        tocEntries.push({ title: titleAtividades, page: doc.internal.getCurrentPageInfo().pageNumber, level: 0 });
        y = addSectionTitle(doc, titleAtividades, y, pageWidth);
        mainSectionCounter++;
        const head = [['Data', 'Técnico', 'Descrição', 'Tempo (h)', 'Materiais']];
        const body = os.atividades.map(act => {
            const dataFmt = act.dataAtividade ? new Date(act.dataAtividade + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A';
            const materiais = (act.materiaisUsados || []).map(m => `${m.nome}(${m.quantidade})`).join(', ') || 'Nenhum';
            return [dataFmt, act.tecnico, act.descricaoTarefa, act.tempoGasto, materiais];
        });
        doc.autoTable({ startY: y, head: head, body: body, theme: 'striped', headStyles: { fillColor: '#064e3b' }, styles: { fontSize: 8 } });
        y = doc.autoTable.previous.finalY + 10;
    }

    // --- FIM DA GERAÇÃO DO CONTEÚDO ---

    // Adiciona a página de assinatura
    doc.addPage();
    renderSignaturePage(doc, pageWidth);

    // Insere o Sumário na página 2
    doc.insertPage(2);
    doc.setPage(2);

    let tocY = 25;
    const tocLeftMargin = 20;
    const tocRightMargin = pageWidth - 20;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor('#333333');
    doc.text("Sumário", pageWidth / 2, tocY, { align: 'center' });
    tocY += 20;
    
    tocEntries.forEach(entry => {
        if (tocY > 260) {
            doc.addPage();
            tocY = 25;
        }
        const pageNumber = entry.page + 1;
        const title = entry.title;
        const level = entry.level || 0;
        const indent = level * 8;
        const leftX = tocLeftMargin + indent;
        doc.setFontSize(level === 0 ? 12 : 11);
        doc.setFont(undefined, level === 0 ? 'bold' : 'normal');
        doc.setTextColor(level === 0 ? '#333333' : '#555555');
        doc.text(title, leftX, tocY);
        const pageNumStr = String(pageNumber);
        doc.text(pageNumStr, tocRightMargin, tocY, { align: 'right' });
        tocY += (level === 0 ? 10 : 7);
    });
    
    // Adiciona a paginação final em todas as páginas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        if (i === 1) continue; // Pula a capa
        
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const footerText = `RELAPRO | Gerado em: ${new Date().toLocaleDateString('pt-BR')}`;
        doc.text(footerText, margin, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    // Salva o arquivo
    doc.save(`Relatorio_OS_${os.id || 'TEMP'}.pdf`);
}