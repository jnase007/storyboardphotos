export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          created_at: string;
          parent_name: string;
          email: string;
          phone: string;
          child_name: string;
          child_age: number;
          preferred_date: string;
          num_people: number;
          package_type: string;
          special_requests: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          parent_name: string;
          email: string;
          phone: string;
          child_name: string;
          child_age: number;
          preferred_date: string;
          num_people: number;
          package_type: string;
          special_requests?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          parent_name?: string;
          email?: string;
          phone?: string;
          child_name?: string;
          child_age?: number;
          preferred_date?: string;
          num_people?: number;
          package_type?: string;
          special_requests?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      generated_images: {
        Row: {
          id: string;
          created_at: string;
          prompt: string;
          style_preset: string;
          image_url: string;
          storage_path: string | null;
          session_id: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          prompt: string;
          style_preset: string;
          image_url: string;
          storage_path?: string | null;
          session_id?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          prompt?: string;
          style_preset?: string;
          image_url?: string;
          storage_path?: string | null;
          session_id?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      storybooks: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          child_name: string;
          child_age: number;
          gender: string;
          notes: string | null;
          status: string;
          photo_urls: string[];
          pages: import("./storybook/types").StoryPage[];
          pdf_url: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          child_name: string;
          child_age: number;
          gender: string;
          notes?: string | null;
          status?: string;
          photo_urls?: string[];
          pages?: import("./storybook/types").StoryPage[];
          pdf_url?: string | null;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          child_name?: string;
          child_age?: number;
          gender?: string;
          notes?: string | null;
          status?: string;
          photo_urls?: string[];
          pages?: import("./storybook/types").StoryPage[];
          pdf_url?: string | null;
          error_message?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert =
  Database["public"]["Tables"]["bookings"]["Insert"];
export type GeneratedImage =
  Database["public"]["Tables"]["generated_images"]["Row"];
