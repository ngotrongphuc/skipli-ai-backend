const accountSid = "ACc42d799aa30b7ac6dcbe2d8dc9b32f97";
const authToken = "cf0064512642cf623b55280d408a03a0";
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
