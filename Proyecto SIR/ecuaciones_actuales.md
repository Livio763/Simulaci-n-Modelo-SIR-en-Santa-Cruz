# Ecuaciones Matemáticas del Modelo SIR Actual

## Sistema de Ecuaciones Diferenciales Ordinarias (EDO)

El código actual implementa el **modelo SIR clásico** basado en tres ecuaciones diferenciales acopladas:

---

### **Ecuación 1: Tasa de cambio de Susceptibles**

$$\frac{dS}{dt} = -\beta \cdot \frac{S \cdot I}{N}$$

**¿Qué hace?**
- Calcula cómo disminuyen los susceptibles con el tiempo
- El signo negativo indica que S **disminuye** (personas pasan de susceptibles a infectados)

**Componentes:**
- $\beta$: Tasa de transmisión (probabilidad de contagio por contacto)
- $S$: Número de susceptibles en el tiempo actual
- $I$: Número de infectados en el tiempo actual
- $N$: Población total constante
- $\frac{S \cdot I}{N}$: Frecuencia de contactos entre susceptibles e infectados (normalizado)

**Interpretación:**
"La velocidad a la que se infectan personas es proporcional al número de contactos entre susceptibles e infectados"

---

### **Ecuación 2: Tasa de cambio de Infectados**

$$\frac{dI}{dt} = \beta \cdot \frac{S \cdot I}{N} - \gamma \cdot I$$

**¿Qué hace?**
- Calcula cómo cambia el número de infectados
- Considera dos procesos simultáneos:
  - **+ Nuevas infecciones** (primer término)
  - **- Recuperaciones** (segundo término)

**Componentes:**
- $\beta \cdot \frac{S \cdot I}{N}$: Tasa de nuevas infecciones (mismo término que en Ecuación 1)
- $\gamma$: Tasa de recuperación (inverso del período infeccioso: $\gamma = 1/D$ donde $D$ = días de infección)
- $\gamma \cdot I$: Número de personas que se recuperan por unidad de tiempo

**Interpretación:**
"Los infectados aumentan cuando hay nuevos contagios, pero disminuyen cuando las personas se recuperan"

---

### **Ecuación 3: Tasa de cambio de Recuperados**

$$\frac{dR}{dt} = \gamma \cdot I$$

**¿Qué hace?**
- Calcula cómo aumentan los recuperados
- Solo depende de las recuperaciones de los infectados

**Componentes:**
- $\gamma \cdot I$: Mismo término que se resta en la Ecuación 2
- Representa el flujo de personas que salen del compartimiento I hacia R

**Interpretación:**
"Los recuperados aumentan proporcionalmente al número de infectados y su tasa de recuperación"

---

## Propiedades del Sistema

### **Conservación de la Población**
$$S(t) + I(t) + R(t) = N \quad \forall t$$

La población total permanece constante (no hay nacimientos ni muertes no relacionadas con la enfermedad).

### **Número Reproductivo Básico ($R_0$)**
$$R_0 = \frac{\beta}{\gamma}$$

- Si $R_0 > 1$: La epidemia crece (cada infectado contagia a más de 1 persona)
- Si $R_0 < 1$: La epidemia se extingue
- Si $R_0 = 1$: Situación crítica (endémica)

---

## Método de Solución Numérica: Euler Explícito

Como estas EDO no tienen solución analítica simple (son no lineales), se resuelven numéricamente:

### **Discretización Temporal**
```
S(t + Δt) = S(t) + dS/dt · Δt
I(t + Δt) = I(t) + dI/dt · Δt
R(t + Δt) = R(t) + dR/dt · Δt
```

**En el código:**
- $\Delta t = 0.5$ días (paso de tiempo pequeño para estabilidad)
- Se actualiza el estado cada medio día

### **Implementación en `main.js`**
```javascript
function stepSIR(zona, deltaT) {
  const infection_rate = (beta * S * I / N) * deltaT;  // dS/dt · Δt
  const recovery_rate = (gamma * I) * deltaT;          // dR/dt · Δt
  
  zona.S = S - infection_rate;                          // Ec. 1
  zona.I = I + infection_rate - recovery_rate;          // Ec. 2
  zona.R = R + recovery_rate;                           // Ec. 3
}
```

---

## Origen de las Ecuaciones

Estas ecuaciones provienen del **modelo SIR clásico** desarrollado por:
- **Kermack, W. O. & McKendrick, A. G. (1927)**
- *"A contribution to the mathematical theory of epidemics"*
- Proceedings of the Royal Society A, 115(772), 700-721

Son el estándar de la epidemiología matemática y se usan en:
- Estudios de brotes de enfermedades infecciosas
- Predicción de pandemias
- Planificación de salud pública
- Análisis de dengue, influenza, COVID-19, sarampión, etc.

---

## Limitaciones del Método Actual

1. **Aproximación numérica**: El método de Euler introduce error de truncamiento
2. **No captura la historia completa**: Solo usa el estado actual, no considera toda la evolución
3. **Puede violar conservación**: Con pasos grandes, S+I+R ≠ N
4. **No es la forma del informe**: Difiere de la ecuación integral que es el foco del proyecto

---

## Relación con la Ecuación Integral del Informe

La ecuación integral:
$$I(t) = I(0)e^{-\gamma t} + \int_0^t \beta S(u)I(u)e^{-\gamma(t-u)} du$$

Es la **solución formal** del sistema de EDO, obtenida mediante:
1. Resolver la ecuación dI/dt usando factor integrante
2. Aplicar convolución temporal
3. Considerar condiciones iniciales

**Ventajas de la ecuación integral:**
- Más precisa matemáticamente
- Refleja explícitamente la memoria del sistema
- Conecta directamente con la teoría de ecuaciones diferenciales
- Es la ecuación central del informe académico

**Por eso debe implementarse en el proyecto.**
