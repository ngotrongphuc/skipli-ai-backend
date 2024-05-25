const express = require("express");
const cors = require("cors");
const db = require("./firebase");
const { sendOtp, sendMessage, validatePhoneNumber } = require("./twilio");
const crypto = require("crypto");

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.post("/create-new-access-code", async (req, res) => {
  try {
    /* generate random int from 0 to 999999 (1000000 is excluded) then add 1000000 to keep the number exactly 7 digits
    before parse to string in case the random number begins with 0, e.g. 012345 will become 12345. then substring the first digit */
    const newOtp = (crypto.randomInt(0, 1000000) + 1000000)
      .toString()
      .substring(1);
    const data = req.body;
    const { phoneNumber } = data;
    const rawPhoneNumber = phoneNumber.replace(/\s/g, "");

    // check if phone number valid first
    const valid = await validatePhoneNumber(rawPhoneNumber);
    if (!valid) throw new Error("Invalid phone number");

    await db.ref("/verifications").child(rawPhoneNumber).set(newOtp);
    await sendMessage(rawPhoneNumber, newOtp);
    res.send(newOtp);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/validate-access-code", async (req, res) => {
  try {
    const data = req.body;
    const { accessCode, phoneNumber } = data;
    const ref = `/verifications/${phoneNumber}`;
    const value = await db.ref(ref).once("value");

    let result = { success: false };
    if (accessCode === value.val()) {
      result.success = true;
      await db.ref(ref).set("");
    }
    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
