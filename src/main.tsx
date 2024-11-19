import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import connectDB from './config/db'

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('✅ MongoDB connected successfully!')
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error)
  });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
