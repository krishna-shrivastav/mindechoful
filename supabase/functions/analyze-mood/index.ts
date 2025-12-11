import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, text, mood, stressLevel, facialExpression } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'journal-analysis') {
      systemPrompt = `You are a compassionate mental health support AI. Analyze the user's journal entry and provide:
1. A brief emotional analysis (2-3 sentences)
2. Key emotional themes detected
3. A supportive, encouraging message
4. Suggested coping strategies if needed

Be warm, empathetic, and non-judgmental. Focus on validation and support.`;
      userPrompt = `Analyze this journal entry: "${text}"`;
    } else if (type === 'mood-insight') {
      systemPrompt = `You are a mental wellness AI assistant. Based on the user's mood and stress data, provide personalized insights and recommendations. Be supportive and practical.`;
      userPrompt = `User's current state:
- Mood: ${mood}
- Stress Level: ${stressLevel}/10
- Facial Expression Analysis: ${facialExpression || 'Not available'}
${text ? `- Additional notes: ${text}` : ''}

Provide a brief, supportive analysis (2-3 sentences) and one actionable suggestion.`;
    } else if (type === 'facial-analysis') {
      systemPrompt = `You are an expert at interpreting facial expression data for mental wellness support. Based on the facial landmarks and expression data, provide a compassionate assessment of the person's emotional state.`;
      userPrompt = `Facial expression data: ${JSON.stringify(facialExpression)}
      
Provide a brief, supportive interpretation of the detected emotional state and any wellness suggestions.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI Gateway error');
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    console.log('Mood analysis completed successfully');

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-mood function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
