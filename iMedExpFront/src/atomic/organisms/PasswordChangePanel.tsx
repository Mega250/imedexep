import { useState } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { TextField } from "@/atomic/atoms/TextField";
import { changePassword } from "@/services/api/accountApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type PasswordChangePanelProps = {
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

function isStrongPassword(value: string): boolean {
  return (
    value.length >= 8 &&
    /[A-ZÁÉÍÓÚÜÑ]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

export function PasswordChangePanel({ style, compact = false }: PasswordChangePanelProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (busy) return;
    setMessage(null);
    setError(null);

    if (!currentPassword.trim()) {
      setError("Escribe tu contraseña actual.");
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setError("La nueva contraseña necesita 8 caracteres, mayúscula, número y símbolo.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("La confirmación no coincide.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("La nueva contraseña debe ser distinta.");
      return;
    }

    setBusy(true);
    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage(response.message || "Contraseña actualizada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar la contraseña.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.panel, compact ? styles.compactPanel : null, style]}>
      <View style={styles.head}>
        <Text style={styles.title}>Seguridad</Text>
        <Text style={styles.subtitle}>Cambia tu contraseña sin salir de la sesión.</Text>
      </View>
      <View style={[styles.fields, compact ? styles.compactFields : null]}>
        <TextField
          label="Contraseña actual"
          placeholder="Tu contraseña actual"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <TextField
          label="Nueva contraseña"
          placeholder="8+ caracteres"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <TextField
          label="Confirmar contraseña"
          placeholder="Repite la nueva contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
      <Button
        label={busy ? "Actualizando..." : "Actualizar contraseña"}
        iconLeft="lock"
        variant="accent"
        size="md"
        onPress={handleSubmit}
        disabled={busy}
        style={styles.action}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    padding: 18
  },
  compactPanel: {
    borderRadius: radii.lg,
    padding: 14
  },
  head: {
    gap: 4,
    marginBottom: 14
  },
  title: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  subtitle: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    lineHeight: 16
  },
  fields: {
    gap: 10
  },
  compactFields: {
    gap: 8
  },
  error: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.alert,
    marginTop: 10,
    lineHeight: 15
  },
  success: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ok,
    marginTop: 10,
    lineHeight: 15
  },
  action: {
    marginTop: 12
  }
});
