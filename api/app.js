const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow all connection to the server, add the frontend link here to allow frontend communicate with the server.
app.use(cors({ origin: '*' }));

const authRouter = require("./routes/auth");
const contentRouter = require("./routes/content");
const { swaggerUi, specs } = require("./swagger");

app.use(express.json());
app.use("/auth", authRouter);
app.use("/content", contentRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
    console.log(`API is running on port ${PORT}`);
    console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
});