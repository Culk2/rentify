import { Outlet, Link, useLocation } from 'react-router';
import { MessageSquare, Home, Package, Plus, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import logoImage from 'figma:asset/e380734a8aa765da03315b1b0b3e9c75841e253a.png';

export function RootLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const unreadMessages = 3; // Mock unread count

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoImage} alt="Rantify" className="h-40" />
            </Link>

            <nav className="flex items-center gap-2">
              <Button
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link to="/">
                  <Home className="size-4 mr-2" />
                  Browse
                </Link>
              </Button>

              {user && (
                <>
                  <Button
                    variant={location.pathname === '/my-rentals' ? 'default' : 'ghost'}
                    size="sm"
                    asChild
                  >
                    <Link to="/my-rentals">
                      <Package className="size-4 mr-2" />
                      My Rentals
                    </Link>
                  </Button>

                  <Button
                    variant={location.pathname.startsWith('/chat') ? 'default' : 'ghost'}
                    size="sm"
                    asChild
                    className="relative"
                  >
                    <Link to="/chat">
                      <MessageSquare className="size-4 mr-2" />
                      Messages
                      {unreadMessages > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadMessages}
                        </Badge>
                      )}
                    </Link>
                  </Button>

                  <Button size="sm" asChild>
                    <Link to="/add-item">
                      <Plus className="size-4 mr-2" />
                      List Item
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Avatar className="size-6">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline">{user.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="size-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {!user && (
                <Button size="sm" asChild>
                  <Link to="/login">
                    <User className="size-4 mr-2" />
                    Login
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-600">
            © 2024 RentHub. Rent anything, anytime.
          </p>
        </div>
      </footer>
    </div>
  );
}