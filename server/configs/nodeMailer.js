import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  secure: false,
  auth: {
    user: "9935db001@smtp-brevo.com",
    pass: "xsmtpsib-edc..."
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    return transporter.sendMail({
      from: "nnnguyenanhkhoa@gmail.com",
      to,
      subject,
      html,
      attachments: [
        {
          filename: "qr.svg",
          path: "../assets/qr.svg",  
          cid: "qr" // <-- dùng để nhúng ảnh trong HTML
        }
      ]
    });
  } catch (err) {
    console.log("❌ Email error:", err);
    throw err;
  }
};

export default sendEmail;
