import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../utils/api';

export const orderKeys = {
    all: ['orders'],
    lists: () => [...orderKeys.all, 'list'],
    details: () => [...orderKeys.all, 'detail'],
    detail: (id) => [...orderKeys.details(), id]
};

export const useOrders = () => {
    return useQuery({
        queryKey: orderKeys.lists(),
        queryFn: async () => {
            const response = await apiService.getOrders();
            return response.data;
        },
        staleTime: 5 * 1000, // Reduced stale time
        refetchInterval: 1000, // Auto-refresh every 1 second for "instant" updates
    });
};

export const useOrder = (id) => {
    return useQuery({
        queryKey: orderKeys.detail(id),
        queryFn: async () => {
            const response = await apiService.getOrder(id);
            return response.data;
        },
        enabled: !!id,
        refetchInterval: 5000, // Auto-refresh details every 5 seconds
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newOrder) => apiService.createOrder(newOrder),
        onSuccess: () => {
            queryClient.invalidateQueries(orderKeys.lists());
        }
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => apiService.updateOrderStatus(id, status),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(orderKeys.lists());
            queryClient.invalidateQueries(orderKeys.detail(variables.id));
        }
    });
};

export const useDeleteOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => apiService.deleteOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries(orderKeys.lists());
        }
    });
};
