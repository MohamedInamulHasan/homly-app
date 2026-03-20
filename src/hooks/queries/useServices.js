import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../utils/api';

export const serviceKeys = {
    all: ['services'],
    lists: () => [...serviceKeys.all, 'list'],
    details: () => [...serviceKeys.all, 'detail'],
    detail: (id) => [...serviceKeys.details(), id],
    items: (serviceId) => [...serviceKeys.detail(serviceId), 'items']
};

// --- Services Hooks ---

export const useServices = () => {
    return useQuery({
        queryKey: serviceKeys.lists(),
        queryFn: async () => {
            const response = await apiService.services.getAll();
            return response; // Assuming response is the data array
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
        gcTime: 15 * 60 * 1000,     // 15 minutes - keep in cache longer
        refetchInterval: 5000,
    });
};

export const useService = (id) => {
    return useQuery({
        queryKey: serviceKeys.detail(id),
        queryFn: async () => {
            const response = await apiService.services.getOne(id);
            return response;
        },
        enabled: !!id,
        refetchInterval: 5000,
    });
};

export const useCreateService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newService) => apiService.services.create(newService),
        onSuccess: () => {
            queryClient.invalidateQueries(serviceKeys.lists());
        }
    });
};

export const useUpdateService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiService.services.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(serviceKeys.lists());
            queryClient.invalidateQueries(serviceKeys.detail(variables.id));
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

export const useUpdateServiceOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderedIds) => apiService.services.sort(orderedIds),
        onSuccess: () => {
            queryClient.invalidateQueries(serviceKeys.lists());
        }
    });
};

// --- Service Items Hooks ---

export const useServiceItems = (serviceId) => {
    return useQuery({
        queryKey: serviceKeys.items(serviceId),
        queryFn: async () => {
            const response = await apiService.serviceItems.getAll(serviceId);
            return response;
        },
        enabled: !!serviceId,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000,     // 15 minutes
        refetchInterval: 5000,
    });
};

export const useCreateServiceItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ serviceId, data }) => apiService.serviceItems.create(serviceId, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(serviceKeys.items(variables.serviceId));
        }
    });
};

export const useUpdateServiceItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ itemId, data }) => apiService.serviceItems.update(itemId, data),
        onSuccess: (data, variables) => {
            // We need to invalidate the items list for the service.
            // Since we might not know the serviceId easily from just the itemId response here (unless we return it),
            // invalidating all services' details might be overkill but safe, 
            // OR we can rely on the parent component triggering a refetch if it knows the serviceId.
            // Ideally, the update response should contain serviceId.
            // If we strictly follow the key structure, we might need to invalidate specific service items.
            // For now, let's invalidate all details to be safe or just refetch everything if we can't pinpoint.
            // Better: Invalidate all 'services' queries to be safe.
            queryClient.invalidateQueries(serviceKeys.all);
        }
    });
};

export const useDeleteServiceItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId) => apiService.serviceItems.delete(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries(serviceKeys.all);
        }
    });
};
export const useUpdateServiceItemOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ serviceId, orderedIds }) => apiService.serviceItems.sort(serviceId, orderedIds),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(serviceKeys.items(variables.serviceId));
        }
    });
};
