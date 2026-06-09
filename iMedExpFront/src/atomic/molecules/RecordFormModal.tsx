import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FormField } from "@/atomic/molecules/FormField";
import { SelectField } from "@/atomic/molecules/SelectField";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

export type RecordField = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  keyboardType?: "default" | "numeric" | "phone-pad";
  type?: "text" | "select";
  options?: string[];
};

type RecordFormModalProps = {
  visible: boolean;
  title: string;
  fields: RecordField[];
  submitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
};

export function RecordFormModal({
  visible,
  title,
  fields,
  submitting = false,
  error,
  onClose,
  onSubmit
}: RecordFormModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  const set = (k: string) => (v: string) => setValues((prev) => ({ ...prev, [k]: v }));

  function submit() {
    for (const f of fields) {
      if (f.required && !(values[f.key] ?? "").trim()) {
        setLocalError(`${f.label} es obligatorio.`);
        return;
      }
    }
    setLocalError(null);
    const cleaned: Record<string, string> = {};
    for (const f of fields) {
      const v = (values[f.key] ?? "").trim();
      if (v) cleaned[f.key] = v;
    }
    onSubmit(cleaned);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" presentationStyle="overFullScreen" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
            {fields.map((f) =>
              f.type === "select" || f.options ? (
                <SelectField
                  key={f.key}
                  label={f.label}
                  placeholder={f.placeholder ?? "Selecciona…"}
                  value={values[f.key] ?? ""}
                  options={f.options}
                  onValueChange={set(f.key)}
                />
              ) : (
                <FormField
                  key={f.key}
                  label={f.label}
                  placeholder={f.placeholder ?? ""}
                  value={values[f.key] ?? ""}
                  onChangeText={set(f.key)}
                  keyboardType={f.keyboardType}
                />
              )
            )}
            {error || localError ? <Text style={styles.error}>{error ?? localError}</Text> : null}
          </ScrollView>
          <View style={styles.actions}>
            <Button label="Cancelar" variant="ghost" size="sm" block={false} onPress={onClose} />
            <Button
              label={submitting ? "Guardando…" : "Guardar"}
              size="sm"
              block={false}
              onPress={submit}
              disabled={submitting}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(3,4,94,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  card: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "86%",
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: 20
  },
  title: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 12
  },
  body: {
    flexGrow: 0
  },
  bodyContent: {
    gap: 12
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16
  }
});
