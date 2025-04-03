import type { BoxProps } from '@mui/material/Box';
import type { CardProps } from '@mui/material/Card';

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import { Stack } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { Lightbox, useLightBox } from 'src/components/lightbox';
import {
  Carousel,
  useCarousel,
  CarouselThumb,
  CarouselThumbs,
  CarouselArrowNumberButtons,
} from 'src/components/carousel';

import { PostHeader } from '../components/header/post-header';

// ----------------------------------------------------------------------

type Props = BoxProps & {
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

export default function FeedPostList({ list, sx, ...other }: Props) {
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

// ----------------------------------------------------------------------

type PostItemProps = CardProps & {
  item: Props['list'][number];
};

function PostItem({ item, sx, ...other }: PostItemProps) {
  const favoritePopWiggle = useBoolean(false);

  const carousel = useCarousel({
    thumbs: {
      slidesToShow: 'auto',
    },
  });

  const slides = ['', '', '']?.map(() => ({ src: item.coverUrl })) || [];

  const lightbox = useLightBox(slides);

  useEffect(() => {
    if (lightbox.open) {
      carousel.mainApi?.scrollTo(lightbox.selected, true);
    }
  }, [carousel.mainApi, lightbox.open, lightbox.selected]);

  const favoritePopWiggleClick = () => {
    favoritePopWiggle.onTrue();
    setTimeout(() => favoritePopWiggle.onFalse(), 500);
  };

  const renderImage = (
    <Box sx={{ px: 1, pt: 1, overflow: 'hidden', position: 'relative' }}>
      <CarouselArrowNumberButtons
        {...carousel.arrows}
        options={carousel.options}
        totalSlides={carousel.dots.dotCount}
        selectedIndex={carousel.dots.selectedIndex + 1}
        slotProps={{
          prevBtn: {
            sx: {
              display: 'none',
            },
          },
          nextBtn: {
            sx: {
              display: 'none',
            },
          },
        }}
        sx={{
          right: 16,
          top: 16,
          height: 18,
          borderRadius: 1,
          position: 'absolute',
        }}
      />
      <Carousel carousel={carousel} sx={{ borderRadius: 1 }}>
        {slides.map((slide) => (
          <Image
            key={slide.src}
            alt={slide.src}
            src={slide.src}
            ratio="1/1"
            onClick={() => lightbox.onOpen(slide.src)}
            sx={{ borderRadius: 0.5, gap: 1 }}
          />
        ))}
      </Carousel>

      <CarouselThumbs
        ref={carousel.thumbs.thumbsRef}
        options={carousel.options?.thumbs}
        slotProps={{
          disableMask: true,
          container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 1,
          },
          slide: {
            padding: 0,
          },
        }}
        sx={{ width: 1, bottom: 5, position: 'absolute', px: 2, zIndex: 9 }}
      >
        {slides.map((slide, index) => (
          <CarouselThumb
            key={slide.src}
            index={index}
            src={slide.src}
            selected={index === carousel.thumbs.selectedIndex}
            onClick={() => carousel.thumbs.onClickThumb(index)}
            sx={{ height: 24, width: 24, borderRadius: 0.5, overflow: 'hidden' }}
          />
        ))}
      </CarouselThumbs>
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
      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        onGetCurrentIndex={(index) => lightbox.setSelected(index)}
      />
    </Card>
  );
}
