import { useState, useEffect } from 'react';
import type { Appointment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { RescheduleForm } from './RescheduleForm';
import { ConfirmDialog } from './ConfirmDialog';

type TimeFilter = 'all' | 'week' | 'month';

export function AppointmentsList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    appointmentId: string | null;
  }>({
    isOpen: false,
    appointmentId: null
  });

  // Get the initial value from localStorage or default to true
  const [showCancelled, setShowCancelled] = useState(() => {
    const saved = localStorage.getItem('showCancelledAppointments');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('showCancelledAppointments', JSON.stringify(showCancelled));
  }, [showCancelled]);

  useEffect(() => {
    const fetchUserAppointments = async () => {
      const userId = user?.id || user?._id;
      
      if (!user || !userId) {
        console.log('No user data available:', user);
        return;
      }
      
      try {
        console.log('Fetching appointments for user:', userId);
        const response = await fetch(`http://localhost:5000/api/appointments/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch appointments');
        }
        
        const data = await response.json();
        console.log('Fetched appointments:', data);
        setAppointments(data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAppointments();
  }, [user]);

  // Filter appointments by time range
  const filterAppointmentsByTime = (appointments: Appointment[]) => {
    const today = new Date();
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      appointmentDate.setHours(0, 0, 0, 0);  // Reset time part for proper date comparison

      switch (timeFilter) {
        case 'week':
          // Check if date is between start of week and today
          return appointmentDate >= startOfWeek && appointmentDate <= today;
        case 'month':
          // Check if date is between start of month and today
          return appointmentDate >= startOfMonth && appointmentDate <= today;
        default:
          // 'all' - show all appointments
          return true;
      }
    });
  };

  // Sort appointments by status (cancelled last) and then by date (newest first)
  const sortedAppointments = [...appointments].sort((a, b) => {
    // First, separate cancelled appointments
    if (a.status === 'cancelled' && b.status !== 'cancelled') return 1;
    if (a.status !== 'cancelled' && b.status === 'cancelled') return -1;

    // Then sort by date and time for non-cancelled appointments
    const dateTimeA = new Date(`${a.date}T${a.time}`);
    const dateTimeB = new Date(`${b.date}T${b.time}`);
    
    // Sort in descending order (newest first)
    return dateTimeB.getTime() - dateTimeA.getTime();
  });

  // Then apply time filter
  const timeFilteredAppointments = filterAppointmentsByTime(sortedAppointments);

  // Then apply search and cancelled filters
  const filteredAppointments = timeFilteredAppointments.filter((appointment) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = (
      appointment.caseType.toLowerCase().includes(searchString) ||
      appointment.date.includes(searchString) ||
      appointment.status.toLowerCase().includes(searchString)
    );

    const matchesCancelledFilter = showCancelled || appointment.status !== 'cancelled';

    return matchesSearch && matchesCancelledFilter;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-law-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'confirmed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleReschedule = async (appointmentId: string, newDate: string, newTime: string) => {
    try {
      const user = localStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      const token = parsedUser?.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Log the appointment ID and request data
      console.log('Rescheduling appointment:', { appointmentId, newDate, newTime });

      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: newDate, time: newTime }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reschedule appointment');
      }

      // Refresh appointments list
      const updatedAppointmentsResponse = await fetch(`http://localhost:5000/api/appointments/user/${parsedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!updatedAppointmentsResponse.ok) {
        throw new Error('Failed to refresh appointments');
      }

      const updatedAppointments = await updatedAppointmentsResponse.json();
      setAppointments(updatedAppointments);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      const user = localStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      const token = parsedUser?.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Cancelling appointment:', appointmentId);

      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel appointment');
      }

      // Refresh appointments list
      const updatedAppointmentsResponse = await fetch(`http://localhost:5000/api/appointments/user/${parsedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!updatedAppointmentsResponse.ok) {
        throw new Error('Failed to refresh appointments');
      }

      const updatedAppointments = await updatedAppointmentsResponse.json();
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      // You might want to show an error message to the user here
    }
  };

  // Update the radio button handlers to be more explicit
  const handleShowCancelledChange = (show: boolean) => {
    setShowCancelled(show);
    localStorage.setItem('showCancelledAppointments', JSON.stringify(show));
  };

  return (
    <div className="max-h-[600px] overflow-y-auto pr-2">
      {/* Search and Filter Bar */}
      <div className="sticky top-0 bg-law-light pb-6 z-1">
        {/* Main Controls Container */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Time Filter Select */}
            <div className="relative md:w-48">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-law-primary focus:ring-1 focus:ring-law-primary text-sm bg-white appearance-none"
              >
                <option key="all" value="all">All Time</option>
                <option key="week" value="week">This Week</option>
                <option key="month" value="month">This Month</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
            
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by case type, date, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:border-law-primary focus:ring-1 focus:ring-law-primary text-sm bg-white"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter Stats and Toggle */}
          <div className="flex items-center justify-between mt-4 px-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Found {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
              </span>
              {timeFilter !== 'all' && (
                <span className="text-sm text-gray-500">
                  • Filtered by {timeFilter === 'week' ? 'this week' : 'this month'}
                </span>
              )}
            </div>
            
            {/* Cancelled Appointments Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show cancelled appointments</label>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="show-cancelled"
                  checked={showCancelled}
                  onChange={() => handleShowCancelledChange(true)}
                  className="w-4 h-4 text-law-primary focus:ring-law-primary border-gray-300"
                />
                <label htmlFor="show-cancelled" className="ml-2 mr-4 text-sm text-gray-600">
                  Show
                </label>

                <input
                  type="radio"
                  id="hide-cancelled"
                  checked={!showCancelled}
                  onChange={() => handleShowCancelledChange(false)}
                  className="w-4 h-4 text-law-primary focus:ring-law-primary border-gray-300"
                />
                <label htmlFor="hide-cancelled" className="ml-2 text-sm text-gray-600">
                  Hide
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div key="no-appointments" className="text-center py-6 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No appointments found matching your search.</p>
          </div>
        ) : (
          filteredAppointments.map((appointment: Appointment) => (
            <div
              key={appointment._id}
              className={`bg-white p-4 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow ${
                appointment.status === 'pending'
                  ? 'border-yellow-400'
                  : appointment.status === 'confirmed'
                  ? 'border-green-500'
                  : appointment.status === 'cancelled'
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex flex-col space-y-2">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-semibold text-base ${
                      appointment.status === 'completed' ? 'text-gray-500' : 'text-law-primary'
                    }`}>
                      {`${appointment.caseType.charAt(0).toUpperCase()}${appointment.caseType.slice(1)} Law`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Case ID: #{appointment._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : appointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getStatusIcon(appointment.status)}
                    <span className="text-xs font-medium">
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 py-2 border-t border-b">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Date</p>
                    <p className="text-sm font-medium">
                      {appointment.date ? 
                        new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                        : 'No date specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Time</p>
                    <p className="text-sm font-medium">
                      {appointment.time ? 
                        new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })
                        : 'No time specified'}
                    </p>
                  </div>
                </div>

                {/* Notes - Only show if present */}
                {appointment.notes && (
                  <div className="pt-1">
                    <p className="text-xs text-gray-500 mb-0.5">Notes</p>
                    <p className="text-xs text-gray-700">{appointment.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-1">
                  {appointment.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            appointmentId: appointment._id
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-law-accent hover:bg-opacity-90 rounded-md transition-colors"
                      >
                        Reschedule
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAppointment && (
        <RescheduleForm
          key={selectedAppointment._id}
          appointment={selectedAppointment}
          onSubmit={handleReschedule}
          onCancel={() => setSelectedAppointment(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No, Keep it"
        type="danger"
        onConfirm={() => {
          if (confirmDialog.appointmentId) {
            handleCancel(confirmDialog.appointmentId);
          }
          setConfirmDialog({ isOpen: false, appointmentId: null });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, appointmentId: null })}
      />
    </div>
  );
}