import * as Application from 'expo-application';
import Constants from 'expo-constants';

export const appInfo = {
  appName: Application.applicationName ?? Constants.expoConfig?.name ?? 'Home Manager',
  appId: Application.applicationId,
  nativeApplicationVersion: Application.nativeApplicationVersion,
  nativeBuildVersion: Application.nativeBuildVersion,
  expoRuntimeVersion: Constants.expoConfig?.runtimeVersion,
};
