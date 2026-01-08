"""
Email Utility for sending OTP emails via Gmail
"""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import asyncio
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from the correct location
# Get the backend directory path (go up from app/utils/ to cashper_backend/)
backend_dir = Path(__file__).parent.parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

# Gmail Configuration
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")


async def send_otp_email(recipient_email: str, otp: str, user_name: str = "User") -> bool:
    """
    Send OTP via Gmail using aiosmtplib (async)
    
    Args:
        recipient_email: Recipient's email address
        otp: OTP to send
        user_name: User's name for personalization
    
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        print(f"\n{'='*60}")
        print(f"📧 Attempting to send OTP email to: {recipient_email}")
        print(f"{'='*60}")
        
        # Validate Gmail credentials
        if not GMAIL_USER or not GMAIL_APP_PASSWORD:
            print("❌ ERROR: Gmail credentials not configured in .env file")
            print("   Email will not be sent. Please configure GMAIL_USER and GMAIL_APP_PASSWORD")
            print(f"\n   📖 Fix Instructions:")
            print(f"   1. Open: cashper_backend\\.env")
            print(f"   2. Update GMAIL_USER and GMAIL_APP_PASSWORD")
            print(f"   3. See: FIX_EMAIL_OTP_PROBLEM.md for detailed guide")
            return False
        
        if GMAIL_USER == "your-email@gmail.com" or GMAIL_APP_PASSWORD == "your-app-password-here":
            print("❌ ERROR: Gmail credentials are still using placeholder values")
            print(f"   Current GMAIL_USER: {GMAIL_USER}")
            print(f"   Current GMAIL_APP_PASSWORD: {GMAIL_APP_PASSWORD}")
            print(f"\n   ⚠️  PLEASE UPDATE THESE IN .env FILE:")
            print(f"   1. Go to https://myaccount.google.com/apppasswords")
            print(f"   2. Generate an App Password")
            print(f"   3. Update cashper_backend\\.env file")
            print(f"   4. Restart the server")
            print(f"\n   📖 Detailed guide: FIX_EMAIL_OTP_PROBLEM.md")
            return False
        
        print(f"✓ Gmail credentials found")
        print(f"  From: {GMAIL_USER}")
        print(f"  To: {recipient_email}")
        
        # Create email message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Password Reset OTP - Cashper"
        message["From"] = GMAIL_USER
        message["To"] = recipient_email
        
        # Email body (HTML and plain text versions)
        text_body = f"""
Hi {user_name},

Your OTP for password reset is: {otp}

This OTP will expire in 5 minutes.

If you didn't request this, please ignore this email.

Best regards,
Cashper Team
        """
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                    <p style="color: #555; font-size: 16px;">Hi {user_name},</p>
                    <p style="color: #555; font-size: 16px;">Your OTP for password reset is:</p>
                    <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <h1 style="color: #007bff; letter-spacing: 5px; margin: 0; font-size: 36px;">{otp}</h1>
                    </div>
                    <p style="color: #555; font-size: 14px;">This OTP will expire in <strong>5 minutes</strong>.</p>
                    <p style="color: #555; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #888; font-size: 12px; text-align: center;">Best regards,<br>Cashper Team</p>
                </div>
            </body>
        </html>
        """
        
        # Attach both versions
        part1 = MIMEText(text_body, "plain")
        part2 = MIMEText(html_body, "html")
        message.attach(part1)
        message.attach(part2)
        
        print(f"✓ Email message prepared")
        print(f"✓ Connecting to Gmail SMTP server...")
        
        # Send email using aiosmtplib (async) with timeout
        # Use start_tls=True to automatically handle TLS
        smtp = aiosmtplib.SMTP(hostname="smtp.gmail.com", port=587, timeout=15, use_tls=False, start_tls=True)
        
        await asyncio.wait_for(smtp.connect(), timeout=10)
        print(f"✓ Connected to smtp.gmail.com:587")
        print(f"✓ TLS encryption enabled")
        
        await asyncio.wait_for(smtp.login(GMAIL_USER, GMAIL_APP_PASSWORD), timeout=10)
        print(f"✓ Authenticated with Gmail")
        
        await asyncio.wait_for(smtp.send_message(message), timeout=15)
        print(f"✓ Email sent successfully")
        
        await smtp.quit()
        print(f"✓ Connection closed")
        
        print(f"\n{'='*60}")
        print(f"✅ PASSWORD RESET OTP EMAIL SENT SUCCESSFULLY!")
        print(f"   Recipient: {recipient_email}")
        print(f"   OTP: {otp}")
        print(f"{'='*60}\n")
        return True
        
    except asyncio.TimeoutError:
        print(f"\n{'='*60}")
        print(f"❌ EMAIL SENDING TIMED OUT")
        print(f"{'='*60}")
        print(f"   Recipient: {recipient_email}")
        print(f"   Possible reasons:")
        print(f"   • Slow internet connection")
        print(f"   • Firewall blocking SMTP port 587")
        print(f"   • Gmail server temporarily unavailable")
        print(f"\n   Try again or check your network settings")
        print(f"{'='*60}\n")
        return False
        
    except aiosmtplib.SMTPAuthenticationError as e:
        print(f"\n{'='*60}")
        print(f"❌ GMAIL AUTHENTICATION FAILED")
        print(f"{'='*60}")
        print(f"   Error: {str(e)}")
        print(f"   GMAIL_USER: {GMAIL_USER}")
        print(f"   GMAIL_APP_PASSWORD: {'*' * len(GMAIL_APP_PASSWORD) if GMAIL_APP_PASSWORD else 'NOT SET'}")
        print(f"\n   Common problems:")
        print(f"   1. Using regular Gmail password instead of App Password")
        print(f"   2. 2-Step Verification not enabled on Gmail")
        print(f"   3. Incorrect App Password")
        print(f"   4. Spaces in App Password (remove them)")
        print(f"\n   📖 Fix guide: FIX_EMAIL_OTP_PROBLEM.md")
        print(f"{'='*60}\n")
        return False
        
    except aiosmtplib.SMTPException as e:
        print(f"\n{'='*60}")
        print(f"❌ SMTP ERROR OCCURRED")
        print(f"{'='*60}")
        print(f"   Error: {str(e)}")
        print(f"   This is usually a server-side issue")
        print(f"   Try again in a few moments")
        print(f"{'='*60}\n")
        return False
        
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"❌ UNEXPECTED ERROR SENDING EMAIL")
        print(f"{'='*60}")
        print(f"   Error type: {type(e).__name__}")
        print(f"   Error message: {str(e)}")
        print(f"   Recipient: {recipient_email}")
        print(f"\n   Please check:")
        print(f"   1. .env file configuration")
        print(f"   2. Internet connection")
        print(f"   3. Gmail account settings")
        print(f"{'='*60}\n")
        return False


async def send_welcome_email(recipient_email: str, user_name: str) -> bool:
    """
    Send welcome email to new users
    
    Args:
        recipient_email: Recipient's email address
        user_name: User's name
    
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Validate Gmail credentials
        if not GMAIL_USER or not GMAIL_APP_PASSWORD:
            print("⚠️  Gmail credentials not configured")
            return False
        
        # Create email message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Welcome to Cashper!"
        message["From"] = GMAIL_USER
        message["To"] = recipient_email
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <h2 style="color: #007bff; text-align: center;">Welcome to Cashper! 🎉</h2>
                    <p style="color: #555; font-size: 16px;">Hi {user_name},</p>
                    <p style="color: #555; font-size: 16px;">Thank you for registering with Cashper. We're excited to have you on board!</p>
                    <p style="color: #555; font-size: 16px;">You can now access all our services including:</p>
                    <ul style="color: #555; font-size: 14px;">
                        <li>Personal Loans</li>
                        <li>Insurance Services</li>
                        <li>Investment Management</li>
                        <li>Tax Services</li>
                        <li>And much more!</li>
                    </ul>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #888; font-size: 12px; text-align: center;">Best regards,<br>Cashper Team</p>
                </div>
            </body>
        </html>
        """
        
        message.attach(MIMEText(html_body, "html"))
        
        # Send email
        smtp = aiosmtplib.SMTP(hostname="smtp.gmail.com", port=587, timeout=30)
        await smtp.connect()
        await smtp.starttls()
        await smtp.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        await smtp.send_message(message)
        await smtp.quit()
        
        print(f"✅ Welcome email sent successfully to {recipient_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send welcome email: {str(e)}")
        return False
