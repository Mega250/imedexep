import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FormField } from "@/atomic/molecules/FormField";
import { SelectField } from "@/atomic/molecules/SelectField";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import {
  PatientEditableValues,
  GENDER_LABELS,
  genderLabelFromValue,
  genderValueFromLabel,
  validatePatientDraft
} from "@/atomic/pages/doctor/patientEditForm";

type EditPatientSheetProps = {
  visible: boolean;
  initial: PatientEditableValues;
  submitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: PatientEditableValues) => void;
};

export function EditPatientSheet({
  visible,
  initial,
  submitting = false,
  error,
  onClose,
  onSubmit
}: EditPatientSheetProps) {
  const [values, setValues] = useState<PatientEditableValues>(initial);
  const [localError, setLocalError] = useState<string | null>(null);

  const set = (k: keyof PatientEditableValues) => (v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  function submit() {
    const validationError = validatePatientDraft(values);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    onSubmit(values);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Editar datos del paciente</Text>
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            <FormField label="Nombre" value={values.first_name} onChangeText={set("first_name")} autoCapitalize="words" />
            <FormField label="Apellidos" value={values.last_name} onChangeText={set("last_name")} autoCapitalize="words" />
            <SelectField
              label="Sexo"
              placeholder="Selecciona…"
              value={genderLabelFromValue(values.gender)}
              options={GENDER_LABELS}
              onValueChange={(label) => set("gender")(genderValueFromLabel(label))}
            />
            <FormField label="Tipo de sangre" placeholder="O+, A-, …" value={values.blood_type} onChangeText={set("blood_type")} autoCapitalize="characters" />
            <FormField label="Teléfono" value={values.phone} onChangeText={set("phone")} keyboardType="phone-pad" />
            <FormField label="Calle y número" value={values.street_address} onChangeText={set("street_address")} />
            <FormField label="Colonia" value={values.neighborhood} onChangeText={set("neighborhood")} />
            <FormField label="Código postal" value={values.postal_code} onChangeText={set("postal_code")} keyboardType="numeric" />
            <FormField label="Ciudad" value={values.city} onChangeText={set("city")} />
            <FormField label="Estado" value={values.state} onChangeText={set("state")} />
            {error || localError ? <Text style={styles.error}>{error ?? localError}</Text> : null}
          </ScrollView>
          <View style={styles.actions}>
            <Button label="Cancelar" variant="ghost" size="sm" block={false} onPress={onClose} />
            <Button label={submitting ? "Guardando…" : "Guardar"} size="sm" block={false} onPress={submit} disabled={submitting} />
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
    maxWidth: 420,
    maxHeight: "88%",
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
