require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function formatResponseToArray(response) {
  const startIndex = response.indexOf("[");
  const endIndex = response.lastIndexOf("]");

  if (startIndex === -1 || endIndex === -1) return null;

  const content = response.substring(startIndex, endIndex + 1);

  try {
    const arrayContent = JSON.parse(content);
    return arrayContent;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}

async function generateCaptions(quantity, socialNetwork, subject, tone) {
  // give AI an example pattern to make its responses more consistent
  const prompt = `Generate ${quantity} captions for ${socialNetwork} post about "${subject}". Use ${tone} tone. Use hash tags if necessary. Format your response to an array of strings. For example:
  [
    "Get ready to say hello to the future! 👋 Skipli AI is here, revolutionizing the way you experience Skipli. ✨ Stay tuned
    for more exciting updates.",
    "The wait is over! 🎉 Skipli AI is officially launched, bringing you smarter, faster, and more personalized experiences.
    🚀 Get ready to be amazed!",
    "We're pushing the boundaries of innovation with the launch of Skipli AI! 🧠 Experience seamless integration,
    intelligent automation, and a whole new level of efficiency. #SkipliAI #FutureIsHere",
    "Skipli just got a whole lot smarter! 💡 Introducing Skipli AI, your ultimate companion for a streamlined and enhanced
    experience. Get ready to unlock new possibilities! #AIInnovation #SkipliUpgrade",
    "It's not just about technology, it's about making your life easier. 🙌 Skipli AI is here to empower you with
    intelligent solutions. Join the future of Skipli! #SkipliAI #IntelligentSolutions"
    ]
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return formatResponseToArray(text);
}

async function generatePostIdeas(quantity, topic) {
  // give AI an example pattern to make its responses more consistent
  const prompt = `Generate ${quantity} post ideas about "${topic}". Format your response to an array of strings. For example:
  [
    "5 Signs You're In A Fancy Restaurant (And How To Navigate Them)",
    "The Ultimate Guide to Dressing for a Fancy Dinner",
    "Fancy Restaurant Etiquette: 10 Things You Should Know",
    "Is It Worth It? Comparing Fancy Restaurants to Local Gems",
    "5 Fancy Restaurant Dishes You Can Actually Make at Home",
    "The Most Instagrammable Fancy Restaurants in [Your City]",
    "Fancy Restaurant Fails: When Things Go Wrong (And How to Handle It)",
    "Hidden Gems: Finding Affordable Luxury in Fancy Restaurants",
    "The Art of the Fancy Restaurant Experience: A Sensory Journey",
    "Beyond the Food: The Importance of Service in a Fancy Restaurant"
    ]
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return formatResponseToArray(text);
}

async function generateCaptionsFromPostIdea(quantity, idea) {
  // give AI an example pattern to make its responses more consistent
  const prompt = `Generate ${quantity} captions for post idea about "${idea}". Format your response to an array of strings.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return formatResponseToArray(text);
}

module.exports = {
  generateCaptions,
  generatePostIdeas,
  generateCaptionsFromPostIdea,
};
