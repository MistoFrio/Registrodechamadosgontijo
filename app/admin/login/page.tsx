'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock, User } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar se já está autenticado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = sessionStorage.getItem('admin_authenticated');
      if (isAuthenticated === 'true') {
        router.push('/admin');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Credenciais do admin (em produção, isso deve vir de variáveis de ambiente)
    const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    // Validar credenciais
    if (username.trim() === adminUsername && password === adminPassword) {
      // Salvar autenticação na sessão
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_username', username);
        router.push('/admin');
      }
    } else {
      setError('Usuário ou senha incorretos');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 sm:mb-6">
          <img 
            src="/logogont.png" 
            alt="Logo Gontijo Fundações" 
            className="h-20 sm:h-24 w-auto object-contain mx-auto mb-4"
          />
        </div>
        <Card className="shadow-xl border-red-100">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
              Acesso Administrativo
            </CardTitle>
            <CardDescription className="text-red-50 text-sm sm:text-base">
              Faça login para acessar o painel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">
                  Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    disabled={loading}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 sm:py-6 text-base sm:text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-pulse">Entrando...</span>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-red-600"
          >
            ← Voltar para página inicial
          </Button>
        </div>
      </div>
    </div>
  );
}

