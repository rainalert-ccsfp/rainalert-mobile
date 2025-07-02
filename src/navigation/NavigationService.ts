import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: object) {
  if ((navigationRef as any).isReady()) {
    if (params) {
      (navigationRef as any).navigate(name, params);
    } else {
      (navigationRef as any).navigate(name);
    }
  }
} 