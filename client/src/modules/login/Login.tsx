import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Link,
  TextField,
  Button,
  Divider,
  Stack,
  CircularProgress,
  Alert,
  Theme,
} from '@mui/material';
import { useSignIn } from '@clerk/clerk-react';
import { useState, FormEvent, ChangeEvent } from 'react';

type LoginProps = Record<string, unknown>;

type FormState = {
  email: string;
  emailCode: string;
  password: string;
  strategy: 'email_code' | 'password';
};

const Login: React.FC<LoginProps> = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [formState, setFormState] = useState<FormState>({
    email: '',
    emailCode: '',
    password: '',
    strategy: 'password',
  });
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleStrategy = (): void => {
    setFormState((prev) => ({
      ...prev,
      strategy: prev.strategy === 'password' ? 'email_code' : 'password',
    }));
    setEmailSent(false);
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const { email, password, emailCode, strategy } = formState;

      if (strategy === 'password') {
        const result = await signIn.create({
          identifier: email,
          password,
          redirectUrl: '/',
        });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          window.location.reload();
        } else {
          console.log('Additional authentication steps required');
        }
      } else {
        // Email code flow
        if (!emailSent) {
          await signIn.create({
            identifier: email,
            strategy: 'email_code',
          });
          setEmailSent(true);
        } else {
          const result = await signIn.attemptFirstFactor({
            strategy: 'email_code',
            code: emailCode,
          });

          if (result.status === 'complete') {
            await setActive({ session: result.createdSessionId });
          } else {
            console.log('Additional authentication steps required');
          }
        }
      }
    } catch (err) {
      const errorMessage = (err as Error).message || 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'oauth_google' | 'oauth_facebook'): Promise<void> => {
    if (!isLoaded) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err) {
      const errorMessage = (err as Error).message || 'OAuth sign in failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: (theme: Theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}>
      <Container component="main" maxWidth="md" disableGutters>
        <Paper elevation={4} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Grid container spacing={0}>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                p: { xs: 3, sm: 5 },
                display: 'flex',
                flexDirection: 'column',
              }}>
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                <img
                  src="/icon.svg"
                  alt="Logo"
                  style={{ height: 24, width: 24, marginRight: '8px' }}
                />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Invoice Analytics
                </Typography>
              </Box>

              <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Hello, Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Sign in to access your invoice analytics dashboard
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    required
                    disabled={formState.strategy === 'email_code' && emailSent}
                    variant="outlined"
                    size="small"
                  />

                  {formState.strategy === 'password' ? (
                    <>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Password"
                        name="password"
                        type="password"
                        value={formState.password}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        size="small"
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          textAlign: 'right',
                          mt: 0.5,
                          cursor: 'pointer',
                        }}
                        onClick={toggleStrategy}>
                        Prefer to login with email code instead?
                      </Typography>
                    </>
                  ) : emailSent ? (
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Email Code"
                      name="emailCode"
                      value={formState.emailCode}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      size="small"
                    />
                  ) : null}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading || !isLoaded}
                    sx={{ mt: 2, mb: 2 }}>
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : formState.strategy === 'password' ? (
                      'Sign In'
                    ) : emailSent ? (
                      'Verify Code'
                    ) : (
                      'Send Email Code'
                    )}
                  </Button>

                  {formState.strategy === 'email_code' && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        textAlign: 'center',
                        mb: 1,
                        cursor: 'pointer',
                      }}
                      onClick={toggleStrategy}>
                      Return to password login
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled={isLoading || !isLoaded}
                    onClick={() => handleOAuthSignIn('oauth_google')}
                    sx={{ textTransform: 'none' }}>
                    Google
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled={isLoading || !isLoaded}
                    onClick={() => handleOAuthSignIn('oauth_facebook')}
                    sx={{ textTransform: 'none' }}>
                    Facebook
                  </Button>
                </Stack>
              </Box>

              <Typography variant="body2" align="center" sx={{ mt: 'auto', pt: 2 }}>
                Don't have an account?{' '}
                <Link href="#" onClick={(e) => e.preventDefault()}>
                  Contact us
                </Link>
              </Typography>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                height: { xs: '300px', sm: 'auto' },
                minHeight: { sm: '400px' },
              }}>
              <img
                src="/sign_in.jpeg"
                alt="Sign in illustration"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
