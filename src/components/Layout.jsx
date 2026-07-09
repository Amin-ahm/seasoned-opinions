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

  // Invite the user to pick a nickname at most ONCE per browser, never nag on
  // refresh. After that it's always available from the header chip.
  useEffect(() => {
    if (!needsNickname) return
    if (localStorage.getItem('so_nickname_prompted')) return
    localStorage.setItem('so_nickname_prompted', '1')
    setPromptNick(true)
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
