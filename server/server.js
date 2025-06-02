import dotenv from "dotenv";
dotenv.config({ path: '../.env' });
import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})