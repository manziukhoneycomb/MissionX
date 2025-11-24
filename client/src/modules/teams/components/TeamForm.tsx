import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreateTeamInput, Team, UpdateTeamInput } from '../types/team';

interface TeamFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateTeamInput | UpdateTeamInput) => void;
  team?: Team | null;
}

const TeamForm: React.FC<TeamFormProps> = ({ open, onClose, onSubmit, team }) => {
  const isEditing = !!team;

  const validationSchema = Yup.object({
    name: Yup.string().max(255).required('Name is required'),
    description: Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      name: team?.name || '',
      description: team?.description || '',
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Edit Team' : 'Create Team'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            id="name"
            name="name"
            label="Team Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            fullWidth
            margin="dense"
            id="description"
            name="description"
            label="Description"
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamForm;
