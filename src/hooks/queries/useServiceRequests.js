import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../utils/api';

export const serviceRequestKeys = {
    all: ['serviceRequests'],
    lists: () => [...serviceRequestKeys.all, 'list'],
};

export const useServiceRequests = () => {
    return useQuery({
        queryKey: serviceRequestKeys.lists(),
        queryFn: async () => {
            const response = await apiService.serviceRequests.getAll();
            // API interceptor already returns response.data, so response IS the data
            return response;
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useUpdateServiceRequestStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => apiService.serviceRequests.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries(serviceRequestKeys.lists());
        }
    });
};

export const useDeleteServiceRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiService.serviceRequests.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(serviceRequestKeys.lists());
        }
    });
};
