const nodemailer = require('nodemailer');


const sendResetEmail = async (recipientEmail, resetToken) => {
  try {
    // Create the Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Use the email service provider you prefer (e.g., Gmail)
      auth: {
        user: process.env.EMAIL, // Your email (from environment variable)
        pass: process.env.EMAIL_PASSWORD, // Your email password (from environment variable)
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL, // Sender's email address
      to: recipientEmail, // Recipient's email address
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="http://localhost:3000/reset-password/${resetToken}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Reset password email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send reset email');
  }
};

module.exports = { sendResetEmail };
