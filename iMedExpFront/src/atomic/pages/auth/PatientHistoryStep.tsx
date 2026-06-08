import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FormField } from "@/atomic/molecules/FormField";
import { MultiSelectField } from "@/atomic/molecules/MultiSelectField";
import { SelectField } from "@/atomic/molecules/SelectField";
import {
  BIRTH_TYPE_OPTIONS,
  COOKING_MATERIAL_OPTIONS,
  COOKING_METHOD_OPTIONS,
  DISEASE_OPTIONS,
  HEREDITARY_OPTIONS,
  PatientRegisterForm,
  VACCINE_OPTIONS,
  YES_NO_OPTIONS
} from "@/atomic/pages/auth/patientRegistration";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

type PatientHistoryStepProps = {
  form: PatientRegisterForm;
  setForm: (updater: (prev: PatientRegisterForm) => PatientRegisterForm) => void;
};

function Section({ title, caption, children }: { title: string; caption?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function PatientHistoryStep({ form, setForm }: PatientHistoryStepProps) {
  const setText = (key: keyof PatientRegisterForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const setList = (key: keyof PatientRegisterForm) => (value: string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <View style={styles.wrap}>
      <Section title="Antecedentes heredofamiliares" caption="Enfermedades en tu familia directa.">
        <MultiSelectField
          label="¿Qué enfermedades hay en tu familia?"
          options={HEREDITARY_OPTIONS}
          values={form.hereditary}
          onChange={setList("hereditary")}
          exclusiveValues={["Ninguna"]}
        />
        <FormField
          label="Detalle (parentesco y enfermedad)"
          placeholder="Ej. Padre con diabetes, abuela con cáncer"
          value={form.hereditaryDetail}
          onChangeText={setText("hereditaryDetail")}
        />
      </Section>

      <Section title="Antecedentes no patológicos" caption="Estilo de vida y entorno.">
        <MultiSelectField
          label="Esquema de vacunación recibido"
          options={VACCINE_OPTIONS}
          values={form.vaccines}
          onChange={setList("vaccines")}
        />
        <FormField
          label="Otras vacunas"
          placeholder="Vacunas no listadas"
          value={form.vaccinesOther}
          onChangeText={setText("vaccinesOther")}
        />
        <SelectField
          label="¿Sufre de algún tipo de alergia?"
          options={YES_NO_OPTIONS}
          value={form.allergiesHas}
          onValueChange={setText("allergiesHas")}
        />
        {form.allergiesHas === "Sí" ? (
          <FormField
            label="¿Cuáles?"
            placeholder="Medicamentos, alimentos, ambiente"
            value={form.allergies}
            onChangeText={setText("allergies")}
          />
        ) : null}
        <SelectField
          label="¿Cuenta con drenaje y alcantarillado?"
          options={YES_NO_OPTIONS}
          value={form.serviceDrainage}
          onValueChange={setText("serviceDrainage")}
        />
        <SelectField
          label="¿Cuenta con agua potable?"
          options={YES_NO_OPTIONS}
          value={form.serviceWater}
          onValueChange={setText("serviceWater")}
        />
        <SelectField
          label="¿Cuenta con electricidad?"
          options={YES_NO_OPTIONS}
          value={form.serviceElectricity}
          onValueChange={setText("serviceElectricity")}
        />
        <FormField
          label="¿Cuántas personas viven en su casa?"
          placeholder="Número de personas"
          keyboardType="number-pad"
          value={form.household}
          onChangeText={(v) => setText("household")(v.replace(/\D/g, "").slice(0, 3))}
        />
        <SelectField
          label="Material que utiliza para cocinar"
          options={COOKING_MATERIAL_OPTIONS}
          value={form.cookingMaterial}
          onValueChange={setText("cookingMaterial")}
        />
        <SelectField
          label="Método que utiliza para cocinar"
          options={COOKING_METHOD_OPTIONS}
          value={form.cookingMethod}
          onValueChange={setText("cookingMethod")}
        />
        <FormField
          label="¿Qué tipo de alimentación consume diariamente?"
          placeholder="Ej. balanceada, alta en carbohidratos…"
          value={form.diet}
          onChangeText={setText("diet")}
        />
        <SelectField
          label="¿Practica algún deporte?"
          options={YES_NO_OPTIONS}
          value={form.sportHas}
          onValueChange={setText("sportHas")}
        />
        {form.sportHas === "Sí" ? (
          <FormField
            label="¿Cuál?"
            placeholder="Deporte y frecuencia"
            value={form.sport}
            onChangeText={setText("sport")}
          />
        ) : null}
      </Section>

      <Section title="Antecedentes patológicos" caption="Tu historia médica personal.">
        <SelectField
          label="Tipo de nacimiento"
          options={BIRTH_TYPE_OPTIONS}
          value={form.birthType}
          onValueChange={setText("birthType")}
        />
        <FormField
          label="¿Presentó alguna complicación al nacer?"
          placeholder="Describe si aplica"
          value={form.birthComplications}
          onChangeText={setText("birthComplications")}
        />
        <MultiSelectField
          label="¿Qué enfermedades ha padecido?"
          options={DISEASE_OPTIONS}
          values={form.diseases}
          onChange={setList("diseases")}
          exclusiveValues={["Ninguna"]}
        />
        <FormField
          label="Otras enfermedades"
          placeholder="Enfermedades no listadas"
          value={form.diseasesOther}
          onChangeText={setText("diseasesOther")}
        />
        <FormField
          label="¿Le han practicado alguna cirugía? ¿Cuáles?"
          placeholder="Tipo de cirugía y fecha"
          value={form.surgeries}
          onChangeText={setText("surgeries")}
        />
        <FormField
          label="¿Ha estado hospitalizado? Causa(s)"
          placeholder="Motivo y número de veces"
          value={form.hospitalizations}
          onChangeText={setText("hospitalizations")}
        />
        <SelectField
          label="¿Ha recibido transfusión sanguínea?"
          options={YES_NO_OPTIONS}
          value={form.transfusions}
          onValueChange={setText("transfusions")}
        />
        <SelectField
          label="¿Ha convulsionado alguna vez?"
          options={YES_NO_OPTIONS}
          value={form.seizures}
          onValueChange={setText("seizures")}
        />
        <FormField
          label="¿Ha tenido algún traumatismo? ¿Cuál?"
          placeholder="Menciona cuál o cuáles"
          value={form.trauma}
          onChangeText={setText("trauma")}
        />
      </Section>

      <Section title="Padecimiento actual" caption="El motivo por el que acudes hoy.">
        <FormField
          label="Describe tu padecimiento actual"
          placeholder="Molestia principal o motivo médico"
          value={form.currentCondition}
          onChangeText={setText("currentCondition")}
        />
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 18
  },
  section: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.rule2
  },
  sectionHead: {
    gap: 2
  },
  sectionTitle: {
    fontFamily: family.semibold,
    fontSize: 15,
    letterSpacing: -0.2,
    color: colors.ink
  },
  sectionCaption: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3
  },
  sectionBody: {
    gap: 12
  }
});
