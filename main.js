// === Configuración inicial ===
let map = null; // Se inicializará después

// === Parámetros del modelo SIR (del informe) ===
// β: tasa de transmisión (probabilidad de infección por contacto)
// γ: tasa de recuperación (1/γ = días de infección)
let beta = 0.3;    // Ajustable
let gamma = 0.14;  // Ajustable
const dt = 0.5;      // Paso de tiempo (medio día) para estabilidad numérica
let animationSpeed = 200; // ms por frame

// Calcular R₀ (número reproductivo básico)
function calculateR0() {
  return beta / gamma;
}

let R0 = calculateR0();

// === Control de método de cálculo ===
let useIntegralMethod = false; // false = Euler, true = Integral

// === Sistema de configuración de zonas ===
// Modo anterior de configuración personalizada eliminado: ahora solo simulaciones aleatorias
// (cleanup: removed setupMode, customZones, tempMarker, tempCoords)

// Población total de Santa Cruz según datos reales
const POBLACION_TOTAL_SANTA_CRUZ = 3122605;

// Nombres reales de zonas/distritos de Santa Cruz
const NOMBRES_ZONAS_SCZ = [
  "Centro Histórico", "Plan 3000", "Equipetrol", "Pampa de la Isla", "Las Palmas",
  "Villa 1ro de Mayo", "Urbarí", "Los Lotes", "Montero Hoyos", "La Cuchilla",
  "Villa Busch", "Cristo Rey", "Santos Dumont", "San Aurelio", "Mutualista",
  "La Morita", "San Martin", "Villa Olimpica", "El Bajio", "Sirari",
  "Palmasola", "La Guardia", "Warnes", "Cotoca", "Porongo"
];

// Límites geográficos del área metropolitana de Santa Cruz
const SCZ_BOUNDS = {
  minLat: -17.85,
  maxLat: -17.70,
  minLng: -63.25,
  maxLng: -63.10
};

// === Función para generar zonas aleatorias ===
function generateRandomZones() {
  const zones = [];
  const numZones = Math.floor(Math.random() * 5) + 3; // 3 a 7 zonas
  const availableNames = [...NOMBRES_ZONAS_SCZ]; // Copia del array
  
  // Calcular población promedio por zona
  const avgPopulation = POBLACION_TOTAL_SANTA_CRUZ / numZones;
  let remainingPopulation = POBLACION_TOTAL_SANTA_CRUZ;
  
  for (let i = 0; i < numZones; i++) {
    // Seleccionar nombre aleatorio único
    const nameIndex = Math.floor(Math.random() * availableNames.length);
    const name = availableNames.splice(nameIndex, 1)[0];
    
    // Generar ubicación aleatoria dentro de Santa Cruz
    const lat = SCZ_BOUNDS.minLat + Math.random() * (SCZ_BOUNDS.maxLat - SCZ_BOUNDS.minLat);
    const lng = SCZ_BOUNDS.minLng + Math.random() * (SCZ_BOUNDS.maxLng - SCZ_BOUNDS.minLng);
    
    // Calcular población (con variación +/- 40%)
    let population;
    if (i === numZones - 1) {
      // Última zona: usar población restante
      population = Math.round(remainingPopulation);
    } else {
      const variation = 0.4; // 40% de variación
      const minPop = avgPopulation * (1 - variation);
      const maxPop = avgPopulation * (1 + variation);
      population = Math.round(minPop + Math.random() * (maxPop - minPop));
      remainingPopulation -= population;
    }
    
    // Calcular infectados iniciales (0.05% - 0.2% de la población)
    const infectionRate = 0.0005 + Math.random() * 0.0015; // 0.05% - 0.2%
    const initialInfected = Math.max(10, Math.round(population * infectionRate));
    
    // Día de inicio aleatorio (0-14 días)
    const dayStart = Math.floor(Math.random() * 15);
    
    zones.push({
      name: name,
      pos: [lat, lng],
      N: population,
      I0: initialInfected,
      dayStart: dayStart
    });
  }
  
  // Ordenar por día de inicio
  zones.sort((a, b) => a.dayStart - b.dayStart);
  
  console.log(`Generadas ${numZones} zonas aleatorias:`);
  zones.forEach(z => {
    console.log(`  - ${z.name}: N=${z.N.toLocaleString()}, I₀=${z.I0}, Día=${z.dayStart}`);
  });
  console.log(`  Población total: ${zones.reduce((sum, z) => sum + z.N, 0).toLocaleString()}`);
  
  return zones;
}

// === Zonas predefinidas de Santa Cruz (ejemplo fijo para referencia) ===
const predefinedZones = [
  { name: "Centro", pos: [-17.7863, -63.1786], N: 450000, I0: 500, dayStart: 0 },
  { name: "Plan 3000", pos: [-17.8200, -63.1300], N: 680000, I0: 300, dayStart: 3 },
  { name: "Barrio Equipetrol", pos: [-17.7650, -63.1650], N: 320000, I0: 250, dayStart: 5 },
  { name: "Pampa de la Isla", pos: [-17.8050, -63.1900], N: 580000, I0: 200, dayStart: 7 },
  { name: "Las Palmas", pos: [-17.7400, -63.1500], N: 410000, I0: 150, dayStart: 9 },
  { name: "Villa 1ro de Mayo", pos: [-17.7950, -63.1450], N: 682605, I0: 180, dayStart: 11 }
];

// === Zonas de simulación (se configurarán) ===
let zonas = [];

// Capas para los círculos
const circles = [];
let currentDay = 0;
let simInterval = null;

// Historial de datos para gráficos y exportación
const history = {
  days: [],
  totalS: [],
  totalI: [],
  totalR: [],
  totalI_Euler: [],    // I(t) calculado con Euler
  totalI_Integral: [], // I(t) calculado con ecuación integral
  zones: {}
};

// Historial temporal para cálculo de integral (guarda S, I y N_activo en cada paso)
const timeHistory = []; // [{t, S, I, I_initial, N_active}, ...]

// Variables para estadísticas
let peakInfected = 0;
let peakDay = 0;
let simulationNumber = 1;

// === Funciones auxiliares ===
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Función para obtener color según prevalencia (I/N)
function getColor(prevalence) {
  if (prevalence > 0.1) return '#8B0000';      // Rojo oscuro: >10%
  if (prevalence > 0.05) return '#e53e3e';     // Rojo: 5-10%
  if (prevalence > 0.02) return '#f56565';     // Rojo claro: 2-5%
  if (prevalence > 0.01) return '#fc8181';     // Rosa fuerte: 1-2%
  if (prevalence > 0.005) return '#feb2b2';    // Rosa: 0.5-1%
  return '#fed7d7';                             // Rosa muy claro: <0.5%
}

// === Modelo SIR: Integrador Euler ===
// Implementa las ecuaciones diferenciales del informe:
// dS/dt = -β * S * I / N
// dI/dt = β * S * I / N - γ * I
// dR/dt = γ * I
function stepSIR(zona, deltaT) {
  if (!zona.active) return;
  
  const N = zona.N;
  const S = zona.S;
  const I = zona.I;
  const R = zona.R;
  
  // Calcular cambios (normalizados por población)
  const infection_rate = (beta * S * I / N) * deltaT;
  const recovery_rate = (gamma * I) * deltaT;
  
  // Actualizar compartimientos con límites para estabilidad
  zona.S = clamp(S - infection_rate, 0, N);
  zona.I = clamp(I + infection_rate - recovery_rate, 0, N);
  zona.R = clamp(R + recovery_rate, 0, N);
  
  // Validar conservación de población (permitir pequeño error numérico)
  const total = zona.S + zona.I + zona.R;
  if (Math.abs(total - N) > 10) {
    console.warn(`Zona ${zona.name}: Conservación violada. Total=${total.toFixed(0)}, N=${N}`);
  }
}

// === Modelo SIR: Ecuación Integral ===
// Implementa la ecuación integral del informe:
// I(t) = I(0)·e^(-γt) + ∫[0,t] β·S(u)·I(u)·e^(-γ(t-u)) du
function calculateI_Integral(t, I_initial) {
  // Primer término: infectados iniciales que decaen exponencialmente
  const term1 = I_initial * Math.exp(-gamma * t);
  
  // Segundo término: integral de nuevas infecciones
  // Usamos método del trapecio compuesto para integración numérica
  let integral = 0;
  
  for (let i = 1; i < timeHistory.length; i++) {
    const prev = timeHistory[i - 1];
    const curr = timeHistory[i];
    
    // Verificar que estamos dentro del rango [0, t]
    if (curr.t > t) break;
    
    const dt_integral = curr.t - prev.t;
    
    // Evaluar el integrando en ambos puntos
    // f(u) = β·S(u)·I(u)/N_activo(u) · e^(-γ(t-u))
    // Notas:
    // - N_activo(u) es la población de zonas activas en u; evita inflar la integral.
    // - Si N_activo es 0 (antes de activaciones), el término se omite.
    const f_prev = (prev.N_active > 0)
      ? beta * (prev.S * prev.I / prev.N_active) * Math.exp(-gamma * (t - prev.t))
      : 0;
    const f_curr = (curr.N_active > 0)
      ? beta * (curr.S * curr.I / curr.N_active) * Math.exp(-gamma * (t - curr.t))
      : 0;
    
    // Regla del trapecio: ∫f ≈ (f(a) + f(b))/2 · Δt
    integral += (f_prev + f_curr) / 2 * dt_integral;
  }
  
  return term1 + integral;
}

// === Crear círculos iniciales (una sola vez) ===
function initializeCircles() {
  zonas.forEach((z, i) => {
    const circle = L.circle(z.pos, {
      radius: 50,
      color: '#cccccc',
      fillColor: '#f0f0f0',
      fillOpacity: 0.4,
      weight: 2
    }).addTo(map);
    
    circle.bindPopup(`<b>${z.name}</b><br>Población: ${z.N.toLocaleString()}<br>Sin casos activos`);
    circles[i] = circle;
  });
}

// === Gráfico Chart.js (ahora en ventana separada) ===
// El gráfico se muestra en graficos.html, no aquí
let sirChart = null;

function initializeChart() {
  // Ya no se usa en ventana principal
  console.log('Gráfico deshabilitado - usar ventana separada');
}

// === Actualizar historial y sincronizar ===
function updateChart() {
  // Esta función ya no actualiza un gráfico local, solo guarda datos
  
  const totalN = zonas.reduce((sum, z) => sum + z.N, 0);
  const totalS = zonas.reduce((sum, z) => sum + z.S, 0);
  const totalI = zonas.reduce((sum, z) => sum + z.I, 0);
  const totalR = zonas.reduce((sum, z) => sum + z.R, 0);
  
  // Calcular I(t) con ecuación integral
  // I(0) efectivo: sólo zonas activas hasta el tiempo actual
  const totalI_initial = zonas.reduce((sum, z) => sum + (z.dayStart <= currentDay ? z.I0 : 0), 0);
  let totalI_Integral = 0;
  if (timeHistory.length > 1 && currentDay > 0) {
    totalI_Integral = calculateI_Integral(currentDay, totalI_initial);
  }
  
  // Guardar en historial
  history.days.push(Math.round(currentDay * 10) / 10);
  history.totalS.push(totalS);
  history.totalI.push(totalI); // I(t) con Euler
  history.totalR.push(totalR);
  history.totalI_Euler.push(totalI); // Guardar explícitamente Euler
  history.totalI_Integral.push(totalI_Integral); // Guardar integral
  
  // Actualizar pico de infectados
  if (totalI > peakInfected) {
    peakInfected = totalI;
    peakDay = currentDay;
  }
  
  // Guardar por zona
  zonas.forEach(z => {
    history.zones[z.name].S.push(z.S);
    history.zones[z.name].I.push(z.I);
    history.zones[z.name].R.push(z.R);
  });
  
  // Sincronizar con ventana externa de gráficos
  syncWithGraphicsWindow();
}

// === Sincronizar datos con ventana de gráficos ===
function syncWithGraphicsWindow() {
  try {
    const dataToSync = {
      currentDay: currentDay,
      beta: beta,
      gamma: gamma,
      R0: calculateR0(),
      history: {
        days: history.days,
        totalS: history.totalS,
        totalI: history.totalI,
        totalR: history.totalR,
        totalI_Euler: history.totalI_Euler,
        totalI_Integral: history.totalI_Integral
      },
      equations: document.getElementById('equations-display') ? document.getElementById('equations-display').innerHTML : ''
    };
    
    localStorage.setItem('sirData', JSON.stringify(dataToSync));
  } catch (error) {
    console.error('Error sincronizando datos:', error);
  }
}

// === Actualizar ecuaciones diferenciales ===
function updateEquations(totalN, totalI, totalR) {
  const totalS = totalN - totalI - totalR;
  
  // Calcular derivadas actuales (tasas de cambio)
  const dS_dt = -(beta * totalS * totalI / totalN);
  const dI_dt = (beta * totalS * totalI / totalN) - (gamma * totalI);
  const dR_dt = gamma * totalI;
  
  // Calcular I(t) con ecuación integral
  // I(0) efectivo para mostrar en ecuaciones (sólo zonas activas)
  const totalI_initial = zonas.reduce((sum, z) => sum + (z.dayStart <= currentDay ? z.I0 : 0), 0);
  let totalI_Integral = 0;
  let errorRelativo = 0;
  if (timeHistory.length > 1 && currentDay > 0 && totalI > 0) {
    totalI_Integral = calculateI_Integral(currentDay, totalI_initial);
    errorRelativo = Math.abs((totalI - totalI_Integral) / totalI) * 100;
  }
  
  const eqDisplay = document.getElementById('equations-display');
  
  if (!eqDisplay) return;
  
  eqDisplay.innerHTML = `
    <h4>📐 Ecuaciones Diferenciales SIR (EDO)</h4>
    
    <div class="eq-line">
      <strong>dI/dt</strong> = β·S·I/N - γ·I
    </div>
    <div class="eq-line">
      = (${beta.toFixed(2)})·(${Math.round(totalS).toLocaleString()})·(${Math.round(totalI).toLocaleString()})/${Math.round(totalN).toLocaleString()} - (${gamma.toFixed(2)})·(${Math.round(totalI).toLocaleString()})
    </div>
    <div class="eq-line">
      = <span class="eq-value">${dI_dt.toFixed(2)}</span> <span class="eq-label">personas/día</span>
      ${dI_dt > 0 ? '↑' : dI_dt < 0 ? '↓' : '—'}
    </div>
    
    <hr style="border-color: #805ad5; margin: 8px 0;">
    
    <h4 style="color: #805ad5;">📊 Ecuación Integral (Solución Exacta)</h4>
    
    <div class="eq-line" style="font-size: 11px;">
      <strong>I(t)</strong> = I(0)·e<sup>-γt</sup> + ∫<sub>0</sub><sup>t</sup> β·S(u)·I(u)·e<sup>-γ(t-u)</sup> du
    </div>
    
    <div class="eq-line" style="margin-top: 6px;">
      <strong>Comparación en t=${currentDay.toFixed(1)}:</strong>
    </div>
    <div class="eq-line">
      I<sub>Euler</sub>(t) = <span class="eq-value" style="color: #e53e3e;">${Math.round(totalI).toLocaleString()}</span> personas
    </div>
    <div class="eq-line">
      I<sub>Integral</sub>(t) = <span class="eq-value" style="color: #9f7aea;">${Math.round(totalI_Integral).toLocaleString()}</span> personas
    </div>
    <div class="eq-line">
      <strong>Error relativo:</strong> <span class="eq-value" style="color: ${errorRelativo < 1 ? '#38a169' : errorRelativo < 5 ? '#d69e2e' : '#e53e3e'};">${errorRelativo.toFixed(2)}%</span>
    </div>
    
    <hr>
    
    <div class="eq-line" style="font-size: 10px; color: #718096; margin-top: 6px;">
      <strong>Interpretación:</strong><br>
      ${dI_dt > 0 ? '↑ Infectados aumentan (fase de crecimiento)' : dI_dt < 0 ? '↓ Infectados disminuyen (fase de declive)' : '— Infectados en pico máximo'}<br>
      ${errorRelativo < 1 ? '✓ Métodos convergen correctamente' : errorRelativo < 5 ? '⚠ Error moderado' : '✗ Error alto, verificar parámetros'}
    </div>
  `;
}

// === Actualizar visualización del mapa ===
function updateMap() {
  const totalN = zonas.reduce((sum, z) => sum + z.N, 0);
  const totalI = zonas.reduce((sum, z) => sum + z.I, 0);
  const totalR = zonas.reduce((sum, z) => sum + z.R, 0);
  
  R0 = calculateR0();
  
  // Actualizar título con número de simulación
  // Siempre simulación aleatoria (modo personalizado eliminado)
  const simTitle = `Aleatoria #${simulationNumber - 1}`;
  
  document.getElementById('day-display').innerHTML = `
    <strong>Día: ${Math.round(currentDay)}</strong><br>
    <small>Simulación: ${simTitle}</small><br>
    <small>R₀ = ${R0.toFixed(2)} ${R0 > 1 ? '(Epidemia crece)' : '(Se extingue)'}</small>
  `;
  
  // Actualizar estadísticas
  document.getElementById('stats-display').innerHTML = `
    <strong>Total Infectados:</strong> ${Math.round(totalI).toLocaleString()}<br>
    <strong>Total Recuperados:</strong> ${Math.round(totalR).toLocaleString()}<br>
    <strong>Pico Infectados:</strong> ${Math.round(peakInfected).toLocaleString()}<br>
    <strong>Día del Pico:</strong> ${Math.round(peakDay)}
  `;
  
  // Actualizar ecuaciones diferenciales con valores actuales
  updateEquations(totalN, totalI, totalR);
  
  zonas.forEach((z, i) => {
    if (z.active) {
      const I = z.I;
      const prevalence = I / z.N;
      
      // Escala logarítmica para el radio (evita valores extremos)
      const radius = Math.max(100, Math.min(3000, 200 * Math.log10(I + 10)));
      
      // Color según prevalencia
      const color = getColor(prevalence);
      
      // Actualizar círculo sin recrearlo
      circles[i].setRadius(radius);
      circles[i].setStyle({
        color: color,
        fillColor: color,
        fillOpacity: 0.6,
        weight: 3
      });
      
      // Actualizar popup con información detallada
      const popupContent = `
        <b>${z.name}</b><br>
        <strong>Población:</strong> ${z.N.toLocaleString()}<br>
        <strong>Susceptibles:</strong> ${Math.round(z.S).toLocaleString()} (${(100*z.S/z.N).toFixed(1)}%)<br>
        <strong>Infectados:</strong> ${Math.round(z.I).toLocaleString()} (${(100*prevalence).toFixed(2)}%)<br>
        <strong>Recuperados:</strong> ${Math.round(z.R).toLocaleString()} (${(100*z.R/z.N).toFixed(1)}%)<br>
        <hr style="margin: 4px 0;">
        <small>Día ${Math.round(currentDay)}</small>
      `;
      circles[i].setPopupContent(popupContent);
    }
  });
}

// === Activar zona cuando llega su día de inicio ===
function checkAndActivateZones() {
  zonas.forEach(z => {
    if (!z.active && currentDay >= z.dayStart) {
      z.active = true;
      z.I = z.I0;  // Activar infectados iniciales
      z.S = z.N - z.I0;
      console.log(`Día ${currentDay}: Activada zona ${z.name} con ${z.I0} infectados iniciales`);
    }
  });
}

// === Paso de simulación ===
function simulationStep() {
  // Verificar si hay zonas para activar
  checkAndActivateZones();
  
  // Guardar estado actual ANTES de actualizar (para cálculo de integral)
  const totalS_before = zonas.reduce((sum, z) => sum + (z.active ? z.S : 0), 0);
  const totalI_before = zonas.reduce((sum, z) => sum + (z.active ? z.I : 0), 0);
  const totalI_initial = zonas.reduce((sum, z) => sum + (z.active ? z.I0 : 0), 0);
  const totalN_active = zonas.reduce((sum, z) => sum + (z.active ? z.N : 0), 0);
  
  timeHistory.push({
    t: currentDay,
    S: totalS_before,
    I: totalI_before,
    I_initial: totalI_initial,
    N_active: totalN_active
  });
  
  // Ejecutar paso SIR para cada zona activa (método Euler)
  zonas.forEach(z => stepSIR(z, dt));
  
  // Calcular I(t) con ecuación integral para comparación
  let totalI_Integral = 0;
  if (timeHistory.length > 1) {
    totalI_Integral = calculateI_Integral(currentDay, totalI_initial);
  }
  
  // Actualizar visualización
  updateMap();
  updateChart();
}

// === Reiniciar simulación ===
function resetSimulation() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
  
  currentDay = 0;
  peakInfected = 0;
  peakDay = 0;
  
  // Limpiar historial
  history.days = [];
  history.totalS = [];
  history.totalI = [];
  history.totalR = [];
  history.totalI_Euler = [];
  history.totalI_Integral = [];
  timeHistory.length = 0; // Limpiar historial temporal para integral
  zonas.forEach(z => {
    history.zones[z.name] = { S: [], I: [], R: [] };
  });
  
  // Reiniciar todas las zonas
  zonas.forEach(z => {
    z.S = z.N - z.I0;
    z.I = 0;
    z.R = 0;
    z.active = false;
  });
  
  // Reiniciar círculos
  circles.forEach(c => {
    if (c) {
      c.setRadius(50);
      c.setStyle({
        color: '#cccccc',
        fillColor: '#f0f0f0',
        fillOpacity: 0.4,
        weight: 2
      });
    }
  });
  
  // Limpiar gráfico
  if (sirChart) {
    sirChart.data.labels = [];
    sirChart.data.datasets.forEach(dataset => dataset.data = []);
    sirChart.update();
  }
  
  // Limpiar ecuaciones
  const eqDisplay = document.getElementById('equations-display');
  if (eqDisplay) {
    eqDisplay.innerHTML = `
      <h4>📐 Ecuaciones Diferenciales SIR</h4>
      <div class="eq-line" style="color: #718096; font-style: italic;">
        Las ecuaciones se actualizarán durante la simulación...
      </div>
    `;
  }
  
  updateMap();
  // Enviar estado inicial a la ventana de gráficos para que arranque sincronizada
  updateChart();
  console.log('Simulación reiniciada (estado inicial sincronizado)');
}

// === Exportar datos a CSV ===
// exportToCSV eliminado por simplificación (no se exporta a Excel)

// === Iniciar/Pausar simulación ===
let isPaused = false;

document.getElementById('startBtn').addEventListener('click', () => {
  const btn = document.getElementById('startBtn');
  
  if (simInterval) {
    // Pausar
    clearInterval(simInterval);
    simInterval = null;
    btn.textContent = 'Reanudar';
    isPaused = true;
    console.log('Simulación pausada');
  } else {
    // Iniciar o reanudar
    btn.textContent = 'Pausar';
    isPaused = false;
    console.log(currentDay === 0 ? 'Simulación iniciada' : 'Simulación reanudada');
    
    simInterval = setInterval(() => {
      currentDay += dt;  // Avanzar medio día
      
      if (currentDay > 120) {  // 120 días de simulación
        clearInterval(simInterval);
        simInterval = null;
        btn.textContent = 'Iniciar Simulación';
        
        // Calcular estadísticas finales
        const totalS = zonas.reduce((sum, z) => sum + z.S, 0);
        const totalI = zonas.reduce((sum, z) => sum + z.I, 0);
        const totalR = zonas.reduce((sum, z) => sum + z.R, 0);
        const totalN = zonas.reduce((sum, z) => sum + z.N, 0);
        
        console.log('=== Simulación finalizada (120 días) ===');
        console.log(`Total Susceptibles: ${Math.round(totalS).toLocaleString()} (${(100*totalS/totalN).toFixed(1)}%)`);
        console.log(`Total Infectados: ${Math.round(totalI).toLocaleString()} (${(100*totalI/totalN).toFixed(2)}%)`);
        console.log(`Total Recuperados: ${Math.round(totalR).toLocaleString()} (${(100*totalR/totalN).toFixed(1)}%)`);
        console.log(`Pico de infectados: ${Math.round(peakInfected).toLocaleString()} en día ${Math.round(peakDay)}`);
        
        alert(`Simulación completada.\n\nDía ${Math.round(currentDay)}\nCasos finales activos: ${Math.round(totalI).toLocaleString()}\nRecuperados totales: ${Math.round(totalR).toLocaleString()}\nPico: ${Math.round(peakInfected).toLocaleString()} (Día ${Math.round(peakDay)})`);
        return;
      }
      
      simulationStep();
    }, animationSpeed);
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  // Generar nuevas zonas aleatorias en cada reinicio (cambio solicitado)
  zonas = generateRandomZones();
  initializeSimulation();
  document.getElementById('startBtn').textContent = 'Iniciar Simulación';
  console.log('Reinicio con nuevas zonas aleatorias');
});

// Botón de nueva simulación eliminado (se usa Reiniciar)

// Botón de exportación eliminado

// Botón para abrir ventana de gráficos
document.getElementById('openGraphicsBtn').addEventListener('click', () => {
  window.open('graficos.html', 'ventanaGraficos', 'width=1400,height=900');
  console.log('Ventana de gráficos abierta');
});

// === Controles de parámetros ===
document.getElementById('betaSlider').addEventListener('input', (e) => {
  beta = parseFloat(e.target.value);
  document.getElementById('betaValue').textContent = beta.toFixed(2);
  R0 = calculateR0();
  updateMap();
  console.log(`β actualizado: ${beta.toFixed(2)}, R₀: ${R0.toFixed(2)}`);
});

document.getElementById('gammaSlider').addEventListener('input', (e) => {
  gamma = parseFloat(e.target.value);
  document.getElementById('gammaValue').textContent = gamma.toFixed(2);
  R0 = calculateR0();
  updateMap();
  const infectionDays = (1 / gamma).toFixed(1);
  console.log(`γ actualizado: ${gamma.toFixed(2)}, Periodo infeccioso: ${infectionDays} días, R₀: ${R0.toFixed(2)}`);
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
  const speed = parseInt(e.target.value);
  document.getElementById('speedValue').textContent = speed;
  animationSpeed = 1000 / speed; // Convertir a ms
  
  // Si está corriendo, reiniciar con nueva velocidad
  if (simInterval) {
    const wasRunning = true;
    document.getElementById('startBtn').click(); // Pausar
    if (wasRunning) {
      setTimeout(() => document.getElementById('startBtn').click(), 100); // Reanudar
    }
  }
  
  console.log(`Velocidad: ${speed}x (${animationSpeed}ms/frame)`);
});

// === Sistema de configuración de zonas (solo aleatorias) ===

// Botón para iniciar con zonas aleatorias
document.getElementById('usePredefinedBtn').addEventListener('click', () => {
  zonas = generateRandomZones();
  closeSetupModal();
  initializeSimulation();
  console.log('Usando zonas generadas aleatoriamente');
});

// Utilidades mínimas para el modal inicial
function showSetupModal() {
  const modal = document.getElementById('setupModal');
  if (modal) modal.style.display = 'block';
}

function closeSetupModal() {
  const modal = document.getElementById('setupModal');
  if (modal) modal.style.display = 'none';
}

// Modo clic en mapa eliminado (no se usan zonas personalizadas)

// Inicializar la simulación después de configurar zonas
function initializeSimulation() {

  // Mostrar controles (gráficos en segunda ventana)
  document.getElementById('controls').style.display = 'block';

  // Limpiar marcadores temporales previos
  circles.forEach(marker => { if (marker) map.removeLayer(marker); });
  circles.length = 0;

  // Estado base de cada zona (sin infectados activos hasta su dayStart)
  zonas.forEach(z => {
    z.S = z.N - z.I0;
    z.I = 0;
    z.R = 0;
    z.active = false;
  });

  // Reiniciar historial completo
  history.days = [];
  history.totalS = [];
  history.totalI = [];
  history.totalR = [];
  history.totalI_Euler = [];
  history.totalI_Integral = [];
  history.zones = {};
  zonas.forEach(z => { history.zones[z.name] = { S: [], I: [], R: [] }; });

  peakInfected = 0;
  peakDay = 0;
  currentDay = 0;

  // Crear círculos visuales de simulación
  initializeCircles();

  // Reset para registrar día 0 y sincronizar ventana de gráficos
  resetSimulation();

  console.log('=== Simulación Inicializada ===');
  console.log(`Simulación #${simulationNumber}`);
  console.log(`Zonas: ${zonas.length}`);
  console.log(`Población total: ${zonas.reduce((sum, z) => sum + z.N, 0).toLocaleString()}`);

  simulationNumber++;
}

// === Inicializar aplicación ===
console.log('=== Modelo SIR - Dengue en Santa Cruz ===');
console.log('Configurando simulación...');
console.log('');

// Inicializar mapa cuando el DOM esté listo
function initializeMap() {
  map = L.map('map').setView([-17.7863, -63.1786], 12);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
  
  console.log('Mapa inicializado correctamente');
}

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMap);
} else {
  initializeMap();
}

// Mostrar modal de configuración inicial
showSetupModal();
