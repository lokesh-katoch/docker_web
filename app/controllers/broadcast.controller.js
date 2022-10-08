const httpStatus = require("http-status");
//const languageDict = require("../config/constants");
//const awsTranslate = require("../config/awsTranslate");
//const twilio = require("../config/twilio");
//const { sendEmail } = require("../config/sendgrid");
const Sequelize = require("sequelize");
//const Op = Sequelize.Op;
//const emailBuilder = require("../config/emailTemplateBuilder");

const broadcastService = require("../services/broadcast.service");

const getOrganizationInfo = async (req, res) => {
  try {
    let org_id = 1;
    let organization = await broadcastService.getCentersByOrgIdforBroadcast(org_id)

    organization = organization.reduce(
      (p, c) => (
        p[c.org_name]
          ? p[c.org_name].push(c)
          : (p[c.org_name] = [c]),
        p
      ),
      {}
    );
    organization = Object.keys(organization).map((k) => ({
      organization: k,
      centers: organization[k],
    }));

    return res.status(httpStatus.OK).send({
      message: "centers fetched successfully",
      data: organization,
    });
  } catch (err) {
    console.log("Error: Not able to get organization Info. Error is: " + err);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: err });
  }
};

/*const getBroadcastHistory = async (req, res) => {
  try {
    if (req.params.orgId.length <= 0)
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ error: "Organization is required" });

    let user = await profileService.getProfileByEmail(req.email);
    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .send({ error: "Profile not Found" });
    }

    let organizationId = req.params.orgId;
    let profile = await profileService.getProfileByEmail(req.email);
    if (profile) {
      if (profile.organisationId) {
        organizationId = profile.organisationId;
      }
    } else {
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ error: "No profile found for user." });
    }

    let searchQueries = {};
    searchQueries[Op.and] = [];

    if (req.query.searchText) {
      searchQueries[Op.and].push({
        message: { [Op.iLike]: `%${req.query.searchText}%` },
      });
    }

    if (req.query.audience) {
      searchQueries[Op.and].push({
        audience: { [Op.iLike]: `%${req.query.audience}%` },
      });
    }

    let page = 1;
    if (req.query.page) page = req.query.page;

    let limit = 20;
    if (req.query.limit) limit = req.query.limit;

    let order = "createdAt";
    if (req.query.orderBy) {
      order = [req.query.orderBy, req.query.order || "DESC"];
    }

    if (req.query.language) {
      searchQueries[Op.and].push({
        languages: { [Op.iLike]: `%${req.query.language}%` },
      });
    }

    if (req.query.type) {
      searchQueries.broadcast_type = req.query.type;
    }

    searchQueries.org_id = organizationId;

    let broadcastHistory = await broadcastService.getbroadcastsByOrg(
      searchQueries,
      page,
      limit,
      order
    );

    return res.status(httpStatus.OK).send({
      message: "Broadcast history fetched successfully",
      data: broadcastHistory,
      page: page,
      limit: limit,
    });
  } catch (err) {
    console.log("Error: Not able to get organization Info. Error is: " + err);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: err });
  }
};

const sendBroadcast = async (req, res) => {
  try {
    if (req.body.audience.length <= 0)
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ error: "Audience is required" });

    if (req.body.channels.length <= 0)
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ error: "Channel is required" });

    if (req.body.orgId.length <= 0)
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ error: "organization Id is required" });

    if (req.body.message.trim().length <= 0)
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ error: "Message is required" });

    if (req.body.message.centers <= 0 && req.body.individual)
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ error: "centers is required" });

    let translated = req.body.translated;
    let languages = "";
    let clients = [];
    let sendGridEmail = "";
    let twilioNo = "";
    let smsSentList = [];
    let emailSentList = [];
    let voiceSentList = [];

    let broadcastData =
      await broadcastService.getOrganisationCommPreferenceByOrgId(
        req.body.orgId || null
      );
    let centers;
     
    if (req.body.individual) {
      centers = await clientProfileService.getSeniorCenterClientsbyMemberRef(
        req.body.audience,
        req.body.orgId,
        req.body.interest_ids || null
      );
    } else {
      centers = await clientProfileService.getSeniorCenterClients(
        req.body.audience,
        req.body.interest_ids || null
      );
    }

    if (req.body.interest_ids) {
      centers = centers.filter((x) => x.UserInterests.length > 0);
    }

    if (
      req.body.snap_eligibility ||
      req.body.snap_enrollment ||
      req.body.snap_interest
    ) {
      centers = centers.filter((x) => x.user_snap != null);

      if (req.body.snap_eligibility) {
        centers = centers.filter(
          (x) => x.user_snap.snap_eligibility == req.body.snap_eligibility.value
        );
      }

      if (req.body.snap_enrollment) {
        centers = centers.filter(
          (x) => x.user_snap.snap_enrollment == req.body.snap_enrollment.value
        );
      }

      if (req.body.snap_interest) {
        centers = centers.filter(
          (x) => x.user_snap.snap_interest == req.body.snap_interest.value
        );
      } else {
        centers = centers.filter((x) => (x.user_snap.snap_interest = true));
      }
    }
    if (
      req.body.ph_interested ||
      req.body.ph_consented ||
      req.body.ph_info_provided
    ) {
      centers = centers.filter((x) => x.user_caregiver_interest != null);

      if (req.body.ph_interested) {
        centers = centers.filter(
          (x) =>
            x.user_caregiver_interest.ph_interested ==
            req.body.ph_interested.value
        );
      }

      if (req.body.ph_consented) {
        centers = centers.filter(
          (x) =>
            x.user_caregiver_interest.ph_consented ==
            req.body.ph_consented.value
        );
      }

      if (req.body.ph_info_provided) {
        centers = centers.filter(
          (x) =>
            x.user_caregiver_interest.ph_info_provided ==
            req.body.ph_info_provided.value
        );
      }
    }

    let newBroadcast = await broadcastService.createBroadcast(
      req.body.individual ? req.body.audience.join(", ") : req.body.centers.join(", "),
      req.body.message,
      req.body.channels.join(", "),
      req.body.interest_ids || null,
      "broadcast",
      req.email,
      req.body.orgId
    );

    centers = centers.reduce(
      (p, c) => (p[c.lang] ? p[c.lang].push(c) : (p[c.lang] = [c]), p),
      {}
    );
    centers = Object.keys(centers).map((k) => ({
      language: k,
      clients: centers[k],
    }));

    let orgId = "";
    if (centers.length > 0) {
      orgId = centers[0].clients[0].SeniorCenter.organisation.id;
    }
    for (let i = 0; i < centers.length; i++) {
      let broadcastmessage = req.body.message;
      let emailConcatenatedTest = Object.values(languageDict.broadcastEmailConstant).join('{');
      if (languages.length > 0) languages += ", " + centers[i].language;
      else languages += centers[i].language;

      let languageData = await languageService.getLanguageByName(
        centers[i].language
      );
      var params = {
        SourceLanguageCode: "en",
        TargetLanguageCode: languageData.lang_code,
        Text: broadcastmessage,
      };

      if (centers[i].language != "English") {
        if (translated) {
          let rt = translated.filter(
            (it) => it.language === centers[i].language
          );
          if (rt && rt.length > 0) {
            if (rt[0].message.length > 0) broadcastmessage = rt[0].message;
            else broadcastmessage = await awsTranslate.translate(params);
          } else broadcastmessage = await awsTranslate.translate(params);
        } else {
          broadcastmessage = await awsTranslate.translate(params);
        }

        params.Text = emailConcatenatedTest;
        emailConcatenatedTest = await awsTranslate.translate(params);
      }

      let voiceUrl = await organizationService.getVoiceUrl(
        orgId,
        centers[i].language
      );
      let voices = [];
      voiceUrl.forEach((element) => {
        voices.push(element.toJSON());
      });

      for (let j = 0; j < req.body.channels.length; j++) {
        if (req.body.channels[j] === "SMS") {
          let filteredData = centers[i].clients.filter(
            (x) =>
              x.client_delivery_method.broadcast_sms &&
              x.phone_no &&
              x.phone_no.length > 0 &&
              !smsSentList.includes(x.phone_no)
          );

          filteredData = filteredData.reduce((unique, o) => {
              if(!unique.some(obj => obj.phone_no === o.phone_no)) {
                unique.push(o);
              }
            return unique;
          },[]);

          if (filteredData.length > 0) {
            //removing duplicate SMS sending functionality.
            filteredData.forEach(x => {
              if(!smsSentList.includes(x.phone_no))
                  smsSentList.push(x.phone_no);
            });

            let smsclients = filteredData.reduce(
              (p, c) => (
                p[c.SeniorCenter.id]
                  ? p[c.SeniorCenter.id].push(c)
                  : (p[c.SeniorCenter.id] = [c]),
                p
              ),
              {}
            );

            smsclients = Object.keys(smsclients).map((k) => ({
              senior_center: k,
              clients: smsclients[k],
            }));
            for (let z = 0; z < smsclients.length; z++) {
              twilioNo =
                broadcastData?.phone_no ||
                process.env.TWILIONO ||
                "+18886602449";
              let numbers = [];

              smsclients[z].clients.map((row) => {
                if (!clients.includes(row.id)) clients.push(row.id);
                numbers.push(row.phone_no);
              });

              const bindings = numbers.map((number) => {
                return JSON.stringify({ binding_type: "sms", address: number });
              });

              try {
                let sentData = await twilio.sendBulkSMS(
                  bindings,
                  broadcastmessage,
                  broadcastData
                );

                sleep(1000);

                smsclients[z].clients.map((row) => {
                  let data = {
                    profile_id: row.id,
                    event_date: new Date().toISOString().replace("T", " "),
                    event_type: "sms_broadcast",
                    phone_from: "Bulk API",
                    phone_to: row.phone_no,
                    direction: "outgoing",
                    date_created: sentData.dateCreated,
                    date_sent: sentData.dateCreated,
                    date_updated: sentData.dateCreated,
                    text_message: sentData.body,
                    response_data: JSON.stringify(sentData),
                    sid: sentData.sid,
                    event_status: "queued",
                    channel: 'sms',
                    broadcast_id: newBroadcast.id,
                    service_type: "broadcast",
                  };

                  let log = DeliveryLogsService.createDeliveryLog(data);
                });
              }
              catch (error) {
                console.log(`Error while sending Bulk SMS to ${numbers} : ${error}`)
              }
            }
          }
        } else if (req.body.channels[j] === "E-Mail") {
          let filteredData = centers[i].clients.filter(
            (x) =>
              x.client_delivery_method.broadcast_email &&
              x.email &&
              x.email.length > 0 &&
              !x.email.includes("yopmail.com") &&
              !emailSentList.includes(x.email)
          );

          filteredData = filteredData.reduce((unique, o) => {
              if(!unique.some(obj => obj.email === o.email)) {
                unique.push(o);
              }
            return unique;
          },[]);

          if (filteredData.length > 0) {
            //removing duplicate email sending functionality.
            filteredData.forEach(x => {
              if(!emailSentList.includes(x.email))
                  emailSentList.push(x.email);
            });

            let emailclients = filteredData.reduce(
              (p, c) => (
                p[c.SeniorCenter.id]
                  ? p[c.SeniorCenter.id].push(c)
                  : (p[c.SeniorCenter.id] = [c]),
                p
              ),
              {}
            );
            emailclients = Object.keys(emailclients).map((k) => ({
              senior_center: k,
              clients: emailclients[k],
            }));

            let emailBroadcastMessage = broadcastmessage.replace(/</g, '&lt;');
            emailBroadcastMessage = emailBroadcastMessage.replace(/>/g, '&gt;');

            for (let x = 0; x < emailclients.length; x++) {
              let centerOrg = await organizationService.getOrgByCenterId(
                emailclients[x].senior_center
              );
              for (let y = 0; y < emailclients[x].clients.length; y++) {
                sendGridEmail =
                  process.env.SENDGRID_FROM || "noreply@gobloominghealth.com";

                var emailParams = {
                  applicationLogo: centerOrg.organisation.logo_url,
                  organisationName: centerOrg.organisation.name,
                  fname: emailclients[x].clients[y].fname,
                  broadcastmessage: emailBroadcastMessage,
                  emailText: emailConcatenatedTest
                };

                let emailHTML = await emailBuilder.broadcastEmailBuilder(emailParams);

                let fromOptions = {
                  email:
                    process.env.SENDGRID_FROM || "noreply@gobloominghealth.com",
                  name: centerOrg.organisation.name,
                };

                try {
                  let mailOptions = {
                    from: fromOptions,
                    to: emailclients[x].clients[y].email,
                    subject: emailConcatenatedTest.split('{')[5] + " " + centerOrg.organisation.name + " " + emailConcatenatedTest.split('{')[6],
                    html: emailHTML,
                  };

                  let response = await sendEmail(mailOptions);

                  if (response) {
                    if (!clients.includes(emailclients[x].clients[y].id))
                      clients.push(emailclients[x].clients[y].id);

                    let data = {
                      phone_from: "Email API",
                      event_type: "email_broadcast",
                      direction: "outgoing",
                      event_status: "Await Sendgrid Resp",
                      event_date: new Date().toISOString().replace("T", " "),
                      profile_id: emailclients[x].clients[y].id,
                      email_to: emailclients[x].clients[y].email,
                      text_message: emailHTML,
                      date_created: response[0].headers.date,
                      date_sent: response[0].headers.date,
                      date_updated: response[0].headers.date,
                      response_data: JSON.stringify(response),
                      sid: response[0].headers["x-message-id"],
                      broadcast_id: newBroadcast.id,
                      service_type: "broadcast",
                      channel: "email"
                    };

                    let log = DeliveryLogsService.createDeliveryLog(data);
                  }
                }
                catch (error) {
                  console.log(`Error while sending mail to ${emailclients[x].clients[y].id} : ${error}`)
                }
              }
            }
          }
        } else if (req.body.channels[j] === "Voice Call") {
          let filteredData = centers[i].clients.filter(
            (x) =>
              x.client_delivery_method.broadcast_voice &&
              x.phone_no &&
              x.phone_no.length > 0 &&
              !voiceSentList.includes(x.phone_no)
          );

          filteredData = filteredData.reduce((unique, o) => {
              if(!unique.some(obj => obj.phone_no === o.phone_no)) {
                unique.push(o);
              }
            return unique;
          }, []);
          
          if (filteredData.length > 0) {
            //removing duplicate voice sending functionality.
            filteredData.forEach(x => {
              if(!voiceSentList.includes(x.phone_no))
              voiceSentList.push(x.phone_no);
            });

            let voicename = languageData.voice_name;
            let langCode = languageData.voice_name.includes('Polly') ? '' : `language=\"${languageData.lang_code}\"`
            let voiceclients = filteredData.reduce(
              (p, c) => (
                p[c.SeniorCenter.id]
                  ? p[c.SeniorCenter.id].push(c)
                  : (p[c.SeniorCenter.id] = [c]),
                p
              ),
              {}
            );
            voiceclients = Object.keys(voiceclients).map((k) => ({
              senior_center: k,
              clients: voiceclients[k],
            }));
            twilioNo =
              broadcastData?.phone_no || process.env.TWILIONO || "+18886602449";
            
            let voiceBroadcast = broadcastmessage;
                voiceBroadcast = voiceBroadcast.replace(/&/g, "and");
                voiceBroadcast = voiceBroadcast.replace(/<|>/g, '-');

            for (let x = 0; x < voiceclients.length; x++) {
              for (let y = 0; y < voiceclients[x].clients.length; y++) {

                let centerUrl = voices.filter(
                  (z) =>
                    z.senior_center_id ==
                    voiceclients[x].clients[y].SeniorCenter.id
                );

                let recorded_voice = null;
                if (centerUrl.length > 0) {
                  recorded_voice = centerUrl[0];
                } else {
                  let orgUrl = voices.filter((z) => z.senior_center_id == null);

                  if (orgUrl) {
                    recorded_voice = orgUrl[0];
                  }
                }

                let voiceMessage = "";
                if (recorded_voice) {
                  voiceMessage =
                    message = `<Response><Play>${recorded_voice.url}</Play><Pause length="1"/><Say voice=\"${voicename}\" ${langCode}><prosody rate="81%" volume="x-loud">${voiceBroadcast}</prosody><break strength="x-strong" time="1500ms"/></Say></Response>`;
                } else {
                  voiceMessage =
                    message = `<Response><Say voice=\"${voicename}\" ${langCode}><prosody rate="81%" volume="x-loud">${voiceBroadcast}</prosody><break strength="x-strong" time="1500ms"/></Say></Response>`;
                }
                try {
                  let response = await twilio.sendVoiceMessage(
                    voiceMessage,
                    twilioNo,
                    voiceclients[x].clients[y].phone_no,
                    broadcastData
                  );

                  if (response.resp) {
                    if (!clients.includes(voiceclients[x].clients[y].id))
                      clients.push(voiceclients[x].clients[y].id);

                    let data = {
                      profile_id: voiceclients[x].clients[y].id,
                      event_date: new Date().toISOString().replace("T", " "),
                      event_type: "voice_broadcast",
                      phone_from: response.resp.from,
                      phone_to: response.resp.to,
                      direction: response.resp.direction,
                      date_created: response.resp.dateCreated,
                      date_updated: response.resp.dateUpdated,
                      text_message: voiceMessage,
                      response_data: JSON.stringify(response),
                      sid: response.resp.sid,
                      event_status: response.resp.status,
                      broadcast_id: newBroadcast.id,
                      service_type: "broadcast",
                      channel: "voice"
                    };

                    let log = DeliveryLogsService.createDeliveryLog(data);
                  }
                }
                catch (error) {
                  console.log(`Error while making call to ${voiceclients[x].clients[y].id} : ${error}`)
                }
              }
            }
          }
        }
      }
    }

    let updatedBroadcast = await broadcastService.updateBroadcast(
      newBroadcast,
      languages,
      clients.length,
      twilioNo,
      sendGridEmail
    );

    return res.status(httpStatus.OK).send({
      message: "Broadcast sent successfully",
      broadcastId: newBroadcast.id,
      data: newBroadcast.toJSON(),
    });
  } catch (err) {
    console.log(
      "Error: Not able to send broadcast : " +
      JSON.stringify(req.body) +
      ". error is: " +
      err
    );

    let emailHTML =
      "Hi,<br/>" +
      req.email +
      " has encountered an error while sending a braodcast. <br/> Tried to send a broadcast with following details: <br/>" +
      JSON.stringify(req.body) +
      ".<br/> Error is: " +
      err;

    let mailOptions = {
      from: process.env.SENDGRID_FROM || "noreply@gobloominghealth.com",
      to: process.env.ERROR_ALERT_EMAIL || "noreply@gobloominghealth.com",
      subject: "Broadcast Message Failure",
      html: emailHTML,
    };

    let response = await sendEmail(mailOptions);

    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ error: err.message });
  }
};*/

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

module.exports = {
  getOrganizationInfo,
  //sendBroadcast,
  //getBroadcastHistory,
};
