# 🎯 Sistema de DOS VENTANAS - Instrucciones

## ✅ **Problemas Resueltos:**

1. ✅ **Círculos de infectados**: Ahora aparecen correctamente en el mapa
2. ✅ **Gráficas**: Se muestran en ventana separada (graficos.html)
3. ✅ **Panel de controles**: Mejor posicionado, no tapa el mapa

---

## 🖥️ **Cómo usar el Sistema de Dos Ventanas:**

### **PASO 1: Abrir la ventana principal**
1. Abre `index.html` en tu navegador
2. Verás el **mapa de Santa Cruz** con el panel de controles a la izquierda

### **PASO 2: Abrir ventana de gráficos**
1. En el panel de controles, haz clic en el botón azul:
   **🖥️ Abrir Gráficos (2da Pantalla)**
2. Se abrirá una nueva ventana con los gráficos

### **PASO 3: Configurar en dos monitores**
1. **Monitor 1** (principal): Ventana con mapa + controles
2. **Monitor 2** (secundario): Ventana con gráficos + ecuaciones

### **PASO 4: Iniciar simulación**
1. En la ventana principal, elige:
   - 🎲 **Simulación Aleatoria** (recomendado)
   - 🗺️ **Marcar en el Mapa** (personalizado)
2. Ajusta parámetros (β, γ, velocidad)
3. Haz clic en **"Iniciar Simulación"**

### **PASO 5: Observar en tiempo real**
- **Ventana 1 (Mapa)**: 
  - Círculos rojos crecen según infectados
  - Colores cambian según prevalencia
  - Estadísticas en panel izquierdo
  
- **Ventana 2 (Gráficos)**:
  - 4 líneas actualizándose en tiempo real:
    - 🔵 Susceptibles (S)
    - 🔴 Infectados - Euler (línea sólida)
    - 🟣 Infectados - Integral (línea punteada)
    - 🟢 Recuperados (R)
  - Ecuaciones diferenciales con valores actuales
  - Error relativo entre métodos

---

## 🔄 **Sincronización Automática**

Las dos ventanas se sincronizan automáticamente cada 500ms mediante `localStorage`:
- ✅ Los gráficos se actualizan automáticamente
- ✅ Las ecuaciones muestran valores en vivo
- ✅ No necesitas hacer nada, todo es automático

Si ves "❌ Error de sincronización" en la ventana de gráficos:
- Asegúrate de que la simulación esté corriendo
- Refresca la ventana de gráficos (F5)

---

## 📊 **Ventajas del Sistema de Dos Ventanas:**

✅ **Para presentaciones**: Proyecta gráficos en pantalla grande mientras controlas desde laptop  
✅ **Para análisis**: Observa mapa y gráficos simultáneamente sin cambiar pestañas  
✅ **Para documentación**: Captura screenshots independientes de mapa y gráficos  
✅ **Para comparación**: Ve círculos infectados y curvas epidémicas al mismo tiempo  

---

## 🎓 **Uso Académico:**

### **Para tu presentación:**
1. **Monitor 1 hacia ti**: Controlas parámetros y ves el mapa
2. **Monitor 2 proyectado**: Audiencia ve gráficos y ecuaciones detalladas

### **Para tu informe:**
1. Captura screenshot del mapa (ventana 1) → Figura 1
2. Captura screenshot de gráficos (ventana 2) → Figura 2
3. Captura screenshot de ecuaciones (ventana 2, scroll down) → Figura 3

---

## 🐛 **Solución de Problemas:**

### **Los círculos no aparecen:**
- Verifica que iniciaste la simulación
- Los círculos aparecen DESPUÉS de hacer clic en "Iniciar Simulación"
- Deben aparecer círculos grises pequeños al inicio

### **La ventana de gráficos no se actualiza:**
- Verifica que ambas ventanas estén en el mismo navegador
- localStorage debe estar habilitado
- Refresca la ventana de gráficos (F5)

### **"Esperando datos de la simulación...":**
- Normal al abrir la ventana de gráficos antes de iniciar
- Inicia la simulación en la ventana principal
- Debe cambiar a "✅ Sincronizado" cuando corra la simulación

---

## 📁 **Archivos del Sistema:**

- `index.html` → Ventana principal (mapa + controles)
- `graficos.html` → Ventana secundaria (gráficos + ecuaciones)
- `main.js` → Lógica de simulación y sincronización
- `styles.css` → Estilos
- `ecuaciones_actuales.md` → Documentación de ecuaciones

---

## 🚀 **¡Listo para usar!**

Tu proyecto ahora tiene:
- ✅ Mapa interactivo con círculos de infectados
- ✅ Gráficos detallados en ventana separada
- ✅ Ecuación integral vs Euler en tiempo real
- ✅ Sistema perfecto para dos monitores
- ✅ Ideal para presentaciones académicas

**¡Disfruta tu simulación!** 📊🗺️
