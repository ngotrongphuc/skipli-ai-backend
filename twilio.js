require("dotenv").config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const validatePhoneNumber = async (phoneNumber) => {
  const { valid } = await client.lookups.v2.phoneNumbers(phoneNumber).fetch();
  return valid;
};

const sendMessage = async (phoneNumber, otp) => {
  await client.messages.create({
    body: `Your OTP code is: ${otp}`,
    from: "+19516665794",
    to: phoneNumber,
  });
};

module.exports = { validatePhoneNumber, sendMessage };
