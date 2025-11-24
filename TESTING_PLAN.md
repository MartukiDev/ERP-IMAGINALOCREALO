# 🧪 Plan de Pruebas - ERP 3D Studio

## ✅ Componentes ya probados (funcionales)

### 1. Autenticación
- [x] Registro de usuario
- [x] Login
- [x] Logout

### 2. Materiales
- [x] Crear material
- [x] Editar material
- [x] Eliminar material
- [x] Ver lista de materiales
- [x] Actualización automática de estado (available/low/out)

---

## 🔧 Componentes corregidos (probar nuevamente)

### 3. Productos - Ventas
**Bugs corregidos:**
- ✅ Campo `unit_price` → `price_per_unit`
- ✅ Agregados campos requeridos: `product_name`, `cost_per_unit`, `total_cost`

**Pruebas sugeridas:**
1. **Vender un producto**:
   - Ir a sección "Productos"
   - Seleccionar un producto con stock > 0
   - Click en "Vender"
   - Ingresar cantidad a vender
   - Confirmar venta
   - ✅ **Verificar**: Stock se reduce automáticamente
   - ✅ **Verificar**: Venta aparece en tabla de ventas
   - ✅ **Verificar**: Se crea transacción en Finanzas

2. **Agregar stock**:
   - Seleccionar un producto
   - Click en "Agregar Stock"
   - Ingresar cantidad
   - Confirmar
   - ✅ **Verificar**: Stock aumenta
   - ✅ **Verificar**: Aparece en movimientos de stock

---

## 🆕 Componentes migrados (probar por primera vez)

### 4. Cotizaciones
**Cambios:**
- ✅ Eliminado localStorage
- ✅ Máquinas cargadas desde DB
- ✅ Cotizaciones se guardan en `quotations` table
- ✅ Al "Guardar como producto" crea en `products` table

**Pruebas sugeridas:**
1. **Crear cotización básica**:
   - Ir a "Cotizaciones"
   - Ingresar nombre: "Figura de prueba"
   - Seleccionar máquina (ej: Bambulab A1 Mini)
   - Peso: 100g
   - Tiempo: 2 horas 30 minutos
   - Peso rollo: 1000g
   - Costo rollo: 25000 CLP
   - Click "Calcular cotización"
   - ✅ **Verificar**: Muestra desglose de costos
   - ✅ **Verificar**: Muestra precio final

2. **Guardar como producto**:
   - Después de calcular cotización
   - Click "Guardar como producto"
   - ✅ **Verificar**: Mensaje de éxito
   - ✅ **Verificar**: Ir a "Productos" y ver el nuevo producto
   - ✅ **Verificar**: Producto tiene precio sugerido correcto
   - ✅ **Verificar**: Stock inicial = 0

3. **Probar con diferentes máquinas**:
   - Crear cotización con Ender 3 (200W)
   - Crear cotización con Bambulab P1S (350W)
   - Crear cotización con Bambulab X1C (500W)
   - ✅ **Verificar**: Costo energía cambia según potencia

---

### 5. Dashboard
**Cambios:**
- ✅ Muestra ventas reales últimos 30 días
- ✅ Muestra ganancia neta últimos 30 días
- ✅ Muestra stock total real
- ✅ Muestra materiales con bajo stock (real)
- ✅ Gráfico ingresos/egresos desde `transactions`

**Pruebas sugeridas:**
1. **Verificar métricas**:
   - Ir a "Dashboard"
   - ✅ **Verificar**: "Ventas del mes" muestra valor real (no $45.231.890)
   - ✅ **Verificar**: "Ganancia neta" muestra valor real
   - ✅ **Verificar**: "Stock total" cuenta correctamente
   - ✅ **Verificar**: "Bajo stock" cuenta materiales low/out

2. **Verificar gráfico**:
   - ✅ **Verificar**: Gráfico "Ingresos vs Egresos" muestra datos reales
   - ✅ **Verificar**: Si no hay transacciones, gráfico está vacío (normal)

**Para obtener datos reales en el gráfico:**
- Crear algunas ventas en "Productos" (se crean transacciones automáticamente)
- O crear transacciones manuales en "Finanzas"

---

### 6. Finanzas
**Cambios:**
- ✅ Carga transacciones desde DB
- ✅ Permite crear transacciones manuales
- ✅ Calcula balance neto automáticamente
- ✅ Las ventas crean transacciones automáticamente

**Pruebas sugeridas:**
1. **Ver transacciones automáticas**:
   - Si hiciste ventas, deberían aparecer aquí
   - ✅ **Verificar**: Tipo "Ingreso"
   - ✅ **Verificar**: Monto correcto

2. **Crear transacción manual (Ingreso)**:
   - Click "Nueva transacción"
   - Tipo: Ingreso
   - Descripción: "Venta directa cliente"
   - Monto: 50000
   - Fecha: hoy
   - Click "Guardar transacción"
   - ✅ **Verificar**: Aparece en tabla
   - ✅ **Verificar**: "Total ingresos" aumenta
   - ✅ **Verificar**: "Balance neto" se actualiza

3. **Crear transacción manual (Egreso)**:
   - Click "Nueva transacción"
   - Tipo: Egreso
   - Descripción: "Compra de filamento"
   - Monto: 25000
   - Fecha: hoy
   - Click "Guardar transacción"
   - ✅ **Verificar**: Aparece en tabla con badge rojo
   - ✅ **Verificar**: "Total egresos" aumenta
   - ✅ **Verificar**: "Balance neto" disminuye

---

### 7. Reportes
**Cambios:**
- ✅ Muestra ventas mensuales reales (últimos 6 meses)
- ✅ Compara ganancia real vs sugerida
- ✅ Muestra costos promedio por categoría desde cotizaciones

**Pruebas sugeridas:**
1. **Ver reportes básicos**:
   - Ir a "Reportes"
   - ✅ **Verificar**: Gráficos se cargan (pueden estar vacíos si no hay datos)
   - ✅ **Verificar**: Filtros de mes/año funcionan

2. **Generar datos para reportes** (si están vacíos):
   - Crear algunas cotizaciones en meses diferentes
   - Guardar como productos
   - Hacer algunas ventas
   - Volver a "Reportes"
   - ✅ **Verificar**: Gráficos muestran datos

3. **Verificar cálculos**:
   - ✅ **Verificar**: Gráfico "Evolución de ventas" suma ventas por mes
   - ✅ **Verificar**: "Ganancia real vs sugerida" muestra comparativa
   - ✅ **Verificar**: "Costos promedio" calcula promedio de cotizaciones

---

## 🎯 Flujo de Prueba Completo Recomendado

### Escenario: Crear producto desde cero y venderlo

1. **Crear cotización**:
   - Ir a "Cotizaciones"
   - Producto: "Maceta decorativa"
   - Máquina: Bambulab A1 Mini
   - Peso: 150g
   - Tiempo: 3h 0m
   - Rollo: 1000g / 25000 CLP
   - Calcular
   - Guardar como producto

2. **Agregar stock**:
   - Ir a "Productos"
   - Buscar "Maceta decorativa"
   - Click "Agregar Stock"
   - Cantidad: 5
   - Confirmar

3. **Realizar venta**:
   - Seleccionar "Maceta decorativa"
   - Click "Vender"
   - Cantidad: 2
   - Precio venta: (usar sugerido o personalizar)
   - Confirmar

4. **Verificar en Dashboard**:
   - Ir a "Dashboard"
   - Ver que "Ventas del mes" aumentó
   - Ver que "Stock total" disminuyó
   - Ver gráfico actualizado

5. **Verificar en Finanzas**:
   - Ir a "Finanzas"
   - Ver transacción de venta creada automáticamente
   - Ver "Total ingresos" actualizado

6. **Verificar en Reportes**:
   - Ir a "Reportes"
   - Ver venta reflejada en gráficos mensuales

---

## 🐛 Qué hacer si encuentras un error

### Error al crear cotización
- Verificar que todas las máquinas existen en la DB
- Verificar campos requeridos están llenos

### Error al vender producto
- Verificar que el producto tiene stock > 0
- Verificar que el precio de venta > 0

### Dashboard no muestra datos
- Normal si es sistema nuevo sin datos
- Crear algunas ventas primero

### Reportes vacíos
- Normal si no hay ventas en los últimos 6 meses
- Crear cotizaciones y ventas para generar datos

---

## ✅ Checklist Final

Después de probar todo:

- [ ] Autenticación funciona
- [ ] Materiales CRUD completo funciona
- [ ] Cotizaciones se calculan correctamente
- [ ] Cotizaciones se guardan como productos
- [ ] Productos: Ventas actualizan stock
- [ ] Productos: Agregar stock funciona
- [ ] Dashboard muestra métricas reales
- [ ] Finanzas: Ver transacciones
- [ ] Finanzas: Crear transacciones manuales
- [ ] Reportes: Gráficos con datos reales

---

## 🎉 Si todo funciona...

**¡El sistema está 100% operativo!** 🚀

Puedes empezar a usarlo para tu negocio de impresión 3D.

## 📝 Notas adicionales

- **Backup**: Supabase hace backups automáticos
- **Escalabilidad**: El sistema puede manejar miles de productos y ventas
- **Seguridad**: RLS asegura que cada usuario solo ve sus datos
- **Performance**: Indexes en tablas para búsquedas rápidas

---

**¡Buenas ventas! 🎨🖨️💰**
