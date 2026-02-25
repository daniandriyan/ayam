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
      profiles: {
        Row: {
          id: string
          email: string
          farm_name: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          farm_name?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          farm_name?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      coops: {
        Row: {
          id: string
          user_id: string
          name: string
          capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          capacity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          capacity?: number
          created_at?: string
          updated_at?: string
        }
      }
      chickens: {
        Row: {
          id: string
          coop_id: string | null
          batch_number: string
          breed: string
          initial_count: number
          current_count: number
          birth_date: string
          status: 'active' | 'sold' | 'dead'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          coop_id?: string | null
          batch_number: string
          breed: string
          initial_count: number
          current_count: number
          birth_date: string
          status?: 'active' | 'sold' | 'dead'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          coop_id?: string | null
          batch_number?: string
          breed?: string
          initial_count?: number
          current_count?: number
          birth_date?: string
          status?: 'active' | 'sold' | 'dead'
          created_at?: string
          updated_at?: string
        }
      }
      egg_production: {
        Row: {
          id: string
          chicken_id: string
          date: string
          count: number
          weight: number | null
          quality: 'A' | 'B' | 'C'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chicken_id: string
          date: string
          count: number
          weight?: number | null
          quality?: 'A' | 'B' | 'C'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          chicken_id?: string
          date?: string
          count?: number
          weight?: number | null
          quality?: 'A' | 'B' | 'C'
          notes?: string | null
          created_at?: string
        }
      }
      feed: {
        Row: {
          id: string
          coop_id: string
          date: string
          type: string
          quantity_kg: number
          cost: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          coop_id: string
          date: string
          type: string
          quantity_kg: number
          cost: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          coop_id?: string
          date?: string
          type?: string
          quantity_kg?: number
          cost?: number
          notes?: string | null
          created_at?: string
        }
      }
      health_records: {
        Row: {
          id: string
          chicken_id: string
          date: string
          type: 'vaccination' | 'treatment' | 'checkup'
          description: string
          cost: number
          vet_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chicken_id: string
          date: string
          type: 'vaccination' | 'treatment' | 'checkup'
          description: string
          cost: number
          vet_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          chicken_id?: string
          date?: string
          type?: 'vaccination' | 'treatment' | 'checkup'
          description?: string
          cost?: number
          vet_name?: string | null
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          date: string
          egg_count: number
          price_per_unit: number
          total: number
          customer: string | null
          status: 'pending' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          egg_count: number
          price_per_unit: number
          total: number
          customer?: string | null
          status?: 'pending' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          egg_count?: number
          price_per_unit?: number
          total?: number
          customer?: string | null
          status?: 'pending' | 'completed'
          created_at?: string
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
