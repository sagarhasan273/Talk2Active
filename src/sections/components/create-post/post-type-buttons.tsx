import React from 'react';
import { Image, Video, Quote, Youtube } from 'lucide-react';

import { Stack, Button } from '@mui/material';

export type PostType = 'image' | 'youtube' | 'video' | 'quote';

interface PostTypeButtonsProps {
  onSelectType?: (type: PostType) => void;
  selectedType?: PostType;
}

export default function PostTypeButtons({ onSelectType, selectedType }: PostTypeButtonsProps) {
  const buttons = [
    { type: 'quote' as PostType, icon: Quote, label: 'Quote', disabled: false },
    { type: 'youtube' as PostType, icon: Youtube, label: 'YouTube', disabled: false },
    { type: 'image' as PostType, icon: Image, label: 'Image', disabled: true },
    { type: 'video' as PostType, icon: Video, label: 'Video', disabled: true },
  ];

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      {buttons.map(({ type, icon: Icon, label, disabled }) => (
        <Button
          key={type}
          onClick={() => onSelectType?.(type)}
          variant={selectedType === type ? 'contained' : 'outlined'}
          color={selectedType === type ? 'primary' : 'inherit'}
          startIcon={<Icon size={18} />}
          disabled={disabled}
          disableRipple
          sx={{
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
