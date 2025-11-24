-- ============================================
-- SCRIPT DE CONFIGURACIÓN COMPLETO - SUPABASE
-- ERP 3D Studio
-- ============================================

-- Este script debe ejecutarse en orden en el SQL Editor de Supabase

-- ============================================
-- 1. FUNCIÓN AUXILIAR PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. TABLA: USERS (Extensión de Supabase Auth)
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT durante el registro (trigger)
CREATE POLICY "Enable insert during registration" ON users
  FOR INSERT WITH CHECK (true);

-- Política para ver el propio perfil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Política para actualizar el propio perfil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. TABLA: MACHINES
-- ============================================

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

CREATE TRIGGER update_machines_updated_at
  BEFORE UPDATE ON machines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view machines" ON machines
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage machines" ON machines
  FOR ALL USING (auth.role() = 'authenticated');

-- Insertar máquinas por defecto
INSERT INTO machines (name, model, power_consumption_watts) VALUES
  ('Bambulab A1 Mini', 'A1 Mini', 150),
  ('Ender 3', 'Ender 3', 200),
  ('Bambulab P1S', 'P1S', 350),
  ('Bambulab X1C', 'X1C', 500);

-- ============================================
-- 4. TABLA: MATERIALS
-- ============================================

CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
  unit VARCHAR(20) NOT NULL,
  unit_cost DECIMAL(10,4) NOT NULL CHECK (unit_cost >= 0),
  status VARCHAR(20) DEFAULT 'active',
  purchase_date DATE NOT NULL,
  supplier VARCHAR(255),
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_material_name UNIQUE(name, type)
);

CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_created_at ON materials(created_at DESC);

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar estado automáticamente
CREATE OR REPLACE FUNCTION update_material_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity = 0 THEN
    NEW.status := 'out';
  ELSIF NEW.quantity < 1000 THEN
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

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all materials" ON materials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage materials" ON materials
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 5. TABLA: QUOTATIONS
-- ============================================

CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name VARCHAR(255) NOT NULL,
  weight_grams DECIMAL(10,2) NOT NULL CHECK (weight_grams > 0),
  print_time_hours INTEGER NOT NULL CHECK (print_time_hours >= 0),
  print_time_minutes INTEGER NOT NULL CHECK (print_time_minutes >= 0 AND print_time_minutes < 60),
  material_cost_per_gram DECIMAL(10,4) NOT NULL,
  energy_cost_per_kwh DECIMAL(10,2) NOT NULL,
  wear_cost_per_hour DECIMAL(10,2) NOT NULL,
  labor_cost_per_hour DECIMAL(10,2) NOT NULL,
  iva_percentage DECIMAL(5,2) NOT NULL DEFAULT 19.00,
  margin_percentage DECIMAL(5,2) NOT NULL DEFAULT 300.00,
  material_cost DECIMAL(10,2) NOT NULL,
  energy_cost DECIMAL(10,2) NOT NULL,
  wear_cost DECIMAL(10,2) NOT NULL,
  labor_cost DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  iva_amount DECIMAL(10,2) NOT NULL,
  margin_amount DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  saved_as_product BOOLEAN DEFAULT FALSE,
  product_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quotations_product_name ON quotations(product_name);
CREATE INDEX idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX idx_quotations_created_by ON quotations(created_by);
CREATE INDEX idx_quotations_saved_as_product ON quotations(saved_as_product);

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all quotations" ON quotations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create quotations" ON quotations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own quotations" ON quotations
  FOR UPDATE USING (created_by = auth.uid());

-- ============================================
-- 6. TABLA: PRODUCTS
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
  suggested_price DECIMAL(10,2) NOT NULL CHECK (suggested_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT unique_product_name UNIQUE(name)
);

CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_created_date ON products(created_date DESC);
CREATE INDEX idx_products_is_active ON products(is_active);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para vincular producto con cotización
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

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 7. TABLA: STOCK_MOVEMENTS
-- ============================================

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_movement_type CHECK (movement_type IN ('add', 'sale', 'adjustment'))
);

CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);

-- Trigger para registrar movimientos automáticamente
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
      notes,
      created_by
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
      'Automatic log',
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_stock_movement_trigger
  AFTER UPDATE OF stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_movement();

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stock movements" ON stock_movements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert stock movements" ON stock_movements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update stock movements" ON stock_movements
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete stock movements" ON stock_movements
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 8. TABLA: SALES
-- ============================================

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_unit DECIMAL(10,2) NOT NULL CHECK (price_per_unit >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  cost_per_unit DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  notes TEXT,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_payment_method CHECK (
    payment_method IN ('cash', 'transfer', 'card', 'other') OR payment_method IS NULL
  ),
  CONSTRAINT sale_date_not_future CHECK (sale_date <= CURRENT_DATE)
);

CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date DESC);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_sales_payment_method ON sales(payment_method);
CREATE INDEX idx_sales_created_by ON sales(created_by);
CREATE INDEX idx_sales_product_date ON sales(product_id, sale_date DESC);

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para calcular totales automáticamente
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

-- Trigger para actualizar stock
CREATE OR REPLACE FUNCTION update_product_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET stock = stock - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  
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

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all sales" ON sales
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create sales" ON sales
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own sales" ON sales
  FOR UPDATE USING (created_by = auth.uid());

-- ============================================
-- 9. TABLA: MATERIAL_MOVEMENTS
-- ============================================

CREATE TABLE material_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  previous_quantity DECIMAL(10,2) NOT NULL,
  new_quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,4),
  total_cost DECIMAL(10,2),
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_material_movement_type CHECK (
    movement_type IN ('purchase', 'usage', 'adjustment')
  )
);

CREATE INDEX idx_material_movements_material_id ON material_movements(material_id);
CREATE INDEX idx_material_movements_created_at ON material_movements(created_at DESC);
CREATE INDEX idx_material_movements_type ON material_movements(movement_type);

-- Trigger para registrar movimientos
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
      notes,
      created_by
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
      'Automatic log',
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER material_movement_trigger
  AFTER UPDATE OF quantity ON materials
  FOR EACH ROW
  EXECUTE FUNCTION log_material_movement();

ALTER TABLE material_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view material movements" ON material_movements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert material movements" ON material_movements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update material movements" ON material_movements
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete material movements" ON material_movements
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 10. TABLA: TRANSACTIONS
-- ============================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL,
  category VARCHAR(100),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_transaction_type CHECK (type IN ('income', 'expense'))
);

CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_sale_id ON transactions(sale_id);
CREATE INDEX idx_transactions_type_date ON transactions(type, transaction_date DESC);

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para crear transacción al registrar venta
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

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all transactions" ON transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 11. TABLA: SETTINGS
-- ============================================

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  data_type VARCHAR(20) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Configuraciones iniciales
INSERT INTO settings (key, value, data_type, description, category, is_public) VALUES
  ('default_energy_cost_per_kwh', '140', 'number', 'Costo de energía por defecto (CLP/kWh)', 'quotation', true),
  ('default_wear_cost_per_hour', '200', 'number', 'Costo de desgaste por defecto (CLP/hora)', 'quotation', true),
  ('default_labor_cost_per_hour', '100', 'number', 'Costo de mano de obra por defecto (CLP/hora)', 'quotation', true),
  ('default_iva_percentage', '19', 'number', 'IVA por defecto (%)', 'quotation', true),
  ('default_margin_percentage', '300', 'number', 'Margen de ganancia por defecto (%)', 'quotation', true),
  ('low_stock_threshold_materials', '1000', 'number', 'Umbral de stock bajo para materiales (g)', 'inventory', true),
  ('currency', 'CLP', 'string', 'Moneda del sistema', 'general', true),
  ('company_name', 'ERP 3D Studio', 'string', 'Nombre de la empresa', 'general', true);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public settings" ON settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can view all settings" ON settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- 12. VISTAS
-- ============================================

-- Vista de productos con bajo stock
CREATE VIEW products_low_stock AS
SELECT 
  p.*,
  COALESCE(sm.total_sales_last_30_days, 0) as total_sales_last_30_days
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
WHERE status IN ('low', 'out');

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

-- Vista de productos más vendidos (últimos 90 días)
CREATE VIEW top_selling_products AS
SELECT 
  p.id,
  p.name,
  COUNT(s.id) as times_sold,
  COALESCE(SUM(s.quantity), 0) as total_units_sold,
  COALESCE(SUM(s.total_amount), 0) as total_revenue,
  COALESCE(SUM(s.profit), 0) as total_profit,
  COALESCE(AVG(s.price_per_unit), 0) as avg_selling_price
FROM products p
LEFT JOIN sales s ON p.id = s.product_id 
  AND s.sale_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY p.id, p.name
ORDER BY total_units_sold DESC;

-- ============================================
-- 13. FUNCIONES ÚTILES
-- ============================================

-- Función para obtener stock disponible de un producto
CREATE OR REPLACE FUNCTION get_product_stock(product_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock INTO current_stock
  FROM products
  WHERE id = product_uuid;
  
  RETURN COALESCE(current_stock, 0);
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el total de ventas de un período
CREATE OR REPLACE FUNCTION get_sales_total(start_date DATE, end_date DATE)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(total_amount), 0) INTO total
  FROM sales
  WHERE sale_date BETWEEN start_date AND end_date;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Crear usuario en tabla users al registrarse
-- ============================================

-- Función que se ejecuta cuando un usuario se registra en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'admin'  -- Por defecto todos son admin (eres el único usuario)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay error, lo registramos pero no bloqueamos la creación del auth user
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función anterior
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
