import sgMail from "@sendgrid/mail";
import "dotenv/config";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: process.env.EMAIL_TO,
  from: process.env.EMAIL_FROM,
  subject: "Please verify your email address",
  html: `<h1>Please verify your email address</h1>
  <p>Click this link to verify your email address</p>`,
  text: `Click this link to verify your email address`,
};
sgMail
  .send(msg)
  .then(console.log)
  .catch((error) => {
    console.error(error);
  });
