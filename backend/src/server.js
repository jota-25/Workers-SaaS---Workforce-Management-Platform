import app from "./app.js";
import { connectRedis } from "./lib/redis.js";

const PORT = process.env.PORT || 3000;

await connectRedis();

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});