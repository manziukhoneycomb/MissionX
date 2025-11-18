import React from 'react';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  FormControl,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  FormGroup,
  FormHelperText,
  InputLabel,
  useTheme,
  Typography,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Role } from '../../users/types/user';
import { getRoles } from '../../roles/roleQueries';
import { inviteUserToTenant } from '../tenantAdminMutations';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { ROLE_QUERY_KEYS } from '../../roles/roleQueryKeys';
import { TENANT_ADMIN_QUERY_KEYS } from '../tenantAdminQueryKeys';

interface InviteUserFormProps {
  onClose: () => void;
}

interface InviteUserFormValues {
  email: string;
  firstName?: string;
  lastName?: string;
  roleIds: string[];
  sendWelcomeEmail: boolean;
}

const inviteUserSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  firstName: Yup.string().max(100, 'Too long').optional(),
  lastName: Yup.string().max(100, 'Too long').optional(),
  roleIds: Yup.array()
    .of(Yup.string().required())
    .min(1, 'At least one role is required')
    .required('Role selection is required'),
  sendWelcomeEmail: Yup.boolean(),
});

const InviteUserForm: React.FC<InviteUserFormProps> = ({ onClose }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const userRolesAuth = useUserRoles();
  const isAdmin = userRolesAuth.includes(ROLES.ADMIN);

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: [ROLE_QUERY_KEYS.GET_ROLES],
    queryFn: getRoles,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const allRoles: Role[] = rolesData?.data ?? [];

  const { mutateAsync: inviteUserMutate, isPending: isInviting } = useMutation({
    mutationFn: inviteUserToTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_TENANT_USERS] });
      enqueueSnackbar('User invitation sent successfully!', { variant: 'success' });
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to send invitation', {
        variant: 'error',
      });
    },
  });

  const initialValues: InviteUserFormValues = {
    email: '',
    firstName: '',
    lastName: '',
    roleIds: [],
    sendWelcomeEmail: true,
  };

  const handleSubmit = async (values: InviteUserFormValues): Promise<void> => {
    await inviteUserMutate({
      email: values.email,
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
      roleIds: values.roleIds,
      sendWelcomeEmail: values.sendWelcomeEmail,
    });
  };

  const availableRoles: Role[] = allRoles.filter((role: Role) => {
    if (isAdmin) {
      return role.name !== ROLES.SUPER_ADMIN;
    }
    return false;
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={inviteUserSchema}
      onSubmit={handleSubmit}>
      {({ errors, touched, values, setFieldValue }) => (
        <Form noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Send an invitation email to add a new user to your tenant
            </Typography>

            <Field
              as={TextField}
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              required
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              placeholder="user@example.com"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Field
                as={TextField}
                name="firstName"
                label="First Name (Optional)"
                fullWidth
                error={touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
              />
              <Field
                as={TextField}
                name="lastName"
                label="Last Name (Optional)"
                fullWidth
                error={touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
              />
            </Box>

            <Box
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 2,
                mt: 1,
              }}>
              <FormControl
                component="fieldset"
                variant="standard"
                required
                error={touched.roleIds && !!errors.roleIds}
                disabled={rolesLoading || isInviting}
                sx={{ width: '100%' }}>
                <InputLabel
                  shrink
                  htmlFor="roles-group-label"
                  sx={{
                    position: 'relative',
                    transform: 'none',
                    mb: 1,
                    fontWeight: 'medium',
                  }}>
                  Assign Roles
                </InputLabel>
                <FormGroup id="roles-group-label" sx={{ pl: 1 }}>
                  {rolesLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    availableRoles.map((role) => (
                      <Field
                        as={FormControlLabel}
                        key={role.id}
                        name="roleIds"
                        value={role.id}
                        control={
                          <Checkbox
                            checked={values.roleIds.includes(role.id)}
                            disabled={rolesLoading || isInviting}
                          />
                        }
                        label={role.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const roleId = e.target.value;
                          const isChecked = e.target.checked;
                          let newRoleIds: string[] = [];

                          if (isChecked) {
                            newRoleIds = [...values.roleIds, roleId];
                          } else {
                            newRoleIds = values.roleIds.filter((id) => id !== roleId);
                          }
                          setFieldValue('roleIds', newRoleIds);
                        }}
                      />
                    ))
                  )}
                </FormGroup>
                {touched.roleIds && errors.roleIds && (
                  <FormHelperText error>{errors.roleIds}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={values.sendWelcomeEmail}
                  onChange={(e) => setFieldValue('sendWelcomeEmail', e.target.checked)}
                  disabled={isInviting}
                />
              }
              label="Send welcome email with setup instructions"
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
              <Button onClick={onClose} disabled={isInviting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isInviting || values.roleIds.length === 0}>
                {isInviting ? (
                  <CircularProgress size={24} />
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default InviteUserForm;