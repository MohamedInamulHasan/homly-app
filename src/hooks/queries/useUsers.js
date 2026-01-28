import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../utils/api';

export const userKeys = {
    all: ['users'],
    lists: () => [...userKeys.all, 'list'],
    details: () => [...userKeys.all, 'detail'],
    profile: () => [...userKeys.all, 'profile']
};

export const useUsers = () => {
    return useQuery({
        queryKey: userKeys.lists(),
        queryFn: async () => {
            const response = await apiService.getAllUsers();
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useUserProfile = () => {
    return useQuery({
        queryKey: userKeys.profile(),
        queryFn: async () => {
            const response = await apiService.getProfile();
            return response.data;
        },
        staleTime: 30 * 60 * 1000, // Profile rarely changes
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => apiService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(userKeys.lists());
        }
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries(userKeys.lists());
        }
    });
};
