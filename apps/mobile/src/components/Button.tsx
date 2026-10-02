import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

const colors = {
  foreground: "#1c1917",
  border: "#d6d3d1",
  primary: "#1c1917",
  white: "#ffffff",
  muted: "#fafaf9",
};

export function Button({
  children,
  disabled,
  loading,
  variant = "primary",
  compact = false,
  onPress,
}: {
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
  compact?: boolean;
  onPress?: () => void;
}) {
  const secondary = variant === "secondary";
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.root,
        compact && styles.compact,
        secondary ? styles.secondary : styles.primary,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.foreground : colors.white} />
      ) : (
        <Text style={[styles.label, secondary ? styles.secondaryLabel : styles.primaryLabel]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  compact: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  primaryLabel: {
    color: colors.white,
  },
  secondaryLabel: {
    color: colors.foreground,
  },
});
