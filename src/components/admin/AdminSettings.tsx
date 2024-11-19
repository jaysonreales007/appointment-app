import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface OfficeHours {
  day: string;
  start: string;
  end: string;
  isOpen: boolean;
}

export function AdminSettings() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Office Information State
  const [officeInfo, setOfficeInfo] = useState({
    name: 'Rañeses Law Office',
    email: 'contact@raneseslawoffice.com',
    phone: '(052) 742-1234',
    address: 'Room 1-201 Los Baños Bldg., Peñaranda St., Legazpi City'
  });

  // Office Hours State
  const [officeHours, setOfficeHours] = useState<OfficeHours[]>([
    { day: 'Monday', start: '09:00', end: '17:00', isOpen: true },
    { day: 'Tuesday', start: '09:00', end: '17:00', isOpen: true },
    { day: 'Wednesday', start: '09:00', end: '17:00', isOpen: true },
    { day: 'Thursday', start: '09:00', end: '17:00', isOpen: true },
    { day: 'Friday', start: '09:00', end: '17:00', isOpen: true },
    { day: 'Saturday', start: '09:00', end: '12:00', isOpen: true },
    { day: 'Sunday', start: '09:00', end: '17:00', isOpen: false }
  ]);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    maxAppointmentsPerDay: 8,
    appointmentDuration: 60, // in minutes
    allowWeekendBookings: true,
    requireApproval: true,
    autoConfirmation: false
  });

  const handleOfficeInfoChange = (key: keyof typeof officeInfo, value: string) => {
    setOfficeInfo(prev => ({ ...prev, [key]: value }));
  };

  const handleOfficeHoursChange = (index: number, field: keyof OfficeHours, value: string | boolean) => {
    const newHours = [...officeHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setOfficeHours(newHours);
  };

  const handleSystemSettingChange = (key: keyof typeof systemSettings, value: number | boolean) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to save the settings
      console.log('Saving settings:', { officeInfo, officeHours, systemSettings });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-law-primary">Admin Settings</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-law-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Edit Settings
          </button>
        ) : (
          <div className="space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-law-accent text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Office Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-law-primary mb-4">Office Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Name</label>
              <input
                type="text"
                value={officeInfo.name}
                onChange={(e) => handleOfficeInfoChange('name', e.target.value)}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={officeInfo.email}
                onChange={(e) => handleOfficeInfoChange('email', e.target.value)}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={officeInfo.phone}
                onChange={(e) => handleOfficeInfoChange('phone', e.target.value)}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={officeInfo.address}
                onChange={(e) => handleOfficeInfoChange('address', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-law-primary mb-4">System Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Appointments Per Day
              </label>
              <input
                type="number"
                value={systemSettings.maxAppointmentsPerDay}
                onChange={(e) => handleSystemSettingChange('maxAppointmentsPerDay', parseInt(e.target.value))}
                disabled={!isEditing}
                min={1}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Duration (minutes)
              </label>
              <input
                type="number"
                value={systemSettings.appointmentDuration}
                onChange={(e) => handleSystemSettingChange('appointmentDuration', parseInt(e.target.value))}
                disabled={!isEditing}
                min={15}
                step={15}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary disabled:bg-gray-50"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Allow Weekend Bookings</label>
              <button
                onClick={() => isEditing && handleSystemSettingChange('allowWeekendBookings', !systemSettings.allowWeekendBookings)}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  systemSettings.allowWeekendBookings ? 'bg-law-accent' : 'bg-gray-300'
                } ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.allowWeekendBookings ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Require Approval</label>
              <button
                onClick={() => isEditing && handleSystemSettingChange('requireApproval', !systemSettings.requireApproval)}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  systemSettings.requireApproval ? 'bg-law-accent' : 'bg-gray-300'
                } ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.requireApproval ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Office Hours */}
        <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
          <h3 className="text-lg font-semibold text-law-primary mb-4">Office Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {officeHours.map((hours, index) => (
              <div key={hours.day} className="flex items-center space-x-4">
                <div className="w-28">
                  <span className="text-sm font-medium text-gray-700">{hours.day}</span>
                </div>
                <button
                  onClick={() => isEditing && handleOfficeHoursChange(index, 'isOpen', !hours.isOpen)}
                  disabled={!isEditing}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    hours.isOpen ? 'bg-law-accent' : 'bg-gray-300'
                  } ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hours.isOpen ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                {hours.isOpen && (
                  <>
                    <input
                      type="time"
                      value={hours.start}
                      onChange={(e) => handleOfficeHoursChange(index, 'start', e.target.value)}
                      disabled={!isEditing}
                      className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary disabled:bg-gray-50"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => handleOfficeHoursChange(index, 'end', e.target.value)}
                      disabled={!isEditing}
                      className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-law-primary disabled:bg-gray-50"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 