import { onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';

const isOnline = (state: Network.NetworkState) =>
  Boolean(state.isConnected) && state.isInternetReachable !== false;

/** Drives TanStack's online state from the device's connection, so queued changes pause and resume. */
onlineManager.setEventListener((setOnline) => {
  void Network.getNetworkStateAsync().then((state) => setOnline(isOnline(state)));
  const subscription = Network.addNetworkStateListener((state) => setOnline(isOnline(state)));
  return () => subscription.remove();
});
