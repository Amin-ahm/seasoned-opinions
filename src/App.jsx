import { HashRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { SpotDetail } from './pages/SpotDetail'
import { AddSpot } from './pages/AddSpot'
import { EditSpot } from './pages/EditSpot'
import { MapView } from './pages/MapView'
import { DecideForMe } from './pages/DecideForMe'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { NotFound } from './pages/NotFound'

function Splash() {
  return (
    <div className="splash">
      <div className="splash-emoji" aria-hidden="true">🧂</div>
      <p className="muted">Warming up the kitchen…</p>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <Splash />

  return (
    <HashRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<Login />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/spot/:id" element={<SpotDetail />} />
            <Route path="/spot/:id/edit" element={<EditSpot />} />
            <Route path="/add" element={<AddSpot />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/decide" element={<DecideForMe />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        )}
      </Routes>
    </HashRouter>
  )
}
