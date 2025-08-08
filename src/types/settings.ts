import { UpdateUserAppearanceSchema, UpdateUserNotificationSchema, UserPrivacySettingsSchema } from 'src/schemas/settings';
import { z as zod } from 'zod';

export type UserPrivacySettingUpdateType = zod.infer<typeof UserPrivacySettingsSchema>;
export type UpdateUserNotificationType = zod.infer<typeof UpdateUserNotificationSchema>
export type UpdateUserAppearanceType = zod.infer<typeof UpdateUserAppearanceSchema>