import axios from 'axios';
import { SecretDto } from './types/secret-dto';

export const setSecret = (secret: SecretDto) => axios.post<void>('/secrets', secret);
