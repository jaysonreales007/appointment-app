// User related types
export interface User {
    id: string;
    email: string;
    fullName: string;
    role?: 'client' | 'admin';
    phone?: string;
    appointments: Appointment[];
    createdAt: string;
    token?: string;
  }
  
  // Appointment related types
  export interface Appointment {
    _id: string;
    userId: string;
    date: string;
    time: string;
    caseType: CaseType;
    status: AppointmentStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
  }
  
  // Appointment status types
  export type AppointmentStatus = 
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'rescheduled';
  
  // Case types
  export type CaseType = 
    | 'corporate'
    | 'family'
    | 'civil'
    | 'criminal'
    | 'real_estate'
    | 'intellectual_property';
  
  // Auth related types
  export interface AuthResponse {
    user: User;
    token: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData extends LoginCredentials {
    fullName: string;
    phone?: string;
  }
  
  // API Error type
  export interface ApiError {
    message: string;
    code?: string;
    status?: number;
  }