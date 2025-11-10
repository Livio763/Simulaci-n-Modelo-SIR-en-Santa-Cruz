# Informe del Modelo SIR Espacial para Dengue

## 1. Introducción
El dengue es una enfermedad viral transmitida por mosquitos que presenta dinámicas epidémicas caracterizadas por periodos de crecimiento rápido seguidos de una disminución conforme la población susceptible se reduce. Para apoyar el análisis y la demostración académica de su comportamiento, se desarrolló una herramienta interactiva basada en el **Modelo SIR** (Susceptibles–Infectados–Recuperados) con extensión espacial y doble validación matemática:
1. Resolución numérica de las ecuaciones diferenciales (método de Euler).
2. Evaluación de la **ecuación integral** exacta para el compartimiento de infectados.

La aplicación permite:
- Definir zonas (aleatorias o manuales) sobre el mapa de Santa Cruz.
- Simular la activación escalonada de focos de infección por día de inicio.
- Visualizar en tiempo real la evolución de S, I y R, así como la comparación entre la solución numérica y la integral.
- Generar conclusiones automáticas al finalizar la simulación.

## 2. Objetivo
Desarrollar e implementar un simulador visual y matemáticamente consistente del proceso de transmisión de dengue en un entorno urbano, que permita:
- Mostrar la relación entre las **ecuaciones diferenciales** del modelo SIR y su **forma integral**.
- Validar la precisión del método numérico (Euler) frente a la solución integral exacta.
- Proporcionar métricas interpretables (pico epidémico, ataque final, error relativo entre métodos, R₀) para exposición académica.

## 3. Planteamiento del Problema y Formulación Matemática
La dinámica de transmisión puede describirse mediante un sistema SIR clásico con población total N = S(t) + I(t) + R(t). Las ecuaciones diferenciales ordinarias (EDO) son:

$$\frac{dS}{dt} = -\beta \frac{S(t) I(t)}{N}$$
$$\frac{dI}{dt} = \beta \frac{S(t) I(t)}{N} - \gamma I(t)$$
$$\frac{dR}{dt} = \gamma I(t)$$
Donde:
- $S(t)$: Susceptibles en el tiempo t.
- $I(t)$: Infectados activos.
- $R(t)$: Recuperados (inmunes).
- $\beta$: Tasa de transmisión efectiva (contacto * probabilidad de infección).
- $\gamma$: Tasa de recuperación (inversa del periodo infeccioso medio).
- $R_0 = \beta / \gamma$: Número básico de reproducción.

### 3.1. Método Numérico (Euler)
Para un paso de tiempo $\Delta t$ se aproxima:
$$S_{t+\Delta t} = S_t - \Delta t\; \beta \frac{S_t I_t}{N}$$
$$I_{t+\Delta t} = I_t + \Delta t\left(\beta \frac{S_t I_t}{N} - \gamma I_t\right)$$
$$R_{t+\Delta t} = R_t + \Delta t\; \gamma I_t$$
Este integrador explícito es eficiente y, con $\Delta t$ suficientemente pequeño (0.5 días en la implementación), reproduce adecuadamente la forma general de la epidemia.

### 3.2. Forma Integral de I(t)
El infectado total también puede expresarse como:
$$I(t) = I(0) e^{-\gamma t} + \int_0^t \beta\, S(u)\, I(u)\, e^{-\gamma (t - u)} du$$
Interpretación:
1. Primer término: sobrevivencia de los infectados iniciales decaída exponencialmente.
2. Segundo término: suma ponderada de nuevas infecciones a lo largo del tiempo, modulada por el decaimiento $e^{-\gamma (t-u)}$.

En la aplicación, la integral se evalúa numéricamente mediante la **regla del trapecio compuesta** usando el historial temporal $(S(u), I(u))$ generado por la simulación. Esto permite comparar punto a punto $I_{Euler}(t)$ contra $I_{Integral}(t)$ y calcular el error relativo.

### 3.3. Extensión Espacial
Se consideran múltiples zonas indexadas por $j$, cada una con parámetros iniciales $(N_j, I_{0,j}, dayStart_j)$. La integración aplica las mismas ecuaciones por zona con un estado de activación. El total agregado se obtiene sumando:
$$S_{total}(t) = \sum_j S_j(t), \quad I_{total}(t) = \sum_j I_j(t), \quad R_{total}(t) = \sum_j R_j(t)$$
La forma integral total para infectados iniciales se evalúa usando $S_{total}(u)$ e $I_{total}(u)$.

## 4. Validación y Métricas
Durante la simulación se calculan:
- **Pico de Infectados (Euler)**: $\max_t I_{Euler}(t)$ y el día en que ocurre.
- **Ataque final**: $R_{final} / N$ (fracción de población que transitó por la infección).
- **Concordancia Euler vs Integral**: Error medio relativo (MAPE) y error máximo relativo.
- **R₀ dinámico inicial**: Interpreta crecimiento ($R₀ > 1$) o extinción ($R₀ < 1$).

Un error medio < 5% se clasifica como alta concordancia; 5–15% moderada; >15% baja (posible necesidad de reducir $\Delta t$ o revisar agregación de zonas).

## 5. Conclusiones
El simulador implementado demuestra:
1. La evolución epidémica sigue el patrón teórico del SIR: crecimiento inicial de $I(t)$ mientras $S(t)$ es abundante, pico cuando $S \approx N / R₀$, y declive conforme $R(t)$ aumenta.
2. La **solución integral** valida la implementación numérica: cuando las curvas $I_{Euler}$ e $I_{Integral}$ coinciden dentro de una discrepancia baja, se confirma la fidelidad del integrador de Euler con el paso adoptado.
3. El panel espacial evidencia la heterogeneidad temporal: zonas activadas en días distintos prolongan la duración global del brote frente a un escenario monozona.
4. Las métricas finales (pico, ataque, errores) sintetizan el impacto y la calidad de la simulación, facilitando su exposición.
5. Esta estructura permite ampliar el modelo a escenarios más complejos: variación temporal de $\beta$, movilidad entre zonas o inclusión de un compartimiento de Expuestos (SEIR) para incubación.

## 6. Trabajo Futuro Sugerido
- Calibración de parámetros ($\beta$, $\gamma$) con datos epidemiológicos reales de dengue.
- Incorporación de estacionalidad (variación de $\beta$ por clima) y movilidad inter-zonas.
- Sensibilidad del error frente al tamaño del paso $\Delta t$ y comparación con métodos más avanzados (Runge–Kutta).
- Inclusión de incertidumbre (intervalos de confianza) mediante simulaciones Monte Carlo.

## 7. Referencias Breves
- Kermack, W.O. & McKendrick, A.G. (1927). A contribution to the mathematical theory of epidemics.
- Hethcote, H.W. (2000). The Mathematics of Infectious Diseases.

---
**Fin del Informe**
