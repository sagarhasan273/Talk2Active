import type { RoomResponse } from 'src/types/type-chat';

import { useDispatch } from 'react-redux';

import { useRouter } from 'src/routes/route-hooks';

import { varAlpha } from 'src/theme/styles';
import { UserContent } from 'src/layouts/user';
import { setRoom } from 'src/core/slices/slice-room';

import { VoiceRoomList } from '../voice-room-list';

// ----------------------------------------------------------------------

export function VoiceRoomView() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleJoinRoom = async (room: RoomResponse) => {
    dispatch(setRoom(room));
    router.push(`/voice-room/${room.id}`);
  };

  return (
    <UserContent
      maxWidth="lg"
      sx={{
        borderTop: (theme) => ({
          lg: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        }),
      }}
    >
      <VoiceRoomList onJoinRoom={handleJoinRoom} />
    </UserContent>
  );
}
