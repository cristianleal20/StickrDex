import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './features/Dashboard'
import { Album } from './features/Album'
import { Scanner } from './features/Scanner'
import { Trades } from './features/Trades'
import { Settings } from './features/Settings'

export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <div className="min-h-screen pb-20">
      {tab === 'home' && <Dashboard />}
      {tab === 'album' && <Album />}
      {tab === 'scan' && <Scanner />}
      {tab === 'trades' && <Trades />}
      {tab === 'more' && <Settings />}

      <BottomNav activeTab={tab} onTabChange={setTab} />
    </div>
  )
}
