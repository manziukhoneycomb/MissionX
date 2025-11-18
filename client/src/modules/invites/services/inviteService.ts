import axios from 'axios';
import { InviteUserDto, InviteResponseDto } from '../types/invite';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class InviteService {
  private static getHeaders() {
    // This would typically get the JWT token from your auth system
    // Implementation depends on how authentication is handled in the client
    const token = localStorage.getItem('clerk-db-jwt'); // Adjust based on your auth implementation
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async inviteUserToTenant(tenantId: string, inviteData: InviteUserDto): Promise<InviteResponseDto> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/users/tenants/${tenantId}/invite`,
        inviteData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to invite user to tenant:', error);
      throw new Error('Failed to send invitation');
    }
  }

  static async getTenantInvitations(tenantId: string): Promise<InviteResponseDto[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/users/tenants/${tenantId}/invitations`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenant invitations:', error);
      throw new Error('Failed to fetch invitations');
    }
  }

  static async revokeInvitation(tenantId: string, invitationId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/users/tenants/${tenantId}/invitations/${invitationId}`,
        { headers: this.getHeaders() }
      );
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
      throw new Error('Failed to revoke invitation');
    }
  }
}