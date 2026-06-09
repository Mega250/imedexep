let selectedInstitutionId: number | null = null;

export function setSelectedInstitutionId(id: number | null): void {
  selectedInstitutionId = id;
}

export function getSelectedInstitutionId(): number | null {
  return selectedInstitutionId;
}

export function clearSelectedInstitutionId(): void {
  selectedInstitutionId = null;
}
