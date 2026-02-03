import { RoleConstants } from '@/constants/Roles';

export type VideoType = 'CEO' | 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'PHARMACIST';

export interface AboutVideo {
  _id: string;
  video_type: VideoType;
  video_url: string;
  created_at: string;
  updated_at: string;
}

export interface GetAboutVideoByTypeResponse {
  success: boolean;
  data: AboutVideo;
}

// Role constant to video type mapping
export const roleToVideoType: Record<RoleConstants, VideoType> = {
  [RoleConstants.CEO]: 'CEO',
  [RoleConstants.ADMIN]: 'ADMIN',
  [RoleConstants.DOCTOR]: 'DOCTOR',
  [RoleConstants.NURSE]: 'NURSE',
  [RoleConstants.RECEPTIONIST]: 'RECEPTIONIST',
  [RoleConstants.PHARMACIST]: 'PHARMACIST',
};
