var AWS = require("aws-sdk");

const AWStranslate = new AWS.Translate({
  accessKeyId: process.env.TRANSLATE_ACCESS_ID,
  secretAccessKey: process.env.TRANSLATE_ACCESS_KEY,
  region: process.env.TRANSLATE_REGION || "us-east-1",
});

const translate = async (params) => {
  let text = await AWStranslate.translateText(params).promise();
  return text["TranslatedText"];
};

module.exports = {
  translate,
};
