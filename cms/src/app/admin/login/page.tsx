'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const currentYear = new Date().getFullYear();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!email) return 'El correo electrónico es requerido';
    if (!emailRegex.test(email)) return 'Ingrese un correo electrónico válido';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'La contraseña es requerida';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      toast({
        title: "Error de validación",
        description: "Por favor corrija los errores en el formulario",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: "¡Bienvenido!",
          description: "Iniciando sesión...",
        });

        // Verificar que el cookie ya está disponible
        const checkMe = await fetch('/api/auth/me', { credentials: 'include' });

        if (checkMe.ok) {
          setLoading(false);
          setTimeout(() => {
            window.location.assign('/admin/dashboard');
          }, 500);
          return;
        }

        const meData = await checkMe.json().catch(() => ({}));
        toast({
          title: "Error de sesión",
          description: meData.error || 'Error al verificar la sesión',
          variant: "destructive",
        });
        setLoading(false);
      } else {
        toast({
          title: "Error de autenticación",
          description: data.error === 'Invalid credentials'
            ? 'Correo o contraseña incorrectos'
            : data.error || 'Error al iniciar sesión',
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Login error', error);

      if (error.name === 'AbortError') {
        toast({
          title: "Tiempo de espera agotado",
          description: "La solicitud ha tardado demasiado. Verifique su conexión.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error de conexión",
          description: "Verifique su internet e intente nuevamente",
          variant: "destructive",
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FFF8F0' }}>
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-md">
              <Image
                src="/Logo.png"
                alt="Finca La Habanera"
                width={80}
                height={80}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl" style={{ color: '#3D2314' }}>
              Finca La Habanera
            </CardTitle>
            <CardDescription style={{ color: '#6B5344' }}>
              Panel de Administración
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: '#3D2314' }}>
                Correo Electrónico
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6B5344' }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={`pl-10 ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#D4A574] focus:ring-[#D4A574]'}`}
                  disabled={loading}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailError && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {emailError && (
                <p id="email-error" className="text-xs text-red-500 mt-1">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: '#3D2314' }}>
                Contraseña
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6B5344' }} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`pl-10 pr-10 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#D4A574] focus:ring-[#D4A574]'}`}
                  disabled={loading}
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                  style={{ color: '#6B5344' }}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {passwordError && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {passwordError && (
                <p id="password-error" className="text-xs text-red-500 mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full transition-all duration-200 hover:shadow-md"
              style={{ backgroundColor: '#3D2314', color: '#FFF8F0' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs" style={{ color: '#9B7B5C' }}>
              © {currentYear} Finca La Habanera - Todos los derechos reservados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}