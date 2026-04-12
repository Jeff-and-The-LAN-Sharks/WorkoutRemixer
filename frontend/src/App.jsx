import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Home from './pages/Home'
import Exercises from './pages/Exercises'
import Routines from './pages/Routines'
import RoutineDetail from './pages/RoutineDetail'
import Workout from './pages/Workout'
import History from './pages/History'
import Food from './pages/Food'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
          <Route path="/exercises" element={<ProtectedRoute><Layout><Exercises /></Layout></ProtectedRoute>} />
          <Route path="/routines" element={<ProtectedRoute><Layout><Routines /></Layout></ProtectedRoute>} />
          <Route path="/routines/:id" element={<ProtectedRoute><Layout><RoutineDetail /></Layout></ProtectedRoute>} />
          <Route path="/workout/:routineId" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
          <Route path="/food" element={<ProtectedRoute><Layout><Food /></Layout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
