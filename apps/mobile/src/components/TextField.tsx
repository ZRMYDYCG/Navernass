import { StyleSheet, Text, TextInput, View } from "react-native";

const colors = {
  foreground: "#1c1917",
  mutedForeground: "#78716c",
  border: "#d6d3d1",
  white: "#ffffff",
};

export function TextField({
  label,
  value,
  placeholder,
  secureTextEntry,
  multiline,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  label: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.foreground,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 112,
    textAlignVertical: "top",
  },
});
