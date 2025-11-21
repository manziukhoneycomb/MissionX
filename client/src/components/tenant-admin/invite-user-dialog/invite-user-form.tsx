import React from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useUserInvitation } from '../../../hooks/use-user-invitation';
import { ROLES } from '../../../common/constants/roles';

interface InviteUserFormProps {
  onClose: () => void;
  onUserInvited: () => void;
}

interface InviteUserFormValues {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  roles: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one role must be selected')
    .required('Roles are required'),
});

const InviteUserForm: React.FC<InviteUserFormProps> = ({
  onClose,
  onUserInvited,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { inviteUser } = useUserInvitation();

  const { mutate: inviteUserMutate, isPending } = useMutation({
    mutationFn: inviteUser.mutateAsync,
    onSuccess: () => {
      enqueueSnackbar('User invitation sent successfully', { variant: 'success' });
      onUserInvited();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to invite user', { variant: 'error' });
    },
  });

  const formik = useFormik<InviteUserFormValues>({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      roles: [],
    },
    validationSchema,
    onSubmit: (values) => {
      inviteUserMutate({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        roleNames: values.roles,
      });
    },
  });

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    formik.setFieldValue('roles', typeof value === 'string' ? value.split(',') : value);
  };

  const availableRoles = [ROLES.ADMIN, ROLES.USER];

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      <TextField
        fullWidth
        id="email"
        name="email"
        label="Email Address"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        margin="normal"
        required
      />
      
      <TextField
        fullWidth
        id="firstName"
        name="firstName"
        label="First Name"
        value={formik.values.firstName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
        helperText={formik.touched.firstName && formik.errors.firstName}
        margin="normal"
        required
      />
      
      <TextField
        fullWidth
        id="lastName"
        name="lastName"
        label="Last Name"
        value={formik.values.lastName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
        helperText={formik.touched.lastName && formik.errors.lastName}
        margin="normal"
        required
      />

      <FormControl fullWidth margin="normal" error={formik.touched.roles && Boolean(formik.errors.roles)}>
        <InputLabel id="roles-label">Roles</InputLabel>
        <Select
          labelId="roles-label"
          id="roles"
          multiple
          value={formik.values.roles}
          onChange={handleRoleChange}
          input={<OutlinedInput id="select-multiple-chip" label="Roles" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}>
          {availableRoles.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </Select>
        {formik.touched.roles && formik.errors.roles && (
          <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
            {formik.errors.roles}
          </Box>
        )}
      </FormControl>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={20} /> : null}>
          {isPending ? 'Sending...' : 'Send Invitation'}
        </Button>
      </Box>
    </Box>
  );
};

export default InviteUserForm;