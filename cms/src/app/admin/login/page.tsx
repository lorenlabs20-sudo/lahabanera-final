'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      console.log('Login response', res.status, data);

      if (res.ok && data.success) {
        // Verificar que el cookie ya está disponible en /api/auth/me
        const checkMe = await fetch('/api/auth/me', { credentials: 'include' });
        const meData = await checkMe.json().catch(() => ({}));

        if (checkMe.ok) {
          setLoading(false);
          // full refresh para que middleware mire el cookie desde el servidor
          window.location.assign('/admin/dashboard');
          return;
        }

        setError(
          meData.error
            ? `Login exitoso pero auth/me falla: ${meData.error}`
            : 'Login exitoso pero no se puede verificar la sesión',
        );
        setLoading(false);
      } else {
        setError(data.error || 'Credenciales incorrectas');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error', error);
      setError('Error de conexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FFF8F0' }}>
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#3D2314' }}
            >
              <span className="text-2xl font-bold" style={{ color: '#D4A574' }}>LH</span>
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl" style={{ color: '#3D2314' }}>
              Finca La Habanera
            </CardTitle>
            <CardDescription style={{ color: '#6B5344' }}>
              Panel de Administracion
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: '#3D2314' }}>Correo</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6B5344' }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: '#3D2314' }}>Contrasena</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6B5344' }} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#6B5344' }}
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              style={{ backgroundColor: '#3D2314', color: '#FFF8F0' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                'Iniciar Sesion'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}