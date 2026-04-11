import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('wr_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    setUser(res.data.user)
    localStorage.setItem('wr_user', JSON.stringify(res.data.user))
    return res.data
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
    localStorage.removeItem('wr_user')
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
