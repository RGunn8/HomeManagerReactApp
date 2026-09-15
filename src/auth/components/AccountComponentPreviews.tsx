import { preview } from "radon-ide";
import { AccountInfoTextInput } from "./AccountInfoTextInput";

export default function AccountComponentPreviews() {
  preview(
    <AccountInfoTextInput
      text=""
      setText={() => {}}
      isEmail={true}
      placeholder="Email"
      autoCapitalize={false}
    />
  );

  return null;
}