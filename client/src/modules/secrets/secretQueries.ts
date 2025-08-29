import axios from 'axios';
import { SecretDto } from './types/secret-dto';

export const getSecrets = () => axios.get<SecretDto[]>('/secrets');
