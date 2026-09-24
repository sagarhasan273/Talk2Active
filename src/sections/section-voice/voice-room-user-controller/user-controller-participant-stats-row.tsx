import { RoomParticipantType } from '@/types/type-room';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

function formatCompactNumber(num: number = 0): string {
    return new Intl.NumberFormat('en', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    }).format(num);
}

export const ParticipantStatsRow = ({ participant }: { participant: Partial<RoomParticipantType> }) => {
    const stats = [
        { label: 'Friends', value: participant?.friend_count ?? 0 },
        { label: 'Followers', value: participant?.follower_count ?? 0 },
        { label: 'Following', value: participant?.following_count ?? 0 },
    ];

    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-evenly"
            divider={
                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                        height: 18,
                        my: 'auto',
                        borderColor: (theme) => alpha(theme.palette.divider, 0.15),
                    }}
                />
            }
            sx={{
                width: '100%',
                maxWidth: '100%',
                py: 0.75,
                px: { xs: 0.5, sm: 1 },
                borderRadius: 1.5,
                bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.default, 0.4)
                        : alpha(theme.palette.grey[500], 0.05),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                mb: 1.5,
            }}
        >
            {stats.map((item) => (
                <Box
                    key={item.label}
                    sx={{
                        flex: 1,
                        minWidth: 0, // Prevents flex-item content from forcing parent wider
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        px: 0.5,
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: 12, sm: 13 },
                            lineHeight: 1.2,
                            color: 'text.primary',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {formatCompactNumber(item.value)}
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: { xs: 10, sm: 11 },
                            fontWeight: 600,
                            color: 'text.secondary',
                            lineHeight: 1.1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            mt: 0.25,
                        }}
                    >
                        {item.label}
                    </Typography>
                </Box>
            ))}
        </Stack>
    );
};

export default ParticipantStatsRow;