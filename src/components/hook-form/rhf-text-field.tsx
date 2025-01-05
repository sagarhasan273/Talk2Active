import type { TextFieldProps } from '@mui/material/TextField';

import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
};

export function RHFTextField({ name, helperText, type, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onChange={(event) => {
            if (type === 'number') {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error?.message ?? helperText}
          inputProps={{
            autoComplete: 'off',
          }}
          sx={{
            '& .MuiInputBase-root': {},
            '& .MuiInputBase-input': {
              height: '40px',
              padding: '0px 10px',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'border.primary',
              },
              '&:hover fieldset': {
                borderColor: 'border.secondary',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'border.disabled',
              },
            },
          }}
          {...other}
        />
      )}
    />
  );
}
