'use strict';

const express = require('express');

// Constants
const PORT = 8080;

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World from CI/CD');
});

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});