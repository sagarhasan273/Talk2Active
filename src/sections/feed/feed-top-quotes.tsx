import type { BoxProps } from '@mui/material/Box';
import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { Carousel, useCarousel, CarouselArrowBasicButtons } from 'src/components/carousel';

import { PostHeader } from '../components/header/post-header';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  title: string;
  list: {
    id: string;
    title: string;
    price: number;
    coverUrl: string;
    totalDuration: number;
    totalStudents: number;
    header: {
      caption: string;
      photoUrl: string;
      time: string;
      userName: string;
      alt: string;
    };
  }[];
};

export default function FeedTopQuotes({ title, list, sx, ...other }: Props) {
  const carousel = useCarousel({
    align: 'start',
    slideSpacing: '24px',
    slidesToShow: { xs: 1, sm: 2, md: 3, lg: '25%', xl: '25%' },
  });

  return (
    <Box sx={sx} {...other}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1, mt: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <CarouselArrowBasicButtons {...carousel.arrows} />
      </Box>

      <Carousel
        carousel={carousel}
        slotProps={{
          slide: { py: 3 },
        }}
        sx={{ px: 0.5 }}
      >
        {list.map((item) => (
          <CarouselItem key={item.id} item={item} />
        ))}
      </Carousel>
    </Box>
  );
}

// ----------------------------------------------------------------------

type CarouselItemProps = CardProps & {
  item: Props['list'][number];
};

function CarouselItem({ item, sx, ...other }: CarouselItemProps) {
  const favoritePopWiggle = useBoolean(false);

  const favoritePopWiggleClick = () => {
    favoritePopWiggle.onTrue();
    setTimeout(() => favoritePopWiggle.onFalse(), 500);
  };

  const renderImage = (
    <Box sx={{ px: 1, pt: 1, overflow: 'hidden' }}>
      <Image alt={item.title} src={item.coverUrl} ratio="6/4" sx={{ borderRadius: 1.5 }} />
    </Box>
  );

  const renderFooter = (
    <Stack direction="row" spacing={1}>
      <Link
        variant="subtitle2"
        underline="none"
        sx={{
          cursor: 'pointer',
          color: 'primary.main',
          display: 'inline-flex',
          alignItems: 'center',
        }}
        onClick={favoritePopWiggleClick}
      >
        <Iconify
          icon="solar:heart-bold"
          width={16}
          sx={{
            mr: 0.5,
          }}
          popWiggle={favoritePopWiggle.value}
        />
        12k Favorite
      </Link>

      <Link
        variant="subtitle2"
        color="inherit"
        underline="none"
        sx={{
          cursor: 'pointer',
          color: 'text.secondary',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <Iconify
          icon="solar:share-bold"
          width={16}
          sx={{
            mr: 1,
          }}
        />
        6k Share
      </Link>
    </Stack>
  );

  return (
    <Card sx={{ width: 1, userSelect: 'none', ...sx }} {...other}>
      <PostHeader item={item.header} />

      {renderImage}

      <Box sx={{ px: 2, py: 1.5 }}>{renderFooter}</Box>
    </Card>
  );
}
