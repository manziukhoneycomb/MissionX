import React, { useRef } from 'react';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { UploadFile as UploadIcon } from '@mui/icons-material';
import { useImportInvoice } from '../invoiceMutations';
import { useSnackbar } from 'notistack';

/**
 * Component for uploading and importing invoice files
 */
const InvoiceFileUpload: React.FC<{ variant?: 'text' | 'contained' | 'outlined' }> = ({
  variant = 'contained',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();

  const importInvoiceMutation = useImportInvoice();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Check if the file is XLSX
    if (!file.name.endsWith('.xlsx')) {
      enqueueSnackbar('Only XLSX files are supported', { variant: 'error' });
      return;
    }

    importInvoiceMutation.mutate(file, {
      onSuccess: () => {
        enqueueSnackbar('Invoice imported successfully', { variant: 'success' });
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (error) => {
        console.error('Error importing invoice:', error);
        enqueueSnackbar('Failed to import invoice', { variant: 'error' });
      },
    });
  };

  const isNavVariant = variant === 'text';

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx"
        onChange={handleFileChange}
      />
      <Tooltip title="Import Invoice">
        <Button
          variant={variant}
          color={isNavVariant ? 'inherit' : 'primary'}
          startIcon={
            importInvoiceMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <UploadIcon />
            )
          }
          onClick={handleClick}
          disabled={importInvoiceMutation.isPending}
          sx={{
            textTransform: 'none',
            ...(isNavVariant
              ? {
                  color: 'text.secondary',
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'primary.main',
                  },
                  '&.Mui-disabled': {
                    color: 'text.disabled',
                  },
                }
              : {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }),
          }}>
          {importInvoiceMutation.isPending ? 'Importing...' : 'Import Invoice'}
        </Button>
      </Tooltip>
    </>
  );
};

export default InvoiceFileUpload;
