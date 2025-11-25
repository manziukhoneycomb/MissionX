import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { CreateTeamInput, Team } from '../types/team';

interface TeamFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateTeamInput) => void;
  initialValues?: Team | null;
  isLoading?: boolean;
}

const validationSchema = yup.object({
  name: yup.string().required('Name is required').max(255, 'Name is too long'),
  description: yup.string().max(500, 'Description is too long'),
});

const TeamForm: React.FC<TeamFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  isLoading,
}) => {
  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Reset form when dialog closes/opens
  useEffect(() => {
    if (open && !initialValues) {
      formik.resetForm();
    }
  }, [open, initialValues]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{initialValues ? 'Edit Team' : 'Create Team'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Team Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              disabled={isLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {initialValues ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamForm;
