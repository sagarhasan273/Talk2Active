import { UserPrivacySettingsSchema } from 'src/schemas/settings';
import { z as zod } from 'zod';

export type UserPrivacySettingUpdateType = zod.infer<typeof UserPrivacySettingsSchema>;