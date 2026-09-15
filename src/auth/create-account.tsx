import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AccountActionButton } from './components/AccountActionButton';
import { AccountInfoTextInput } from './components/AccountInfoTextInput';
import { PasswordInput } from './components/PasswordInput';
import { useCreateAccount } from './hooks/use-create-account';

export default function CreateAccount() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailError, setEmailError] = useState('');
  const createAccountMutation = useCreateAccount();

  const passwordsMatch = password === confirmPassword;
  const enabled =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    email.trim() !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    passwordsMatch &&
    emailError === '' &&
    !createAccountMutation.isPending;

  function handleCreateAccount() {
    if (!enabled) {
      return;
    }

    createAccountMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  }

  function onBackPress() {
    router.back();
  }

  useEffect(() => {
    if (email.length === 0) {
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailRegex.test(email) ? '' : 'Please enter a valid email address.');
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [email]);

  return (
    <View className="flex-1 gap-4 bg-forest px-screen pt-safe-offset-screen dark:bg-forest-deep">
      <Pressable accessibilityRole="button" className="mt-14" onPress={onBackPress}>
        <Text className="font-serif-semibold text-2xl leading-[39px] tracking-[-1.08px] text-cream">
          Back
        </Text>
      </Pressable>

      <Text className="mt-4 font-serif-bold text-3xl text-cream">Create your account</Text>

      <Text className="mt-4 font-serif text-sm text-cream">
        You&apos;ll name the home and invite people next.
      </Text>

      <AccountInfoTextInput
        autoCapitalize
        isEmail={false}
        placeholder="First Name"
        setText={setFirstName}
        text={firstName}
      />
      <AccountInfoTextInput
        autoCapitalize
        isEmail={false}
        placeholder="Last Name"
        setText={setLastName}
        text={lastName}
      />
      <AccountInfoTextInput
        autoCapitalize={false}
        isEmail
        placeholder="Email"
        setText={setEmail}
        text={email}
      />

      {email.length > 0 && emailError ? <Text className="mt-1 text-sm text-clay-light">{emailError}</Text> : null}

      <PasswordInput password={password} placeholder="Password" setPassword={setPassword} />
      <PasswordInput password={confirmPassword} placeholder="Confirm Password" setPassword={setConfirmPassword} />

      {confirmPassword.length > 0 && !passwordsMatch ? (
        <Text className="mt-1 text-sm text-clay-light">Passwords do not match.</Text>
      ) : null}

      {createAccountMutation.error ? (
        <Text className="rounded-xl border border-clay-light/50 bg-clay/20 px-4 py-3 text-[14.5px] leading-5 text-error-tint">
          {createAccountMutation.error.message}
        </Text>
      ) : null}

      <AccountActionButton
        disabled={!enabled}
        label="Create Account"
        onClick={handleCreateAccount}
        pending={createAccountMutation.isPending}
        pendinglabel="Creating Account..."
      />
    </View>
  );
}
