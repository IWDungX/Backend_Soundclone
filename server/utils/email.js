const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER || 'dungd4348@gmail.com',
    pass: process.env.EMAIL_PASS || 'dxpf iscr sddr ehps',
  },
});

const sendVerificationEMail = async (userEmail,verification_token) => {
  const verificationUrl = `${process.env.APP_URL}/api/verify?token=${verification_token}`;
  const mailOptions = {
    from: `"SoundClone" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Xác Minh Tài Khoản SoundClone',
    html: `
      <h2>Xin chào!</h2>
      <p>Vui lòng nhấp vào liên kết dưới đây để xác minh tài khoản:</p>
      <a href="${verificationUrl}">Xác Minh Tài Khoản</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEMail }; 