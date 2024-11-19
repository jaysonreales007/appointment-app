import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update local storage
      const userWithToken = { ...updatedUser, token: user?.token };
      localStorage.setItem('user', JSON.stringify(userWithToken));

      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-law-primary">Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-law-accent hover:text-opacity-80 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Profile Initial */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full bg-law-primary text-white flex items-center justify-center text-4xl">
          {formData.fullName.charAt(0).toUpperCase()}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-law-secondary mb-1">Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary"
            disabled={!isEditing}
            required
          />
        </div>
        <div>
          <label className="block text-law-secondary mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary"
            disabled={!isEditing}
            required
          />
        </div>
        <div>
          <label className="block text-law-secondary mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary"
            disabled={!isEditing}
          />
        </div>
        {isEditing && (
          <button
            type="submit"
            className="w-full bg-law-accent text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Save Changes
          </button>
        )}
      </form>
    </div>
  );
} 
