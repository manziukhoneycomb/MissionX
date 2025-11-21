import React from 'react';
import { Chip } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Role } from '../../../modules/users/types/user';
import { ROLES } from '../../../common/constants/roles';

interface RoleChipProps {
  role: Role;
  onDelete?: () => void;
}

const RoleChip: React.FC<RoleChipProps> = ({ role, onDelete }) => {
  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case ROLES.SUPER_ADMIN:
        return <SupervisorAccountIcon />;
      case ROLES.ADMIN:
        return <AdminPanelSettingsIcon />;
      case ROLES.USER:
        return <PersonIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case ROLES.SUPER_ADMIN:
        return 'error' as const;
      case ROLES.ADMIN:
        return 'warning' as const;
      case ROLES.USER:
        return 'primary' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <Chip
      icon={getRoleIcon(role.name)}
      label={role.name}
      color={getRoleColor(role.name)}
      size="small"
      onDelete={onDelete}
      sx={{
        '& .MuiChip-icon': {
          fontSize: 16,
        },
      }}
    />
  );
};

export default RoleChip;