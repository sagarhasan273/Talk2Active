import { varAlpha } from 'src/theme/styles';
import { UserContent } from 'src/layouts/user';

import RoomManager from '../RoomManager';

// ----------------------------------------------------------------------

export function VoiceChatView() {
  return (
    <UserContent
      maxWidth="lg"
      sx={{
        borderTop: (theme) => ({
          lg: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        }),
      }}
    >
      <RoomManager />
    </UserContent>
  );
}
