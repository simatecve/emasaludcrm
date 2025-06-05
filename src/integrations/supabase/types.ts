export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      autorizaciones: {
        Row: {
          activa: boolean | null
          created_at: string | null
          descripcion: string | null
          documento_url: string | null
          estado: string | null
          fecha_solicitud: string | null
          fecha_vencimiento: string | null
          id: number
          medico_id: number | null
          numero_autorizacion: string | null
          obra_social_id: number | null
          observaciones: string | null
          paciente_id: number
          tipo_autorizacion: string
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          documento_url?: string | null
          estado?: string | null
          fecha_solicitud?: string | null
          fecha_vencimiento?: string | null
          id?: number
          medico_id?: number | null
          numero_autorizacion?: string | null
          obra_social_id?: number | null
          observaciones?: string | null
          paciente_id: number
          tipo_autorizacion: string
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          documento_url?: string | null
          estado?: string | null
          fecha_solicitud?: string | null
          fecha_vencimiento?: string | null
          id?: number
          medico_id?: number | null
          numero_autorizacion?: string | null
          obra_social_id?: number | null
          observaciones?: string | null
          paciente_id?: number
          tipo_autorizacion?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autorizaciones_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autorizaciones_obra_social_id_fkey"
            columns: ["obra_social_id"]
            isOneToOne: false
            referencedRelation: "obras_sociales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autorizaciones_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      consultas: {
        Row: {
          created_at: string | null
          diagnostico: string | null
          fecha_consulta: string | null
          id: number
          medico: string | null
          motivo: string | null
          observaciones: string | null
          paciente_id: number | null
          precio: number | null
          tratamiento: string | null
        }
        Insert: {
          created_at?: string | null
          diagnostico?: string | null
          fecha_consulta?: string | null
          id?: number
          medico?: string | null
          motivo?: string | null
          observaciones?: string | null
          paciente_id?: number | null
          precio?: number | null
          tratamiento?: string | null
        }
        Update: {
          created_at?: string | null
          diagnostico?: string | null
          fecha_consulta?: string | null
          id?: number
          medico?: string | null
          motivo?: string | null
          observaciones?: string | null
          paciente_id?: number | null
          precio?: number | null
          tratamiento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      especialidades: {
        Row: {
          activa: boolean | null
          created_at: string | null
          descripcion: string | null
          id: number
          nombre: string
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: number
          nombre: string
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: number
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      medicos: {
        Row: {
          activo: boolean | null
          apellido: string
          created_at: string | null
          direccion: string | null
          dni: string
          email: string | null
          especialidad_id: number | null
          id: number
          matricula: string
          nombre: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          apellido: string
          created_at?: string | null
          direccion?: string | null
          dni: string
          email?: string | null
          especialidad_id?: number | null
          id?: number
          matricula: string
          nombre: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          apellido?: string
          created_at?: string | null
          direccion?: string | null
          dni?: string
          email?: string | null
          especialidad_id?: number | null
          id?: number
          matricula?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicos_especialidad_id_fkey"
            columns: ["especialidad_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
        ]
      }
      obras_sociales: {
        Row: {
          activa: boolean | null
          codigo: string | null
          created_at: string | null
          direccion: string | null
          email: string | null
          id: number
          nombre: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          codigo?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: number
          nombre: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          codigo?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: number
          nombre?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          activo: boolean | null
          apellido: string
          consultas_maximas: number | null
          consultas_mes_actual: number | null
          created_at: string | null
          direccion: string | null
          dni: string
          email: string | null
          fecha_nacimiento: string
          id: number
          nombre: string
          numero_afiliado: string | null
          obra_social_id: number | null
          observaciones: string | null
          telefono: string | null
          ultima_visita: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          apellido: string
          consultas_maximas?: number | null
          consultas_mes_actual?: number | null
          created_at?: string | null
          direccion?: string | null
          dni: string
          email?: string | null
          fecha_nacimiento: string
          id?: number
          nombre: string
          numero_afiliado?: string | null
          obra_social_id?: number | null
          observaciones?: string | null
          telefono?: string | null
          ultima_visita?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          apellido?: string
          consultas_maximas?: number | null
          consultas_mes_actual?: number | null
          created_at?: string | null
          direccion?: string | null
          dni?: string
          email?: string | null
          fecha_nacimiento?: string
          id?: number
          nombre?: string
          numero_afiliado?: string | null
          obra_social_id?: number | null
          observaciones?: string | null
          telefono?: string | null
          ultima_visita?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_obra_social_id_fkey"
            columns: ["obra_social_id"]
            isOneToOne: false
            referencedRelation: "obras_sociales"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          copyright: string
          created_at: string | null
          id: string
          name: string
          subtitle: string
          updated_at: string | null
          version: string
        }
        Insert: {
          copyright?: string
          created_at?: string | null
          id?: string
          name?: string
          subtitle?: string
          updated_at?: string | null
          version?: string
        }
        Update: {
          copyright?: string
          created_at?: string | null
          id?: string
          name?: string
          subtitle?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      turnos: {
        Row: {
          created_at: string | null
          estado: string
          fecha: string
          hora: string
          id: number
          medico_id: number
          motivo: string | null
          observaciones: string | null
          paciente_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estado?: string
          fecha: string
          hora: string
          id?: number
          medico_id: number
          motivo?: string | null
          observaciones?: string | null
          paciente_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estado?: string
          fecha?: string
          hora?: string
          id?: number
          medico_id?: number
          motivo?: string | null
          observaciones?: string | null
          paciente_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turnos_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turnos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          password_hash: string
          role: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          password_hash: string
          role?: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          password_hash?: string
          role?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
