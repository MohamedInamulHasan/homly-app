import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../utils/api';

export const adKeys = {
    all: ['ads'],
    lists: () => [...adKeys.all, 'list'],
    details: () => [...adKeys.all, 'detail'],
    detail: (id) => [...adKeys.details(), id]
};

export const useAds = () => {
    return useQuery({
        queryKey: adKeys.lists(),
        queryFn: async () => {
            const response = await apiService.getAds();
            return response.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes (ads change infrequently)
    });
};

export const useCreateAd = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newAd) => apiService.createAd(newAd),
        onSuccess: () => {
            queryClient.invalidateQueries(adKeys.lists());
        }
    });
};

export const useDeleteAd = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => apiService.deleteAd(id),
        onSuccess: () => {
            queryClient.invalidateQueries(adKeys.lists());
        }
    });
};
