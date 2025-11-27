import { Cloud, LogOut, MapPin, User, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.clearAuth);
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="mr-4 flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Weather</span>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors hover:text-foreground/80 ${location.pathname === '/'
                ? 'text-foreground'
                : 'text-foreground/60'
                }`}
            >
              Dashboard
            </Link>
            <Link
              to="/users"
              className={`transition-colors hover:text-foreground/80 flex items-center gap-1 ${location.pathname === '/users'
                ? 'text-foreground'
                : 'text-foreground/60'
                }`}
            >
              <Users className="h-4 w-4" />
              Usuários
            </Link>
            <Link
              to="/explore"
              className={`transition-colors hover:text-foreground/80 flex items-center gap-1 ${location.pathname === '/explore'
                ? 'text-foreground'
                : 'text-foreground/60'
                }`}
            >
              <MapPin className="h-4 w-4" />
              Explorar
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <Separator orientation="vertical" className="h-6" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user?.name ? getInitials(user.name) : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.name && (
                      <p className="font-medium">{user.name}</p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="container bg-muted py-6">{children}</main>
    </div>
  );
}
