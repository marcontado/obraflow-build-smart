export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          admin_email: string
          created_at: string
          first_login: boolean
          id: string
          password_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_email: string
          created_at?: string
          first_login?: boolean
          id?: string
          password_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_email?: string
          created_at?: string
          first_login?: boolean
          id?: string
          password_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_budget_categories_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          alternative_product_code: string | null
          alternative_store_link: string | null
          alternative_store_name: string | null
          alternative_unit_price: number | null
          area_id: string | null
          category_id: string
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          executor: string | null
          id: string
          item_name: string
          measurement_base: number | null
          measurement_purchased: number | null
          measurement_unit: string | null
          measurement_with_margin: number | null
          notes: string | null
          product_code: string | null
          project_id: string
          quantity: number | null
          selected_store: string | null
          status: string | null
          store_link: string | null
          store_name: string | null
          total_price: number | null
          unit_price: number | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          alternative_product_code?: string | null
          alternative_store_link?: string | null
          alternative_store_name?: string | null
          alternative_unit_price?: number | null
          area_id?: string | null
          category_id: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          executor?: string | null
          id?: string
          item_name: string
          measurement_base?: number | null
          measurement_purchased?: number | null
          measurement_unit?: string | null
          measurement_with_margin?: number | null
          notes?: string | null
          product_code?: string | null
          project_id: string
          quantity?: number | null
          selected_store?: string | null
          status?: string | null
          store_link?: string | null
          store_name?: string | null
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          alternative_product_code?: string | null
          alternative_store_link?: string | null
          alternative_store_name?: string | null
          alternative_unit_price?: number | null
          area_id?: string | null
          category_id?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          executor?: string | null
          id?: string
          item_name?: string
          measurement_base?: number | null
          measurement_purchased?: number | null
          measurement_unit?: string | null
          measurement_with_margin?: number | null
          notes?: string | null
          product_code?: string | null
          project_id?: string
          quantity?: number | null
          selected_store?: string | null
          status?: string | null
          store_link?: string | null
          store_name?: string | null
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_budget_items_area"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "project_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_budget_items_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_budget_items_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_budget_items_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_budget_items_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      client_representatives: {
        Row: {
          company_client_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          representative_client_id: string
          role: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          company_client_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          representative_client_id: string
          role?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          company_client_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          representative_client_id?: string
          role?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_representative_company"
            columns: ["company_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_representative_person"
            columns: ["representative_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_representative_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          cnpj: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          marital_status: string | null
          name: string
          nationality: string | null
          notes: string | null
          occupation: string | null
          phone: string | null
          razao_social: string | null
          rg: string | null
          state: string | null
          updated_at: string
          workspace_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          marital_status?: string | null
          name: string
          nationality?: string | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          razao_social?: string | null
          rg?: string | null
          state?: string | null
          updated_at?: string
          workspace_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          marital_status?: string | null
          name?: string
          nationality?: string | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          razao_social?: string | null
          rg?: string | null
          state?: string | null
          updated_at?: string
          workspace_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clients_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string
          content: Json
          created_at: string
          created_by: string | null
          id: string
          name: string
          signatures: Json | null
          updated_at: string
          variables_used: string[] | null
          workspace_id: string
        }
        Insert: {
          category: string
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          signatures?: Json | null
          updated_at?: string
          variables_used?: string[] | null
          workspace_id: string
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          signatures?: Json | null
          updated_at?: string
          variables_used?: string[] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_documents: {
        Row: {
          client_id: string | null
          content_rendered: Json
          created_at: string
          created_by: string | null
          id: string
          name: string
          pdf_url: string | null
          project_id: string | null
          template_id: string | null
          workspace_id: string
        }
        Insert: {
          client_id?: string | null
          content_rendered: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          pdf_url?: string | null
          project_id?: string | null
          template_id?: string | null
          workspace_id: string
        }
        Update: {
          client_id?: string | null
          content_rendered?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          pdf_url?: string | null
          project_id?: string | null
          template_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          category: string
          city: string | null
          created_at: string
          created_by: string | null
          diferencial: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          state: string | null
          status: string
          tags: string[] | null
          updated_at: string
          workspace_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          category: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          diferencial?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          state?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          workspace_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          diferencial?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          state?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          workspace_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          password_configured: boolean | null
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          password_configured?: boolean | null
          role?: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          password_configured?: boolean | null
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          language: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          language?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          language?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      project_activities: {
        Row: {
          created_at: string | null
          created_by: string | null
          dependencies: Json | null
          description: string | null
          end_date: string
          id: string
          name: string
          priority: string
          progress: number | null
          project_id: string
          start_date: string
          task_id: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          dependencies?: Json | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          priority?: string
          progress?: number | null
          project_id: string
          start_date: string
          task_id?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          dependencies?: Json | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          priority?: string
          progress?: number | null
          project_id?: string
          start_date?: string
          task_id?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activities_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      project_areas: {
        Row: {
          budget: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string
          spent: number | null
          workspace_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          spent?: number | null
          workspace_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          spent?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_areas_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_areas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_deliveries: {
        Row: {
          area_id: string | null
          attachments: Json | null
          budget_item_id: string | null
          created_at: string
          created_by: string | null
          delivery_date: string
          id: string
          notes: string | null
          photos: Json | null
          project_id: string
          status: string
          supplier_name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          area_id?: string | null
          attachments?: Json | null
          budget_item_id?: string | null
          created_at?: string
          created_by?: string | null
          delivery_date: string
          id?: string
          notes?: string | null
          photos?: Json | null
          project_id: string
          status?: string
          supplier_name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          area_id?: string | null
          attachments?: Json | null
          budget_item_id?: string | null
          created_at?: string
          created_by?: string | null
          delivery_date?: string
          id?: string
          notes?: string | null
          photos?: Json | null
          project_id?: string
          status?: string
          supplier_name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_delivery_area"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "project_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_delivery_budget_item"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_delivery_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_delivery_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_delivery_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          briefing: Json | null
          budget: number | null
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          main_contact_id: string | null
          moodboard: Json | null
          name: string
          progress: number | null
          project_manager_id: string | null
          site_photos: Json | null
          spent: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          technical_files: Json | null
          type: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          briefing?: Json | null
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          main_contact_id?: string | null
          moodboard?: Json | null
          name: string
          progress?: number | null
          project_manager_id?: string | null
          site_photos?: Json | null
          spent?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          technical_files?: Json | null
          type?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          briefing?: Json | null
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          main_contact_id?: string | null
          moodboard?: Json | null
          name?: string
          progress?: number | null
          project_manager_id?: string | null
          site_photos?: Json | null
          spent?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          technical_files?: Json | null
          type?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_main_contact"
            columns: ["main_contact_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_manager"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projects_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          area_id: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          project_id: string
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          area_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id: string
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          area_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id?: string
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tasks_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "project_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["workspace_role"]
          token: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["workspace_role"]
          token?: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          created_by: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_workspace_invite: {
        Args: { invite_token: string }
        Returns: {
          user_role: Database["public"]["Enums"]["workspace_role"]
          workspace_id: string
          workspace_name: string
        }[]
      }
      add_platform_admin: {
        Args: {
          _granted_by?: string
          _role: Database["public"]["Enums"]["platform_role"]
          _user_id: string
        }
        Returns: string
      }
      admin_needs_password_setup: {
        Args: { _user_id: string }
        Returns: boolean
      }
      count_user_workspaces: { Args: { _user_id: string }; Returns: number }
      count_workspace_members: {
        Args: { _workspace_id: string }
        Returns: number
      }
      count_workspace_projects: {
        Args: { _workspace_id: string }
        Returns: number
      }
      create_workspace: {
        Args: {
          plan?: Database["public"]["Enums"]["subscription_plan"]
          workspace_name: string
        }
        Returns: {
          created_at: string
          created_by: string
          id: string
          logo_url: string
          name: string
          slug: string
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
        }[]
      }
      generate_workspace_slug: {
        Args: { workspace_name: string }
        Returns: string
      }
      get_client_representatives: {
        Args: { _client_id: string; _workspace_id: string }
        Returns: {
          id: string
          is_primary: boolean
          representative_client_id: string
          representative_cpf: string
          representative_email: string
          representative_name: string
          representative_phone: string
          role: string
        }[]
      }
      get_platform_admin_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["platform_role"]
      }
      has_workspace_role: {
        Args: {
          _role: Database["public"]["Enums"]["workspace_role"]
          _user_id: string
          _workspace_id: string
        }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      mark_admin_password_configured: {
        Args: { _user_id: string }
        Returns: undefined
      }
      pj_has_representative: { Args: { _client_id: string }; Returns: boolean }
      remove_platform_admin: {
        Args: { _removed_by?: string; _user_id: string }
        Returns: undefined
      }
      transfer_workspace_ownership: {
        Args: { _new_owner_user_id: string; _workspace_id: string }
        Returns: undefined
      }
      update_admin_password: {
        Args: { _new_password: string; _user_id: string }
        Returns: undefined
      }
      update_platform_admin_role: {
        Args: {
          _new_role: Database["public"]["Enums"]["platform_role"]
          _updated_by?: string
          _user_id: string
        }
        Returns: undefined
      }
      verify_admin_password: {
        Args: { _admin_email: string; _password: string }
        Returns: boolean
      }
    }
    Enums: {
      client_type: "PF" | "PJ"
      platform_role: "super_admin" | "support" | "analyst"
      project_status:
        | "planning"
        | "in_progress"
        | "review"
        | "completed"
        | "on_hold"
      subscription_plan: "atelier" | "studio" | "domus"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "backlog" | "todo" | "in_progress" | "review" | "done"
      user_role: "admin" | "designer" | "client" | "supplier"
      workspace_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      client_type: ["PF", "PJ"],
      platform_role: ["super_admin", "support", "analyst"],
      project_status: [
        "planning",
        "in_progress",
        "review",
        "completed",
        "on_hold",
      ],
      subscription_plan: ["atelier", "studio", "domus"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["backlog", "todo", "in_progress", "review", "done"],
      user_role: ["admin", "designer", "client", "supplier"],
      workspace_role: ["owner", "admin", "member"],
    },
  },
} as const
