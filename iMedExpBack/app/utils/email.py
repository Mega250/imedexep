import html
import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings


_BRAND_PRIMARY = "#03045E"
_BRAND_ACCENT = "#0096C7"
_BRAND_ACCENT_DEEP = "#023E8A"
_BRAND_PAPER = "#F1FAFE"
_BRAND_PAPER_SOFT = "#CAF0F8"
_BRAND_RULE = "#BFE2EF"
_BRAND_INK_2 = "#023E8A"
_BRAND_INK_3 = "#0077B6"


def _frontend_url(path: str = "") -> str:
    if not path:
        return settings.frontend_url
    return f"{settings.frontend_url}/{path.lstrip('/')}"


def _shell(title: str, preheader: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:{_BRAND_PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:{_BRAND_PRIMARY};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">{preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{_BRAND_PAPER};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#FFFFFF;border-radius:20px;border:1px solid {_BRAND_RULE};box-shadow:0 18px 40px -20px rgba(3,4,94,0.12);overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,{_BRAND_PRIMARY} 0%,{_BRAND_INK_2} 60%,{_BRAND_ACCENT_DEEP} 100%);padding:28px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:22px;letter-spacing:-0.02em;font-weight:600;color:#FFFFFF;">imedexp</td>
                <td align="right" style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Plataforma médica · MX</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 28px 40px;">{body_html}</td>
        </tr>
        <tr>
          <td style="padding:24px 40px 32px 40px;border-top:1px solid {_BRAND_RULE};background-color:{_BRAND_PAPER};">
            <p style="margin:0;font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:11px;color:{_BRAND_INK_3};letter-spacing:0.05em;">
              HIPAA · NOM-024-SSA3
            </p>
            <p style="margin:8px 0 0 0;font-size:11px;color:{_BRAND_INK_3};line-height:1.55;">
              Recibiste este correo porque alguien usó tu dirección en imedexp. Si no fuiste tú, puedes ignorarlo sin problema.
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:18px 0 0 0;font-size:11px;color:{_BRAND_INK_3};">© imedexp · CDMX, México</p>
    </td>
  </tr>
</table>
</body>
</html>"""


async def _send(to_email: str, subject: str, html: str) -> None:
    if not settings.mail_enabled:
        return
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"imedexp <{settings.mail_username}>"
    message["To"] = to_email
    message.attach(MIMEText(html, "html"))
    await aiosmtplib.send(
        message,
        hostname="smtp.gmail.com",
        port=465,
        username=settings.mail_username,
        password=settings.mail_password,
        use_tls=True,
    )


def _code_boxes(code: str) -> str:
    safe_code = html.escape(code)
    digits = (safe_code + "······")[:6]
    cells = "".join(
        f"""<td align="center" valign="middle" width="56" style="width:56px;padding:0 4px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td align="center" valign="middle" height="64" style="
                    height:64px;
                    background:#FFFFFF;
                    border:1.5px solid {_BRAND_ACCENT};
                    border-radius:12px;
                    font-family:'SFMono-Regular',Menlo,Consolas,monospace;
                    font-size:30px;
                    font-weight:700;
                    color:{_BRAND_PRIMARY};
                    letter-spacing:0;">{d}</td></tr>
              </table>
            </td>"""
        for d in digits
    )
    return f"""<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                 <tr>{cells}</tr>
               </table>"""


async def send_verification_code(email: str, code: str) -> None:
    boxes = _code_boxes(code)
    body = f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td>
    <p style="margin:0 0 12px 0;font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:{_BRAND_ACCENT};">
      Verificación · 6 dígitos
    </p>
    <h1 style="margin:0 0 10px 0;font-size:30px;line-height:1.1;letter-spacing:-0.02em;color:{_BRAND_PRIMARY};font-weight:600;">
      Tu código de acceso
    </h1>
    <p style="margin:0 0 28px 0;font-size:15px;line-height:1.55;color:{_BRAND_INK_2};">
      Escribe los siguientes 6 dígitos en imedexp para terminar de crear tu cuenta.
    </p>
  </td></tr>
  <tr><td style="padding:18px;background:linear-gradient(135deg,{_BRAND_PAPER} 0%,{_BRAND_PAPER_SOFT} 100%);border:1px solid {_BRAND_RULE};border-radius:18px;">
    {boxes}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
      <tr>
        <td align="left" style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:{_BRAND_INK_3};">
          ● Vigente · 10 min
        </td>
        <td align="right" style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:{_BRAND_INK_3};">
          imedexp · MX
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding-top:24px;">
    <p style="margin:0 0 8px 0;font-size:13.5px;line-height:1.6;color:{_BRAND_INK_2};">
      Si pides otro código, este dejará de funcionar de inmediato.
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:{_BRAND_INK_3};">
      ¿No iniciaste tú esta verificación? Puedes ignorar este correo, no se hará nada.
    </p>
  </td></tr>
</table>
"""
    await _send(email, "Tu código de verificación · imedexp", _shell("Verifica tu correo", f"Tu código es {code}", body))


async def send_password_reset(email: str, code: str) -> None:
    safe_code = html.escape(code)
    body = f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td>
    <p style="margin:0 0 12px 0;font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:{_BRAND_ACCENT};">
      Recuperación · código de un solo uso
    </p>
    <h1 style="margin:0 0 10px 0;font-size:30px;line-height:1.1;letter-spacing:-0.02em;color:{_BRAND_PRIMARY};font-weight:600;">
      Restablece tu contraseña
    </h1>
    <p style="margin:0 0 28px 0;font-size:15px;line-height:1.55;color:{_BRAND_INK_2};">
      Recibimos una solicitud para recuperar tu contraseña en imedexp. Usa el código de abajo en la pantalla de recuperación para crear una nueva contraseña.
    </p>
  </td></tr>
  <tr><td style="padding:22px;background:linear-gradient(135deg,{_BRAND_PAPER} 0%,{_BRAND_PAPER_SOFT} 100%);border:1px solid {_BRAND_RULE};border-radius:18px;">
    <p style="margin:0 0 10px 0;font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:{_BRAND_INK_3};text-align:center;">
      Código de recuperación
    </p>
    <p style="margin:0;font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:36px;letter-spacing:0.32em;text-align:center;color:{_BRAND_PRIMARY};font-weight:700;">
      {safe_code}
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
      <tr>
        <td align="left" style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:{_BRAND_INK_3};">
          ● Vigente · 15 min
        </td>
        <td align="right" style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:{_BRAND_INK_3};">
          imedexp · MX
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding-top:24px;">
    <p style="margin:0 0 8px 0;font-size:13.5px;line-height:1.6;color:{_BRAND_INK_2};">
      El código se anula automáticamente si pides otro o cuando termines de restablecer tu contraseña.
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:{_BRAND_INK_3};">
      ¿No solicitaste cambiar tu contraseña? Ignora este correo. Tu cuenta sigue protegida.
    </p>
  </td></tr>
</table>
"""
    await _send(
        email,
        "Restablece tu contraseña · imedexp",
        _shell("Recupera tu contraseña", f"Tu código de recuperación es {safe_code}", body),
    )


async def send_doctor_invitation(
    doctor_email: str,
    clinic_name: str,
    inviter_name: str | None = None,
) -> None:
    safe_clinic = html.escape(clinic_name)
    safe_inviter = html.escape(inviter_name) if inviter_name else None
    invitation_url = html.escape(_frontend_url("/screen/doc-invites"), quote=True)
    inviter_line = (
        f"<strong style=\"color:{_BRAND_PRIMARY};\">{safe_inviter}</strong> te invitó en nombre de "
        if safe_inviter
        else "Te invitaron a unirte a "
    )
    body = f"""
<h1 style="margin:0 0 8px 0;font-size:28px;line-height:1.15;letter-spacing:-0.02em;color:{_BRAND_PRIMARY};font-weight:600;">
  Te invitaron a una clínica
</h1>
<p style="margin:0 0 20px 0;font-size:15px;line-height:1.55;color:{_BRAND_INK_2};">
  {inviter_line}<strong style="color:{_BRAND_PRIMARY};">{safe_clinic}</strong> en imedexp.
</p>
<div style="background-color:{_BRAND_PAPER_SOFT};border:1px solid {_BRAND_RULE};border-radius:14px;padding:22px;margin-bottom:22px;">
  <p style="margin:0 0 6px 0;font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:{_BRAND_INK_3};">Clínica</p>
  <p style="margin:0;font-size:18px;letter-spacing:-0.01em;color:{_BRAND_PRIMARY};font-weight:600;">{safe_clinic}</p>
</div>
<p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:{_BRAND_INK_2};">
  Para aceptar, entra a imedexp con tu cuenta de médico y abre la sección
  <strong style="color:{_BRAND_PRIMARY};">Invitaciones</strong> en tu menú lateral.
</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
  <tr>
    <td style="border-radius:12px;background-color:{_BRAND_ACCENT};">
      <a href="{invitation_url}" style="display:inline-block;padding:14px 24px;font-size:14px;font-weight:600;letter-spacing:-0.01em;color:#FFFFFF;text-decoration:none;">
        Revisar invitación →
      </a>
    </td>
  </tr>
</table>
<p style="margin:0 0 6px 0;font-size:13px;line-height:1.6;color:{_BRAND_INK_3};">
  Inicia sesión con el mismo correo en el que recibiste esta invitación.
</p>
<p style="margin:0;font-size:13px;line-height:1.6;color:{_BRAND_INK_3};">
  Si no esperabas esta invitación, ignora este correo. No daremos acceso a tu expediente clínico sin tu consentimiento.
</p>
"""
    await _send(
        doctor_email,
        f"Te invitaron a {safe_clinic} · imedexp",
        _shell("Te invitaron a una clínica", f"{safe_clinic} te invitó a sumarte en imedexp", body),
    )


async def send_prescription_to_patient(patient_email: str, prescription_id: int) -> None:
    body = f"""
<h1 style="margin:0 0 8px 0;font-size:28px;line-height:1.15;letter-spacing:-0.02em;color:{_BRAND_PRIMARY};font-weight:600;">
  Tu médico te envió una receta
</h1>
<p style="margin:0 0 20px 0;font-size:15px;line-height:1.55;color:{_BRAND_INK_2};">
  Tu receta #{prescription_id} ya está disponible en tu expediente clínico de imedexp.
</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
  <tr>
    <td style="border-radius:12px;background-color:{_BRAND_ACCENT};">
      <a href="{settings.frontend_url}" style="display:inline-block;padding:14px 24px;font-size:14px;font-weight:600;letter-spacing:-0.01em;color:#FFFFFF;text-decoration:none;">
        Abrir mi expediente →
      </a>
    </td>
  </tr>
</table>
<p style="margin:0;font-size:13px;line-height:1.6;color:{_BRAND_INK_3};">
  La receta queda registrada en tu historial. Si tu farmacia la requiere impresa, puedes descargarla desde la app.
</p>
"""
    await _send(
        patient_email,
        f"Receta #{prescription_id} · imedexp",
        _shell("Tu médico te envió una receta", f"Receta #{prescription_id} disponible", body),
    )


async def send_reminder(patient_email: str, subject: str, message: str) -> None:
    safe = html.escape(message)
    body = f"""
<h1 style="margin:0 0 10px 0;font-size:26px;line-height:1.15;letter-spacing:-0.02em;color:{_BRAND_PRIMARY};font-weight:600;">
  Recordatorio de salud
</h1>
<div style="background-color:{_BRAND_PAPER_SOFT};border:1px solid {_BRAND_RULE};border-radius:14px;padding:20px;margin:0 0 22px 0;">
  <p style="margin:0;font-size:15px;line-height:1.6;color:{_BRAND_INK_2};">{safe}</p>
</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;">
  <tr>
    <td style="border-radius:12px;background-color:{_BRAND_ACCENT};">
      <a href="{settings.frontend_url}" style="display:inline-block;padding:14px 24px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;">
        Abrir imedexp →
      </a>
    </td>
  </tr>
</table>
<p style="margin:0;font-size:13px;line-height:1.6;color:{_BRAND_INK_3};">
  Recibes este aviso porque activaste los recordatorios en imedexp. Puedes ajustarlos o desactivarlos desde la app.
</p>
"""
    await _send(patient_email, subject, _shell("Recordatorio de salud", safe[:80], body))
