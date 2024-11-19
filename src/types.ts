export interface Appointment {
  id: string;
  userId: string;
  clientName?: string;
  clientEmail?: string;
  date: string;
  time: string;
  caseType: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  contactNumber?: string;
} 