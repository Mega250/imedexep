from fpdf import FPDF


def _latin1(text: str) -> str:
    return (text or "").encode("latin-1", "replace").decode("latin-1")


def certificate_pdf(title: str, body: str, folio: int, issued_at: str, doctor_label: str) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 8, _latin1("iMedExp - Certificado medico"), ln=True)
    pdf.set_draw_color(200, 200, 200)
    pdf.line(10, pdf.get_y() + 1, 200, pdf.get_y() + 1)
    pdf.ln(8)
    pdf.set_font("Helvetica", "B", 20)
    pdf.multi_cell(0, 11, _latin1(title))
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 12)
    pdf.multi_cell(0, 8, _latin1(body))
    pdf.ln(10)
    pdf.set_font("Helvetica", "I", 10)
    pdf.cell(0, 7, _latin1(f"Folio: {folio}"), ln=True)
    pdf.cell(0, 7, _latin1(f"Emitido: {issued_at}"), ln=True)
    pdf.cell(0, 7, _latin1(f"Medico: {doctor_label}"), ln=True)
    return bytes(pdf.output())
