import { authedRequest } from "@/services/api/authedRequest";

export type ReminderPreference = {
  patient_id: number;
  medication_enabled: boolean;
  medication_every_hours: number;
  appointment_enabled: boolean;
  appointment_hours_before: number;
  email_enabled: boolean;
  last_medication_reminder_at: string | null;
};

export type ReminderPreferenceUpdate = {
  medication_enabled?: boolean;
  medication_every_hours?: number;
  appointment_enabled?: boolean;
  appointment_hours_before?: number;
  email_enabled?: boolean;
};

export type ReminderRunResult = { created: number; medication: number; appointments: number };

export const getReminderPreferences = () => authedRequest<ReminderPreference>("/api/v1/reminders/me");

export const updateReminderPreferences = (body: ReminderPreferenceUpdate) =>
  authedRequest<ReminderPreference>("/api/v1/reminders/me", {
    method: "PUT",
    body: JSON.stringify(body)
  });

export const runMyReminders = () =>
  authedRequest<ReminderRunResult>("/api/v1/reminders/run/me", { method: "POST" });
