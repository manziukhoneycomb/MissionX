import React, { useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { Team, CreateTeamInput, UpdateTeamInput } from '../types/team';
import { useCreateTeam, useUpdateTeam } from '../teamMutations';

type TeamFormProps = {
  team?: Team | null;
  onClose: () => void;
};

type TeamFormValues = {
  name: string;
  description: string;
};

const teamSchema = Yup.object().shape({
  name: Yup.string()
    .max(255, 'Team name must be less than 255 characters')
    .required('Team name is required'),
  description: Yup.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
});

const TeamForm: React.FC<TeamFormProps> = ({ team, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();

  const isEditing = !!team;

  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();

  const initialValues = useMemo(
    (): TeamFormValues => ({
      name: team?.name ?? '',
      description: team?.description ?? '',
    }),
    [team],
  );

  const handleSubmit = async (values: TeamFormValues): Promise<void> => {
    try {
      if (isEditing && team) {
        const updateData: UpdateTeamInput = {
          name: values.name,
          description: values.description || undefined,
        };

        await updateTeamMutation.mutateAsync({ id: team.id, data: updateData });
        enqueueSnackbar('Team updated successfully', { variant: 'success' });
      } else {
        const createData: CreateTeamInput = {
          name: values.name,
          description: values.description || undefined,
        };

        await createTeamMutation.mutateAsync(createData);
        enqueueSnackbar('Team created successfully', { variant: 'success' });
      }

      onClose();
    } catch (error) {
      enqueueSnackbar(`Failed to ${isEditing ? 'update' : 'create'} team`, {
        variant: 'error',
      });
    }
  };

  const isSubmitting = createTeamMutation.isPending || updateTeamMutation.isPending;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={teamSchema}
      onSubmit={handleSubmit}
      enableReinitialize>
      {({ errors, touched, dirty }) => (
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
              disabled={isSubmitting}
            />
            <Field
              as={TextField}
              name="description"
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              error={touched.description && !!errors.description}
              helperText={touched.description && errors.description}
              disabled={isSubmitting}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !dirty}>
                {isSubmitting ? (
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