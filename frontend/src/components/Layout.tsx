import { Cloud, LogOut, MapPin, Menu, User, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const NavLinks = () => (
    <>
      <Link
        to="/"
        onClick={() => setMobileMenuOpen(false)}
        className={`transition-colors hover:text-foreground/80 flex items-center gap-2 px-4 py-2 rounded-md ${location.pathname === '/'
          ? 'text-foreground bg-muted'
          : 'text-foreground/60'
          }`}
      >
        <Cloud className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        to="/users"
        onClick={() => setMobileMenuOpen(false)}
        className={`transition-colors hover:text-foreground/80 flex items-center gap-2 px-4 py-2 rounded-md ${location.pathname === '/users'
          ? 'text-foreground bg-muted'
          : 'text-foreground/60'
          }`}
      >
        <Users className="h-4 w-4" />
        Usuários
      </Link>
      <Link
        to="/explore"
        onClick={() => setMobileMenuOpen(false)}
        className={`transition-colors hover:text-foreground/80 flex items-center gap-2 px-4 py-2 rounded-md ${location.pathname === '/explore'
          ? 'text-foreground bg-muted'
          : 'text-foreground/60'
          }`}
      >
        <MapPin className="h-4 w-4" />
        Explorar
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="mr-4 flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Weather</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
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

          <div className="ml-auto flex items-center gap-2 md:gap-4">
            {/* Mobile Menu Button */}
            <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} direction="left">
              <DrawerTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent direction="left" className="w-[280px] sm:w-[320px]">
                <DrawerHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <DrawerTitle className="flex items-center gap-2">
                      <Cloud className="h-5 w-5 text-primary" />
                      Weather
                    </DrawerTitle>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-4 w-4" />
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>
                <div className="flex flex-col gap-2 p-4">
                  <NavLinks />
                  <Separator className="my-2" />
                  <div className="flex items-center gap-3 px-4 py-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {user?.name ? getInitials(user.name) : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      {user?.name && (
                        <p className="text-sm font-medium">{user.name}</p>
                      )}
                      {user?.email && (
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Meu Perfil
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-4">
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

            {/* Mobile User Avatar (simplified) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
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
      <main className="container bg-muted py-4 md:py-6 px-2 sm:px-4">{children}</main>
    </div>
  );
}
