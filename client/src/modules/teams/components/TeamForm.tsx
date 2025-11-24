import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Team, CreateTeamRequest, UpdateTeamRequest } from '../types/team';
import { useCreateTeam, useUpdateTeam } from '../teamMutations';
import { useTeamManagementStore } from '../stores/teamManagementStore';

const TeamFormSchema = Yup.object().shape({
  name: Yup.string()
    .required('Team name is required')
    .min(2, 'Team name must be at least 2 characters')
    .max(255, 'Team name must be less than 255 characters'),
  description: Yup.string()
    .nullable()
    .max(1000, 'Description must be less than 1000 characters'),
});

type TeamFormValues = {
  name: string;
  description: string;
};

export const TeamForm: React.FC = () => {
  const { isFormOpen, selectedTeam, closeForm } = useTeamManagementStore();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();

  const isEditMode = !!selectedTeam;

  const initialValues: TeamFormValues = {
    name: selectedTeam?.name || '',
    description: selectedTeam?.description || '',
  };

  const handleSubmit = async (values: TeamFormValues) => {
    try {
      if (isEditMode && selectedTeam) {
        const updateData: UpdateTeamRequest = {
          name: values.name,
          description: values.description || undefined,
        };
        await updateTeamMutation.mutateAsync({ id: selectedTeam.id, data: updateData });
      } else {
        const createData: CreateTeamRequest = {
          name: values.name,
          description: values.description || undefined,
        };
        await createTeamMutation.mutateAsync(createData);
      }
      closeForm();
    } catch (error) {
      // Error is handled by mutation hooks
    }
  };

  return (
    <Dialog open={isFormOpen} onClose={closeForm} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Team' : 'Create New Team'}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={TeamFormSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Field
                  as={TextField}
                  name="name"
                  label="Team Name"
                  fullWidth
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />
                <Field
                  as={TextField}
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  fullWidth
                  error={touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeForm}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};