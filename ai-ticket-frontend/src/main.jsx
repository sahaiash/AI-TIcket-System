import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import checkAuth from './components/checkAuth.jsx'
import login from './pages/login.jsx'
import signup from './pages/signup.jsx'
import Ticket from './pages/ticket.jsx'
import Tickets from './pages/tickets.jsx'
import admin from './pages/admin.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route
      path='/'
      element={
        <checkAuth protected={true}>
          <Tickets/>

        </checkAuth>
      }
      />
      <Route
        path="ticket/:id"
      />
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
