# Esquema de Base de Datos - ERP 3D Studio

## Diseño Relacional para Supabase (PostgreSQL)

---

## 1. TABLA: `users` (Usuarios del sistema)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- 'admin', 'user', 'viewer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Trigger para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Notas:**
- Supabase Auth maneja la autenticación, esta tabla extiende los datos del usuario
- `role` determina permisos (RLS - Row Level Security)

---

## 2. TABLA: `materials` (Inventario de Materiales)

```sql
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- 'Filamento', 'Resina', etc.
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
  unit VARCHAR(20) NOT NULL, -- 'g', 'kg', 'ml', 'm'
  unit_cost DECIMAL(10,4) NOT NULL CHECK (unit_cost >= 0), -- CLP por unidad
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'low', 'out'
  purchase_date DATE NOT NULL,
  supplier VARCHAR(255),
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_material_name UNIQUE(name, type)
);

-- Índices
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_created_at ON materials(created_at DESC);

-- Trigger para actualizar estado automáticamente
CREATE OR REPLACE FUNCTION update_material_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity = 0 THEN
    NEW.status := 'out';
  ELSIF NEW.quantity < 1000 THEN -- Umbral personalizable
    NEW.status := 'low';
  ELSE
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER material_status_trigger
  BEFORE INSERT OR UPDATE OF quantity ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_material_status();
```

---

## 3. TABLA: `machines` (Máquinas de impresión 3D)

```sql
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255),
  power_consumption_watts INTEGER NOT NULL CHECK (power_consumption_watts > 0),
  is_active BOOLEAN DEFAULT TRUE,
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_machine_name UNIQUE(name)
);

-- Datos iniciales
INSERT INTO machines (name, model, power_consumption_watts) VALUES
  ('Bambulab A1 Mini', 'A1 Mini', 150),
  ('Ender 3', 'Ender 3', 200),
  ('Bambulab P1S', 'P1S', 350),
  ('Bambulab X1C', 'X1C', 500);
```

---

## 4. TABLA: `quotations` (Cotizaciones)

```sql
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name VARCHAR(255) NOT NULL,
  
  -- Parámetros de entrada
  weight_grams DECIMAL(10,2) NOT NULL CHECK (weight_grams > 0),
  print_time_hours INTEGER NOT NULL CHECK (print_time_hours >= 0),
  print_time_minutes INTEGER NOT NULL CHECK (print_time_minutes >= 0 AND print_time_minutes < 60),
  
  -- Costos por unidad
  material_cost_per_gram DECIMAL(10,4) NOT NULL,
  energy_cost_per_kwh DECIMAL(10,2) NOT NULL,
  wear_cost_per_hour DECIMAL(10,2) NOT NULL,
  labor_cost_per_hour DECIMAL(10,2) NOT NULL,
  
  -- Porcentajes
  iva_percentage DECIMAL(5,2) NOT NULL DEFAULT 19.00,
  margin_percentage DECIMAL(5,2) NOT NULL DEFAULT 300.00,
  
  -- Costos calculados (almacenados para histórico)
  material_cost DECIMAL(10,2) NOT NULL,
  energy_cost DECIMAL(10,2) NOT NULL,
  wear_cost DECIMAL(10,2) NOT NULL,
  labor_cost DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  iva_amount DECIMAL(10,2) NOT NULL,
  margin_amount DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  
  -- Relaciones
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Metadata
  saved_as_product BOOLEAN DEFAULT FALSE,
  product_id UUID, -- Se llena cuando se guarda como producto
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_quotations_product_name ON quotations(product_name);
CREATE INDEX idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX idx_quotations_created_by ON quotations(created_by);
CREATE INDEX idx_quotations_saved_as_product ON quotations(saved_as_product);
```

---

## 5. TABLA: `products` (Inventario de Productos Terminados)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
  suggested_price DECIMAL(10,2) NOT NULL CHECK (suggested_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  
  -- Relaciones
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT unique_product_name UNIQUE(name)
);

-- Índices
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_created_date ON products(created_date DESC);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Trigger para actualizar la cotización cuando se guarda como producto
CREATE OR REPLACE FUNCTION link_product_to_quotation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quotation_id IS NOT NULL THEN
    UPDATE quotations 
    SET saved_as_product = TRUE, product_id = NEW.id
    WHERE id = NEW.quotation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_quotation_link_trigger
  AFTER INSERT ON products
  FOR EACH ROW
  WHEN (NEW.quotation_id IS NOT NULL)
  EXECUTE FUNCTION link_product_to_quotation();
```

---

## 6. TABLA: `stock_movements` (Movimientos de Stock de Productos)

```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL, -- 'add', 'sale', 'adjustment'
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_movement_type CHECK (movement_type IN ('add', 'sale', 'adjustment'))
);

-- Índices
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);

-- Trigger para registrar movimientos de stock automáticamente
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.stock != NEW.stock THEN
    INSERT INTO stock_movements (
      product_id, 
      movement_type, 
      quantity, 
      previous_stock, 
      new_stock,
      notes
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.stock > OLD.stock THEN 'add'
        WHEN NEW.stock < OLD.stock THEN 'sale'
        ELSE 'adjustment'
      END,
      ABS(NEW.stock - OLD.stock),
      OLD.stock,
      NEW.stock,
      'Automatic log'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_stock_movement_trigger
  AFTER UPDATE OF stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_movement();
```

---

## 7. TABLA: `sales` (Ventas)

```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Información de la venta
  product_name VARCHAR(255) NOT NULL, -- Desnormalizado para histórico
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_unit DECIMAL(10,2) NOT NULL CHECK (price_per_unit >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  
  -- Costos y ganancias
  cost_per_unit DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  
  -- Datos adicionales
  payment_method VARCHAR(50), -- 'cash', 'transfer', 'card', 'other'
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  notes TEXT,
  
  -- Metadata
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_payment_method CHECK (
    payment_method IN ('cash', 'transfer', 'card', 'other') OR payment_method IS NULL
  )
);

-- Índices
CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date DESC);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_sales_payment_method ON sales(payment_method);
CREATE INDEX idx_sales_created_by ON sales(created_by);

-- Trigger para calcular total_amount y profit automáticamente
CREATE OR REPLACE FUNCTION calculate_sale_totals()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_amount := NEW.quantity * NEW.price_per_unit;
  NEW.total_cost := NEW.quantity * NEW.cost_per_unit;
  NEW.profit := NEW.total_amount - NEW.total_cost;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sale_totals_trigger
  BEFORE INSERT OR UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sale_totals();

-- Trigger para actualizar stock del producto al registrar venta
CREATE OR REPLACE FUNCTION update_product_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET stock = stock - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  
  -- Validar que haya stock suficiente
  IF (SELECT stock FROM products WHERE id = NEW.product_id) < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente para el producto';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sale_stock_update_trigger
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_on_sale();
```

---

## 8. TABLA: `material_movements` (Movimientos de Inventario de Materiales)

```sql
CREATE TABLE material_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL, -- 'purchase', 'usage', 'adjustment'
  quantity DECIMAL(10,2) NOT NULL,
  previous_quantity DECIMAL(10,2) NOT NULL,
  new_quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,4), -- Para compras
  total_cost DECIMAL(10,2), -- Para compras
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_material_movement_type CHECK (
    movement_type IN ('purchase', 'usage', 'adjustment')
  )
);

-- Índices
CREATE INDEX idx_material_movements_material_id ON material_movements(material_id);
CREATE INDEX idx_material_movements_created_at ON material_movements(created_at DESC);
CREATE INDEX idx_material_movements_type ON material_movements(movement_type);

-- Trigger para registrar movimientos automáticamente
CREATE OR REPLACE FUNCTION log_material_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.quantity != NEW.quantity THEN
    INSERT INTO material_movements (
      material_id,
      movement_type,
      quantity,
      previous_quantity,
      new_quantity,
      notes
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.quantity > OLD.quantity THEN 'purchase'
        WHEN NEW.quantity < OLD.quantity THEN 'usage'
        ELSE 'adjustment'
      END,
      ABS(NEW.quantity - OLD.quantity),
      OLD.quantity,
      NEW.quantity,
      'Automatic log'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER material_movement_trigger
  AFTER UPDATE OF quantity ON materials
  FOR EACH ROW
  EXECUTE FUNCTION log_material_movement();
```

---

## 9. TABLA: `transactions` (Transacciones Financieras)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL, -- 'income', 'expense'
  category VARCHAR(100), -- 'sales', 'materials', 'utilities', 'maintenance', etc.
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  
  -- Relaciones opcionales
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  
  -- Metadata
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_transaction_type CHECK (type IN ('income', 'expense'))
);

-- Índices
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_sale_id ON transactions(sale_id);

-- Trigger para crear transacción automáticamente al registrar venta
CREATE OR REPLACE FUNCTION create_income_transaction_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO transactions (
    type,
    category,
    description,
    amount,
    sale_id,
    transaction_date,
    created_by
  ) VALUES (
    'income',
    'sales',
    'Venta de ' || NEW.product_name || ' (x' || NEW.quantity || ')',
    NEW.total_amount,
    NEW.id,
    NEW.sale_date,
    NEW.created_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sale_income_transaction_trigger
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION create_income_transaction_on_sale();
```

---

## 10. TABLA: `settings` (Configuraciones del Sistema)

```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  data_type VARCHAR(20) NOT NULL, -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  category VARCHAR(50), -- 'general', 'quotation', 'inventory', etc.
  is_public BOOLEAN DEFAULT FALSE, -- Si es visible para todos los usuarios
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);

-- Configuraciones iniciales
INSERT INTO settings (key, value, data_type, description, category) VALUES
  ('default_energy_cost_per_kwh', '140', 'number', 'Costo de energía por defecto (CLP/kWh)', 'quotation'),
  ('default_wear_cost_per_hour', '200', 'number', 'Costo de desgaste por defecto (CLP/hora)', 'quotation'),
  ('default_labor_cost_per_hour', '100', 'number', 'Costo de mano de obra por defecto (CLP/hora)', 'quotation'),
  ('default_iva_percentage', '19', 'number', 'IVA por defecto (%)', 'quotation'),
  ('default_margin_percentage', '300', 'number', 'Margen de ganancia por defecto (%)', 'quotation'),
  ('low_stock_threshold_materials', '1000', 'number', 'Umbral de stock bajo para materiales (g)', 'inventory'),
  ('currency', 'CLP', 'string', 'Moneda del sistema', 'general'),
  ('company_name', 'ERP 3D Studio', 'string', 'Nombre de la empresa', 'general');
```

---

## FUNCIONES AUXILIARES

```sql
-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## VISTAS ÚTILES

```sql
-- Vista de productos con bajo stock
CREATE VIEW products_low_stock AS
SELECT 
  p.*,
  sm.total_sales_last_30_days
FROM products p
LEFT JOIN (
  SELECT 
    product_id,
    SUM(quantity) as total_sales_last_30_days
  FROM sales
  WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY product_id
) sm ON p.id = sm.product_id
WHERE p.stock < 5 AND p.is_active = TRUE;

-- Vista de materiales con bajo stock
CREATE VIEW materials_low_stock AS
SELECT *
FROM materials
WHERE status IN ('low', 'out') AND quantity < 1000;

-- Vista de ventas con detalles completos
CREATE VIEW sales_detailed AS
SELECT 
  s.*,
  p.name as current_product_name,
  p.total_cost as current_product_cost,
  p.suggested_price as current_suggested_price,
  u.full_name as seller_name,
  (s.total_amount - s.total_cost) as actual_profit,
  CASE 
    WHEN s.price_per_unit > (SELECT suggested_price FROM products WHERE id = s.product_id) 
    THEN 'above'
    WHEN s.price_per_unit < (SELECT suggested_price FROM products WHERE id = s.product_id)
    THEN 'below'
    ELSE 'suggested'
  END as price_comparison
FROM sales s
LEFT JOIN products p ON s.product_id = p.id
LEFT JOIN users u ON s.created_by = u.id;

-- Vista de resumen financiero mensual
CREATE VIEW monthly_financial_summary AS
SELECT 
  DATE_TRUNC('month', transaction_date) as month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_balance
FROM transactions
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;

-- Vista de productos más vendidos
CREATE VIEW top_selling_products AS
SELECT 
  p.id,
  p.name,
  COUNT(s.id) as times_sold,
  SUM(s.quantity) as total_units_sold,
  SUM(s.total_amount) as total_revenue,
  SUM(s.profit) as total_profit,
  AVG(s.price_per_unit) as avg_selling_price
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
WHERE s.sale_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY p.id, p.name
ORDER BY total_units_sold DESC;
```

---

## ROW LEVEL SECURITY (RLS) - POLÍTICAS DE SEGURIDAD

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Políticas para materials (ejemplo)
CREATE POLICY "Users can view all materials" ON materials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert materials" ON materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update materials" ON materials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete materials" ON materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para sales
CREATE POLICY "Users can view all sales" ON sales
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create sales" ON sales
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own sales" ON sales
  FOR UPDATE USING (created_by = auth.uid());

-- Políticas para settings
CREATE POLICY "Users can view public settings" ON settings
  FOR SELECT USING (is_public = TRUE OR auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify settings" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## DIAGRAMA DE RELACIONES

```
users ──┬── materials (created_by)
        ├── quotations (created_by)
        ├── products (created_by)
        ├── sales (created_by)
        ├── transactions (created_by)
        └── material_movements (created_by)

machines ──→ quotations (machine_id)

quotations ──→ products (quotation_id)

products ──┬── sales (product_id)
           └── stock_movements (product_id)

materials ──┬── material_movements (material_id)
            └── transactions (material_id) [opcional]

sales ──→ transactions (sale_id) [auto-generado]
```

---

## ÍNDICES COMPUESTOS ADICIONALES (Para mejorar rendimiento)

```sql
-- Ventas por producto y fecha
CREATE INDEX idx_sales_product_date ON sales(product_id, sale_date DESC);

-- Transacciones por tipo y fecha
CREATE INDEX idx_transactions_type_date ON transactions(type, transaction_date DESC);

-- Movimientos de material por fecha
CREATE INDEX idx_material_movements_date_type ON material_movements(created_at DESC, movement_type);

-- Cotizaciones por usuario y fecha
CREATE INDEX idx_quotations_user_date ON quotations(created_by, created_at DESC);
```

---

## CONSTRAINTS ADICIONALES IMPORTANTES

```sql
-- Asegurar que las fechas de venta no sean futuras
ALTER TABLE sales ADD CONSTRAINT sale_date_not_future 
  CHECK (sale_date <= CURRENT_DATE);

-- Asegurar que las cantidades en ventas sean positivas
ALTER TABLE sales ADD CONSTRAINT sale_quantity_positive 
  CHECK (quantity > 0);

-- Asegurar que el stock de productos no sea negativo
ALTER TABLE products ADD CONSTRAINT product_stock_non_negative 
  CHECK (stock >= 0);

-- Asegurar que el precio sugerido sea mayor que el costo
ALTER TABLE products ADD CONSTRAINT suggested_price_gt_cost 
  CHECK (suggested_price >= total_cost);
```

---

## NOTAS DE IMPLEMENTACIÓN

### Migración desde localStorage:

1. **Script de migración** para importar datos existentes
2. **Sincronización bidireccional** durante período de transición
3. **Backup automático** antes de migrar

### Performance:

- **Particionamiento** de tablas grandes (sales, transactions) por fecha
- **Índices parciales** para consultas frecuentes
- **Materializar vistas** para reportes complejos

### Seguridad:

- **RLS (Row Level Security)** para control de acceso
- **Encriptación** de datos sensibles
- **Auditoría** de cambios críticos

### Escalabilidad:

- **Archivado** de datos antiguos (>2 años)
- **Caché** de consultas frecuentes
- **Réplicas de lectura** para reportes

---

## PRÓXIMOS PASOS

1. ✅ Crear tablas en Supabase
2. ✅ Configurar RLS policies
3. ✅ Implementar funciones y triggers
4. ✅ Migrar datos de localStorage
5. ✅ Actualizar componentes React para usar Supabase
6. ✅ Implementar sincronización real-time
7. ✅ Testing y validación

