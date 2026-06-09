const APPOINTMENT_STATUS_ES: Record<string, string> = {
  scheduled: "Programada",
  confirmed: "Confirmada",
  in_progress: "En consulta",
  completed: "Atendida",
  cancelled: "Cancelada",
  canceled: "Cancelada",
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  no_show: "No asistió"
};

export function statusLabel(status: string | null | undefined): string {
  if (!status) {
    return "—";
  }
  const key = String(status).toLowerCase().trim();
  return APPOINTMENT_STATUS_ES[key] ?? status;
}
