import { RHFCode } from './input-code';
import { RHFRating } from './input-rating';
import { RHFEditor } from './input-editor';
import { RHFSlider } from './input-slider';
import { RHFTextField } from './input-text-field';
import { RHFRadioGroup } from './input-radio-group';
import { RHFPhoneInput } from './input-phone-input';
import { RHFAutocomplete } from './input-autocomplete';
import { RHFCountrySelect } from './input-country-select';
import { RHFSwitch, RHFMultiSwitch } from './input-switch';
import { RHFSelect, RHFMultiSelect } from './input-select';
import { RHFCheckbox, RHFMultiCheckbox } from './input-checkbox';
import { RHFUpload, RHFUploadBox, RHFUploadAvatar } from './input-upload';
import { RHFDatePicker, RHFMobileDateTimePicker } from './input-date-picker';

// ----------------------------------------------------------------------

export const Field = {
  Code: RHFCode,
  Editor: RHFEditor,
  Select: RHFSelect,
  Upload: RHFUpload,
  Switch: RHFSwitch,
  Slider: RHFSlider,
  Rating: RHFRating,
  Text: RHFTextField,
  Phone: RHFPhoneInput,
  Checkbox: RHFCheckbox,
  UploadBox: RHFUploadBox,
  RadioGroup: RHFRadioGroup,
  DatePicker: RHFDatePicker,
  MultiSelect: RHFMultiSelect,
  MultiSwitch: RHFMultiSwitch,
  UploadAvatar: RHFUploadAvatar,
  Autocomplete: RHFAutocomplete,
  MultiCheckbox: RHFMultiCheckbox,
  CountrySelect: RHFCountrySelect,
  MobileDateTimePicker: RHFMobileDateTimePicker,
};
