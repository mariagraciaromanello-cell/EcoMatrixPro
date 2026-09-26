// script.js

// 1. Base de datos de factores ambientales por sector
const environmentalFactors = {
    construction: [
        "Generación de Residuos Sólidos",
        "Emisiones de Polvo (Material Particulado)",
        "Ruido por Maquinaria Pesada",
        "Consumo de Agua Potable",
        "Alteración del Drenaje Natural",
        "Uso de Materiales Tóxicos (Pinturas/Solventes)"
    ],
    mining: [
        "Generación de Relaves",
        "Alteración del Paisaje (Extracción)",
        "Consumo Intensivo de Agua",
        "Emisiones por Transporte Minero",
        "Contaminación Sónica",
        "Afectación a Acuíferos Subterráneos"
    ],
    energy: [
        "Emisiones de CO2 / Gases Efecto Invernadero",
        "Impacto Visual (Estructuras Grandes)",
        "Interferencia con Fauna Migratoria",
        "Generación de Residuos Radiactivos/Eléctricos",
        "Consumo de Agua para Refrigeración",
        "Riesgo de Accidentes Eléctricos/Térmicos"
    ]
};

// Función principal: Genera la matriz basada en el tipo seleccionado
function generateMatrix() {
    const projectType = document.getElementById('projectType').value;
    const projectName = document.getElementById('projectName').value || "Proyecto sin nombre";
    const factorsList = environmentalFactors[projectType];
    const tbody = document.getElementById('matrixBody');
    
    // Limpiar tabla anterior
    tbody.innerHTML = '';

    // Generar filas dinámicamente
    factorsList.forEach((factor, index) => {
        const row = document.createElement('tr');
        row.innerHTML = 
            <td><strong>${index + 1}. ${factor}</strong></td>
            <td><input type="number" min="1" max="5" value="3" class="small-input mag" onchange="calculateRow(this)"></td>
            <td><input type="number" min="1" max="5" value="3" class="small-input int" onchange="calculateRow(this)"></td>
            <td class="impact-result">9</td>
            <td class="action-cell"><span class="badge low-risk">Neutro</span></td>
        ;
        tbody.appendChild(row);
    });

    // Mostrar la sección de evaluación y ocultar la configuración inicial
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
    
    // Guardar datos básicos para el reporte
    window.projectData = { name: projectName, type: projectType };
}

// Calcular impacto individual de cada fila
function calculateRow(inputElement) {
    const row = inputElement.closest('tr');
    const mag = parseInt(row.querySelector('.mag').value);
    const int = parseInt(row.querySelector('.int').value);
    const total = mag * int;
    
    const resultCell = row.querySelector('.impact-result');
    const actionCell = row.querySelector('.action-cell');
    
    resultCell.textContent = total;

    // Lógica simple de criterio
    let statusText = "";
    let cssClass = "";

    if (total <= 4) {
        statusText = "Insignificante";
        cssClass = "low-risk";
    } else if (total <= 10) {
        statusText = "Moderado";
        cssClass = "med-risk";
    } else {
        statusText = "Crítico";
        cssClass = "high-risk";
    }

    actionCell.innerHTML = <span class="badge ${cssClass}">${statusText}</span>;
    
    // Actualizar resumen general si es necesario
    updateSummary();
}

// Actualizar el resumen global
function updateSummary() {
    const rows = document.querySelectorAll('#matrixBody tr');
    let criticalCount = 0;
    let moderateCount = 0;
    let insignificantCount = 0;

    rows.forEach(row => {
        const impactVal = parseInt(row.querySelector('.impact-result').textContent);
        if (impactVal > 10) criticalCount++;
        else if (impactVal > 4) moderateCount++;
        else insignificantCount++;
    });

    const summaryDiv = document.getElementById('summaryText');
    summaryDiv.innerHTML = 
        <p><strong>Críticos:</strong> ${criticalCount}</p>
        <p><strong>Moderados:</strong> ${moderateCount}</p>
        <p><strong>Insignificantes:</strong> ${insignificantCount}</p>
        <hr>
        <p><em>Para ver el reporte detallado y medidas de mitigación automáticas, desbloquea la versión PRO.</em></p>
    ;
    
    document.getElementById('resultsPanel').classList.remove('hidden');
}

// Simulación de exportación PDF (En la versión Pro esto generaría un PDF real)
function exportPDF() {
    alert("🚀 Funcionalidad PRO:\n\nEn la versión Pro, aquí se generaría un PDF con:\n- Tablas completas\n- Medidas de Mitigación sugeridas por IA\n- Firmas digitales\n\n¡Gracias por usar EcoMatrix Lite!");
}
