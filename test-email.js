const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: '2023498964@student.uitm.edu.my',
    pass: 'dksz iyps rgyg wicc',
  },
});

console.log('Testing email configuration...');

transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email configuration error:');
    console.error(error);
  } else {
    console.log('✅ Email server is ready to send messages');
    console.log('\nSending test email...');
    
    transporter.sendMail({
      from: '"Intern Attendance System" <2023498964@student.uitm.edu.my>',
      to: '2023498964@student.uitm.edu.my',
      subject: 'Test Email - Intern Attendance System',
      text: 'This is a test email from the Intern Attendance System.',
      html: '<h1>Test Email</h1><p>This is a test email from the Intern Attendance System.</p>',
    }, (err, info) => {
      if (err) {
        console.log('❌ Failed to send test email:');
        console.error(err);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
      }
    });
  }
});





