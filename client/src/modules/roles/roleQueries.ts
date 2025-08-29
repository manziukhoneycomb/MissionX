import axios from 'axios';
import { Role } from '../users/types/user';

export const getRoles = () => axios.get<Role[]>('/roles');
