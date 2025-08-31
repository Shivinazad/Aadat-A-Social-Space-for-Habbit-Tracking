
// 1. Import Express
const express = require('express');

// 2. Create an Express application
const app = express();

// 3. Define the port the server will run on
const PORT = 3000;

// 4. Create a basic API endpoint (a "route")
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Aadat API! 🎉" });
});

// 5. Start the server and listen for requests
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});