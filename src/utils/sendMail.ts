// eslint-disable-next-line import/no-import-module-exports
import nodemailer from 'nodemailer';

// eslint-disable-next-line consistent-return
const sendMail = async (email: string, subject: string, html?: any) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Boolean(process.env.SMTP_SECURE),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_API_KEY,
      },
    });

    await transporter.sendMail({
      from: `"Rushikesh Patil 😀" <${process.env.SMTP_FROM}>`,
      to: email,
      subject,
      html
    });
    console.log('email sent successfully');
  } catch (error) {
    console.log('email not sent!');
    console.log(error);
    return error;
  }
};

export default sendMail;
