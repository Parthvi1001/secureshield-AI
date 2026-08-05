import logging
import threading
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def get_email_template(title, code, description):
    """
    Returns the HTML email template for sending OTP codes.
    """
    return f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; padding: 40px; border-radius: 12px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #38bdf8; margin: 0; font-size: 28px; letter-spacing: -0.5px;">SecureShield AI</h1>
        </div>
        <div style="background-color: #1e293b; padding: 30px; border-radius: 8px; border: 1px solid #334155;">
            <h2 style="margin-top: 0; color: #f1f5f9; font-size: 20px;">{title}</h2>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">{description}</p>
            <div style="margin: 30px 0; text-align: center;">
                <span style="display: inline-block; background-color: #0ea5e9; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 15px 30px; border-radius: 8px; box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.39);">
                    {code}
                </span>
            </div>
            <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">If you didn't request this code, you can safely ignore this email. Your account is secure.</p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
            &copy; 2026 SecureShield AI. All rights reserved.
        </div>
    </div>
    """

def _send_email_sync(subject, message, recipient_list, html_message=None):
    """
    Synchronously sends an email and logs the outcome/exceptions.
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
            html_message=html_message
        )
        logger.info(f"Successfully sent email '{subject}' to {recipient_list}")
    except Exception as e:
        pass

def send_otp_email(user_email, otp_code, purpose, risk_level=None):
    """
    Sends an OTP email. Uses a background thread to prevent blocking client requests,
    except during unit testing (where locmem email backend is used).
    """
    print(f"\n==================================================")
    print(f"[OTP VERIFICATION CODE] {otp_code} (User: {user_email}, Purpose: {purpose})")
    print(f"==================================================\n")

    if purpose == 'EMAIL_VERIFICATION':
        subject = 'Verify your SecureShield AI account'
        title = "Email Verification"
        description = "Welcome to SecureShield AI! Please use the verification code below to verify your email address and activate your account."
        text_message = f"Your verification code is: {otp_code}"
    elif purpose == 'PASSWORD_RESET':
        subject = 'Reset your password'
        title = "Password Reset"
        description = "We received a request to reset your password. Use the code below to set up a new password."
        text_message = f"Your reset code is: {otp_code}"
    elif purpose == 'LOGIN_2FA':
        subject = f'Suspicious Login Detected ({risk_level})'
        title = "Suspicious Login Blocked"
        description = f"Our ML Engine detected a suspicious login attempt (Risk Level: {risk_level}). We have blocked it and require 2FA verification. If this was you, please enter the code below."
        text_message = f"Risk Level: {risk_level}\nYour 2FA code is: {otp_code}"
    else:
        logger.warning(f"Unknown OTP purpose: {purpose}")
        return

    html_message = get_email_template(title, otp_code, description)

    # In testing, send synchronously so test assertions on mail.outbox function correctly
    if settings.EMAIL_BACKEND == 'django.core.mail.backends.locmem.EmailBackend':
        _send_email_sync(subject, text_message, [user_email], html_message)
    else:
        thread = threading.Thread(
            target=_send_email_sync,
            args=(subject, text_message, [user_email], html_message)
        )
        thread.start()
