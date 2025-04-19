import type { BoxProps } from '@mui/material/Box';
import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { Avatar, Tooltip, AvatarGroup, avatarGroupClasses } from '@mui/material';

import { fShortenNumber } from 'src/utils/format-number';

import { _mock } from 'src/_mock';
import { maxLine } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { Label, labelClasses } from 'src/components/label';

import { ComponentBlock } from '../components';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  list: {
    id: string;
    title: string;
    price: number;
    coverUrl: string;
    totalDuration: number;
    totalStudents: number;
  }[];
};

export function VoiceChatCards({ list, sx, ...other }: Props) {
  return (
    <Box
      sx={{
        gap: 3,
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          md: 'repeat(3, 1fr)',
        },
      }}
    >
      {list.map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------

type ItemProps = CardProps & {
  item: Props['list'][number];
};

const COLORS = ['default', 'primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

function Item({ item, sx, ...other }: ItemProps) {
  const renderImage = (
    <Box sx={{ px: 1, pt: 1 }}>
      <ComponentBlock flexDirection="column" alignItems="center">
        <AvatarGroup
          key={56}
          sx={{ [`& .${avatarGroupClasses.avatar}`]: { width: 56, height: 56 } }}
        >
          {COLORS.map((color, index) => (
            <Tooltip title="owner" key={color}>
              <Avatar alt={_mock.fullAddress(index + 1)} src={_mock.image.avatar(index + 1)} />
            </Tooltip>
          ))}
        </AvatarGroup>
      </ComponentBlock>
    </Box>
  );

  const renderLabels = (
    <Box
      sx={{
        gap: 1,
        mb: 1.5,
        display: 'flex',
        flexWrap: 'wrap',
        [`& .${labelClasses.root}`]: {
          typography: 'caption',
          color: 'text.secondary',
        },
      }}
    >
      <Label startIcon={<Iconify width={12} icon="solar:clock-circle-outline" />}>1h 40m</Label>

      <Label startIcon={<Iconify width={12} icon="solar:users-group-rounded-bold" />}>
        {fShortenNumber(item.totalStudents)}
      </Label>
    </Box>
  );

  const renderFooter = (
    <Box
      sx={{
        mt: 2.5,
        gap: 0.5,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box component="span" sx={{ typography: 'body2', color: 'text.secondary', flexGrow: 1 }}>
        English x Bangali
      </Box>
      <Button variant="contained" size="small">
        Join call
      </Button>
    </Box>
  );

  return (
    <Card sx={{ width: 1, ...sx }} {...other}>
      {renderImage}

      <Box sx={{ px: 2, py: 2.5 }}>
        {renderLabels}

        <Link
          variant="subtitle2"
          color="inherit"
          underline="none"
          sx={(theme) => ({
            ...maxLine({ line: 2, persistent: theme.typography.subtitle2 }),
          })}
        >
          {item.title}
        </Link>

        {renderFooter}
      </Box>
    </Card>
  );
}
