import nodemailer from 'nodemailer'

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || process.env.EMAIL_USER,
    pass: process.env.GMAIL_PASS || process.env.EMAIL_PASS
  }
})

export async function sendVerificationEmail(
  email: string,
  code: string,
  fullName: string
) {
  // Check if Gmail is configured
  const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER
  const gmailPass = process.env.GMAIL_PASS || process.env.EMAIL_PASS

  if (!gmailUser || !gmailPass) {
    console.log('📧 EMAIL NOT CONFIGURED - Gmail credentials missing')
    console.log(`📧 To: ${email}`)
    console.log(`📧 Code: ${code}`)
    return { sent: false, code }
  }

  console.log('📧 Attempting to send email via Gmail to:', email)

  try {
    const mailOptions = {
      from: `Intern Attendance System <${gmailUser}>`,
      to: email,
      subject: 'Verification Code - Intern Attendance System',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #20b2aa 0%, #17a2b8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .code { background: #fff; padding: 20px; text-align: center; margin: 20px 0; border: 2px solid #20b2aa; border-radius: 8px; }
              .code-number { font-size: 36px; font-weight: bold; color: #20b2aa; letter-spacing: 8px; font-family: 'Courier New', monospace; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Verification Code</h1>
                <p>Intern Attendance System</p>
              </div>
              <div class="content">
                <p>Hello ${fullName},</p>
                <p>Your verification code for the Intern Attendance System is:</p>
                
                <div class="code">
                  <div class="code-number">${code}</div>
                  <p style="margin-top: 10px; color: #666;">This code will expire in 5 minutes</p>
                </div>
                
                <p>Enter this code to complete your account registration.</p>
                <p><strong>If you didn't request this code, please ignore this email.</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply.</p>
                <p>&copy; Intern Attendance System</p>
              </div>
            </div>
          </body>
        </html>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    
    console.log('✅ Verification email sent via Gmail successfully!')
    console.log('📧 Message ID:', result.messageId)
    console.log('📧 Sent to:', email)
    return { sent: true, code }
  } catch (error: any) {
    console.error('❌ Failed to send email via Gmail:', error)
    console.error('❌ Error message:', error?.message)
    
    // Return helpful error message
    let errorMessage = 'Email sending failed'
    if (error?.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed. Check username and app password.'
    } else if (error?.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to Gmail server.'
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    return { sent: false, code, error: errorMessage }
  }
}
