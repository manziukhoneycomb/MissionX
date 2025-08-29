import React from 'react';
import { useSnackbar } from 'notistack';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import { Tenant } from '../types/tenant.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTenant,
  CreateTenantInput,
  updateTenant,
  UpdateTenantInput,
} from '../tenantMutations.ts';
import { TENANT_QUERY_KEYS } from '../tenantQueryKeys.ts';

type TenantFormProps = {
  tenant?: Tenant | null;
  onClose: () => void;
};

type TenantFormValues = {
  name: string;
  alias: string;
};

const TenantSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(255, 'Too Long!').required('Required'),
  alias: Yup.string()
    .max(50, 'Too Long!')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Alias must be lowercase alphanumeric with hyphens (no leading/trailing)',
    })
    .required('Required'),
});

const TenantForm: React.FC<TenantFormProps> = ({ tenant, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { mutateAsync: addTenantMutate, isPending: isCreating } = useMutation({
    mutationKey: ['create-tenant'],
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANT_QUERY_KEYS.GET_TENANTS] });
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to create tenant', {
        variant: 'error',
      });
    },
  });

  const { mutateAsync: updateTenantMutate, isPending: isUpdating } = useMutation({
    mutationKey: ['update-tenant'],
    mutationFn: updateTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANT_QUERY_KEYS.GET_TENANTS] });
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update tenant', {
        variant: 'error',
      });
    },
  });

  const isLoading = isCreating || isUpdating;

  const initialValues = React.useMemo(
    (): TenantFormValues => ({
      name: tenant?.name ?? '',
      alias: tenant?.alias ?? '',
    }),
    [tenant],
  );

  const handleSubmit = async (values: TenantFormValues): Promise<void> => {
    if (tenant) {
      const updateData: UpdateTenantInput = { name: values.name };
      await updateTenantMutate({ id: tenant.id, data: updateData });
    } else {
      const createPayload: CreateTenantInput = { name: values.name, alias: values.alias };
      await addTenantMutate(createPayload);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={TenantSchema}
      onSubmit={handleSubmit}
      enableReinitialize>
      {({ errors, touched }) => {
        return (
          <Form noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Field
                as={TextField}
                name="name"
                label="Tenant Name"
                variant="outlined"
                fullWidth
                required
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
              />
              <Field
                as={TextField}
                name="alias"
                label="Tenant Alias (lowercase, alphanumeric, hyphens)"
                variant="outlined"
                fullWidth
                required
                disabled={!!tenant}
                error={touched.alias && !!errors.alias}
                helperText={touched.alias && errors.alias}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                <Button onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isLoading}>
                  {isLoading ? (
                    <CircularProgress size={24} />
                  ) : tenant ? (
                    'Update Tenant'
                  ) : (
                    'Create Tenant'
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

export default TenantForm;
