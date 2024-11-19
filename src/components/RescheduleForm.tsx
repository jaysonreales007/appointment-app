import { useState, FormEvent } from 'react';
import type { Appointment, CaseType } from '../types';

interface RescheduleFormProps {
  appointment: Appointment;
  onSubmit: (appointmentId: string, newDate: string, newTime: string) => void;
  onCancel: () => void;
}

export function RescheduleForm({ appointment, onSubmit, onCancel }: RescheduleFormProps) {
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(appointment._id, date, time);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-law-primary">
              Reschedule Appointment
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Current appointment: {new Date(appointment.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} at {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-law-primary focus:border-law-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Time
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-law-primary focus:border-law-primary appearance-none"
              required
            >
              {(() => {
                const selectedDate = new Date(date);
                const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
                const hours = isWeekend ? [9, 10, 11, 12] : Array.from({ length: 9 }, (_, i) => i + 9);
                
                return hours.flatMap(hour => 
                  isWeekend && hour === 12 ? [0].map(minute => {
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
                  }) : hour === 17 ? [0].map(minute => {
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
                  }) : [0, 30].map(minute => {
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
              })()}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-law-accent hover:bg-opacity-90 rounded-lg transition-colors"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 