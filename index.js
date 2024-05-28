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
    console.log(newOtp);
    res.send(newOtp);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/validate-access-code", async (req, res) => {
  try {
    const data = req.body;
    const { accessCode, phoneNumber } = data;
    const otpRef = db.ref(`/users/${phoneNumber}/otp`);
    const snapshot = await otpRef.once("value");

    let result = { success: false };
    if (accessCode === snapshot.val()) {
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

    const result = await generateCaptions(5, socialNetwork, subject, tone);

    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/generate-post-ideas", async (req, res) => {
  try {
    const data = req.body;
    const { topic } = data;

    const result = await generatePostIdeas(10, topic);

    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/generate-captions-from-ideas", async (req, res) => {
  try {
    const data = req.body;
    const { idea } = data;

    const result = await generateCaptionsFromPostIdea(5, idea);

    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/save-content", async (req, res) => {
  try {
    const data = req.body;
    const { phoneNumber, subject, caption } = data;
    const contentsRef = db.ref(`/users/${phoneNumber}/contents`);
    let contentId = null;
    let captionId = null;

    const snapshot = await contentsRef
      .orderByChild("subject")
      .equalTo(subject)
      .once("value");

    // create new content object if not exist
    if (!snapshot.exists()) {
      contentId = db.ref(contentsRef).push().key;
      captionId = db
        .ref(contentsRef)
        .child(contentId)
        .child("captions")
        .push().key;
      await contentsRef
        .child(contentId)
        .set({ subject, captions: { [captionId]: caption } });
    } else {
      // add caption to existed content
      snapshot.forEach((childSnapshot) => {
        contentId = childSnapshot.key;
      });
      captionId = db
        .ref(contentsRef)
        .child(contentId)
        .child("captions")
        .push().key;
      await contentsRef
        .child(contentId)
        .child("captions")
        .update({ [captionId]: caption });
    }

    res.send({ success: true, contentId, captionId });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/get-user-generated-contents", async (req, res) => {
  try {
    const data = req.query;
    const { phoneNumber } = data;

    const snapshot = await db
      .ref(`/users/${phoneNumber}/contents`)
      .once("value");
    const result = snapshot.val();

    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/unsave-content", async (req, res) => {
  try {
    const data = req.body;
    const { phoneNumber, contentId, captionId } = data;
    const contentsRef = db.ref(`/users/${phoneNumber}/contents`);

    await contentsRef
      .child(contentId)
      .child("captions")
      .child(captionId)
      .remove();

    // delete content if it doesn't contains any caption
    const snapshot = await contentsRef
      .child(contentId)
      .child("captions")
      .once("value");
    if (!snapshot.exists()) {
      await contentsRef.child(contentId).remove();
    }

    res.send({ success: true });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
