import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../utils/api';

export const serviceKeys = {
    all: ['services'],
    lists: () => [...serviceKeys.all, 'list'],
};

export const useServices = () => {
    return useQuery({
        queryKey: serviceKeys.lists(),
        queryFn: async () => {
            const response = await apiService.services.getAll();
            return response.data;
        },
        staleTime: 30 * 60 * 1000, // Services rarely change
    });
};

export const useCreateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => apiService.services.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(serviceKeys.lists());
        }
    });
};

export const useDeleteService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiService.services.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(serviceKeys.lists());
        }
    });
};

export const useUpdateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => apiService.services.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(serviceKeys.lists());
        }
    });
};
