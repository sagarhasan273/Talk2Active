import type { Country } from 'react-phone-number-input/input';
import type { SxProps, Theme } from '@mui/material/styles';
import type { TextFieldProps } from '@mui/material/TextField';

export type PhoneInputProps = Omit<
  TextFieldProps,
  'onChange' | 'ref'
> & {
  value: string;
  country?: Country;
  disableSelect?: boolean;
  onChange: (newValue: string) => void;
};

export type CountryListProps = {
  sx?: SxProps<Theme>;
  countryCode?: Country;
  searchCountry: string;
  onClickCountry: (inputValue: Country) => void;
  onSearchCountry: (inputValue: string) => void;
};
