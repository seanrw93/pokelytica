import "./loadEnv";
import { createApp } from "./app";

const PORT = process.env.PORT ?? 4000;

createApp().listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
