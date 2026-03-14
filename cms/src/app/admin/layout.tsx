'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Categorias', href: '/admin/categorias', icon: FolderTree },
  { name: 'Imagenes', href: '/admin/imagenes', icon: Image },
  { name: 'Reservas', href: '/admin/reservas', icon: Calendar },
  { name: 'Mensajes', href: '/admin/mensajes', icon: MessageSquare },
  { name: 'Configuracion', href: '/admin/configuracion', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verificar autenticacion
    const checkAuth = async () => {
      // Skip para login
      if (pathname === '/admin/login') {
        setChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
      } catch {
        router.push('/admin/login');
        return;
      }
      setChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
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
    <div className="min-h-screen flex" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ backgroundColor: '#3D2314' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#D4A574' }}
              >
                <span className="text-lg font-bold" style={{ color: '#3D2314' }}>LH</span>
              </div>
              <div>
                <h1 className="font-bold text-sm" style={{ color: '#FFF8F0' }}>La Habanera</h1>
                <p className="text-xs" style={{ color: '#D4A574' }}>CMS Admin</p>
              </div>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)} style={{ color: '#FFF8F0' }}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
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
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              style={{ borderColor: '#5D4037', color: '#FFF8F0', backgroundColor: 'transparent' }}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesion</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header mobile */}
        <header className="h-14 flex items-center px-4 border-b lg:hidden" style={{ backgroundColor: '#FFF8F0', borderColor: '#E8E4D9' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: '#3D2314' }}>
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-4 font-medium" style={{ color: '#3D2314' }}>La Habanera</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
