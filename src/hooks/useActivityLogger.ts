import { useCallback } from 'react';
import { activityApi, ActivityLogPayload } from '../api';
import { useAuth } from '../contexts/AuthContext';

export const useActivityLogger = () => {
  const { user } = useAuth();

  const track = useCallback(
    async (action: string, module: string, description: string, metadata?: Record<string, any>) => {
      if (!user) return;

      try {
        const resourceId = metadata?.case_number || metadata?.referral_number || metadata?.registration_id || metadata?.case_id || metadata?.referral_id;

        const payload: ActivityLogPayload = {
          user_id: user.id,
          action,
          module,
          description,
          device_id: getDeviceId(),
          metadata,
          resource_id: resourceId,
        };

        await activityApi.logActivity(payload);
      } catch (error) {
        console.error('Activity logging failed:', error);
      }
    },
    [user]
  );

  return { track };
};

const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

const generateDeviceId = (): string => {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
