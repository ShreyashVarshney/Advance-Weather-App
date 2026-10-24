import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,12,41,0.95)',
            color: '#e2e8f0',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
