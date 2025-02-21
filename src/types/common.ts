import type { Dayjs } from 'dayjs';

// ------------------------------------------

export type IPaymentCard = {
    id: string;
    cardType: string;
    primary?: boolean;
    cardNumber: string;
}

export type ISocialLink = {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
}

export type IDatePickerControl = Dayjs | null;