import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CheckAuth from './components/checkAuth.jsx'
import Ticket from './pages/ticket.jsx'
import Tickets from './pages/tickets.jsx'
import Signup from './pages/signup.jsx'
import Login from './pages/login.jsx'
import Admin from './pages/admin.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    {/* this is the main routes that renders the app */}
    <Routes>
      {/* this is the home page */}
      <Route
      path='/'
      element={
        <CheckAuth protected={true}>
          <Tickets/>
        </CheckAuth>
      }
      />
      {/* this is the ticket page */}
      <Route
        path="ticket/:id"
        element={
          <CheckAuth protected={true}>
            <Ticket/>
          </CheckAuth>
        }
      />
      {/* this is the signup page */}
      <Route
        path="/signup"
        element={
          <CheckAuth protected={false}>
            <Signup/>
          </CheckAuth>
        }
      />
      {/* this is the login page */}
      <Route
        path="/login"
        element={
          <CheckAuth protected={false}>
            <Login/>
          </CheckAuth>
        }
      />
      {/* this is the admin page */}
      <Route
        path="/admin"
        element={
          <CheckAuth protected={true}>
            <Admin/>
          </CheckAuth>
        }
      />
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
