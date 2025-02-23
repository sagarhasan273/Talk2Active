import type { IconButtonProps } from '@mui/material/IconButton';

import { Button } from '@mui/material';


// ----------------------------------------------------------------------

export type LanguagePopoverProps = IconButtonProps & {
  language?: string;

};

export function LanguageViewer({ language = 'English'}: LanguagePopoverProps) {

  return (
    <Button
      variant='outlined'
      disableRipple
    >
      {language}
    </Button>
  );
}
