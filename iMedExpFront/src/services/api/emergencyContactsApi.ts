import { authedRequest } from "@/services/api/authedRequest";

export type EmergencyContact = {
  id: number;
  patient_id: number;
  full_name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
};

export type EmergencyContactCreate = {
  full_name: string;
  phone: string;
  relationship: string;
  is_primary?: boolean;
};

export type EmergencyContactUpdate = Partial<EmergencyContactCreate>;

export function fetchEmergencyContacts(patientId: number): Promise<EmergencyContact[]> {
  return authedRequest<EmergencyContact[]>(`/api/v1/emergency-contacts/${patientId}`, {
    method: "GET"
  });
}

export function postEmergencyContact(patientId: number, payload: EmergencyContactCreate): Promise<EmergencyContact> {
  return authedRequest<EmergencyContact>(`/api/v1/emergency-contacts/${patientId}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function patchEmergencyContact(contactId: number, payload: EmergencyContactUpdate): Promise<EmergencyContact> {
  return authedRequest<EmergencyContact>(`/api/v1/emergency-contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteEmergencyContact(contactId: number): Promise<void> {
  return authedRequest<void>(`/api/v1/emergency-contacts/${contactId}`, {
    method: "DELETE"
  });
}
