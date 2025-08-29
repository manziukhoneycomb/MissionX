import React, { useEffect, useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  SelectChangeEvent,
  FormGroup,
  FormHelperText,
  useTheme,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Role } from '../types/user.ts';
import {
  createUser,
  createUserBySuperAdmin,
  updateUser,
  CreateUserInput,
  CreateUserSuperAdminInput,
  UpdateUserInput,
  UpdateUserPayload,
} from '../userMutations.ts';

import { getTenants } from '../../tenants/tenantQueries.ts';
import { getRoles } from '../../roles/roleQueries.ts';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes.ts';
import { USER_QUERY_KEYS } from '../userQueryKeys.ts';
import { TENANT_QUERY_KEYS } from '../../tenants/tenantQueryKeys.ts';
import { ROLE_QUERY_KEYS } from '../../roles/roleQueryKeys.ts';

type UserFormProps = {
  user?: User | null;
  onClose: () => void;
};

type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  tenantId?: string;
  roleIds: string[];
};

const generateUserSchema = (allRoles: Role[]) =>
  Yup.object().shape({
    firstName: Yup.string().max(100, 'Too Long!').optional(),
    lastName: Yup.string().max(100, 'Too Long!').optional(),
    email: Yup.string().email('Invalid email').max(255).required('Required'),
    tenantId: Yup.string().when(['roleIds', '$isSuperAdmin'], {
      is: (roleIds: string[], isContextSuperAdmin: boolean) => {
        const superAdminRole = allRoles?.find((r) => r.name === ROLES.SUPER_ADMIN);
        const isSuperAdminRoleSelected = roleIds.includes(superAdminRole?.id ?? '');

        return isContextSuperAdmin && !isSuperAdminRoleSelected;
      },
      then: (schema) => schema.required('Tenant is required unless Super Admin role is selected'),
      otherwise: (schema) => schema.optional(),
    }),
    roleIds: Yup.array()
      .of(Yup.string().required())
      .min(1, 'At least one role is required')
      .required('Role selection is required'),
  });

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const userRolesAuth = useUserRoles();
  const isSuperAdmin = userRolesAuth.includes(ROLES.SUPER_ADMIN);

  const isEditing = !!user;

  const {
    data: tenantsData,
    isLoading: tenantsLoading,
    error: tenantsError,
  } = useQuery({
    queryKey: [TENANT_QUERY_KEYS.GET_TENANTS],
    queryFn: getTenants,
    enabled: isSuperAdmin,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: [ROLE_QUERY_KEYS.GET_ROLES],
    queryFn: getRoles,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const tenants = tenantsData?.data ?? [];
  const allRoles: Role[] = useMemo(() => rolesData?.data ?? [], [rolesData]);

  const superAdminRole = useMemo(
    () => allRoles.find((r) => r.name === ROLES.SUPER_ADMIN),
    [allRoles],
  );

  const { mutateAsync: createUserMutate, isPending: isCreating } = useMutation({
    mutationFn: (data: { payload: CreateUserInput; isSuper: boolean }) =>
      data.isSuper
        ? createUserBySuperAdmin(data.payload as CreateUserSuperAdminInput)
        : createUser(data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.GET_USERS] });
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update user', {
        variant: 'error',
      });
    },
  });

  const { mutateAsync: updateUserMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.GET_USERS] });
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update user', {
        variant: 'error',
      });
    },
  });

  useEffect(() => {
    if (tenantsError) {
      enqueueSnackbar(tenantsError.message || 'An error occurred while fetching data', {
        variant: 'error',
      });
    }
  }, [tenantsError, enqueueSnackbar]);

  const formIsSubmittingOverall = isCreating || isUpdating;

  const initialValues = useMemo(
    (): UserFormValues => ({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      tenantId: user?.tenant?.id ?? undefined,
      roleIds: user?.roles?.map((r) => r.id) ?? [],
    }),
    [user],
  );

  const handleSubmit = async (values: UserFormValues): Promise<void> => {
    if (isEditing && user) {
      const updateData: UpdateUserInput = {
        email: values.email,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        roleIds: values.roleIds,
      };

      const updatePayload: UpdateUserPayload = { id: user.id, data: updateData };
      await updateUserMutate(updatePayload);
    } else {
      if (isSuperAdmin) {
        const superAdminRoleSelected = values.roleIds.includes(superAdminRole?.id ?? '');

        if (!superAdminRoleSelected && values.tenantId === undefined) {
          throw new Error('Tenant ID is required unless Super Admin role is selected.');
        }

        const createPayload: CreateUserSuperAdminInput = {
          email: values.email,
          firstName: values.firstName || undefined,
          lastName: values.lastName || undefined,
          roleIds: values.roleIds,
          tenantId: values.tenantId,
        };

        await createUserMutate({ payload: createPayload, isSuper: true });
      } else {
        const createPayload: CreateUserInput = {
          email: values.email,
          firstName: values.firstName || undefined,
          lastName: values.lastName || undefined,
          roleIds: values.roleIds,
        };

        await createUserMutate({ payload: createPayload, isSuper: false });
      }
    }
  };

  const availableRoles: Role[] = allRoles.filter((role: Role) => {
    if (isSuperAdmin) return true;

    return role.name !== ROLES.SUPER_ADMIN;
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={generateUserSchema(allRoles)}
      validationContext={{ isSuperAdmin }}
      onSubmit={handleSubmit}
      enableReinitialize>
      {({ errors, touched, values, setFieldValue, dirty }) => {
        const isSuperAdminSelected = values.roleIds.includes(superAdminRole?.id ?? '');
        const isOtherRoleSelected = values.roleIds.some((id) => id !== superAdminRole?.id);

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

              {isSuperAdmin && (
                <FormControl
                  fullWidth
                  required={isSuperAdmin && !values.roleIds.includes(superAdminRole?.id ?? '')}
                  disabled={
                    tenantsLoading ||
                    isEditing ||
                    formIsSubmittingOverall ||
                    values.roleIds.includes(superAdminRole?.id ?? '')
                  }
                  error={touched.tenantId && !!errors.tenantId}>
                  <InputLabel id="tenant-select-label">Tenant</InputLabel>
                  <Field
                    as={Select}
                    labelId="tenant-select-label"
                    name="tenantId"
                    label="Tenant"
                    value={values.tenantId ?? ''}
                    onChange={(e: SelectChangeEvent<string>) => {
                      setFieldValue('tenantId', e.target.value === '' ? undefined : e.target.value);
                    }}>
                    <MenuItem value="" disabled>
                      <em>{tenantsLoading ? 'Loading tenants...' : 'Select Tenant'}</em>
                    </MenuItem>
                    {tenants.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Field>
                  {touched.tenantId && errors.tenantId && (
                    <FormHelperText>{errors.tenantId}</FormHelperText>
                  )}
                </FormControl>
              )}

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
                  disabled={rolesLoading || formIsSubmittingOverall}
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
                    Roles
                  </InputLabel>
                  <FormGroup id="roles-group-label" sx={{ pl: 1 }}>
                    {rolesLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      availableRoles.map((role) => {
                        const isThisSuperAdmin = role.id === superAdminRole?.id;

                        const isDisabled =
                          (isThisSuperAdmin && isOtherRoleSelected) ||
                          (!isThisSuperAdmin && isSuperAdminSelected);

                        return (
                          <Field
                            as={FormControlLabel}
                            key={role.id}
                            name="roleIds"
                            value={role.id}
                            control={
                              <Checkbox
                                checked={values.roleIds.includes(role.id)}
                                disabled={isDisabled || rolesLoading || formIsSubmittingOverall}
                              />
                            }
                            label={role.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const roleId = e.target.value;
                              const isChecked = e.target.checked;
                              let newRoleIds: string[] = [];

                              if (roleId === superAdminRole?.id) {
                                newRoleIds = isChecked ? [roleId] : [];
                                if (isChecked) {
                                  setFieldValue('tenantId', undefined);
                                }
                              } else {
                                if (isChecked) {
                                  newRoleIds = [
                                    ...values.roleIds.filter((id) => id !== superAdminRole?.id),
                                    roleId,
                                  ];
                                } else {
                                  newRoleIds = values.roleIds.filter((id) => id !== roleId);
                                }
                              }
                              setFieldValue('roleIds', newRoleIds);
                            }}
                            disabled={isDisabled || rolesLoading || formIsSubmittingOverall}
                          />
                        );
                      })
                    )}
                  </FormGroup>
                  {touched.roleIds && errors.roleIds && (
                    <FormHelperText error>{errors.roleIds}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                <Button onClick={onClose} disabled={formIsSubmittingOverall}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formIsSubmittingOverall || !dirty}>
                  {formIsSubmittingOverall ? (
                    <CircularProgress size={24} />
                  ) : isEditing ? (
                    'Update User'
                  ) : (
                    'Create User'
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

export default UserForm;
