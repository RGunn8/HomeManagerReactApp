import { router } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDeleteAccount, useSignOut } from '@/auth/hooks/use-sign-out';
import { TopBarButton } from '@/components/top-bar-button';
import { selectionHaptic } from '@/lib/haptics';
import { usePendingChangeCount } from '@/lib/offline/offline-mutation';

export default function SettingsScreen() {
    const signOut = useSignOut();
    const deleteAccount = useDeleteAccount();
    const pendingChangeCount = usePendingChangeCount();

    function handleSignOut() {
        void selectionHaptic();
        if (pendingChangeCount === 0) {
            void signOut();
            return;
        }
        Alert.alert(
            'Changes not synced',
            `${pendingChangeCount} ${pendingChangeCount === 1 ? 'change hasn\'t' : 'changes haven\'t'} reached the server yet and will be lost if you sign out. Connect to the internet to sync them first.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign out anyway', style: 'destructive', onPress: () => void signOut() },
            ],
        );
    }

    function handleDeleteAccount() {
        void selectionHaptic();
        Alert.alert(
            'Delete account',
            'This permanently deletes your account and its tasks, inventory and shopping lists. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteAccount.mutate(undefined, {
                        onError: (error) => Alert.alert('Could not delete account', error.message),
                    }),
                },
            ],
        );
    }

    function handleBack() {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-canvas px-screen" edges={['top']}>
            <View className="h-12 flex-row items-center justify-between">
                <TopBarButton label="Back" onPress={handleBack} />
                <Text className="font-sans-semibold text-[16px] text-ink">Settings</Text>
                <View className="w-14" />
            </View>
            <View className="flex-1 justify-center">
                <View className="rounded-card border border-hairline bg-card p-5">
                    <Text className="font-serif-semibold text-[30px] leading-[34px] text-ink">
                        Sign out
                    </Text>
                    <Text className="mt-3 font-sans text-[15px] leading-[23px] text-ink-muted">
                        Sign out of your account on this device.
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        className="mt-8 h-[54px] items-center justify-center rounded-button bg-overdue active:opacity-80"
                        onPress={handleSignOut}>
                        <Text className="font-sans-semibold text-[16.5px] text-white">
                            Sign out
                        </Text>
                    </Pressable>
                </View>

                <View className="mt-4 rounded-card border border-hairline bg-card p-5">
                    <Text className="font-serif-semibold text-[30px] leading-[34px] text-ink">
                        Delete account
                    </Text>
                    <Text className="mt-3 font-sans text-[15px] leading-[23px] text-ink-muted">
                        Permanently delete your account and all of its data.
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        className="mt-8 h-[54px] items-center justify-center rounded-button border border-overdue active:opacity-80"
                        onPress={handleDeleteAccount}>
                        <Text className="font-sans-semibold text-[16.5px] text-overdue">
                            Delete account
                        </Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}