import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { User } from './types/user';
import { USER_QUERY_KEYS } from './userQueryKeys';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

export const getUsers = () => axios.get<User[]>('/users');
export const getUserById = (id: string) => axios.get<User>(`/users/${id}`);

export const useGetUsers = () => {
  return useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: async () => {
      const { data } = await getUsers();
      return data;
    },
    staleTime: CACHE_TIMES.DEFAULT,
  });
};
