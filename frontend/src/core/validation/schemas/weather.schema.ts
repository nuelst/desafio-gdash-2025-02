import { z } from 'zod';

export const weatherLogSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  timestamp: z.string(),
  location: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  temperature: z.number(),
  humidity: z.number(),
  windSpeed: z.number(),
  condition: z.string(),
  weatherCode: z.number(),
  precipitationProbability: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Novo formato com IA (gemini-2.5-flash)
export const insightsSchema = z.object({
  insights: z.string(),
  generatedBy: z.enum(['ai', 'rules']),
  dataPoints: z.number(),
  location: z.string().optional(),
}).or(
  // Formato antigo (fallback/regras) - mantido para compatibilidade
  z.object({
    summary: z.string(),
    averages: z.object({
      temperature: z.number(),
      humidity: z.number(),
      windSpeed: z.number(),
    }),
    trend: z.object({
      temperature: z.string(),
      value: z.number(),
    }),
    comfortScore: z.number(),
    condition: z.string(),
    alerts: z.array(z.string()),
    dataPoints: z.number(),
    latestUpdate: z.string(),
  })
);

export type WeatherLog = z.infer<typeof weatherLogSchema>;
export type Insights = z.infer<typeof insightsSchema>;

