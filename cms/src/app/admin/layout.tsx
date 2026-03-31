'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image as Imagens,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Categorias', href: '/admin/categorias', icon: FolderTree },
  { name: 'Imagenes', href: '/admin/imagenes', icon: Imagens },
  { name: 'Reservas', href: '/admin/reservas', icon: Calendar },
  { name: 'Mensajes', href: '/admin/mensajes', icon: MessageSquare },
  { name: 'Configuracion', href: '/admin/configuracion', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Verificar autenticacion
    const checkAuth = async () => {
      // Skip para login
      if (pathname === '/admin/login') {
        setChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          router.push('/admin/login');
          setChecking(false);
          return;
        }
      } catch (error) {
        console.error('checkAuth error:', error);
        router.push('/admin/login');
        setChecking(false);
        return;
      }
      setChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (response.ok) {
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente.",
        });
        router.push('/admin/login');
      } else {
        toast({
          title: "Error",
          description: "No se pudo cerrar la sesión.",
          variant: "destructive",
        });
        setIsLoggingOut(false);
        setLogoutDialogOpen(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      });
      setIsLoggingOut(false);
      setLogoutDialogOpen(false);
    }
  };

  // Login page sin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="w-10 h-10 rounded-full animate-pulse" style={{ backgroundColor: '#D4A574' }} />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fijo sin scroll */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-full overflow-hidden
        `}
        style={{ backgroundColor: '#3D2314' }}
      >
        {/* Logo - Fijo con imagen */}
        <div className="flex-shrink-0 p-4 border-b" style={{ borderColor: '#5D4037' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo con imagen */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex-shrink-0 shadow-md">
                <Image
                  src="/Logo.png"
                  alt="La Habanera"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm truncate" style={{ color: '#FFF8F0' }}>La Habanera</h1>
                <p className="text-xs truncate" style={{ color: '#D4A574' }}>CMS Admin</p>
              </div>
            </div>
            <button className="lg:hidden flex-shrink-0" onClick={() => setSidebarOpen(false)} style={{ color: '#FFF8F0' }}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation - Scrollable solo si es necesario */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                style={{
                  backgroundColor: isActive ? '#D4A574' : 'transparent',
                  color: isActive ? '#3D2314' : '#FFF8F0',
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout - Fijo */}
        <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: '#5D4037' }}>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            style={{ borderColor: '#5D4037', color: '#FFF8F0', backgroundColor: 'transparent' }}
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Cerrar Sesion</span>
          </Button>
        </div>
      </aside>

      {/* Main content area - Scrollable */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header mobile - Fijo */}
        <header className="flex-shrink-0 h-14 flex items-center px-4 border-b lg:hidden" style={{ backgroundColor: '#FFF8F0', borderColor: '#E8E4D9' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: '#3D2314' }}>
            <Menu className="h-6 w-6" />
          </button>
          {/* Logo pequeño en mobile header */}
          <div className="ml-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-sm">
              <Image
                src="/Logo.png"
                alt="La Habanera"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-medium truncate" style={{ color: '#3D2314' }}>La Habanera</span>
          </div>
        </header>

        {/* Content - Scrollable independiente */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Modal de confirmación de cierre de sesión */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="w-[95%] sm:w-full max-w-md mx-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <AlertDialogTitle style={{ color: '#3D2314' }} className="text-lg sm:text-xl">
                ¿Cerrar sesión?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription style={{ color: '#6B5344' }} className="text-sm">
              ¿Estás seguro de que deseas cerrar tu sesión?
              <br />
              Deberás volver a iniciar sesión para acceder al panel de administración.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={isLoggingOut}
              className="w-full sm:w-auto"
              style={{
                borderColor: '#E8E4D9',
                color: '#6B5344',
                backgroundColor: 'white'
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full sm:w-auto hover:opacity-90"
              style={{
                backgroundColor: '#3D2314',
                color: '#FFF8F0',
                border: 'none'
              }}
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Cerrando...
                </>
              ) : (
                'Sí, cerrar sesión'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}