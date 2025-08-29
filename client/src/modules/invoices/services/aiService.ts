import axios from 'axios';
import { AskAboutDataDto, AskAboutDataResponseDto } from '../types/invoice';

export const aiService = {
  /**
   * Ask the AI about data
   * @param data - Query data
   * @returns Promise<AskAboutDataResponseDto>
   */
  askAboutData: async (data: AskAboutDataDto): Promise<AskAboutDataResponseDto> => {
    const response = await axios.post<AskAboutDataResponseDto>('/ai/ask-about-data', data);
    return response.data;
  },
};
