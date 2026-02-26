export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

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
          id?: string
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "coops_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "chickens_coop_id_fkey"
            columns: ["coop_id"]
            referencedRelation: "coops"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "egg_production_chicken_id_fkey"
            columns: ["chicken_id"]
            referencedRelation: "chickens"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "feed_coop_id_fkey"
            columns: ["coop_id"]
            referencedRelation: "coops"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "health_records_chicken_id_fkey"
            columns: ["chicken_id"]
            referencedRelation: "chickens"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
