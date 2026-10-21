/**
 * Analytics codes have been migrated into the Profile component (`ProfileModal.tsx`).
 * Re-exporting ProfileModal for backwards compatibility.
 */
import ProfileModal, { type ProfileModalProps } from "./ProfileModal";

export default ProfileModal;
export type { ProfileModalProps as AnalyticsCardProps };
