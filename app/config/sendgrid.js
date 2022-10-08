const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_KEY);

const sendEmail = async (mailoptions) => {
  let response = await sgMail.send(mailoptions).catch((error) => {
    console.log(
      "Error: Email sending failed to " +
        mailoptions.to +
        " with error: " +
        error
    );
  });
  return response;
};

module.exports = {
  sendEmail,
};
