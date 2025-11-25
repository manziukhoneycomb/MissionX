import React from 'react';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Team } from '../types/team';
import { useCreateTeam, useUpdateTeam } from '../teamMutations';

type TeamFormProps = {
  open: boolean;
  team?: Team | null;
  onClose: () => void;
};

type TeamFormValues = {
  name: string;
  description: string;
};

const teamSchema = Yup.object().shape({
  name: Yup.string().max(255, 'Too Long!').required('Required'),
  description: Yup.string().optional(),
});

const TeamForm: React.FC<TeamFormProps> = ({ open, team, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const isEditing = !!team;

  const { mutateAsync: createTeamMutate, isPending: isCreating } = useCreateTeam();
  const { mutateAsync: updateTeamMutate, isPending: isUpdating } = useUpdateTeam();

  const initialValues: TeamFormValues = {
    name: team?.name ?? '',
    description: team?.description ?? '',
  };

  const handleSubmit = async (values: TeamFormValues): Promise<void> => {
    try {
      if (isEditing && team) {
        await updateTeamMutate({
          id: team.id,
          data: {
            name: values.name,
            description: values.description || undefined,
          },
        });
        enqueueSnackbar('Team updated successfully', { variant: 'success' });
      } else {
        await createTeamMutate({
          name: values.name,
          description: values.description || undefined,
        });
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

  const formIsSubmitting = isCreating || isUpdating;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Team' : 'Create Team'}</DialogTitle>
      <DialogContent>
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
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
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
      </DialogContent>
    </Dialog>
  );
};

export default TeamForm;
