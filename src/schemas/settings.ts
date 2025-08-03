import { UserSchema } from "./user";

// Then create a subset schema for the form
export const UserPrivacySettingsSchema = UserSchema.pick({
    id: true,
    profileVisibility: true,
    allowMessagesFrom: true,
    showActivityStatus: true,
    showReadReceipts: true,
    showLastSeen: true,
}).required({ id: true });