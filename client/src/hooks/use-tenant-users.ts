import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { User } from '../modules/users/types/user';
import { CACHE_TIMES } from '../common/constants/cacheTimes';

const TENANT_USERS_QUERY_KEY = 'tenantUsers';

export const getTenantUsers = () => axios.get<User[]>('/tenant/users');

export const useTenantUsers = () => {
  return useQuery({
    queryKey: [TENANT_USERS_QUERY_KEY],
    queryFn: getTenantUsers,
    staleTime: CACHE_TIMES.DEFAULT,
    refetchOnWindowFocus: false,
  });
};