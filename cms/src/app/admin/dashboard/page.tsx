'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, FolderTree, Image, Calendar, MessageSquare, LogOut, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Stats {
  productos: number;
  categorias: number;
  imagenes: number;
  reservas: number;
  mensajes: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    productos: 0,
    categorias: 0,
    imagenes: 0,
    reservas: 0,
    mensajes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        setChecking(false);
        loadStats();
      } catch {
        router.push('/admin/login');
      }
    };

    const loadStats = async () => {
      try {
        const [prodRes, catRes, imgRes, resRes, menRes] = await Promise.all([
          fetch('/api/productos'),
          fetch('/api/categorias'),
          fetch('/api/imagenes'),
          fetch('/api/reservas'),
          fetch('/api/mensajes'),
        ]);

        const productos = await prodRes.json();
        const categorias = await catRes.json();
        const imagenes = await imgRes.json();
        const reservas = await resRes.json();
        const mensajes = await menRes.json();

        setStats({
          productos: productos.productos?.length || 0,
          categorias: categorias.categorias?.length || 0,
          imagenes: imagenes.imagenes?.length || 0,
          reservas: reservas.reservas?.length || 0,
          mensajes: mensajes.mensajes?.length || 0,
        });
      } catch (e) {
        console.error('Error loading stats:', e);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#D4A574' }} />
      </div>
    );
  }

  const cards = [
    { title: 'Productos', value: stats.productos, icon: Package, href: '/admin/productos', color: '#D4A574' },
    { title: 'Categorias', value: stats.categorias, icon: FolderTree, href: '/admin/categorias', color: '#6B8E5A' },
    { title: 'Imagenes', value: stats.imagenes, icon: Image, href: '/admin/imagenes', color: '#7BA3B5' },
    { title: 'Reservas', value: stats.reservas, icon: Calendar, href: '/admin/reservas', color: '#C9A86C' },
    { title: 'Mensajes', value: stats.mensajes, icon: MessageSquare, href: '/admin/mensajes', color: '#7D8B6A' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#3D2314' }}>Dashboard</h1>
          <p className="text-sm" style={{ color: '#6B5344' }}>Bienvenido al panel de administracion</p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2"
          style={{ borderColor: '#3D2314', color: '#3D2314' }}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesion
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#D4A574' }} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium" style={{ color: '#6B5344' }}>
                    {card.title}
                  </CardTitle>
                  <div className="p-2 rounded-md" style={{ backgroundColor: `${card.color}20` }}>
                    <card.icon className="h-4 w-4" style={{ color: card.color }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: '#3D2314' }}>{card.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle style={{ color: '#3D2314' }}>Acciones Rapidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/productos/nuevo">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors hover:opacity-80" style={{ backgroundColor: '#FFF8F0' }}>
                <Package className="h-6 w-6" style={{ color: '#D4A574' }} />
                <span className="text-sm font-medium text-center" style={{ color: '#3D2314' }}>Nuevo Producto</span>
              </div>
            </Link>
            <Link href="/admin/categorias/nuevo">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors hover:opacity-80" style={{ backgroundColor: '#FFF8F0' }}>
                <FolderTree className="h-6 w-6" style={{ color: '#6B8E5A' }} />
                <span className="text-sm font-medium text-center" style={{ color: '#3D2314' }}>Nueva Categoria</span>
              </div>
            </Link>
            <Link href="/admin/reservas">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors hover:opacity-80" style={{ backgroundColor: '#FFF8F0' }}>
                <Calendar className="h-6 w-6" style={{ color: '#C9A86C' }} />
                <span className="text-sm font-medium text-center" style={{ color: '#3D2314' }}>Ver Reservas</span>
              </div>
            </Link>
            <Link href="/admin/configuracion">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors hover:opacity-80" style={{ backgroundColor: '#FFF8F0' }}>
                <MessageSquare className="h-6 w-6" style={{ color: '#7D8B6A' }} />
                <span className="text-sm font-medium text-center" style={{ color: '#3D2314' }}>Configuracion</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
