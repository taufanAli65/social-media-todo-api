const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors()); //Allow all connection to the server, add the frontend link here to allow frontend comunicate with the server.

const authRouter = require("./routes/auth");

app.use("/auth", authRouter);

app.listen(PORT, () => {
    console.log(`API is running on port ${PORT}`)
})