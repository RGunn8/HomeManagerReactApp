import { TextInput } from "react-native";


type AccountInfoTextInputProps = {
    text: string;
    setText: (text: string) => void;
    isEmail: boolean;
    placeholder: string;
    autoCapitalize:boolean;
}

export function AccountInfoTextInput(accountInfoTextInputProps: AccountInfoTextInputProps) {
    return ( <TextInput
            autoCapitalize={accountInfoTextInputProps.autoCapitalize ? "words" : "none"}
            className="h-[54px] w-full rounded-input border border-cream/20 bg-cream/10 px-[18px] text-base text-cream"
            onChangeText={accountInfoTextInputProps.setText}
            placeholder= {accountInfoTextInputProps.placeholder}
            placeholderTextColor="rgba(244,239,228,0.55)"
            cursorColor="rgba(244,239,228,0.55)"
            selectionColor="rgba(244,239,228,0.55)"
            textContentType= {accountInfoTextInputProps.isEmail ? "emailAddress" : "name"}
            value={accountInfoTextInputProps.text}
        />
    )
}








