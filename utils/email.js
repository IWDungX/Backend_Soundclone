const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER || "dungd4348@gmail.com", 
    pass: process.env.EMAIL_PASS || "dxpf iscr sddr ehps", 
  },
});

const sendVerificationEmail = async (userEmail, verificationToken) => {
  try {
    const verificationUrl = `${process.env.APP_URL}/api/verify?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"SoundClone 🎵" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🎶 Xác Minh Tài Khoản SoundClone',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
          <h2 style="color: #1DB954;">Chào mừng bạn đến với SoundClone! 🎧</h2>
          <p>Nhấp vào nút bên dưới để xác minh tài khoản của bạn:</p>
          <a href="${verificationUrl}" style="background-color: #1DB954; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 5px; display: inline-block;">
            Xác Minh Tài Khoản
          </a>
          <p><strong>Lưu ý:</strong> Liên kết sẽ hết hạn sau 24 giờ.</p>
          <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email xác minh đã gửi đến: ${userEmail}`);
  } catch (error) {
    console.error('❌ Lỗi gửi email xác minh:', error);
  }
};

module.exports = { sendVerificationEmail };
