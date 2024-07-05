import EmailIcon from '@mui/icons-material/Email';
import PasswordIcon from '@mui/icons-material/Password';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { InputAdornment, Stack, TextField } from '@mui/material';
import React from 'react';

function LabelWithInput({ label, type, inputProps, passwordVisibleIcon, passwordVisibleIconHandler, ...props }) {
  return (
    <Stack>
      {type === 'text' && <TextField label={label} type={type} variant="standard" {...props} />}
      {type === 'email' && (
        <TextField
          label={label}
          type={type}
          variant="standard"
          value=""
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
          {...props}
        />
      )}
      {type === 'password' && (
        <TextField
          label={label}
          type={passwordVisibleIcon ? 'text' : 'password'}
          variant="standard"
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PasswordIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment sx={{ cursor: 'pointer' }} position="start" onClick={passwordVisibleIconHandler}>
                {passwordVisibleIcon ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </InputAdornment>
            ),
          }}
          {...props}
        />
      )}
    </Stack>
  );
}

export default LabelWithInput;
