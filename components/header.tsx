"use client"

import { Settings, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/auth/logout-button"
import { useUser } from "@/lib/supabase/hooks"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, userData } = useUser()

  // Usar user_metadata si userData no está disponible (RLS puede bloquear)
  const displayName = userData?.full_name || user?.user_metadata?.full_name || user?.email

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {/* Botón hamburguesa para móvil */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h2 className="text-base lg:text-lg font-semibold text-card-foreground">
          ERP 3D Studio
        </h2>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground max-w-[150px] lg:max-w-none truncate">
              {displayName}
            </span>
          </div>
        )}
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Settings className="w-5 h-5" />
        </Button>
        <LogoutButton />
      </div>
    </header>
  )
}
