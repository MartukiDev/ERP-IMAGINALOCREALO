export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
      }
      machines: {
        Row: {
          id: string
          name: string
          model: string | null
          power_consumption_watts: number
          is_active: boolean
          purchase_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          model?: string | null
          power_consumption_watts: number
          is_active?: boolean
          purchase_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          model?: string | null
          power_consumption_watts?: number
          is_active?: boolean
          purchase_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          name: string
          type: string
          quantity: number
          unit: string
          unit_cost: number
          status: string
          purchase_date: string
          supplier: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          quantity: number
          unit: string
          unit_cost: number
          status?: string
          purchase_date: string
          supplier?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          quantity?: number
          unit?: string
          unit_cost?: number
          status?: string
          purchase_date?: string
          supplier?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quotations: {
        Row: {
          id: string
          product_name: string
          weight_grams: number
          print_time_hours: number
          print_time_minutes: number
          material_cost_per_gram: number
          energy_cost_per_kwh: number
          wear_cost_per_hour: number
          labor_cost_per_hour: number
          iva_percentage: number
          margin_percentage: number
          material_cost: number
          energy_cost: number
          wear_cost: number
          labor_cost: number
          subtotal: number
          iva_amount: number
          margin_amount: number
          final_price: number
          machine_id: string | null
          created_by: string | null
          saved_as_product: boolean
          product_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_name: string
          weight_grams: number
          print_time_hours: number
          print_time_minutes: number
          material_cost_per_gram: number
          energy_cost_per_kwh: number
          wear_cost_per_hour: number
          labor_cost_per_hour: number
          iva_percentage?: number
          margin_percentage?: number
          material_cost: number
          energy_cost: number
          wear_cost: number
          labor_cost: number
          subtotal: number
          iva_amount: number
          margin_amount: number
          final_price: number
          machine_id?: string | null
          created_by?: string | null
          saved_as_product?: boolean
          product_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_name?: string
          weight_grams?: number
          print_time_hours?: number
          print_time_minutes?: number
          material_cost_per_gram?: number
          energy_cost_per_kwh?: number
          wear_cost_per_hour?: number
          labor_cost_per_hour?: number
          iva_percentage?: number
          margin_percentage?: number
          material_cost?: number
          energy_cost?: number
          wear_cost?: number
          labor_cost?: number
          subtotal?: number
          iva_amount?: number
          margin_amount?: number
          final_price?: number
          machine_id?: string | null
          created_by?: string | null
          saved_as_product?: boolean
          product_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          total_cost: number
          suggested_price: number
          stock: number
          quotation_id: string | null
          created_by: string | null
          created_date: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          total_cost: number
          suggested_price: number
          stock?: number
          quotation_id?: string | null
          created_by?: string | null
          created_date?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          total_cost?: number
          suggested_price?: number
          stock?: number
          quotation_id?: string | null
          created_by?: string | null
          created_date?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      sales: {
        Row: {
          id: string
          product_id: string
          created_by: string | null
          product_name: string
          quantity: number
          price_per_unit: number
          total_amount: number
          cost_per_unit: number
          total_cost: number
          profit: number
          payment_method: string | null
          client_name: string | null
          client_email: string | null
          client_phone: string | null
          notes: string | null
          sale_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          created_by?: string | null
          product_name: string
          quantity: number
          price_per_unit: number
          total_amount?: number
          cost_per_unit: number
          total_cost?: number
          profit?: number
          payment_method?: string | null
          client_name?: string | null
          client_email?: string | null
          client_phone?: string | null
          notes?: string | null
          sale_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          created_by?: string | null
          product_name?: string
          quantity?: number
          price_per_unit?: number
          total_amount?: number
          cost_per_unit?: number
          total_cost?: number
          profit?: number
          payment_method?: string | null
          client_name?: string | null
          client_email?: string | null
          client_phone?: string | null
          notes?: string | null
          sale_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          type: string
          category: string | null
          description: string
          amount: number
          sale_id: string | null
          material_id: string | null
          transaction_date: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          category?: string | null
          description: string
          amount: number
          sale_id?: string | null
          material_id?: string | null
          transaction_date?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          category?: string | null
          description?: string
          amount?: number
          sale_id?: string | null
          material_id?: string | null
          transaction_date?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          data_type: string
          description: string | null
          category: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          data_type: string
          description?: string | null
          category?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          data_type?: string
          description?: string | null
          category?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
