import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { apiUrl } from '../utils/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (barcodeId) => {
    try {
      const response = await axios.post(apiUrl('/api/auth/login'), { barcodeId })
      const userData = response.data
      setUser(userData.user)
      localStorage.setItem('user', JSON.stringify(userData.user))
      localStorage.setItem('token', userData.token)
      return userData
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext 