import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

type SpeechRecognition = typeof import('expo-speech-recognition');

/**
 * expo-speech-recognition needs its native module, which Expo Go doesn't include. The package is only
 * loaded when that module is present, so the app still runs in Expo Go with voice entry turned off.
 */
export const isSpeechRecognitionAvailable =
  Platform.OS === 'web' || requireOptionalNativeModule('ExpoSpeechRecognition') != null;

// eslint-disable-next-line @typescript-eslint/no-require-imports -- a static import would load the missing native module
const speech: SpeechRecognition | null = isSpeechRecognitionAvailable ? require('expo-speech-recognition') : null;

export const ExpoSpeechRecognitionModule = speech?.ExpoSpeechRecognitionModule;

export const useSpeechRecognitionEvent: SpeechRecognition['useSpeechRecognitionEvent'] =
  speech?.useSpeechRecognitionEvent ?? (() => {});

export const speechUnavailableMessage = 'Voice entry needs a development build. It isn’t available in Expo Go.';
