import { TextInput } from 'react-native';

type PasswordInputProps = {
  password: string;
  setPassword: (password: string) => void;
  placeholder?: string;
};

export function PasswordInput({ password, placeholder = 'Password', setPassword }: PasswordInputProps) {
  return (
    <TextInput
      autoCapitalize="none"
      autoComplete="password"
      className="h-[54px] w-full rounded-input border border-cream/20 bg-cream/10 px-[18px] text-base text-cream"
      onChangeText={setPassword}
      placeholder={placeholder}
      placeholderTextColor="rgba(244,239,228,0.55)"
      secureTextEntry
      textContentType="password"
      value={password}
    />
  );
}
