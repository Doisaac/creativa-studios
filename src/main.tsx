import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { CreativaStudios } from '@/CreativaStudios'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CreativaStudios />
  </StrictMode>,
)
