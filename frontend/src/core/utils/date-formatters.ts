import { format } from 'date-fns';

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy');
};

export const formatTime = (date: string | Date): string => {
  return format(new Date(date), 'HH:mm');
};

export const formatTimeWithSeconds = (date: string | Date): string => {
  return format(new Date(date), 'HH:mm:ss');
};


export const formatTimeSmart = (date: string | Date, allDates: (string | Date)[]): string => {
  const dateObj = new Date(date);

  if (allDates.length <= 1) {
    return format(dateObj, 'HH:mm');
  }

  const hasCloseDates = allDates.some((d) => {
    const otherDate = new Date(d);
    const diff = Math.abs(dateObj.getTime() - otherDate.getTime());
    return diff > 0 && diff < 60000;
  });

  if (hasCloseDates) {
    return format(dateObj, 'HH:mm:ss');
  }

  return format(dateObj, 'HH:mm');
};

const WEATHER_CONDITION_TRANSLATIONS: Record<string, string> = {
  clear_sky: 'Céu Limpo',
  mainly_clear: 'Predominantemente Limpo',
  partly_cloudy: 'Parcialmente Nublado',
  overcast: 'Nublado',

  fog: 'Névoa',
  depositing_rime_fog: 'Névoa com Geada',

  light_drizzle: 'Garoa Leve',
  moderate_drizzle: 'Garoa Moderada',
  dense_drizzle: 'Garoa Densa',
  light_freezing_drizzle: 'Garoa Congelante Leve',
  dense_freezing_drizzle: 'Garoa Congelante Densa',

  slight_rain: 'Chuva Leve',
  moderate_rain: 'Chuva Moderada',
  heavy_rain: 'Chuva Forte',
  light_freezing_rain: 'Chuva Congelante Leve',
  heavy_freezing_rain: 'Chuva Congelante Forte',

  slight_snow: 'Neve Leve',
  moderate_snow: 'Neve Moderada',
  heavy_snow: 'Neve Forte',
  snow_grains: 'Grãos de Neve',

  slight_rain_showers: 'Chuvisco Leve',
  moderate_rain_showers: 'Chuvisco Moderado',
  violent_rain_showers: 'Chuvisco Intenso',

  slight_snow_showers: 'Aguaceiros de Neve Leves',
  heavy_snow_showers: 'Aguaceiros de Neve Fortes',

  thunderstorm: 'Tempestade',
  thunderstorm_with_slight_hail: 'Tempestade com Granizo Leve',
  thunderstorm_with_heavy_hail: 'Tempestade com Granizo Forte',

  unknown: 'Desconhecido',
};

export const translateWeatherCondition = (condition: string): string => {
  const normalized = condition.toLowerCase().trim();

  if (WEATHER_CONDITION_TRANSLATIONS[normalized]) {
    return WEATHER_CONDITION_TRANSLATIONS[normalized];
  }
  return condition.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
};

export const formatCondition = (condition: string): string => {
  return translateWeatherCondition(condition);
};

