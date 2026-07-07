// App shell for all signed-in routes.
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { NicknameModal } from './NicknameModal'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { needsNickname } = useAuth()
  const [promptNick, setPromptNick] = useState(false)

  // Gently invite new users to pick a nickname the first time (once).
  useEffect(() => {
    if (needsNickname) setPromptNick(true)
  }, [needsNickname])

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <NicknameModal
        open={promptNick}
        firstTime
        onClose={() => setPromptNick(false)}
      />
    </div>
  )
}
