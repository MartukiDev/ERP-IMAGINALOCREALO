# Diagrama Entidad-Relación (ERD) - ERP 3D Studio

## Esquema Visual de Base de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ERP 3D STUDIO - DATABASE                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       USERS          │
├──────────────────────┤
│ PK id (UUID)         │──┐
│    email             │  │
│    full_name         │  │
│    role              │  │
│    is_active         │  │
│    created_at        │  │
│    updated_at        │  │
└──────────────────────┘  │
                          │
     ┌────────────────────┼────────────────────────┐
     │                    │                        │
     │                    │                        │
     ▼                    ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│    MATERIALS         │ │    QUOTATIONS        │ │     PRODUCTS         │
├──────────────────────┤ ├──────────────────────┤ ├──────────────────────┤
│ PK id (UUID)         │ │ PK id (UUID)         │ │ PK id (UUID)         │
│    name              │ │    product_name      │ │    name              │
│    type              │ │    weight_grams      │ │    total_cost        │
│    quantity          │ │    print_time_hours  │ │    suggested_price   │
│    unit              │ │    print_time_min    │ │    stock             │
│    unit_cost         │ │    material_cost_pg  │ │    is_active         │
│    status            │ │    energy_cost_kwh   │ │    created_date      │
│    purchase_date     │ │    wear_cost_ph      │ │ FK quotation_id      │──┐
│    supplier          │ │    labor_cost_ph     │ │ FK created_by        │  │
│ FK created_by        │─┤ FK machine_id        │ │    created_at        │  │
│    created_at        │ │ FK created_by        │─┤    updated_at        │  │
│    updated_at        │ │    iva_percentage    │ │                      │  │
└──────────────────────┘ │    margin_percentage │ └──────────────────────┘  │
         │               │    material_cost     │           │               │
         │               │    energy_cost       │           │               │
         │               │    wear_cost         │           │               │
         ▼               │    labor_cost        │           ▼               │
┌──────────────────────┐ │    subtotal          │ ┌──────────────────────┐  │
│ MATERIAL_MOVEMENTS   │ │    iva_amount        │ │  STOCK_MOVEMENTS     │  │
├──────────────────────┤ │    margin_amount     │ ├──────────────────────┤  │
│ PK id (UUID)         │ │    final_price       │ │ PK id (UUID)         │  │
│ FK material_id       │─┤    saved_as_product  │ │ FK product_id        │──┤
│    movement_type     │ │ FK product_id        │─┤    movement_type     │  │
│    quantity          │ │    notes             │ │    quantity          │  │
│    previous_quantity │ │    created_at        │ │    previous_stock    │  │
│    new_quantity      │ │    updated_at        │ │    new_stock         │  │
│    unit_cost         │ └──────────────────────┘ │    notes             │  │
│    total_cost        │           │              │ FK created_by        │  │
│    notes             │           │              │    created_at        │  │
│ FK created_by        │           │              └──────────────────────┘  │
│    created_at        │           │                        │               │
└──────────────────────┘           │                        │               │
                                   │                        │               │
                                   │                        │               │
┌──────────────────────┐           │                        │               │
│      MACHINES        │           │                        │               │
├──────────────────────┤           │                        │               │
│ PK id (UUID)         │           │                        │               │
│    name              │──────────┐│                        │               │
│    model             │          ││                        │               │
│    power_watts       │          ││                        │               │
│    is_active         │          ││                        │               │
│    purchase_date     │          ││                        │               │
│    notes             │          ││                        │               │
│    created_at        │          ││                        │               │
│    updated_at        │          ││                        │               │
└──────────────────────┘          ││                        │               │
                                  ││                        │               │
                                  │└────────────────────────┼───────────────┘
                                  │                         │
                                  │                         ▼
                                  │               ┌──────────────────────┐
                                  │               │       SALES          │
                                  │               ├──────────────────────┤
                                  │               │ PK id (UUID)         │
                                  │               │ FK product_id        │
                                  │               │    product_name      │
                                  │               │    quantity          │
                                  │               │    price_per_unit    │
                                  │               │    total_amount      │
                                  │               │    cost_per_unit     │
                                  │               │    total_cost        │
                                  │               │    profit            │
                                  │               │    payment_method    │
                                  │               │    client_name       │
                                  │               │    client_email      │
                                  │               │    client_phone      │
                                  │               │    sale_date         │
                                  │               │ FK created_by        │
                                  │               │    created_at        │
                                  │               │    updated_at        │
                                  │               └──────────────────────┘
                                  │                         │
                                  │                         │
                                  │                         ▼
                                  │               ┌──────────────────────┐
                                  │               │    TRANSACTIONS      │
                                  │               ├──────────────────────┤
                                  │               │ PK id (UUID)         │
                                  │               │    type              │
                                  │               │    category          │
                                  │               │    description       │
                                  │               │    amount            │
                                  │               │ FK sale_id           │──┐
                                  │               │ FK material_id       │  │
                                  │               │    transaction_date  │  │
                                  └──────────────→│ FK created_by        │  │
                                                  │    created_at        │  │
                                                  │    updated_at        │  │
                                                  └──────────────────────┘  │
                                                            │                │
                                                            └────────────────┘

┌──────────────────────┐
│      SETTINGS        │
├──────────────────────┤
│ PK id (UUID)         │
│    key (UNIQUE)      │
│    value             │
│    data_type         │
│    description       │
│    category          │
│    is_public         │
│    created_at        │
│    updated_at        │
└──────────────────────┘
```

---

## Relaciones Principales

### 1. **USERS (1) → (N) Multiple Tables**
- Un usuario puede crear múltiples materiales
- Un usuario puede crear múltiples cotizaciones
- Un usuario puede crear múltiples productos
- Un usuario puede registrar múltiples ventas
- Un usuario puede crear múltiples transacciones

### 2. **MACHINES (1) → (N) QUOTATIONS**
- Una máquina puede estar asociada a múltiples cotizaciones
- Una cotización pertenece a una máquina (opcional)

### 3. **QUOTATIONS (1) → (1) PRODUCTS**
- Una cotización puede convertirse en un producto (relación 1:1 opcional)
- Un producto puede originarse de una cotización

### 4. **PRODUCTS (1) → (N) SALES**
- Un producto puede tener múltiples ventas
- Una venta pertenece a un producto específico

### 5. **PRODUCTS (1) → (N) STOCK_MOVEMENTS**
- Un producto tiene múltiples movimientos de stock
- Cada movimiento registra cambios en el stock

### 6. **MATERIALS (1) → (N) MATERIAL_MOVEMENTS**
- Un material tiene múltiples movimientos de inventario
- Cada movimiento registra compras, usos o ajustes

### 7. **SALES (1) → (1) TRANSACTIONS**
- Cada venta genera automáticamente una transacción de ingreso
- Una transacción puede estar asociada a una venta (opcional)

### 8. **MATERIALS (1) → (N) TRANSACTIONS**
- Compras de materiales pueden generar transacciones de egreso
- Una transacción puede estar asociada a un material (opcional)

---

## Cardinalidad y Restricciones

```
┌─────────────────────────────────────────────────────────────────┐
│                     CARDINALIDAD DETALLADA                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  users (1) ───────────< materials (N)                           │
│    • ON DELETE: SET NULL (mantener materiales si se borra user)│
│    • created_by es opcional (puede ser NULL)                    │
│                                                                  │
│  users (1) ───────────< quotations (N)                          │
│    • ON DELETE: SET NULL                                        │
│    • created_by es opcional                                     │
│                                                                  │
│  users (1) ───────────< products (N)                            │
│    • ON DELETE: SET NULL                                        │
│    • created_by es opcional                                     │
│                                                                  │
│  users (1) ───────────< sales (N)                               │
│    • ON DELETE: SET NULL                                        │
│    • created_by es opcional                                     │
│                                                                  │
│  machines (1) ───────────< quotations (N)                       │
│    • ON DELETE: SET NULL                                        │
│    • machine_id es opcional                                     │
│                                                                  │
│  quotations (0..1) ─────── products (0..1)                      │
│    • Relación bidireccional opcional                            │
│    • quotation_id en products                                   │
│    • product_id en quotations                                   │
│                                                                  │
│  products (1) ───────────< sales (N)                            │
│    • ON DELETE: RESTRICT (no se puede borrar si hay ventas)    │
│    • product_id es requerido                                    │
│                                                                  │
│  products (1) ───────────< stock_movements (N)                  │
│    • ON DELETE: CASCADE (borrar movimientos si se borra prod)  │
│    • product_id es requerido                                    │
│                                                                  │
│  materials (1) ───────────< material_movements (N)              │
│    • ON DELETE: CASCADE                                         │
│    • material_id es requerido                                   │
│                                                                  │
│  sales (1) ─────────── transactions (0..1)                      │
│    • ON DELETE: SET NULL                                        │
│    • sale_id es opcional (puede ser transacción manual)         │
│                                                                  │
│  materials (1) ─────────── transactions (0..N)                  │
│    • ON DELETE: SET NULL                                        │
│    • material_id es opcional                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Triggers Automáticos

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRIGGERS IMPLEMENTADOS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. update_updated_at_column()                                   │
│    • Se ejecuta BEFORE UPDATE en todas las tablas               │
│    • Actualiza automáticamente el campo updated_at              │
│                                                                  │
│ 2. update_material_status()                                     │
│    • Se ejecuta BEFORE INSERT/UPDATE en materials               │
│    • Actualiza status según quantity:                           │
│      - quantity = 0 → 'out'                                     │
│      - quantity < 1000 → 'low'                                  │
│      - quantity >= 1000 → 'active'                              │
│                                                                  │
│ 3. link_product_to_quotation()                                  │
│    • Se ejecuta AFTER INSERT en products                        │
│    • Actualiza la cotización relacionada:                       │
│      - saved_as_product = TRUE                                  │
│      - product_id = nuevo producto                              │
│                                                                  │
│ 4. log_stock_movement()                                         │
│    • Se ejecuta AFTER UPDATE OF stock en products               │
│    • Crea automáticamente registro en stock_movements           │
│    • Determina tipo: 'add', 'sale', o 'adjustment'              │
│                                                                  │
│ 5. calculate_sale_totals()                                      │
│    • Se ejecuta BEFORE INSERT/UPDATE en sales                   │
│    • Calcula automáticamente:                                   │
│      - total_amount = quantity * price_per_unit                 │
│      - total_cost = quantity * cost_per_unit                    │
│      - profit = total_amount - total_cost                       │
│                                                                  │
│ 6. update_product_stock_on_sale()                               │
│    • Se ejecuta AFTER INSERT en sales                           │
│    • Descuenta stock del producto vendido                       │
│    • Valida que haya stock suficiente (RAISE EXCEPTION)         │
│                                                                  │
│ 7. log_material_movement()                                      │
│    • Se ejecuta AFTER UPDATE OF quantity en materials           │
│    • Crea registro en material_movements                        │
│    • Determina tipo: 'purchase', 'usage', 'adjustment'          │
│                                                                  │
│ 8. create_income_transaction_on_sale()                          │
│    • Se ejecuta AFTER INSERT en sales                           │
│    • Crea automáticamente transacción de ingreso                │
│    • type = 'income', category = 'sales'                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Índices para Performance

```sql
-- USERS
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- MATERIALS
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_created_at ON materials(created_at DESC);

-- QUOTATIONS
CREATE INDEX idx_quotations_product_name ON quotations(product_name);
CREATE INDEX idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX idx_quotations_created_by ON quotations(created_by);
CREATE INDEX idx_quotations_saved_as_product ON quotations(saved_as_product);

-- PRODUCTS
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_created_date ON products(created_date DESC);
CREATE INDEX idx_products_is_active ON products(is_active);

-- SALES
CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date DESC);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_sales_payment_method ON sales(payment_method);
CREATE INDEX idx_sales_product_date ON sales(product_id, sale_date DESC); -- Compuesto

-- TRANSACTIONS
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_type_date ON transactions(type, transaction_date DESC); -- Compuesto

-- MOVEMENTS
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX idx_material_movements_material_id ON material_movements(material_id);
CREATE INDEX idx_material_movements_created_at ON material_movements(created_at DESC);
```

---

## Constraints y Validaciones

```sql
-- CHECK Constraints
materials:         quantity >= 0
materials:         unit_cost >= 0
quotations:        weight_grams > 0
quotations:        print_time_hours >= 0
quotations:        print_time_minutes >= 0 AND < 60
products:          total_cost >= 0
products:          suggested_price >= 0
products:          stock >= 0
sales:             quantity > 0
sales:             price_per_unit >= 0
sales:             total_amount >= 0
sales:             sale_date <= CURRENT_DATE
transactions:      amount > 0

-- UNIQUE Constraints
users:             email
machines:          name
materials:         (name, type) -- Composite
products:          name
settings:          key

-- FOREIGN KEY Constraints
Todas las FK tienen ON DELETE apropiado:
  - SET NULL: Para referencias opcionales
  - CASCADE: Para datos dependientes (movements)
  - RESTRICT: Para prevenir eliminación (sales → products)
```

---

## Vistas Materializadas (Opcional para Performance)

```sql
-- Vista de dashboard con métricas principales
CREATE MATERIALIZED VIEW dashboard_metrics AS
SELECT 
  (SELECT COUNT(*) FROM products WHERE is_active = TRUE) as total_products,
  (SELECT SUM(stock) FROM products WHERE is_active = TRUE) as total_stock,
  (SELECT COUNT(*) FROM materials WHERE status = 'low') as low_stock_materials,
  (SELECT SUM(total_amount) FROM sales WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days') as sales_last_30_days,
  (SELECT SUM(profit) FROM sales WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days') as profit_last_30_days;

-- Refrescar cada hora
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_metrics;
END;
$$ LANGUAGE plpgsql;
```

---

## Resumen de Normalización

- **3NF (Third Normal Form)**: Base de datos está normalizada a 3NF
- **Desnormalización estratégica**: 
  - `product_name` en `sales` (para histórico)
  - Costos calculados en `quotations` (para no recalcular)
- **Integridad referencial**: Todas las FK con acciones apropiadas
- **Triggers**: Automatizan cálculos y mantienen consistencia
- **RLS (Row Level Security)**: Control de acceso a nivel de fila

