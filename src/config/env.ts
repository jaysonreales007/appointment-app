export const env = {
  MONGODB_URI: import.meta.env.VITE_MONGODB_URI || 'mongodb+srv://rlawoffice:sXyXyJLnpfHFZ7uP@appointment-system.j7xag.mongodb.net/appointment',
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || 'e8af1200637b9e3e56128ea3b5a768f34f8988186f4ce25a1a3f821cef7c71992186b39ea9925189dae62cb3d12c36229e030de6a7200e2fac9804375352cca9',
  PORT: import.meta.env.VITE_PORT || 5000
}; 