import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AccountActionButton } from "./components/AccountActionButton";
import { AccountInfoTextInput } from "./components/AccountInfoTextInput";
import { PasswordInput } from "./components/PasswordInput";
import { useCreateAccount } from "./hooks/use-create-account";

export default function CreateAccount() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailError, setEmailError] = useState('');
      const createAccountMutation = useCreateAccount();
    const enabled =
        firstName.trim() !== '' &&
        lastName.trim() !== '' &&
        email.trim() !== '' &&
        password.trim() !== '' &&
        confirmPassword.trim() !== '' &&
        password === confirmPassword &&
        emailError === ''&&
         !createAccountMutation.isPending;;
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

    const AccountActionProps = {
        onClick: handleCreateAccount,
        label: 'Create Account',
        pendinglabel: 'Creating Account...',
        pending: false,
        disabled: !enabled,
    };

    function onBackPress()  {
                router.back();
    }

   useEffect(() => {
    // 1. Don't show an error if the user hasn't typed anything yet
    if (email.length === 0) {
      return;
    }

    // 2. Set a timer to validate 600ms AFTER the user stops typing
    const delayDebounceFn = setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address.');
      } else {
        setEmailError('');
      }
    }, 600); // 600ms pause threshold

    
    return () => clearTimeout(delayDebounceFn);
  }, [email]); 


    return(
        <View className="flex-1 flex-col bg-forest px-screen dark:bg-forest-deep gap-4 pt-safe-offset-screen ">

            <Pressable className="mt-14" onPress={onBackPress} >
                <Text className="font-serif-semibold text-2xl leading-[39px] tracking-[-1.08px] text-cream">
                    Back
                </Text>
            </Pressable>
            <Text className="mt-4 font-serif-bold text-3xl  text-cream">
                Create your account
            </Text>

            <Text className="mt-4 font-serif text-sm  text-cream">
                You&apos;ll name the home and invite people next.
            </Text>
                <AccountInfoTextInput text={firstName} setText={setFirstName} isEmail={false} placeholder="First Name" autoCapitalize={true} />
                <AccountInfoTextInput text={lastName} setText={setLastName} isEmail={false} placeholder="Last Name" autoCapitalize={true} />
                <AccountInfoTextInput text={email} setText={setEmail} isEmail={true} placeholder="Email" autoCapitalize={false} />

            {email.length > 0 && emailError ? (
                <Text className="text-red-500 text-sm mt-1">{emailError}</Text>
            ) : null}
                        <PasswordInput password={password} setPassword={setPassword} placeholder="Password" />

                        <PasswordInput password={confirmPassword} placeholder="Confirm Password" setPassword={setConfirmPassword} />
      

            <AccountActionButton {...AccountActionProps} />
        </View>
    );
}