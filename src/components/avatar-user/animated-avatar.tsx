import { CONFIG } from '@/config-global';
import { Avatar, Box, keyframes, type SxProps } from '@mui/material';

// ─── Animations ─────────────────────────────────────────────────────────

const spin = keyframes`
  from { transform: rotate(0deg) translateZ(0); }
  to   { transform: rotate(360deg) translateZ(0); }
`;

// ----------------------------------------------------------------------

export type AccountTier = 'ADMIN' | 'SUPPORTER' | 'SUPPORTER_PLUS' | 'MEMBER' | string;

export type AnimatedAvatarProps = {
  accountType?: AccountTier;
  src?: string;
  name?: string;
  /** Exact size of the inner avatar in pixels */
  size?: number;
  /** Space in pixels between the avatar edge and the spinning image */
  ringGap?: number;
  speed?: number;
  sx?: SxProps;
};

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export const AnimatedAvatar = ({
  accountType = 'MEMBER',
  src,
  name,
  size = 48,
  ringGap = 8,
  speed = 8,
  sx,
}: AnimatedAvatarProps) => {
  const normalizedTier = accountType.toUpperCase();
  const hasAnimatedBorder = normalizedTier !== 'MEMBER';

  const ringSize = size + ringGap * 2;
  const positionOffset = -ringGap;

  let ringImageSrc = '';

  if (normalizedTier === 'ADMIN') {
    ringImageSrc = `${CONFIG.assetsDir}/assets/background/supporter.68180b0d.png`;
  } else if (normalizedTier === 'SUPPORTER' || normalizedTier === 'SUPPORTER_PLUS') {
    ringImageSrc = `${CONFIG.assetsDir}/assets/background/supporter-plus.0d5f0ce3.png`;
  }

  return (
    <Box
      sx={[
        {
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          isolation: 'isolate',
          width: size,
          height: size,
          ...(hasAnimatedBorder && {
            '& .spinning-image': {
              position: 'absolute',
              top: positionOffset,
              left: positionOffset,
              width: ringSize,
              height: ringSize,

              // --- PREVENTS OVAL DISTORTION ---
              maxWidth: 'none',
              objectFit: 'contain',
              // --------------------------------

              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 10,
              animation: `${spin} ${speed}s linear infinite`,
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              willChange: 'transform',
            },
            '@media (prefers-reduced-motion: reduce)': {
              '& .spinning-image': { animation: 'none' },
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* Outer Spinning Image Frame */}
      {hasAnimatedBorder && ringImageSrc && (
        <img
          src={ringImageSrc}
          alt={`${normalizedTier} border`}
          className="spinning-image"
        />
      )}

      {/* Standard MUI Avatar */}
      <Avatar
        src={src}
        alt={name}
        sx={{
          width: '100%',
          height: '100%',
          fontSize: size * 0.4,
          fontWeight: 700,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {!src && getInitials(name)}
      </Avatar>
    </Box>
  );
};

export default AnimatedAvatar;
