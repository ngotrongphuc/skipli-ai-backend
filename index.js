const express = require("express");
const cors = require("cors");
const db = require("./firebase");
const { sendMessage, validatePhoneNumber } = require("./twilio");
const crypto = require("crypto");
const {
  generateCaptions,
  generatePostIdeas,
  generateCaptionsFromPostIdea,
} = require("./geminiAI");

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

    // check if phone number valid first
    const valid = await validatePhoneNumber(phoneNumber);
    if (!valid) throw new Error("Invalid phone number");

    await db.ref(`/users/${phoneNumber}/otp`).set(newOtp);
    await sendMessage(phoneNumber, newOtp);
    console.log(phoneNumber, newOtp);
    res.send(newOtp);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

app.post("/validate-access-code", async (req, res) => {
  try {
    const data = req.body;
    const { accessCode, phoneNumber } = data;
    const otpRef = db.ref(`/users/${phoneNumber}/otp`);
    const value = await db.ref(otpRef).once("value");

    let result = { success: false };
    if (accessCode === value.val()) {
      result.success = true;
      await otpRef.set("");
    }
    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/generate-post-captions", async (req, res) => {
  try {
    const data = req.body;
    const { socialNetwork, subject, tone } = data;
    console.log(socialNetwork, subject, tone);

    const result = await generateCaptions(5, socialNetwork, subject, tone);

    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/get-post-ideas", async (req, res) => {
  try {
    const data = req.body;
    const { topic } = data;
    console.log(topic);

    const result = await generatePostIdeas(10, topic);

    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/create-captions-from-ideas", async (req, res) => {
  try {
    const data = req.body;
    const { idea } = data;
    console.log(idea);

    const result = await generateCaptionsFromPostIdea(5, idea);

    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/save-generated-content", async (req, res) => {
  try {
    const data = req.body;
    const { phoneNumber, caption } = data;
    const id = db.ref().push().key;
    const captionRef = db.ref(`/users/${phoneNumber}/contents/${id}`);

    await captionRef.set(caption);

    res.send({ success: true, captionId: id });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/get-user-generated-contents", async (req, res) => {
  try {
    const data = req.query;
    const { phoneNumber } = data;
    console.log(phoneNumber);

    const value = await db.ref(`/users/${phoneNumber}/contents`).once("value");
    const result = value.val();

    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/unsave-content", async (req, res) => {
  try {
    const data = req.body;
    const { phoneNumber, captionId } = data;
    const captionRef = db.ref(`/users/${phoneNumber}/contents/${captionId}`);

    await captionRef.remove();

    res.send({ success: true });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
