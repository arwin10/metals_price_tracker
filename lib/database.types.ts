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
          first_name: string | null
          last_name: string | null
          role: string
          preferred_currency: string
          notification_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          preferred_currency?: string
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          preferred_currency?: string
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      metal_prices: {
        Row: {
          id: number
          metal_type: string
          price_usd: number
          price_eur: number | null
          price_gbp: number | null
          price_inr: number | null
          bid_price: number | null
          ask_price: number | null
          change_24h: number | null
          change_percentage: number | null
          high_24h: number | null
          low_24h: number | null
          source: string | null
          timestamp: string
        }
        Insert: {
          id?: number
          metal_type: string
          price_usd: number
          price_eur?: number | null
          price_gbp?: number | null
          price_inr?: number | null
          bid_price?: number | null
          ask_price?: number | null
          change_24h?: number | null
          change_percentage?: number | null
          high_24h?: number | null
          low_24h?: number | null
          source?: string | null
          timestamp?: string
        }
        Update: {
          id?: number
          metal_type?: string
          price_usd?: number
          price_eur?: number | null
          price_gbp?: number | null
          price_inr?: number | null
          bid_price?: number | null
          ask_price?: number | null
          change_24h?: number | null
          change_percentage?: number | null
          high_24h?: number | null
          low_24h?: number | null
          source?: string | null
          timestamp?: string
        }
      }
      portfolios: {
        Row: {
          id: number
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_holdings: {
        Row: {
          id: number
          portfolio_id: number
          metal_type: string
          quantity: number
          unit: string
          purchase_price: number
          purchase_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          portfolio_id: number
          metal_type: string
          quantity: number
          unit?: string
          purchase_price: number
          purchase_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          portfolio_id?: number
          metal_type?: string
          quantity?: number
          unit?: string
          purchase_price?: number
          purchase_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      price_alerts: {
        Row: {
          id: number
          user_id: string
          metal_type: string
          target_price: number
          condition: string
          currency: string
          is_active: boolean
          triggered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          metal_type: string
          target_price: number
          condition: string
          currency?: string
          is_active?: boolean
          triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          metal_type?: string
          target_price?: number
          condition?: string
          currency?: string
          is_active?: boolean
          triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      alert_history: {
        Row: {
          id: number
          alert_id: number
          triggered_price: number
          triggered_at: string
          notification_sent: boolean
        }
        Insert: {
          id?: number
          alert_id: number
          triggered_price: number
          triggered_at?: string
          notification_sent?: boolean
        }
        Update: {
          id?: number
          alert_id?: number
          triggered_price?: number
          triggered_at?: string
          notification_sent?: boolean
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
