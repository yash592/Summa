const uuid = require("uuid");
const joi = require("@hapi/joi");
const express = require("express");
const app = express();
const mysql = require("mysql");
require("dotenv").config();
const PORT = 3000;
app.use(express.json());
const schema = require("./schema.js");

const pool = mysql.createPool({
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

const getMetrics = (MetricID) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err;

      const query = `SELECT * FROM analytics WHERE MetricID = ?`;
      connection.query(query, [MetricID], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
};

const postMetrics = (payload) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err;

      const query = `INSERT INTO analytics SET ? `;

      connection.query(query, payload, (err, results, fields) => {
        connection.release();

        if (err) reject(err);
        resolve(results);
      });
    });
  });
};

app.get("/metrics/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const resp = await getMetrics(id);
    return {
      statusCode: 200,
      body: res.json(resp),
    };
  } catch (error) {
    console.log(error);
  }
});

app.post("/metrics/:metricId/accountId/:accountId", async (req, res) => {
  const { metricId, accountId } = req.params;
  const { date, views, plays, shares } = req.body;
  const payload = { id: uuid.v4(), ...req.body, ...req.params };

  console.log("Payload", payload);

  console.log("Validating schema");
  const valid = schema.Schema.validate(payload);
  if (valid.error) {
    console.log("Validation error", valid.error);
    res.json("Validation error Bad Request");
  } else {
    console.log("Valid Schema");
    try {
      const resp = await postMetrics(payload);
      console.log(resp);
      res.status(201).json({ body: "Inserted into db" });
    } catch (error) {
      console.log(error);
    }
  }
});

// start the server
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

module.exports = pool;
