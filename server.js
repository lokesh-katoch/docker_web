'use strict';

const express = require('express');
const db = require("./app/models");
const controller = require("./app/controllers/broadcast.controller");

db.sequelize.sync().then(() => {
  console.log("Drop and Resync Db");
});

// Constants
const PORT = process.env.PORT || 8080;

// App
const app = express();
app.get('/', async (req, res) => {
  controller.getOrganizationInfo(req, res);
});

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});