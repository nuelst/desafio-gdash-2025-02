import { useQuery } from '@tanstack/react-query';
import { exploreApi, type ExploreCitiesParams } from '../core/api/explore';

export function useExploreCities(params: ExploreCitiesParams = {}) {
  return useQuery({
    queryKey: ['explore', 'cities', params],
    queryFn: () => exploreApi.getCities(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2, // Tentar novamente em caso de erro
    retryDelay: 1000, // Esperar 1s antes de tentar novamente
  });
}

export function useCityDetail(geonameId: number | null) {
  return useQuery({
    queryKey: ['explore', 'city', geonameId],
    queryFn: () => (geonameId ? exploreApi.getCityDetail(geonameId) : null),
    enabled: !!geonameId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

