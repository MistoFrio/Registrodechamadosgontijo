'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ticket, AlertCircle, CheckCircle2, ListOrdered, Bot, Sparkles, X, Send, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { registerServiceWorker } from '@/lib/service-worker';

export default function Home() {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [queueMessage, setQueueMessage] = useState('');
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [queueAhead, setQueueAhead] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [requiresTicket, setRequiresTicket] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Garantir que só renderize no cliente
  useEffect(() => {
    setMounted(true);
    setShowTooltip(true);
    
    // Esconder tooltip após 5 segundos
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Registrar Service Worker para PWA
  useEffect(() => {
    registerServiceWorker();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    // Validação básica
    if (!email || !description) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, informe um email válido');
      setLoading(false);
      return;
    }

    try {
      // Inserir chamado no Supabase
      const { error: insertError } = await supabase()
        .from('tickets')
        .insert([
          {
            email: email,
            description: description,
            status: 'aberto'
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      // Sucesso
      setSuccess(true);
      setEmail('');
      setDescription('');

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Erro ao criar chamado:', err);
      setError('Erro ao enviar chamado. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const maskEmail = (value: string) => {
    const [namePart, domain = 'email.com'] = value.split('@');
    if (!namePart) return value;
    const visible = namePart.slice(0, Math.min(3, namePart.length));
    const masked = namePart.length > 3 ? `${visible}***` : visible;
    return `${masked}@${domain}`;
  };

  const handleAskAI = async () => {
    if (!description || description.trim().length < 10) {
      setError('Por favor, descreva o problema com mais detalhes para consultar o assistente de IA.');
      return;
    }

    setAiLoading(true);
    setAiResponse('');
    setError('');
    setShowAiAssistant(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao consultar assistente de IA');
      }

      setAiResponse(data.response || 'Não foi possível obter resposta da IA.');
      setRequiresTicket(data.requiresTicket || false);
    } catch (err: any) {
      console.error('Erro ao consultar IA:', err);
      setError('Erro ao consultar assistente de IA. Por favor, tente novamente ou abra um chamado diretamente.');
      setShowAiAssistant(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handleChatSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Adicionar mensagem do usuário
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMessage }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao consultar assistente de IA');
      }

      // Adicionar resposta da IA
      setChatMessages([...newMessages, { role: 'assistant', content: data.response || 'Não foi possível obter resposta da IA.' }]);
    } catch (err: any) {
      console.error('Erro ao consultar IA:', err);
      setChatMessages([...newMessages, { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleOpenChat = () => {
    setChatOpen(true);
    // Mensagem inicial se o chat estiver vazio
    if (chatMessages.length === 0) {
      setChatMessages([{
        role: 'assistant',
        content: 'Olá! Sou seu assistente virtual de T.I. Como posso ajudá-lo hoje? Descreva seu problema técnico e eu tentarei ajudá-lo.'
      }]);
    }
  };

  const handleCheckQueue = async () => {
    if (!email) {
      setQueueError('Informe seu email corporativo para verificar a fila.');
      return;
    }

    setQueueLoading(true);
    setQueueError('');
    setQueueMessage('');
    setQueuePosition(null);
    setQueueAhead([]);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error: fetchError } = await supabase()
        .from('tickets')
        .select('id,email,status,created_at')
        .eq('status', 'aberto')
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      if (!data || data.length === 0) {
        setQueueMessage('Não há chamados em aberto no momento.');
        return;
      }

      const position = data.findIndex((ticket) => ticket.email.toLowerCase() === normalizedEmail);

      if (position === -1) {
        setQueueMessage('Não encontramos um chamado em aberto com este email.');
        return;
      }

      const ahead = data.slice(0, position).map((ticket) => maskEmail(ticket.email));
      setQueueAhead(ahead);
      setQueuePosition(position + 1);

      if (ahead.length === 0) {
        setQueueMessage('Seu chamado é o próximo a ser atendido!');
      } else {
        setQueueMessage(`Existem ${ahead.length} chamado(s) antes do seu.`);
      }
    } catch (err) {
      console.error('Erro ao verificar fila:', err);
      setQueueError('Não foi possível consultar a fila agora. Tente novamente em instantes.');
    } finally {
      setQueueLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Floating AI Assistant Button - apenas no cliente */}
      {mounted && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
          <div className="relative flex flex-col items-end">
            {/* Balão de fala - aparece por 5 segundos */}
            {showTooltip && (
              <div className="mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-gray-900 text-white text-sm sm:text-base rounded-lg px-4 sm:px-5 py-3 sm:py-3.5 shadow-xl text-center">
                  <span className="font-semibold block whitespace-normal max-w-[160px] sm:max-w-none sm:whitespace-nowrap">
                    Pergunte para IA especializada em T.I
                  </span>
                </div>
              </div>
            )}
            
            {/* Botão redondo com robô - cor vermelha */}
            <Button
              onClick={handleOpenChat}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center p-0 hover:scale-110 flex-shrink-0"
              size="lg"
            >
              <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </Button>
          </div>
        </div>
      )}

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-600" />
              Assistente Virtual de T.I
            </DialogTitle>
            <DialogDescription>
              Descreva seu problema técnico e receba ajuda instantânea
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleChatSend} className="px-6 pb-6 pt-4 border-t">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                disabled={chatLoading}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSend();
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <img 
                src="/logogont.png" 
                alt="Logo Gontijo Fundações" 
                className="h-20 sm:h-24 md:h-28 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 px-2">
              Abertura de chamados T.I/IA 
            </h1>
          </div>

          {/* Form Card */}
          <Card className="shadow-xl border-red-100">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
              <CardTitle className="text-xl sm:text-2xl">Abrir Novo Chamado</CardTitle>
              <CardDescription className="text-red-50 text-sm sm:text-base">
                Preencha os dados abaixo para registrar seu chamado
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Success Alert */}
              {success && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Chamado criado com sucesso! Nossa equipe entrará em contato em breve.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Alert */}
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Corporativo *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-gray-700 font-medium">
                      Descrição do Problema *
                    </Label>
                    {description.length >= 10 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAskAI}
                        disabled={aiLoading || loading}
                        className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        {aiLoading ? (
                          <>
                            <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                            Consultando IA...
                          </>
                        ) : (
                          <>
                            <Bot className="w-3 h-3 mr-1" />
                            Consultar Assistente IA
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente o problema ou solicitação..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (showAiAssistant) {
                        setShowAiAssistant(false);
                        setAiResponse('');
                      }
                    }}
                    className="min-h-[150px] border-gray-300 focus:border-red-500 focus:ring-red-500"
                    disabled={loading}
                    required
                  />
                </div>

                {/* AI Assistant Response */}
                {showAiAssistant && aiResponse && (
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Assistente de IA</h3>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAiAssistant(false);
                          setAiResponse('');
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border border-blue-100">
                      {aiResponse}
                    </div>
                    {requiresTicket && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 text-xs">
                          Este problema parece requerer suporte técnico especializado. Recomendamos abrir um chamado.
                        </AlertDescription>
                      </Alert>
                    )}
                    {!requiresTicket && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 text-xs">
                          Se a solução sugerida não resolver seu problema, você ainda pode abrir um chamado abaixo.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 sm:py-6 text-base sm:text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-pulse">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-5 h-5 mr-2" />
                      Enviar Chamado
                    </>
                  )}
                </Button>

                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCheckQueue}
                    disabled={queueLoading}
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  >
                    {queueLoading ? (
                      <span className="animate-pulse">Verificando fila...</span>
                    ) : (
                      <>
                        <ListOrdered className="w-5 h-5 mr-2" />
                        Verificar posição na fila
                      </>
                    )}
                  </Button>

                  {queueError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">{queueError}</AlertDescription>
                    </Alert>
                  )}

                  {queueMessage && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertDescription className="text-blue-900 font-medium">{queueMessage}</AlertDescription>
                    </Alert>
                  )}

                  {queuePosition && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Sua posição atual</p>
                      <p className="text-3xl font-bold text-gray-900">{queuePosition}º</p>
                    </div>
                  )}

                  {queueAhead.length > 0 && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Chamados antes do seu (email parcial por privacidade):
                      </p>
                      <ul className="space-y-2">
                        {queueAhead.map((maskedEmail, index) => (
                          <li key={`${maskedEmail}-${index}`} className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="text-gray-500">{index + 1}º</span>
                            <span className="font-mono">{maskedEmail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="mt-6 sm:mt-8 text-center text-gray-600 text-xs sm:text-sm space-y-3 sm:space-y-4 px-2">
            <p className="mt-2">
              Em caso de urgência, entre em contato pelo telefone
            </p>

            <div>
              <p className="text-gray-700 mb-2 text-sm">
                Administradores podem acessar o painel seguro abaixo:
              </p>
              <Link href="/admin/login" className="inline-block">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white text-sm sm:text-base px-4 sm:px-6">
                  Área Administrativa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
