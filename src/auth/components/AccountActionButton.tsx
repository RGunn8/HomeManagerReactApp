import { Pressable, Text } from "react-native";

type AccountActionButtonProps = {
  onClick: () => void;
  label: string;
  pendinglabel?: string;
  pending: boolean;
  disabled?: boolean;
};

export function AccountActionButton({ onClick, label, pendinglabel, pending, disabled }: AccountActionButtonProps) {
    return (
        <Pressable
              accessibilityRole="button"
              className="h-[54px] items-center justify-center rounded-button bg-clay active:opacity-80 disabled:opacity-60"
              disabled={disabled}
              onPress={onClick}>
              <Text className="font-sans-semibold text-[16.5px] text-card">
                {pending && pendinglabel ? pendinglabel : label}
              </Text>
            </Pressable>
    );
    }