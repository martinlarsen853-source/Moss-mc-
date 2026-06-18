import Anthropic from '@anthropic-ai/sdk';
import { COACH_BRAIN } from './coach-brain';

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export interface CoachContext {
  type: string;
  todayMetrics?: { hrv?: number; restingHr?: number; sleepMin?: number; bodyBattery?: number; stress?: number; steps?: number; };
  recentWorkouts?: Array<{ date: string; type: string; name: string; avgPace?: string; avgHr?: number; dragMedian?: string; aiAnalysis?: string; }>;
  trainingLoad?: { ctl?: number; atl?: number; tsb?: number };
  hrvTrend?: number[];
  currentWeek?: number;
  workout?: Record<string, unknown>;
  question?: string;
}

export async function askCoach(context: CoachContext): Promise<string> {
  const userMessage = buildUserMessage(context);
  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: COACH_BRAIN,
    messages: [{ role: 'user', content: userMessage }],
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

export async function analyzeFood(imageBase64: string, mimeType: string): Promise<{ description: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number; confidence: 'high' | 'medium' | 'low'; }> {
  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg', data: imageBase64 } },
        { type: 'text', text: `Analyser dette matbildet. Gi estimat på kalorier og makros.\nSvar KUN med JSON (ingen markdown, ingen forklaring):\n{"description":"kort norsk beskrivelse","kcal":0,"protein_g":0,"carbs_g":0,"fat_g":0,"confidence":"high|medium|low"}\nConfidence: high = tydelig mat med kjente mengder, medium = skjønn, low = usikker porsjonsstørrelse.` },
      ],
    }],
  });
  const block = response.content[0];
  if (block.type !== 'text') throw new Error('No text response');
  return JSON.parse(block.text.trim());
}

function buildUserMessage(ctx: CoachContext): string {
  const lines: string[] = [`TYPE: ${ctx.type}`];
  if (ctx.todayMetrics) {
    const m = ctx.todayMetrics;
    lines.push(`\nDAGENS DATA:`);
    if (m.hrv) lines.push(`HRV: ${m.hrv} ms`);
    if (m.restingHr) lines.push(`Hvilepuls: ${m.restingHr} bpm`);
    if (m.sleepMin) lines.push(`Søvn: ${Math.round(m.sleepMin / 60)}t ${m.sleepMin % 60}m`);
    if (m.bodyBattery) lines.push(`Body Battery: ${m.bodyBattery}%`);
    if (m.stress) lines.push(`Stress: ${m.stress}`);
  }
  if (ctx.trainingLoad) {
    const t = ctx.trainingLoad;
    lines.push(`\nTRENINGSBELASTNING: CTL(fitness)=${t.ctl} ATL(fatigue)=${t.atl} TSB(form)=${t.tsb}`);
  }
  if (ctx.hrvTrend?.length) lines.push(`HRV-trend siste ${ctx.hrvTrend.length} dager: ${ctx.hrvTrend.join(', ')}`);
  if (ctx.recentWorkouts?.length) {
    lines.push(`\nSISTE ØKTER:`);
    ctx.recentWorkouts.slice(0, 5).forEach((w) => {
      const pace = w.dragMedian ? ` | drag-median: ${w.dragMedian}` : w.avgPace ? ` | snittfart: ${w.avgPace}` : '';
      lines.push(`${w.date} – ${w.name}${pace}${w.avgHr ? ` | puls: ${w.avgHr}` : ''}`);
    });
  }
  if (ctx.currentWeek) lines.push(`\nUKE ${ctx.currentWeek} av 16 i planen`);
  if (ctx.workout) lines.push(`\nØKT-DETALJER: ${JSON.stringify(ctx.workout)}`);
  if (ctx.question) lines.push(`\nSPØRSMÅL: ${ctx.question}`);
  return lines.join('\n');
}
