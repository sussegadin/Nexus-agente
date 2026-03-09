// ─────────────────────────────────────────
//  NEXUS API Utility
//  Anthropic · OpenAI Whisper · Runway · Kling
// ─────────────────────────────────────────

export const AI_MODELS = [
  { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Recomendado)', provider: 'anthropic' },
  { id: 'claude-opus-4-20250514',   label: 'Claude Opus 4 (Avançado)',       provider: 'anthropic' },
  { id: 'claude-haiku-4-5-20251001',label: 'Claude Haiku (Rápido)',          provider: 'anthropic' },
];

export const VIDEO_MODELS = [
  { id: 'runway_gen3', label: 'Runway Gen-3 Alpha', provider: 'runway' },
  { id: 'kling_v2',   label: 'Kling AI v2',         provider: 'kling' },
];

// ── Claude (Anthropic) ──────────────────────────────────────────────────────
export async function callClaude({ apiKey, model, system, messages, maxTokens = 600 }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

// ── OpenAI Whisper (STT) ────────────────────────────────────────────────────
export async function transcribeAudio({ apiKey, audioUri, lang = 'pt' }) {
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'audio.m4a',
  });
  formData.append('model', 'whisper-1');
  formData.append('language', lang.split('-')[0]);

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`Whisper HTTP ${res.status}`);
  const data = await res.json();
  return data.text || '';
}

// ── Build NEXUS system prompt ───────────────────────────────────────────────
export function buildSystemPrompt({ userName, userGoal, lang, tasks, stats }) {
  const langName = lang === 'pt-BR' ? 'português brasileiro' : lang === 'es' ? 'espanhol' : 'inglês';
  const allTasks = [
    ...(tasks?.manha || []),
    ...(tasks?.tarde || []),
    ...(tasks?.noite || []),
  ].map(t => `${t.title}${t.done ? ' ✅' : ''}`);

  return `Você é o NEXUS, agente pessoal de IA de ${userName}.
Objetivo principal do usuário: ${userGoal}.
Idioma de resposta: ${langName}. SEMPRE responda neste idioma.
Tarefas de hoje: ${allTasks.length > 0 ? allTasks.join(', ') : 'nenhuma ainda'}.
Conversas totais: ${stats?.msgs || 0}. Tarefas feitas: ${stats?.tasksDone || 0}.
Missão: Gerir cotidiano, redes sociais, criação de conteúdo e desenvolvimento pessoal.
Estilo: Direto, prático, motivador. Use emojis com moderação. Respostas concisas (máx 3 parágrafos).
Quando relevante, sugira ações concretas e imediatas.`;
}

// ── Generate social content ideas ──────────────────────────────────────────
export async function generateSocialIdeas({ apiKey, model, userName, userGoal, lang }) {
  const prompt = `Gere 4 ideias de conteúdo para redes sociais para: objetivo="${userGoal}".
Responda APENAS com JSON array, sem markdown:
[{"platform":"Instagram","tag":"Tipo","text":"Ideia concisa em 1-2 frases"},...]
Inclua Instagram, TikTok, YouTube e X/Twitter. Seja criativo e específico.`;

  const text = await callClaude({
    apiKey, model,
    system: `Você é especialista em marketing digital. Responda sempre em JSON puro, sem explicações.`,
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 800,
  });

  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// ── Generate daily routine ──────────────────────────────────────────────────
export async function generateRoutine({ apiKey, model, userGoal, lang }) {
  const prompt = `Crie rotina diária para objetivo: "${userGoal}".
Responda APENAS com JSON, sem markdown:
{"manha":[{"title":"...","time":"HH:MM"}],"tarde":[...],"noite":[...]}
3 tarefas por período. Seja específico e prático.`;

  const text = await callClaude({
    apiKey, model,
    system: `Responda sempre em JSON puro, sem explicações.`,
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 600,
  });

  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// ── Refine content idea ─────────────────────────────────────────────────────
export async function refineIdea({ apiKey, model, idea, lang }) {
  const prompt = `Melhore esta ideia de conteúdo: "${idea}". 
Seja mais criativo, específico e com call-to-action. Máximo 2 frases.`;

  return callClaude({
    apiKey, model,
    system: `Especialista em conteúdo digital. Respostas diretas e criativas.`,
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 200,
  });
}
