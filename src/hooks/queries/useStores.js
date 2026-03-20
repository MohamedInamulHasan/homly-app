import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../utils/api';

export const storeKeys = {
    all: ['stores'],
    lists: () => [...storeKeys.all, 'list'],
    details: () => [...storeKeys.all, 'detail'],
    detail: (id) => [...storeKeys.details(), id]
};

export const useStores = () => {
    return useQuery({
        queryKey: storeKeys.lists(),
        queryFn: async () => {
            const response = await apiService.getStores();
            return response.data;
        },
        staleTime: 60 * 1000, // 1 minute
        refetchInterval: 2000,
    });
};

export const useStore = (id) => {
    return useQuery({
        queryKey: storeKeys.detail(id),
        queryFn: async () => {
            const response = await apiService.getStore(id);
            return response.data;
        },
        enabled: !!id,
        refetchInterval: 5000,
    });
};

export const useCreateStore = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newStore) => apiService.createStore(newStore),
        onSuccess: () => {
            queryClient.invalidateQueries(storeKeys.lists());
        }
    });
};

export const useUpdateStore = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiService.updateStore(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(storeKeys.lists());
            queryClient.invalidateQueries(storeKeys.detail(variables.id));
        }
    });
};

export const useDeleteStore = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => apiService.deleteStore(id),
        onSuccess: () => {
            queryClient.invalidateQueries(storeKeys.lists());
        }
    });
};

export const useUpdateStoreOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderedIds) => apiService.updateStoresOrder(orderedIds),
        onSuccess: () => {
            queryClient.invalidateQueries(storeKeys.lists());
        }
    });
};
