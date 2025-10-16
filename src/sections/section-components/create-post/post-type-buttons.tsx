import React from 'react';
import { Image, Video, Quote, Youtube } from 'lucide-react';

import { Stack, Button } from '@mui/material';

import type { PostTypeProps } from './types';

interface PostTypePropsButtonsProps {
  onSelectType?: (type: PostTypeProps) => void;
  selectedType?: PostTypeProps;
  enableList: PostTypeProps[];
}

export default function PostTypePropsButtons({
  onSelectType,
  selectedType,
  enableList,
}: PostTypePropsButtonsProps) {
  const buttons = [
    { type: 'quote' as PostTypeProps, icon: Quote, label: 'Quote', disabled: false },
    { type: 'youtube' as PostTypeProps, icon: Youtube, label: 'YouTube', disabled: false },
    { type: 'image' as PostTypeProps, icon: Image, label: 'Image', disabled: true },
    { type: 'video' as PostTypeProps, icon: Video, label: 'Video', disabled: true },
  ];

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        mb: 2,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        flexWrap: 'wrap',
      }}
    >
      {buttons.map(({ type, icon: Icon, label, disabled }) => (
        <Button
          key={type}
          onClick={() => onSelectType?.(type)}
          variant={selectedType === type ? 'contained' : 'outlined'}
          color={selectedType === type ? 'primary' : 'inherit'}
          startIcon={<Icon size={18} />}
          disabled={!enableList.includes(type)}
          disableRipple
          sx={{
            // mx: 'auto',
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 1,
            px: 2.5,
            py: 1.2,
            border: 'none',
            transition: 'all 0.2s ease',
            backgroundColor: selectedType === type ? 'primary' : 'background.neutral',
            '&:hover': {
              backgroundColor: selectedType === type ? 'primary' : 'background.neutral',
            },
          }}
        >
          {label}
        </Button>
      ))}
    </Stack>
  );
}
