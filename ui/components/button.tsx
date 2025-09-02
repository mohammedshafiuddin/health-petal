import React from "react";
import { Button as PaperButton, ButtonProps } from "react-native-paper";
// import { useTheme } from "../hooks/theme-context";
import { TouchableOpacity } from "react-native";
import MyText from "./text";
import { useTheme } from "@/app/hooks/theme.context";

// Omit 'children' from ButtonProps so it can't be passed
interface Props extends Omit<ButtonProps, "children"> {
  variant?: "blue" | "red" | "green";
  fillColor?: keyof ReturnType<typeof useTheme>["theme"]["colors"];
  textColor?: keyof ReturnType<typeof useTheme>["theme"]["colors"];
  borderColor?: keyof ReturnType<typeof useTheme>["theme"]["colors"];
  fullWidth?: boolean;
  textContent?: string;
  children?: React.ReactNode;
}

function MyButton({
  variant = "blue",
  fullWidth,
  fillColor,
  textColor,
  borderColor,
  children,
  textContent,
  ...props
}: Props) {
  const { colors } = useTheme().theme;
  let backgroundColor = colors.blue1;
  if (variant === "red") backgroundColor = colors.red1;
  if (variant === "green") backgroundColor = colors.green1;
  if (fillColor && colors[fillColor]) backgroundColor = colors[fillColor];
  let labelColor = "#fff";
  if (textColor && colors[textColor]) labelColor = colors[textColor];
  let borderCol = backgroundColor;
  if (borderColor && colors[borderColor]) borderCol = colors[borderColor];
  // Default font weight 400 (as string literal)
  const labelStyle = {
    color: labelColor,
    fontWeight: "400" as const,
    ...(props.labelStyle as object),
  };
  return (
    <PaperButton
      {...props}
      style={[
        {
          backgroundColor,
          borderRadius: 8,
          alignSelf: "flex-start",
          borderWidth: 1,
          borderColor: borderCol,
          opacity: props.disabled ? 0.7 : 1,
          // cursor: props.disabled ? "not-allowed" : "pointer",
          ...(fullWidth && { width: "100%" }),
        },
        props.style && props.style,
      ]}
      labelStyle={labelStyle}
    >
      {textContent ? <MyText>{textContent}</MyText> : children}
    </PaperButton>
  );
}

// MyTextButton props: same as Props, but no children and with an extra 'text' property
interface MyTextButtonProps extends Omit<Props, "children"> {
  text: string;
}

export function MyTextButton({
  variant = "blue",
  fillColor,
  textColor,
  text,
  ...props
}: MyTextButtonProps) {
  return (
    <MyButton
      variant={variant}
      fillColor={fillColor}
      textColor={textColor}
      {...props}
    >
      {text}
    </MyButton>
  );
}

export default MyButton;
