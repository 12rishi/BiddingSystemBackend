const nodemailer = require("nodemailer");
async function sendEmail(data) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });
  let mailOptions = {
    from: "ThriftHeaven<thriftheaven234@gmail.com>",
    to: data.email,
    subject: data.subject,
    text: data.text,
  };
  await transporter.sendMail(mailOptions);
}
module.exports = sendEmail;
