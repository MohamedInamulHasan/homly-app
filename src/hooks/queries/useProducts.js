import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../utils/api';

// Keys for cache invalidation
export const productKeys = {
    all: ['products'],
    lists: () => [...productKeys.all, 'list'],
    list: (filters) => [...productKeys.lists(), { ...filters }],
    details: () => [...productKeys.all, 'detail'],
    detail: (id) => [...productKeys.details(), id]
};

// 1. Fetch Request hooks
// Stable default params to prevent infinite query loops
const DEFAULT_PARAMS = { limit: 1000, page: 1 };

export const useProducts = (params = DEFAULT_PARAMS) => {
    return useQuery({
        queryKey: productKeys.list(params),
        queryFn: async () => {
            const response = await apiService.getProducts(params);
            // Handle both { data: [...] } and direct [...] responses
            return response?.data || (Array.isArray(response) ? response : []);
        },
        staleTime: 30 * 1000, // 30 seconds (reduced from 5 mins to ensure fresh data)
        keepPreviousData: true,
        retry: false, // Stop infinite retries on error
        onError: (err) => console.error("❌ useProducts Fetch Error:", err)
    });
};

export const useProduct = (id) => {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: async () => {
            const response = await apiService.getProduct(id);
            return response.data;
        },
        enabled: !!id // Only run if ID is provided
    });
};

// 2. Mutation hooks
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newProduct) => apiService.createProduct(newProduct),
        onSuccess: () => {
            queryClient.invalidateQueries(productKeys.lists()); // Refresh lists
        }
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiService.updateProduct(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(productKeys.lists());
            queryClient.invalidateQueries(productKeys.detail(variables.id));
        }
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => apiService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries(productKeys.lists());
        }
    });
};
