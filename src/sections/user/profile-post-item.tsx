import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { PostItem, type PostItemProps } from '../components/post-item';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  list: PostItemProps[];
};

export function ProfilePostItem({ list, sx, ...other }: Props) {
  return (
    <Box sx={sx} {...other}>
      <Stack gap={1}>
        {list.map((item) => (
          <PostItem key={item.id} item={item} />
        ))}
      </Stack>
    </Box>
  );
}
