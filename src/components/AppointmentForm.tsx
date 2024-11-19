import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/appointmentService';
import type { CaseType } from '../types';

interface AppointmentFormProps {
  onSubmit?: (appointment: {
    date: string;
    time: string;
    caseType: CaseType;
    notes?: string;
  }) => void;
}

export function AppointmentForm({ onSubmit }: AppointmentFormProps) {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [caseType, setCaseType] = useState<CaseType | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (caseType) {
        const appointmentData = {
          userId: user.id,
          date,
          time,
          caseType,
          notes: notes || undefined
        };

        // Save to database
        const newAppointment = await appointmentService.createAppointment(appointmentData);
        
        // Call the onSubmit prop if provided
        onSubmit?.({
          date,
          time,
          caseType,
          notes: notes || undefined
        });

        // Clear form
        setDate('');
        setTime('');
        setCaseType('');
        setNotes('');
      }
    } catch (err) {
      setError('Failed to schedule appointment. Please try again.');
      console.error('Error scheduling appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-law-primary mb-6">Schedule an Appointment</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-law-secondary mb-1">Preferred Date</label>
          <div className="relative">
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary bg-white"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-law-secondary mb-1">Preferred Time</label>
          <div className="relative">
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary appearance-none bg-white cursor-pointer"
              required
            >
              <option value="">Select a time</option>
              {(() => {
                const selectedDate = new Date(date);
                const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6; // 0 = Sunday, 6 = Saturday
                const hours = isWeekend ? [9, 10, 11, 12] : Array.from({ length: 9 }, (_, i) => i + 9); // 9AM to 12PM on weekends, 9AM to 5PM on weekdays
                const timeOptions = hours.flatMap(hour => 
                  isWeekend && hour === 12 ? [0].map(minute => { // Only 12:00 PM for weekends
                    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    return (
                      <option key={timeString} value={timeString}>
                        {displayTime}
                      </option>
                    );
                  }) : hour === 17 ? [0].map(minute => { // Only 5:00 PM for weekdays
                    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    return (
                      <option key={timeString} value={timeString}>
                        {displayTime}
                      </option>
                    );
                  }) : [0, 30].map(minute => { // 9AM to 4:30PM for weekdays, 9AM to 11:30AM for weekends
                    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    return (
                      <option key={timeString} value={timeString}>
                        {displayTime}
                      </option>
                    );
                  })
                );
                return timeOptions;
              })()}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg 
                className="h-5 w-5 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-law-secondary mb-1">Case Type</label>
          <select 
            value={caseType}
            onChange={(e) => setCaseType(e.target.value as CaseType)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary"
            required
          >
            <option value="">Select a case type</option>
            <option value="corporate">Corporate Law</option>
            <option value="family">Family Law</option>
            <option value="civil">Civil Litigation</option>
          </select>
        </div>
        <div>
          <label className="block text-law-secondary mb-1">Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary"
            rows={4}
            placeholder="Any additional information..."
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-law-accent text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors font-semibold disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Scheduling...' : 'Confirm Appointment'}
        </button>
      </form>
    </div>
  );
} 