import type { Dayjs } from 'dayjs';

// ----------------------------------------------------------------------

export type IPaymentCard = {
  id: string;
  cardType: string;
  primary?: boolean;
  cardNumber: string;
};

export type IAddressItem = {
  id?: string;
  name: string;
  company?: string;
  primary?: boolean;
  fullAddress: string;
  phoneNumber?: string;
  addressType?: string;
};

export type IDateValue = string | number | null;

export type IDatePickerControl = Dayjs | null;

export type ISocialLink = {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type ResponseSuccess = {
  status: boolean;
  message: string;
  data: any;
  metaData?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};
export type ResponseError = {
  status: boolean;
  message: string;
  data?: any;
};

export type ResponseType = ResponseSuccess | ResponseError;
