import axios from 'axios';
import { Tenant } from './types/tenant';

export const getTenants = async () => axios.get<Tenant[]>('/tenants');
