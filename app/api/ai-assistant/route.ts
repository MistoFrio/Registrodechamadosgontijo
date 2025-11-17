import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Função para buscar na base de conhecimento
async function searchKnowledgeBase(query: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Buscar por palavras-chave e texto completo
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    
    // Buscar na base de conhecimento
    const { data, error } = await supabase
      .from('ai_knowledge_base')
      .select('*')
      .order('priority', { ascending: false })
      .order('usage_count', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Erro ao buscar base de conhecimento:', error);
      return [];
    }

    // Filtrar resultados relevantes baseado em palavras-chave
    const relevantResults = (data || []).filter(item => {
      const questionLower = item.question?.toLowerCase() || '';
      const answerLower = item.answer?.toLowerCase() || '';
      const keywords = (item.keywords || []).map((k: string) => k.toLowerCase());
      const queryLower = query.toLowerCase();

      // Verificar se alguma palavra-chave da query está na pergunta, resposta ou keywords
      return searchTerms.some(term => 
        questionLower.includes(term) || 
        answerLower.includes(term) ||
        keywords.some((k: string) => k.includes(term))
      ) || queryLower.includes(questionLower) || questionLower.includes(queryLower);
    });

    // Atualizar contador de uso
    if (relevantResults.length > 0) {
      const topResult = relevantResults[0];
      await supabase
        .from('ai_knowledge_base')
        .update({ usage_count: (topResult.usage_count || 0) + 1 })
        .eq('id', topResult.id);
    }

    return relevantResults.slice(0, 3); // Retornar até 3 resultados mais relevantes
  } catch (error) {
    console.error('Erro ao buscar base de conhecimento:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Descrição é obrigatória' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key não configurada' },
        { status: 500 }
      );
    }

    // Buscar na base de conhecimento primeiro (RAG - Retrieval Augmented Generation)
    const knowledgeBaseResults = await searchKnowledgeBase(description);
    
    // Construir contexto da base de conhecimento (RAG - Retrieval Augmented Generation)
    // A base de conhecimento é um COMPLEMENTO, não uma limitação
    let knowledgeContext = '';
    if (knowledgeBaseResults.length > 0) {
      knowledgeContext = '\n\nINFORMAÇÕES ESPECÍFICAS DA EMPRESA (use como referência quando relevante):\n';
      knowledgeBaseResults.forEach((item, index) => {
        knowledgeContext += `${index + 1}. ${item.question}\n   Solução: ${item.answer}\n\n`;
      });
      knowledgeContext += 'IMPORTANTE: Use essas informações apenas se forem relevantes ao problema do usuário. Se o problema for diferente, use seu conhecimento geral de T.I para ajudar.';
    }

    // Prompt otimizado para suporte de T.I
    // A base de conhecimento é opcional e complementar
    const systemPrompt = `Você é um assistente virtual especializado em suporte de T.I da empresa Gontijo Fundações.
Sua função é ajudar usuários com problemas técnicos, fornecendo soluções práticas e passo a passo.

INSTRUÇÕES:
- Use seu conhecimento geral de T.I para responder qualquer pergunta
- Se houver informações específicas da empresa abaixo, use-as como REFERÊNCIA quando relevantes
- Se o problema não estiver na base de conhecimento, use seu conhecimento técnico geral
- Seja conciso, claro e objetivo
- Use linguagem simples e técnica quando necessário
- Se o problema for complexo ou requer acesso físico ao equipamento, sugira que o usuário abra um chamado técnico
${knowledgeContext ? '\n' + knowledgeContext : ''}`;

    const userPrompt = `O usuário está relatando o seguinte problema de T.I:
"${description}"

Analise o problema e forneça:
1. Uma possível solução rápida (se aplicável)
2. Passos para resolver (se for algo simples)
3. Se o problema requer suporte técnico especializado, informe que é necessário abrir um chamado

${knowledgeContext ? 'Se as informações da empresa acima forem relevantes, use-as. Caso contrário, use seu conhecimento geral de T.I.' : 'Use seu conhecimento geral de suporte técnico para ajudar.'}
Seja objetivo e prático.`;

    // Groq API endpoint - usando Llama 3 que é rápido e eficiente
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Modelo rápido e gratuito do Groq
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API Error:', errorData);
      return NextResponse.json(
        { error: 'Erro ao consultar assistente de IA' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Não foi possível obter resposta da IA.';

    return NextResponse.json({ 
      response: aiResponse,
      requiresTicket: aiResponse.toLowerCase().includes('chamado') || 
                      aiResponse.toLowerCase().includes('suporte técnico') ||
                      aiResponse.toLowerCase().includes('técnico especializado')
    });

  } catch (error: any) {
    console.error('Erro na API de assistente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

