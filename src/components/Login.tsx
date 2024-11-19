import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onSuccess?: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  // Additional registration fields
  const [registrationData, setRegistrationData] = useState({
    fullName: '',
    phone: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegister) {
        // Validate passwords match
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        // Validate required fields
        if (!registrationData.fullName) {
          setError('Please fill in all required fields');
          return;
        }

        await register(email, password, registrationData.fullName);
        
        // Check if registered user is admin
        const savedUser = localStorage.getItem('user');
        const user = savedUser ? JSON.parse(savedUser) : null;
        
        if (user?.role === 'admin') {
          setError('This registration is for clients only');
          localStorage.removeItem('user'); // Remove admin user from storage
          return;
        }
      } else {
        await login(email, password);
        
        // Check if logged in user is admin
        const savedUser = localStorage.getItem('user');
        const user = savedUser ? JSON.parse(savedUser) : null;
        
        if (user?.role === 'admin') {
          setError('Authentication failed.');
          localStorage.removeItem('user'); // Remove admin user from storage
          return;
        }
      }
      
      onSuccess?.();
      navigate('/dashboard');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-law-primary mb-6">
        {isRegister ? 'Create Account' : 'Login'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister ? (
          <>
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-law-secondary mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={registrationData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-law-secondary mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={registrationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary"
                  required
                />
              </div>
            </div>
          </>
        ) : null}

        {/* Login Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-law-secondary mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-law-secondary mb-1">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-law-secondary mb-1">Confirm Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-law-primary"
                required
              />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-law-accent text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          {isRegister ? 'Create Account' : 'Login'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-600">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          className="text-law-accent hover:underline"
        >
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  );
}