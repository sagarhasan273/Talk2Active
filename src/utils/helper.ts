/**
 * https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore?tab=readme-ov-file#_flatten
 * https://github.com/you-dont-need-x/you-dont-need-lodash
 */

import { languages } from 'src/_mock/data/languages';

import axiosInstance, { endpoints } from './axios';

// ----------------------------------------------------------------------

export function flattenArray<T>(list: T[], key = 'children'): T[] {
  let children: T[] = [];

  const flatten = list?.map((item: any) => {
    if (item[key] && item[key].length) {
      children = [...children, ...item[key]];
    }
    return item;
  });

  return flatten?.concat(children.length ? flattenArray(children, key) : children);
}

// ----------------------------------------------------------------------

export function flattenDeep(array: any): any[] {
  const isArray = array && Array.isArray(array);

  if (isArray) {
    return array.flat(Infinity);
  }
  return [];
}

// ----------------------------------------------------------------------

export function orderBy<T>(array: T[], properties: (keyof T)[], orders?: ('asc' | 'desc')[]): T[] {
  return array.slice().sort((a, b) => {
    for (let i = 0; i < properties.length; i += 1) {
      const property = properties[i];
      const order = orders && orders[i] === 'desc' ? -1 : 1;

      const aValue = a[property];
      const bValue = b[property];

      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
    }
    return 0;
  });
}

// ----------------------------------------------------------------------

export function keyBy<T>(
  array: T[],
  key: keyof T
): {
  [key: string]: T;
} {
  return (array || []).reduce((result, item) => {
    const keyValue = key ? item[key] : item;

    return { ...result, [String(keyValue)]: item };
  }, {});
}

// ----------------------------------------------------------------------

export function sumBy<T>(array: T[], iteratee: (item: T) => number): number {
  return array.reduce((sum, item) => sum + iteratee(item), 0);
}

// ----------------------------------------------------------------------

export function isEqual(a: any, b: any): boolean {
  if (a === null || a === undefined || b === null || b === undefined) {
    return a === b;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean') {
    return a === b;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((item, index) => isEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a!);
    const keysB = Object.keys(b!);

    if (keysA.length !== keysB.length) {
      return false;
    }

    return keysA.every((key) => isEqual(a[key], b[key]));
  }

  return false;
}

// ----------------------------------------------------------------------

function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export const merge = (target: any, ...sources: any[]): any => {
  if (!sources.length) return target;

  const source = sources.shift();

  // eslint-disable-next-line no-restricted-syntax
  for (const key in source) {
    if (isObject(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      merge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }

  return merge(target, ...sources);
};

interface UploadImageResponse {
  success: boolean;
  imageUrl: string;
  publicId: string;
}

export const uploadImage = async (file: File): Promise<{ imageUrl: string } | undefined> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axiosInstance.post<UploadImageResponse>(
      endpoints.inventory.image,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return { imageUrl: response.data.imageUrl };
  } catch (err) {
    console.error('Upload error:', err);
    return undefined;
  }
};

export const extractYouTubeId = (inputUrl: string): string | null => {
  // Remove any URL parameters that might interfere
  const cleanUrl = inputUrl.split('&pp=')[0]; // Remove &pp parameter

  const patterns = [
    // Standard desktop URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/e\/([^&?#]+)/,

    // Short URLs
    /(?:https?:\/\/)?youtu\.be\/([^&?#]+)/,
    /(?:https?:\/\/)?y2u\.be\/([^&?#]+)/,

    // Mobile URLs
    /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([^&?#]+)/,
    /(?:https?:\/\/)?m\.youtube\.com\/embed\/([^&?#]+)/,

    // Music URLs
    /(?:https?:\/\/)?music\.youtube\.com\/watch\?v=([^&?#]+)/,
    /(?:https?:\/\/)?music\.youtube\.com\/embed\/([^&?#]+)/,

    // International domains
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\.[a-z]{2,3}\/watch\?v=([^&?#]+)/,
    /(?:https?:\/\/)?youtu\.be\.[a-z]{2,3}\/([^&?#]+)/,
  ];

  const found = patterns.find((pattern) => {
    const match = cleanUrl.match(pattern);
    return match && match[1];
  });
  if (found) {
    const match = cleanUrl.match(found);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

export function fUsername(fullName?: string): string {
  if (!fullName) return '';

  const parts = fullName.trim().split(/\s+/);

  if (parts.length >= 2) {
    // Has first and last name
    const first = parts[0].charAt(0).toUpperCase();
    const last = parts[1].charAt(0).toUpperCase();
    return first + last;
  }
  // Only first name → take first two chars
  return fullName.substring(0, 2).toUpperCase();
}

export const fgetLanguageName = (code: string) => {
  const language = languages.find(
    (lang: { code: string; flag: string; name: string }) => lang.code === code
  );
  return language ? `${language.flag} ${language.name}` : code;
};
