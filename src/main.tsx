import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/refined-base.css'
import './styles/refined-public.css'
import './styles/refined-home.css'
import './styles/refined-fixes.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
