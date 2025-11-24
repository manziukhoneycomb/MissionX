import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { Team, CreateTeamInput, UpdateTeamInput } from '../types/team';
import { useCreateTeam, useUpdateTeam } from '../teamMutations';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';

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
  name: Yup.string().max(255, 'Too Long!').required('Name is required'),
  description: Yup.string().optional(),
});

const TeamForm: React.FC<TeamFormProps> = ({ open, team, onClose }) => {
  const { hasRole } = useUserRoles();
  const isSuperAdmin = hasRole([ROLES.SUPER_ADMIN]);

  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (values: TeamFormValues): Promise<void> => {
    try {
      if (team) {
        const updateData: UpdateTeamInput = {
          name: values.name,
          description: values.description || undefined,
        };
        await updateMutation.mutateAsync({ id: team.id, data: updateData });
      } else {
        const createData: CreateTeamInput = {
          name: values.name,
          description: values.description || undefined,
        };
        await createMutation.mutateAsync(createData);
      }
      onClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  const initialValues: TeamFormValues = {
    name: team?.name || '',
    description: team?.description || '',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{team ? 'Edit Team' : 'Create Team'}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={teamSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, isValid }) => (
          <Form>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2}>
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
                  multiline
                  rows={3}
                  error={touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!isValid || isLoading}
              >
                {isLoading ? 'Saving...' : team ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default TeamForm;