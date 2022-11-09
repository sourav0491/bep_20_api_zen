const express = require("express");
const routes = require("./router");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//  Connect all our routes to our application
app.use("/api", routes);

const start = async () => {
  try {
    await mongoose.connect(
      process.env.NODE_ENV?.trim() === "dev"
        ? process.env.MONGO_CONNECTION_URL_LOCAL
        : process.env.MONGO_CONNECTION_URL_HOSTED
    );
    console.log("db connected");
  } catch (error) {
    console.log(error);
  }

  app.listen(port, () => {
    console.log(`Server listening on the port::::::${port}`);
  });
};

start();
