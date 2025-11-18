import React, { useMemo } from 'react';
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
  useTheme,
  InputLabel,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { User, Role } from '../../users/types/user';
import { getRoles } from '../../roles/roleQueries';
import { ROLES } from '../../../common/constants/roles';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { ROLE_QUERY_KEYS } from '../../roles/roleQueryKeys';

type TenantUserFormProps = {
  user?: User | null;
  onSubmit: (values: TenantUserFormValues) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
};

type TenantUserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  roleIds: string[];
};

const generateTenantUserSchema = () =>
  Yup.object().shape({
    firstName: Yup.string().max(100, 'Too Long!').optional(),
    lastName: Yup.string().max(100, 'Too Long!').optional(),
    email: Yup.string().email('Invalid email').max(255).required('Required'),
    roleIds: Yup.array()
      .of(Yup.string().required())
      .min(1, 'At least one role is required')
      .required('Role selection is required'),
  });

const TenantUserForm: React.FC<TenantUserFormProps> = ({
  user,
  onSubmit,
  onClose,
  isLoading,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const isEditing = !!user;

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: [ROLE_QUERY_KEYS.GET_ROLES],
    queryFn: getRoles,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const allRoles: Role[] = useMemo(() => rolesData?.data ?? [], [rolesData]);

  // Filter out Super Admin role for tenant admins
  const availableRoles: Role[] = allRoles.filter((role: Role) => {
    return role.name !== ROLES.SUPER_ADMIN;
  });

  const initialValues = useMemo(
    (): TenantUserFormValues => ({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      roleIds: user?.roles?.map((r) => r.id) ?? [],
    }),
    [user],
  );

  const handleSubmit = async (values: TenantUserFormValues): Promise<void> => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={generateTenantUserSchema()}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ errors, touched, values, setFieldValue, dirty }) => {
        return (
          <Form noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
              <Field
                as={TextField}
                name="email"
                label="Email"
                type="email"
                fullWidth
                required
                disabled={isEditing}
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
              />

              <Box
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  p: 2,
                  mt: 1,
                }}
              >
                <FormControl
                  component="fieldset"
                  variant="standard"
                  required
                  error={touched.roleIds && !!errors.roleIds}
                  disabled={rolesLoading || isLoading}
                  sx={{ width: '100%' }}
                >
                  <InputLabel
                    shrink
                    htmlFor="roles-group-label"
                    sx={{
                      position: 'relative',
                      transform: 'none',
                      mb: 1,
                      fontWeight: 'medium',
                    }}
                  >
                    Roles
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
                              disabled={rolesLoading || isLoading}
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
                          disabled={rolesLoading || isLoading}
                        />
                      ))
                    )}
                  </FormGroup>
                  {touched.roleIds && errors.roleIds && (
                    <FormHelperText error>{errors.roleIds}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                <Button onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || !dirty}
                >
                  {isLoading ? (
                    <CircularProgress size={24} />
                  ) : isEditing ? (
                    'Update User'
                  ) : (
                    'Invite User'
                  )}
                </Button>
              </Box>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

export default TenantUserForm;