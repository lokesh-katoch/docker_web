/*let accountSid = process.env.TWILIO_ACCOUNT_ID;
let authToken = process.env.TWILIO_TOKEN;
let twilio = require("twilio")(accountSid, authToken);

let service = twilio.notify.services(process.env.TWILIO_SERVICE_ID);

const sendBulkSMS = async (bindings, body, broadcastData) => {
  if (broadcastData) {
    accountSidTemp =
      broadcastData?.account_sid || process.env.TWILIO_ACCOUNT_ID;
    authTokenTemp = broadcastData?.auth_token || process.env.TWILIO_TOKEN;
    twilio = require("twilio")(accountSidTemp, authTokenTemp);
    service = twilio.notify.services(
      broadcastData?.service_id || process.env.TWILIO_SERVICE_ID
    );
  } else {
    twilio = require("twilio")(accountSid, authToken);
    service = twilio.notify.services(process.env.TWILIO_SERVICE_ID);
  }
  return await service.notifications
    .create({
      toBinding: bindings,
      body: body,
      deliveryCallbackUrl: process.env.SMS_CALLBACK_URL,
    })
    .then((notification) => {
      return notification;
    })
    .catch((err) => {
      console.log(
        "Error: Not able to send Bulk SMS to " +
          bindings +
          " with message " +
          body +
          ". error from TWILIO : " +
          err
      );
      return err;
    });
};

const sendVoiceMessage = async (
  voiceMessage,
  twilioNo,
  phone_no,
  broadcastData
) => {
  if (broadcastData) {
    accountSidTemp =
      broadcastData?.account_sid || process.env.TWILIO_ACCOUNT_ID;
    authTokenTemp = broadcastData?.auth_token || process.env.TWILIO_TOKEN;
    twilio = require("twilio")(accountSidTemp, authTokenTemp);
  } else {
    twilio = require("twilio")(accountSid, authToken);
  }

  return await twilio.calls
    .create({
      twiml: voiceMessage,
      from: twilioNo,
      to: phone_no,
      machineDetection: "DetectMessageEnd",
    })
    .then((resp) => {
      return { resp: resp, voiceMessage: voiceMessage };
    })
    .catch((error) => {
      console.log(
        "Error: Not able to send Voice message to " +
          phone_no +
          " with message " +
          voiceMessage +
          " from number " +
          twilioNo +
          ". error from TWILIO : " +
          error
      );
      return error;
    });
};

module.exports = {
  sendBulkSMS,
  sendVoiceMessage,
};*/
