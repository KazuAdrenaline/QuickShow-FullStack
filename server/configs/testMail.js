import sendEmail from "./nodeMailer.js";

(async () => {
  try {
    await sendEmail({
      to: "nnnguyenanhkhoa@gmail.com",
      subject: "Brevo Test Email",
      html: "<h1>Test OK!</h1>",
    });
    console.log("Email sent successfully!");
  } catch (err) {
    console.log("Error sending email:", err);
  }
})();
