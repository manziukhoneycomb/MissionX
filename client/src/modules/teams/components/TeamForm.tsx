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
  CircularProgress,
  SelectChangeEvent,
  FormHelperText,
  useTheme,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Team } from '../types/team';
import { useCreateTeam, useUpdateTeam } from '../teamMutations';
import { CreateTeamDto, UpdateTeamDto } from '../services/teamService';
import { getTenants } from '../../tenants/tenantQueries';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { TENANT_QUERY_KEYS } from '../../tenants/tenantQueryKeys';

type TeamFormProps = {
  team?: Team | null;
  onClose: () => void;
};

type TeamFormValues = {
  name: string;
  description: string;
  tenantId?: string;
};

const teamSchema = Yup.object().shape({
  name: Yup.string()
    .max(100, 'Too Long!')
    .required('Team name is required'),
  description: Yup.string()
    .max(500, 'Too Long!')
    .required('Description is required'),
  tenantId: Yup.string().when('$isSuperAdmin', {
    is: true,
    then: (schema) => schema.required('Tenant is required for Super Admin'),
    otherwise: (schema) => schema.optional(),
  }),
});

const TeamForm: React.FC<TeamFormProps> = ({ team, onClose }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const userRolesAuth = useUserRoles();
  const isSuperAdmin = userRolesAuth.includes(ROLES.SUPER_ADMIN);

  const isEditing = !!team;

  const {
    data: tenantsData,
    isLoading: tenantsLoading,
    error: tenantsError,
  } = useQuery({
    queryKey: [TENANT_QUERY_KEYS.GET_TENANTS],
    queryFn: getTenants,
    enabled: isSuperAdmin && !isEditing,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const tenants = tenantsData?.data ?? [];

  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();

  useEffect(() => {
    if (tenantsError) {
      enqueueSnackbar(tenantsError.message || 'An error occurred while fetching tenants', {
        variant: 'error',
      });
    }
  }, [tenantsError, enqueueSnackbar]);

  const initialValues = useMemo(
    (): TeamFormValues => ({
      name: team?.name ?? '',
      description: team?.description ?? '',
      tenantId: team?.tenant?.id ?? undefined,
    }),
    [team],
  );

  const handleSubmit = async (values: TeamFormValues): Promise<void> => {
    try {
      if (isEditing && team) {
        const updateData: UpdateTeamDto = {
          name: values.name,
          description: values.description,
        };

        await updateTeamMutation.mutateAsync({ id: team.id, data: updateData });
        enqueueSnackbar('Team updated successfully', { variant: 'success' });
      } else {
        const createData: CreateTeamDto = {
          name: values.name,
          description: values.description,
          tenantId: isSuperAdmin ? values.tenantId : undefined,
        };

        await createTeamMutation.mutateAsync(createData);
        enqueueSnackbar('Team created successfully', { variant: 'success' });
      }
      onClose();
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to save team',
        { variant: 'error' }
      );
    }
  };

  const formIsSubmitting = createTeamMutation.isPending || updateTeamMutation.isPending;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={teamSchema}
      validationContext={{ isSuperAdmin: isSuperAdmin && !isEditing }}
      onSubmit={handleSubmit}
      enableReinitialize>
      {({ errors, touched, values, setFieldValue, dirty }) => (
        <Form noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Field
              as={TextField}
              name="name"
              label="Team Name"
              fullWidth
              required
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
              disabled={formIsSubmitting}
            />
            
            <Field
              as={TextField}
              name="description"
              label="Description"
              fullWidth
              required
              multiline
              rows={4}
              error={touched.description && !!errors.description}
              helperText={touched.description && errors.description}
              disabled={formIsSubmitting}
            />

            {isSuperAdmin && !isEditing && (
              <FormControl
                fullWidth
                required
                disabled={tenantsLoading || formIsSubmitting}
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
              <Button onClick={onClose} disabled={formIsSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formIsSubmitting || !dirty}>
                {formIsSubmitting ? (
                  <CircularProgress size={24} />
                ) : isEditing ? (
                  'Update Team'
                ) : (
                  'Create Team'
                )}
              </Button>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default TeamForm;