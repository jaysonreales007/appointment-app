import { Appointment, CaseType } from '../types';

interface CreateAppointmentData {
  userId: string;
  date: string;
  time: string;
  caseType: CaseType;
  notes?: string;
}

export const appointmentService = {
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    try {
      const user = localStorage.getItem('user');
      const token = user ? JSON.parse(user).token : null;

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appointment');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  async getUserAppointments(userId: string): Promise<Appointment[]> {
    try {
      const user = localStorage.getItem('user');
      const token = user ? JSON.parse(user).token : null;

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/appointments/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<Appointment> {
    try {
      const user = localStorage.getItem('user');
      const token = user ? JSON.parse(user).token : null;

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update appointment status');
      }

      return response.json();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  async deleteAppointment(appointmentId: string): Promise<void> {
    try {
      const user = localStorage.getItem('user');
      const token = user ? JSON.parse(user).token : null;

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }
}; 