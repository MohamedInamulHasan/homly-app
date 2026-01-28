import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../utils/api';

export const newsKeys = {
    all: ['news'],
    lists: () => [...newsKeys.all, 'list'],
};

export const useNews = () => {
    return useQuery({
        queryKey: newsKeys.lists(),
        queryFn: async () => {
            const response = await apiService.getNews();
            return response.data;
        },
        staleTime: 10 * 60 * 1000,
    });
};

export const useCreateNews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => apiService.createNews(data),
        onSuccess: () => {
            queryClient.invalidateQueries(newsKeys.lists());
        }
    });
};

export const useUpdateNews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => apiService.updateNews(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(newsKeys.lists());
        }
    });
};

export const useDeleteNews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiService.deleteNews(id),
        onSuccess: () => {
            queryClient.invalidateQueries(newsKeys.lists());
        }
    });
};
