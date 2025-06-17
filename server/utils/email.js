const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER || "dungd4348@gmail.com",
    pass: process.env.EMAIL_PASS || "dxpf iscr sddr ehps",
  },
});

// Hàm gửi email xác minh (giữ nguyên)
const sendVerificationEmail = async (userEmail, verificationToken) => {
  try {
    const verificationUrl = `http://192.168.126.223:15000/api/verify?token=${verificationToken}`;
    
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
    throw new Error('Không thể gửi email xác minh');
  }
};

const sendResetPasswordEmail = async (userEmail, otp, isOtp = false) => {
  if (!userEmail) {
    throw new Error('Không có email người nhận để gửi OTP reset password');
  }

  if (!otp) {
    throw new Error('Không có OTP để gửi');
  }

  try {
    const mailOptions = {
      from: `"SoundClone 🎵" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🔐 Mã OTP Đặt Lại Mật Khẩu SoundClone',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
          <h2 style="color: #1DB954;">Đặt lại mật khẩu của bạn</h2>
          <p>Dưới đây là mã OTP để đặt lại mật khẩu của bạn:</p>
          <h3 style="color: #333; font-size: 24px; letter-spacing: 2px;">${otp}</h3>
          <p>Nhập mã này vào ứng dụng để tiếp tục.</p>
          <p><strong>Lưu ý:</strong> Mã OTP sẽ hết hạn sau 5 phút.</p>
          <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email OTP reset password đã gửi đến: ${userEmail}`);
  } catch (error) {
    console.error('❌ Lỗi gửi email OTP reset password:', error);
    throw new Error('Không thể gửi email OTP reset password');
  }
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };