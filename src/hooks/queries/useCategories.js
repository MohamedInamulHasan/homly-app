import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../utils/api';

export const categoryKeys = {
    all: ['categories'],
    lists: () => [...categoryKeys.all, 'list'],
};

export const useCategories = () => {
    return useQuery({
        queryKey: categoryKeys.lists(),
        queryFn: async () => {
            const response = await apiService.categories.getAll();
            return response.data;
        },
        staleTime: 30 * 1000, // 30 seconds (reduced from 1 hour to ensure fresh data)
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newCategory) => apiService.categories.create(newCategory),
        onSuccess: () => {
            queryClient.invalidateQueries(categoryKeys.lists());
        }
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => apiService.categories.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(categoryKeys.lists());
        }
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiService.categories.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(categoryKeys.lists());
        }
    });
};
