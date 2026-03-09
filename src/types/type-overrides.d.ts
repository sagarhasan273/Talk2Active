import type { FunctionComponent } from 'react';
import type { LazyLoadImageProps } from 'react-lazy-load-image-component';

declare module 'react-lazy-load-image-component' {
  export const LazyLoadImage: FunctionComponent<LazyLoadImageProps & {
    [key: string]: any
  }>;
}
