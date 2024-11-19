import { User, Appointment } from '../../types';

interface ClientDetailsModalProps {
  client: User;
  onClose: () => void;
}

export function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-law-primary text-white flex items-center justify-center text-xl font-semibold">
                {client.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{client.fullName}</h3>
                <p className="text-sm text-gray-500">Client ID: #{client.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Contact Information */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-law-primary mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{client.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{client.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Appointment History */}
          <div>
            <h4 className="text-lg font-semibold text-law-primary mb-4">Appointment History</h4>
            <div className="space-y-4">
              {client.appointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No appointments yet</p>
              ) : (
                client.appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.caseType.charAt(0).toUpperCase() + appointment.caseType.slice(1)} Law
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} at {appointment.time}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    {appointment.notes && (
                      <p className="mt-2 text-sm text-gray-600">
                        Notes: {appointment.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-law-primary mb-4">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-gray-900">
                  {new Date(client.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Appointments</p>
                <p className="text-gray-900">{client.appointments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 