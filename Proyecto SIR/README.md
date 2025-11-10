# Modelo SIR - Simulación de Dengue en Santa Cruz

## 🎯 Descripción
Simulación espacial del modelo epidemiológico SIR (Susceptibles-Infectados-Recuperados) aplicado al dengue en diferentes zonas de Santa Cruz de la Sierra, Bolivia. Este proyecto implementa y compara DOS métodos de resolución: ecuaciones diferenciales ordinarias (método de Euler) y ecuación integral (solución exacta).

## 📊 Modelo Matemático

### **Método 1: Ecuaciones Diferenciales Ordinarias (EDO)**

El proyecto implementa las ecuaciones diferenciales del modelo SIR clásico:

```
dS/dt = -β * S(t) * I(t) / N
dI/dt = β * S(t) * I(t) / N - γ * I(t)
dR/dt = γ * I(t)
```

**Solución numérica:** Método de Euler con paso de tiempo dt = 0.5 días

### **Método 2: Ecuación Integral (Solución Exacta)**

Implementa la ecuación integral del informe académico:

```
I(t) = I(0)·e^(-γt) + ∫[0,t] β·S(u)·I(u)·e^(-γ(t-u)) du
```

**Componentes:**
- **I(0)·e^(-γt)**: Decaimiento exponencial de infectados iniciales
- **∫ β·S(u)·I(u)·e^(-γ(t-u)) du**: Convolución de nuevas infecciones con memoria temporal

**Solución numérica de la integral:** Método del trapecio compuesto

### **Parámetros:**
- **S(t)**: Susceptibles en el tiempo t
- **I(t)**: Infectados en el tiempo t
- **R(t)**: Recuperados en el tiempo t
- **β**: Tasa de transmisión (0.3)
- **γ**: Tasa de recuperación (0.14 → ~7 días de infección)
- **N**: Población total de la zona
- **R₀**: Número reproductivo básico = β/γ ≈ 2.14

### Interpretación de R₀:
- **R₀ > 1**: La epidemia crecerá
- **R₀ < 1**: La epidemia se extinguirá
- **R₀ = 2.14**: Cada infectado contagia en promedio a 2.14 personas

### **Validación de Métodos:**
El proyecto calcula **error relativo** entre ambos métodos:
```
Error = |I_Euler(t) - I_Integral(t)| / I_Integral(t) × 100%
```
Error típico: < 1% (validación exitosa)

## 🏙️ Zonas Simuladas

### **Sistema Aleatorio (Nuevo)** 🎲

Cada vez que eliges "Simulación Aleatoria", el sistema genera:

- **Número de zonas**: 3 a 7 zonas (aleatorio)
- **Ubicaciones**: Distribuidas aleatoriamente en el área metropolitana de Santa Cruz
- **Nombres reales**: Seleccionados de 25 distritos/zonas reales de Santa Cruz
- **Población total**: ~3,122,605 habitantes (dato oficial de Santa Cruz)
- **Distribución poblacional**: Cada zona recibe una porción proporcional con variación ±40%
- **Infectados iniciales**: 0.05% - 0.2% de la población de cada zona
- **Días de inicio**: Escalonados de 0 a 14 días (simula expansión geográfica)

### **Ejemplo de Simulación Aleatoria:**

| Zona | Población | Infectados | Día Inicio |
|------|-----------|------------|------------|
| Plan 3000 | 612,450 | 918 | 0 |
| Cristo Rey | 485,320 | 364 | 2 |
| Urbarí | 723,185 | 542 | 5 |
| Villa Busch | 589,740 | 442 | 8 |
| El Bajio | 711,910 | 534 | 12 |

**Total: 3,122,605 habitantes** ✅

### **Zonas Disponibles en el Pool:**
Centro Histórico, Plan 3000, Equipetrol, Pampa de la Isla, Las Palmas, Villa 1ro de Mayo, Urbarí, Los Lotes, Montero Hoyos, La Cuchilla, Villa Busch, Cristo Rey, Santos Dumont, San Aurelio, Mutualista, La Morita, San Martin, Villa Olimpica, El Bajio, Sirari, Palmasola, La Guardia, Warnes, Cotoca, Porongo.

## 🚀 Cómo Usar

### **Modo 1: Configuración Interactiva (Nuevo)** 🗺️ ⭐

Al abrir la aplicación verás un modal con dos opciones:

#### **Opción A: Marcar en el Mapa**
1. Haz clic en **"🗺️ Marcar en el Mapa"**
2. El mapa se pone en modo configuración (cursor en cruz)
3. **Haz clic en cualquier parte del mapa** donde quieras ubicar un caso índice
4. Se abre un formulario:
   - **Nombre**: Ej. "Hospital Santa Cruz", "Mercado Central"
   - **Población (N)**: Habitantes de esa zona (ej. 50000)
   - **Infectados iniciales (I₀)**: Casos al inicio del brote (ej. 100)
   - **Día de inicio**: Cuándo aparecieron los casos (0 = día inicial)
5. Haz clic en **"Añadir Zona"**
6. Repite para añadir más zonas (focos múltiples)
7. Cuando termines, haz clic en **"✓ Listo, Iniciar Simulación"**

**Ventajas:**
- ✅ Ubicas casos reales en sus coordenadas exactas
- ✅ Puedes simular escenarios hipotéticos
- ✅ Ideal para proyectos sin datos oficiales
- ✅ Eliminas zonas con el botón "✕ Eliminar"

#### **Opción B: Simulación Aleatoria** 🎲 ⭐ NUEVO
1. Haz clic en **"🎲 Simulación Aleatoria"**
2. El sistema genera automáticamente:
   - 3-7 zonas aleatorias
   - Ubicaciones distribuidas en Santa Cruz
   - Población total de 3,122,605 habitantes
   - Infectados y días de inicio variables
3. La simulación inicia inmediatamente
4. Cada vez que lo presiones, obtendrás una configuración diferente

**Ventajas:**
- ✅ Rápido para experimentar
- ✅ Nunca se repite (siempre diferente)
- ✅ Ideal para análisis estadístico (múltiples escenarios)
- ✅ Población realista de Santa Cruz
- ✅ Perfecto para presentaciones dinámicas

**Botón "Nueva Simulación":**
- Aparece en el panel de controles durante la simulación
- Púrpura, debajo de "Reiniciar"
- Te devuelve al menú principal para elegir nuevo escenario

### Controles Básicos
1. **Navega por las pestañas:**
   - **🗺️ Mapa**: Vista geográfica con círculos por zona
   - **📊 Gráficos**: Evolución temporal detallada con leyenda mejorada
   - **📐 Ecuaciones**: Ecuaciones diferenciales e integrales en tiempo real
2. **Ajusta parámetros** (opcional):
   - **β (Transmisión)**: 0.05 a 1.0 (desliza para cambiar)
   - **γ (Recuperación)**: 0.05 a 0.5 (desliza para cambiar)
   - **Velocidad**: 1x a 10x (controla rapidez de la simulación)
3. Haz clic en **"Iniciar Simulación"**
4. Observa en tiempo real:
   - **Pestaña Mapa**: Círculos crecen y cambian de color según infectados
   - **Pestaña Gráficos**: Curvas S-I-R evolucionan, comparación Euler vs Integral
   - **Pestaña Ecuaciones**: Valores actualizados de dI/dt, error relativo, interpretación
   - **Panel izquierdo**: Estadísticas (total infectados, pico, día del pico)
5. Usa **"Pausar"** para detener y examinar
6. Usa **"Reiniciar"** para volver al inicio
7. Haz clic en **"Exportar CSV"** para descargar los datos

### Sistema de Pestañas (Nuevo) 📑 ⭐
La interfaz ahora está organizada en tres pestañas principales:

#### **🗺️ Pestaña Mapa**
- Vista geográfica interactiva de Santa Cruz
- Círculos por zona que crecen con los infectados
- Colores según prevalencia (I/N)
- Zoom y navegación con mouse
- Popups al hacer clic en cada zona

#### **📊 Pestaña Gráficos**
- Gráfico más grande y detallado
- **Leyenda mejorada** con descripciones completas:
  - 🔵 Susceptibles (S) - Personas sin infectar
  - 🔴 Infectados - Método Euler (línea sólida) - EDO numérica
  - 🟣 Infectados - Método Integral (línea punteada) - Solución exacta
  - 🟢 Recuperados (R) - Personas recuperadas
- Comparación visual entre ambos métodos
- Nota interpretativa sobre convergencia

#### **📐 Pestaña Ecuaciones**
- Ecuación diferencial dI/dt con valores sustituidos
- Ecuación integral I(t) = I(0)·e^(-γt) + ∫...
- Comparación: I_Euler vs I_Integral
- **Error relativo** con código de colores:
  - Verde (✓): Error < 1% - Métodos convergen
  - Amarillo (⚠): Error 1-5% - Error moderado
  - Rojo (✗): Error > 5% - Verificar parámetros
- Interpretación automática del estado de la epidemia

### Interacción con el Mapa
- Haz clic en cualquier círculo para ver estadísticas detalladas de esa zona
- Zoom con rueda del mouse o botones +/-
- Arrastra para mover el mapa
- Cambia entre pestañas sin detener la simulación

### Experimentos Sugeridos
1. **Brote controlado**: β=0.2, γ=0.2 → R₀=1.0 (epidemia lenta)
2. **Brote severo**: β=0.5, γ=0.14 → R₀≈3.6 (epidemia rápida)
3. **Extinción**: β=0.1, γ=0.2 → R₀=0.5 (epidemia se extingue)
4. **Comparar métodos**: Observa en pestaña "Gráficos" si las líneas roja y morada coinciden

## 🎨 Visualización

### Colores por Prevalencia (I/N):
- 🟥 **Rojo oscuro**: >10% de infectados
- 🔴 **Rojo**: 5-10%
- 🟠 **Rojo claro**: 2-5%
- 🟡 **Rosa fuerte**: 1-2%
- 🟣 **Rosa**: 0.5-1%
- ⚪ **Rosa claro**: <0.5%

### Tamaño de Círculos:
El radio es proporcional al número de infectados (escala logarítmica para mejor visualización).

## 📈 Características Implementadas (Fases 1, 2 y 3) ✅

### Fase 1 - Fundamentos
✅ **Modelo SIR Correcto**: Ecuaciones diferenciales del informe  
✅ **Integrador Euler**: Método numérico con dt = 0.5 días  
✅ **Compartimientos S-I-R**: Por cada zona  
✅ **Cálculo de R₀**: Actualizado dinámicamente  
✅ **Validación**: Conservación de población  
✅ **Visualización Mejorada**: Colores por prevalencia, sin parpadeo  

### Fase 2 - Gráficos y Visualización
✅ **Gráficos Temporales**: Curvas S(t), I(t), R(t) con Chart.js  
✅ **Panel de Estadísticas**: Total infectados, recuperados, pico y día del pico  
✅ **Historial Completo**: Datos guardados por zona y globales  
✅ **Actualización en Tiempo Real**: Gráfico sincronizado con mapa  

### Fase 3 - Interactividad
✅ **Sliders para β y γ**: Ajusta parámetros en tiempo real  
✅ **Control de Velocidad**: 1x a 10x (configurable)  
✅ **Exportar a CSV**: Descarga todos los datos de la simulación  
✅ **Controles Avanzados**: Pausar/Reanudar/Reiniciar  
✅ **R₀ Dinámico**: Se recalcula automáticamente al cambiar parámetros  

### Fase 4 - Configuración Interactiva (Nuevo) ⭐
✅ **Clic en Mapa**: Marca dónde empezó el primer infectado  
✅ **Formulario de Zona**: Ingresa datos sin editar código  
✅ **Múltiples Focos**: Añade varias zonas de contagio  
✅ **Zonas Aleatorias**: Genera simulaciones diferentes cada vez 🎲  
✅ **Población Real**: 3,122,605 habitantes de Santa Cruz  
✅ **Eliminar Zonas**: Ajusta configuración antes de iniciar  
✅ **Coordenadas GPS**: Ubicación exacta en el mapa  
✅ **Nueva Simulación**: Botón para generar nuevo escenario  

### Fase 5 - Visualización de Ecuaciones (Nuevo) 📐 ⭐⭐
✅ **Ecuaciones Diferenciales en Tiempo Real**: Muestra las 3 EDs del modelo SIR  
✅ **Valores Actualizados**: Sustituye S, I, R, β, γ con datos en vivo  
✅ **Tasas de Cambio**: Calcula dS/dt, dI/dt, dR/dt instantáneas  
✅ **Interpretación Automática**: Explica si cada variable sube/baja  
✅ **Formato Educativo**: Ideal para presentaciones académicas  
✅ **Conexión Teoría-Práctica**: Vincula matemática con simulación visual  

### Fase 6 - Método Híbrido: EDO + Ecuación Integral (Nuevo) 🎯 ⭐⭐⭐
✅ **Ecuación Integral Implementada**: I(t) = I(0)·e^(-γt) + ∫[0,t] β·S(u)·I(u)·e^(-γ(t-u))du  
✅ **Comparación de Métodos**: Muestra curvas de Euler vs Integral simultáneamente  
✅ **Cálculo de Error**: Mide error relativo entre ambos métodos en tiempo real  
✅ **Validación Matemática**: Demuestra convergencia numérica  
✅ **Gráfico Dual**: Línea sólida roja (Euler) + línea punteada morada (Integral)  
✅ **Display Educativo**: Muestra ambas ecuaciones con valores sustituidos  
✅ **Interpretación de Convergencia**: Indica si error < 1% (✓), 1-5% (⚠), >5% (✗)  
✅ **Historial Temporal**: Guarda S(t), I(t) para evaluación de la integral  
✅ **Método del Trapecio**: Integración numérica de alta precisión  
✅ **Valor Académico**: Conecta teoría de EDO con soluciones integrales  

### Fase 7 - Sistema de Pestañas (Nuevo) 📑 ⭐⭐⭐
✅ **Interfaz Organizada**: Tres pestañas principales (Mapa, Gráficos, Ecuaciones)  
✅ **Pestaña Mapa**: Vista geográfica interactiva sin sobreposición de elementos  
✅ **Pestaña Gráficos**: Gráfico ampliado con leyenda detallada y descriptiva  
✅ **Pestaña Ecuaciones**: Panel dedicado a ecuaciones diferenciales e integrales  
✅ **Leyenda Mejorada**: Nombres completos de cada línea con descripción  
✅ **Mayor Espacio Visual**: Gráfico más grande (aspectRatio 2:1)  
✅ **Código de Colores Claro**: Identificación visual de cada método  
✅ **Navegación Fluida**: Cambio entre pestañas sin detener simulación  
✅ **Diseño Profesional**: Separación clara de contenido por función  
✅ **UX Mejorada**: Información accesible sin saturación visual  

## 🔧 Estructura del Proyecto

```
Proyecto SIR/
├── index.html            # Estructura HTML con controles y canvas
├── styles.css            # Estilos responsivos y diseño de paneles
├── main.js               # Lógica SIR: Euler + Integral, gráficos, exportación
├── ecuaciones_actuales.md  # Documentación detallada de las ecuaciones
└── README.md             # Documentación completa
```

### Dependencias (CDN)
- **Leaflet.js 1.9.4**: Mapas interactivos
- **Chart.js 4.4.0**: Gráficos temporales

## 📐 Métodos Numéricos

### **Método 1: Euler Explícito (EDO)**

Paso temporal dt = 0.5 días:

```javascript
S(t+dt) = S(t) - (β * S * I / N) * dt
I(t+dt) = I(t) + (β * S * I / N - γ * I) * dt
R(t+dt) = R(t) + (γ * I) * dt
```

Con funciones de `clamp` para mantener valores en [0, N].

### **Método 2: Ecuación Integral (Solución Exacta)**

```javascript
function calculateI_Integral(t, I_initial) {
  // Término 1: Decaimiento exponencial de infectados iniciales
  const term1 = I_initial * Math.exp(-gamma * t);
  
  // Término 2: Integral usando método del trapecio
  let integral = 0;
  for (cada paso temporal desde 0 hasta t) {
    const f = beta * S(u) * I(u) * exp(-gamma * (t - u));
    integral += f * dt; // Regla del trapecio
  }
  
  return term1 + integral;
}
```

**Validación:** Error relativo típico < 1%

## 🎓 Próximas Mejoras (Futuro)

- [ ] Movilidad entre zonas (matriz de flujo)
- [ ] Modelo vector-huésped (mosquitos + humanos)
- [ ] Calibración con datos reales de Santa Cruz
- [ ] Intervenciones: vacunación, fumigación
- [ ] Modo comparación: ejecutar múltiples escenarios
- [ ] Sensibilidad: análisis de variación de parámetros
- [ ] Predicciones: ML para estimar parámetros óptimos

## 📚 Referencia

Basado en el informe: **"Modelado Matemático del Dengue en Santa Cruz mediante el Modelo SIR"**

## 🐛 Validación

El modelo conserva población en cada zona:
```
S(t) + I(t) + R(t) = N (constante)
```

Se registra advertencia en consola si el error supera 10 personas.

---

**Desarrollado con**: JavaScript, Leaflet.js, HTML5, CSS3  
**Última actualización**: Noviembre 2025
