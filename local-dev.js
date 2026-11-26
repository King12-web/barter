import app from "./server/app.js";

app.listen(3001, () => {
  console.log("Local API test server running at http://localhost:3001");
});