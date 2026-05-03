import { NavLink } from 'react-router-dom'
import { Home, BookOpen, ScanLine, ArrowLeftRight, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',       label: 'Inicio',     Icon: Home },
  { to: '/album',  label: 'Álbum',      Icon: BookOpen },
  { to: '/scan',   label: 'Escanear',   Icon: ScanLine },
  { to: '/trades', label: 'Cambios',    Icon: ArrowLeftRight },
  { to: '/more',   label: 'Más',        Icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 safe-bottom">
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-500 active:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
