import React, { useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Team } from '../types/team';
import { useCreateTeam, useUpdateTeam } from '../hooks/useTeamMutations';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';

type TeamFormProps = {
  team?: Team | null;
  onClose: () => void;
};

type TeamFormValues = {
  name: string;
  description: string;
};

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Team name is required')
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must be less than 100 characters'),
  description: Yup.string().max(500, 'Description must be less than 500 characters'),
});

const TeamForm: React.FC<TeamFormProps> = ({ team, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const queryClient = useQueryClient();

  const isEdit = Boolean(team);

  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();

  const initialValues: TeamFormValues = {
    name: team?.name || '',
    description: team?.description || '',
  };

  const handleSubmit = async (values: TeamFormValues): Promise<void> => {
    try {
      if (isEdit && team) {
        await updateTeamMutation.mutateAsync({
          id: team.id,
          data: {
            name: values.name,
            description: values.description || undefined,
          },
        });
      } else {
        await createTeamMutation.mutateAsync({
          name: values.name,
          description: values.description || undefined,
        });
      }
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Form submission error:', error);
    }
  };

  const isSubmitting = createTeamMutation.isPending || updateTeamMutation.isPending;

  return (
    <Box sx={{ backgroundColor: theme.palette.background.paper }}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize>
        {({ errors, touched, isValid }) => (
          <Form>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
              <Field name="name">
                {({ field }: any) => (
                  <TextField
                    {...field}
                    label="Team Name"
                    variant="outlined"
                    fullWidth
                    required
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: theme.palette.text.primary,
                        '& fieldset': {
                          borderColor: theme.palette.divider,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.palette.text.secondary,
                        '&.Mui-focused': {
                          color: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                )}
              </Field>

              <Field name="description">
                {({ field }: any) => (
                  <TextField
                    {...field}
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: theme.palette.text.primary,
                        '& fieldset': {
                          borderColor: theme.palette.divider,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.palette.text.secondary,
                        '&.Mui-focused': {
                          color: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                )}
              </Field>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onClose}
                  disabled={isSubmitting}
                  sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      borderColor: theme.palette.text.secondary,
                    },
                  }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': { backgroundColor: theme.palette.primary.dark },
                  }}>
                  {isSubmitting ? 'Saving...' : isEdit ? 'Update Team' : 'Create Team'}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default TeamForm;