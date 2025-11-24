import React from 'react';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { Team } from '../types/team';
import { useCreateTeam, useUpdateTeam } from '../teamMutations';

type TeamFormProps = {
  team?: Team | null;
  onClose: () => void;
};

type TeamFormValues = {
  name: string;
  description: string;
};

const teamValidationSchema = Yup.object({
  name: Yup.string()
    .required('Team name is required')
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must be at most 100 characters'),
  description: Yup.string()
    .max(500, 'Description must be at most 500 characters'),
});

const TeamForm: React.FC<TeamFormProps> = ({ team, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const isEditMode = !!team;

  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();

  const initialValues: TeamFormValues = {
    name: team?.name || '',
    description: team?.description || '',
  };

  const handleSubmit = async (values: TeamFormValues): Promise<void> => {
    try {
      if (isEditMode && team) {
        await updateTeamMutation.mutateAsync({
          id: team.id,
          data: values,
        });
        enqueueSnackbar('Team updated successfully', { variant: 'success' });
      } else {
        await createTeamMutation.mutateAsync(values);
        enqueueSnackbar('Team created successfully', { variant: 'success' });
      }
      onClose();
    } catch (error) {
      enqueueSnackbar(
        isEditMode ? 'Failed to update team' : 'Failed to create team',
        { variant: 'error' }
      );
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={teamValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ errors, touched, isSubmitting }) => (
        <Form>
          <Box sx={{ mt: 2 }}>
            <Field
              as={TextField}
              name="name"
              label="Team Name"
              fullWidth
              margin="normal"
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
              required
            />
            <Field
              as={TextField}
              name="description"
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              error={touched.description && !!errors.description}
              helperText={touched.description && errors.description}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isEditMode ? 'Update' : 'Create'} Team
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default TeamForm;