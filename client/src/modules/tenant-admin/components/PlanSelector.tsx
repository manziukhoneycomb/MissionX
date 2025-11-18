import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  CircularProgress,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import { BillingPlan } from '../services/mockBillingService';

interface PlanSelectorProps {
  plans: BillingPlan[];
  currentPlanId: string;
  onPlanChange: (planId: string) => Promise<void>;
  loading?: boolean;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  plans,
  currentPlanId,
  onPlanChange,
  loading = false,
}) => {
  const theme = useTheme();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlanId) return;
    setSelectedPlanId(planId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmChange = async () => {
    if (!selectedPlanId) return;
    
    setIsChanging(true);
    try {
      await onPlanChange(selectedPlanId);
      setConfirmDialogOpen(false);
      setSelectedPlanId(null);
    } catch (error) {
      console.error('Failed to change plan:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleCancelChange = () => {
    setConfirmDialogOpen(false);
    setSelectedPlanId(null);
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    return `$${price}/${interval === 'monthly' ? 'month' : 'year'}`;
  };

  const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
  const currentPlan = plans.find(plan => plan.id === currentPlanId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isRecommended = plan.recommended;

          return (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: isCurrent
                    ? `2px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                  ...(isRecommended && !isCurrent && {
                    border: `2px solid ${theme.palette.secondary.main}`,
                  }),
                }}>
                {isRecommended && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 1,
                    }}>
                    <Chip
                      icon={<StarIcon />}
                      label="Recommended"
                      color="secondary"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                )}

                {isCurrent && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: 16,
                      zIndex: 1,
                    }}>
                    <Chip
                      label="Current Plan"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, pt: isRecommended || isCurrent ? 3 : 2 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 2 }}>
                    {formatPrice(plan.price, plan.currency, plan.interval)}
                  </Typography>

                  <List dense>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon
                            color="primary"
                            sx={{ fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={isCurrent ? 'outlined' : 'contained'}
                    disabled={isCurrent}
                    onClick={() => handlePlanSelect(plan.id)}
                    sx={{ fontWeight: 'bold' }}>
                    {isCurrent ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelChange}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Confirm Plan Change</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to change from the <strong>{currentPlan?.name}</strong> plan
            to the <strong>{selectedPlan?.name}</strong> plan?
          </Typography>
          {selectedPlan && currentPlan && (
            <Box
              sx={{
                p: 2,
                backgroundColor: theme.palette.action.hover,
                borderRadius: 1,
              }}>
              <Typography variant="body2" color="text.secondary">
                <strong>New billing amount:</strong> {formatPrice(selectedPlan.price, selectedPlan.currency, selectedPlan.interval)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                The change will be effective immediately and prorated accordingly.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelChange} disabled={isChanging}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmChange}
            variant="contained"
            disabled={isChanging}>
            {isChanging ? <CircularProgress size={20} /> : 'Confirm Change'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlanSelector;