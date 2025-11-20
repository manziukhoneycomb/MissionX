import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getRoles } from '../../roles/roleQueries';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { ROLE_QUERY_KEYS } from '../../roles/roleQueryKeys';
import { ROLES } from '../../../common/constants/roles';
import { RoleValue } from '../../../common/constants/roles';
import { Role } from '../../users/types/user';

interface MemberRoleSelectProps {
  value: RoleValue;
  onChange: (role: RoleValue) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  size?: 'small' | 'medium';
}

const MemberRoleSelect: React.FC<MemberRoleSelectProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  label = 'Role',
  size = 'medium',
}) => {
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: [ROLE_QUERY_KEYS.GET_ROLES],
    queryFn: getRoles,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const allRoles: Role[] = rolesData?.data ?? [];
  const availableRoles = allRoles.filter((role) => role.name !== ROLES.SUPER_ADMIN);

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value as RoleValue);
  };

  return (
    <FormControl size={size} disabled={disabled || rolesLoading} error={error} sx={{ minWidth: 120 }}>
      <InputLabel id={`role-select-label-${label}`}>{label}</InputLabel>
      <Select
        labelId={`role-select-label-${label}`}
        value={value}
        onChange={handleChange}
        label={label}>
        {rolesLoading ? (
          <MenuItem value="" disabled>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            Loading...
          </MenuItem>
        ) : (
          availableRoles.map((role) => (
            <MenuItem key={role.id} value={role.name}>
              {role.name}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

export default MemberRoleSelect;