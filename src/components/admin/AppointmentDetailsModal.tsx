import { Appointment } from '../../types';

interface AppointmentDetailsModalProps {
  appointment: Appointment & {
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
  };
  onClose: () => void;
}

export function AppointmentDetailsModal({ appointment, onClose }: AppointmentDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-law-primary">
              Appointment Details
            </h3>
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
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-law-primary">Client Information</h4>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-base font-medium">{appointment.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base">{appointment.clientEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-base">{appointment.clientPhone || 'Not provided'}</p>
              </div>
            </div>

            {/* Appointment Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-law-primary">Appointment Details</h4>
              <div>
                <p className="text-sm text-gray-500">Case Type</p>
                <p className="text-base font-medium">
                  {appointment.caseType.charAt(0).toUpperCase() + appointment.caseType.slice(1).replace('_', ' ')} Law
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="text-base">
                  {new Date(appointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-base">
                  {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                  ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {appointment.notes && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-law-primary mb-2">Notes</h4>
              <p className="text-base text-gray-700 bg-gray-50 p-4 rounded-lg">
                {appointment.notes}
              </p>
            </div>
          )}

          {/* Timeline Section */}
          <div className="mt-6">
            <h4 className="text-lg font-medium text-law-primary mb-2">Timeline</h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-24 text-gray-500">Created</div>
                <div>{new Date(appointment.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-24 text-gray-500">Last Updated</div>
                <div>{new Date(appointment.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 