import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'
import Dashboard from '@/features/dashboard/Dashboard'
import Album from '@/features/album/Album'
import Scan from '@/features/scan/Scan'
import Trades from '@/features/trades/Trades'
import More from '@/features/more/More'

export default function App() {
  return (
    <div className="flex flex-col min-h-svh bg-slate-950">
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/album" element={<Album />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/more" element={<More />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
