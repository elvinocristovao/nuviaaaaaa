const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { initSupabase } = require('./supabaseClient');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

initSupabase();

app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NUVIA backend running on port ${PORT}`));
