import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { type, text, mood, stressLevel, facialExpression, moodData, stats, audioData, duration } = await req.json();
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
    } else if (type === 'voice-analysis') {
      systemPrompt = `You are a mental wellness AI that analyzes voice check-ins. Based on the duration and context of a voice recording, provide emotional insights. Estimate the emotional state based on the fact that someone took time to record a voice check-in.`;
      userPrompt = `A user recorded a ${duration} second voice check-in for their mental wellness app.

Based on this engagement, provide:
1. An estimated emotional state (one word: Calm, Anxious, Stressed, Neutral, Hopeful, etc.)
2. A stress level estimate (low, moderate, or high)
3. A brief supportive message (2-3 sentences)

Format your response as:
Emotion: [emotion]
Stress: [level]
Insight: [your supportive message]`;
      
      // For voice analysis, return structured data
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
        }),
      });

      if (!response.ok) {
        throw new Error('AI Gateway error');
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Parse the structured response
      const emotionMatch = content.match(/Emotion:\s*(\w+)/i);
      const stressMatch = content.match(/Stress:\s*(\w+)/i);
      const insightMatch = content.match(/Insight:\s*(.+)/is);
      
      return new Response(JSON.stringify({ 
        emotion: emotionMatch?.[1] || 'Neutral',
        stress: stressMatch?.[1]?.toLowerCase() || 'moderate',
        analysis: insightMatch?.[1]?.trim() || 'Thank you for checking in with your voice today.',
        transcript: 'Voice recording analyzed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (type === 'weekly-report') {
      systemPrompt = `You are a mental wellness analyst providing personalized weekly mood reports. Analyze the user's mood data and provide actionable insights.`;
      userPrompt = `Here's the user's mood data for analysis:

Mood entries: ${JSON.stringify(moodData)}

Statistics:
- Average Mood: ${stats?.averageMood?.toFixed(2)}/5
- Average Stress: ${stats?.averageStress?.toFixed(2)}/10
- Trend: ${stats?.trend}
- Total Check-ins: ${stats?.totalCheckins}

Please provide a personalized wellness report that includes:
1. Summary of their emotional patterns
2. Notable observations or patterns
3. Specific, actionable recommendations
4. Words of encouragement

Keep it concise but meaningful (3-4 paragraphs).`;
    } else if (type === 'thought-challenge') {
      systemPrompt = `You are a CBT (Cognitive Behavioral Therapy) assistant helping users reframe negative thoughts. Be supportive, practical, and help identify cognitive distortions.`;
      userPrompt = `Help analyze this thought challenge:
Situation: ${text}
Provide a brief, supportive reframe and identify any cognitive distortions if present.`;
    } else if (type === 'gratitude-reflection') {
      systemPrompt = `You are a mindfulness and gratitude coach. Help users reflect on their gratitude entries with warmth and insight.`;
      userPrompt = `The user shared these gratitude items: ${text}
Provide a brief, meaningful reflection on their gratitude practice (2-3 sentences).`;
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
