import React, { useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Team, CreateTeamInput, UpdateTeamInput } from '../types/team';
import { createTeam, updateTeam, UpdateTeamPayload } from '../teamMutations';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';

type TeamFormProps = {
  team?: Team | null;
  onClose: () => void;
};

type TeamFormValues = {
  name: string;
  description: string;
};

const teamSchema = Yup.object().shape({
  name: Yup.string().max(100, 'Too Long!').required('Required'),
  description: Yup.string().max(500, 'Too Long!').required('Required'),
});

const TeamForm: React.FC<TeamFormProps> = ({ team, onClose }) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const isEditing = !!team;

  const { mutateAsync: createTeamMutate, isPending: isCreating } = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team created successfully', { variant: 'success' });
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to create team', {
        variant: 'error',
      });
    },
  });

  const { mutateAsync: updateTeamMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team updated successfully', { variant: 'success' });
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update team', {
        variant: 'error',
      });
    },
  });

  const formIsSubmittingOverall = isCreating || isUpdating;

  const initialValues = useMemo(
    (): TeamFormValues => ({
      name: team?.name ?? '',
      description: team?.description ?? '',
    }),
    [team],
  );

  const handleSubmit = async (values: TeamFormValues): Promise<void> => {
    if (isEditing && team) {
      const updateData: UpdateTeamInput = {
        name: values.name,
        description: values.description,
      };

      const updatePayload: UpdateTeamPayload = { id: team.id, data: updateData };
      await updateTeamMutate(updatePayload);
    } else {
      const createPayload: CreateTeamInput = {
        name: values.name,
        description: values.description,
      };

      await createTeamMutate(createPayload);
    }
  };

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
            />
            <Field
              as={TextField}
              name="description"
              label="Description"
              fullWidth
              required
              multiline
              rows={3}
              error={touched.description && !!errors.description}
              helperText={touched.description && errors.description}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
              <Button onClick={onClose} disabled={formIsSubmittingOverall}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={formIsSubmittingOverall || !dirty}>
                {formIsSubmittingOverall ? (
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
