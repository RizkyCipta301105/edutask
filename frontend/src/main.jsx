import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "GANTI_DENGAN_CLIENT_ID_ANDA.apps.googleusercontent.com"}>
        <App />
      </GoogleOAuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fdfaf4',
            color: '#3d300a',
            border: '1px solid #d09730',
            borderRadius: '10px',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#8b6914', secondary: '#fdf6e3' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
