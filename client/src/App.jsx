import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ToolCheckout from './pages/ToolCheckout'
import ToolCheckin from './pages/ToolCheckin'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute roles={['admin', 'storeperson', 'worker']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute roles={['storeperson']}>
                <ToolCheckout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkin" 
            element={
              <ProtectedRoute roles={['storeperson']}>
                <ToolCheckin />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
