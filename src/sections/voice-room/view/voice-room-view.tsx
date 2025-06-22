import { varAlpha } from 'src/theme/styles';
import { UserContent } from 'src/layouts/user';

import { VoiceRoomManager } from '../voice-room-manager';

// ----------------------------------------------------------------------

export function VoiceRoomView() {
  return (
    <UserContent
      maxWidth="lg"
      sx={{
        borderTop: (theme) => ({
          lg: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        }),
      }}
    >
      <VoiceRoomManager />
    </UserContent>
  );
}
