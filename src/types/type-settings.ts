import type { z as zod } from 'zod';
import type {
  UserPrivacySettingsSchema,
  UpdateUserAppearanceSchema,
  UpdateUserNotificationSchema,
} from 'src/schemas/schema-settings';

export type UserPrivacySettingUpdateType = zod.infer<typeof UserPrivacySettingsSchema>;
export type UpdateUserNotificationType = zod.infer<typeof UpdateUserNotificationSchema>;
export type UpdateUserAppearanceType = zod.infer<typeof UpdateUserAppearanceSchema>;
