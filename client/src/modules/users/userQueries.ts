import axios from 'axios';
import { User } from './types/user';

export const getUsers = () => axios.get<User[]>('/users');
export const getUserById = (id: string) => axios.get<User>(`/users/${id}`);
