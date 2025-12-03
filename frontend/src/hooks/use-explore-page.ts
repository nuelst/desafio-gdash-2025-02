import { useState } from 'react';
import { useCityDetail, useExploreCities } from './use-explore';

export const useExplorePage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const limit = 10;

  const { data, isLoading, error } = useExploreCities({
    page,
    limit,
    search: search || undefined,
  });

  const { data: cityDetail, isLoading: isLoadingDetail } = useCityDetail(selectedCityId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const handleCityClick = (geonameId: number) => {
    setSelectedCityId(geonameId);
  };

  const handleCloseDetail = () => {
    setSelectedCityId(null);
  };

  const handlePreviousPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setPage((p) => p + 1);
  };

  return {
    page,
    search,
    setSearch,
    selectedCityId,
    limit,
    data,
    isLoading,
    error,
    cityDetail,
    isLoadingDetail,
    handleSearch,
    handleClearSearch,
    handleCityClick,
    handleCloseDetail,
    handlePreviousPage,
    handleNextPage,
  };
};

