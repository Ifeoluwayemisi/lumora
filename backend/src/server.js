import dotenv from "dotenv";
import app from "./app.js";
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Lumora backend running on port ${PORT}`);
  console.log("ENABLE_AI_RISK:", process.env.ENABLE_AI_RISK);
  console.log("OPENAI key exists:", !!process.env.OPENAI_API_KEY);

});
