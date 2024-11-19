import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Appointment } from '../../types';
import { SendMessageModal } from './SendMessageModal';
import { ConfirmDialog } from '../ConfirmDialog';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
type SortField = 'date' | 'clientName' | 'caseType' | 'status';

export function AdminAppointments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusConfirmDialog, setStatusConfirmDialog] = useState<{
    isOpen: boolean;
    appointmentId: string | null;
    newStatus: AppointmentStatus | null;
  }>({
    isOpen: false,
    appointmentId: null,
    newStatus: null
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch all appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:5000/api/appointments/all', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Update the status change handler
  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    setStatusConfirmDialog({
      isOpen: true,
      appointmentId,
      newStatus
    });
  };

  const confirmStatusChange = async () => {
    if (!statusConfirmDialog.appointmentId || !statusConfirmDialog.newStatus) return;

    try {
      console.log('Updating status:', { 
        appointmentId: statusConfirmDialog.appointmentId, 
        newStatus: statusConfirmDialog.newStatus 
      });
      
      const response = await fetch(`http://localhost:5000/api/appointments/${statusConfirmDialog.appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: statusConfirmDialog.newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      // Update local state
      setAppointments(appointments.map(apt => 
        apt._id === statusConfirmDialog.appointmentId 
          ? { ...apt, status: statusConfirmDialog.newStatus } 
          : apt
      ));

      // Refresh the appointments list
      const updatedResponse = await fetch('http://localhost:5000/api/appointments/all', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setAppointments(updatedData);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update appointment status');
    } finally {
      setStatusConfirmDialog({
        isOpen: false,
        appointmentId: null,
        newStatus: null
      });
    }
  };

  // Calculate stats
  const appointmentStats = {
    total: appointments.length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort appointments
  const filteredAndSortedAppointments = appointments
    .filter((appointment) => {
      const searchString = searchTerm.toLowerCase();
      const matchesSearch = 
        appointment.caseType.toLowerCase().includes(searchString) ||
        appointment.date.includes(searchString) ||
        appointment.status.toLowerCase().includes(searchString);
      
      const matchesStatus = 
        statusFilter === 'all' || appointment.status === statusFilter;

      const matchesDateRange = 
        (!dateRange.start || appointment.date >= dateRange.start) &&
        (!dateRange.end || appointment.date <= dateRange.end);

      return matchesSearch && matchesStatus && matchesDateRange;
    })
    .sort((a, b) => {
      // Always put cancelled appointments at the bottom
      if (a.status === 'cancelled' && b.status !== 'cancelled') return 1;
      if (a.status !== 'cancelled' && b.status === 'cancelled') return -1;
      
      // For non-cancelled appointments, sort by the selected field
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'date':
          return (new Date(b.date).getTime() - new Date(a.date).getTime()) * direction;
        case 'caseType':
          return a.caseType.localeCompare(b.caseType) * direction;
        case 'status':
          return a.status.localeCompare(b.status) * direction;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Show loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-law-primary"></div>
        </div>
      )}

      {/* Show error message if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Only show the table if we have data and no error */}
      {!loading && !error && (
        <>
          {/* Header and Filters */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-law-primary">Appointments Management</h2>
              
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 p-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary"
                  />
                  <svg
                    className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2"
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

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary"
                />
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      onClick={() => handleSort('clientName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Client
                      {sortField === 'clientName' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('caseType')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Case Type
                      {sortField === 'caseType' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('date')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Date & Time
                      {sortField === 'date' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Status
                      {sortField === 'status' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-law-primary text-white flex items-center justify-center">
                              {appointment.clientName?.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.clientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.clientEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.caseType.charAt(0).toUpperCase() + appointment.caseType.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">{appointment.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.status === 'cancelled' ? (
                          // For cancelled appointments, just show the status badge
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            Cancelled by client
                          </span>
                        ) : (
                          // For non-cancelled appointments, show the dropdown
                          <select
                            value={appointment.status}
                            onChange={(e) => handleStatusChange(appointment._id, e.target.value as AppointmentStatus)}
                            className={`text-sm rounded-full px-3 py-1 font-semibold ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetailsModal(true);
                          }}
                          className="text-law-primary hover:text-law-secondary mr-3"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowMessageModal(true);
                          }}
                          className="text-law-primary hover:text-law-secondary"
                        >
                          Send Message
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedAppointment && (
        <SendMessageModal
          client={{
            id: selectedAppointment.userId,
            fullName: selectedAppointment.clientName || '',
            email: selectedAppointment.clientEmail || '',
            appointments: []
          }}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}

      {/* Status Update Confirmation Dialog */}
      <ConfirmDialog
        isOpen={statusConfirmDialog.isOpen}
        title="Update Appointment Status"
        message={`Are you sure you want to change the appointment status to ${statusConfirmDialog.newStatus}?`}
        confirmText="Yes, Update"
        cancelText="No, Cancel"
        type="warning"
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusConfirmDialog({
          isOpen: false,
          appointmentId: null,
          newStatus: null
        })}
      />
    </div>
  );
} 