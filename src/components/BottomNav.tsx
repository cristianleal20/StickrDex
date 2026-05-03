import { Home, BookOpen, Camera, Repeat2, Settings } from 'lucide-react'
import { clsx } from 'clsx'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'home',   label: 'Inicio',   Icon: Home },
  { id: 'album',  label: 'Álbum',    Icon: BookOpen },
  { id: 'scan',   label: 'Escanear', Icon: Camera },
  { id: 'trades', label: 'Cambios',  Icon: Repeat2 },
  { id: 'more',   label: 'Más',      Icon: Settings },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={clsx(
            'flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs transition-colors',
            activeTab === id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
