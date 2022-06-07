const express = require("express");
const pointsController = require("./controllers/pointsController");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// transaction route
app.post("/transaction", 
  pointsController.addTransactions, 
  (req, res) => {
    res.status(200).json(res.locals.newBalance);
})

// spend route
app.post("/spend",
  pointsController.spendPoints,
  (req, res) => {
    res.status(200).json(res.locals.pointSummary);
  }
)

// balance route
app.get("/balance", 
  pointsController.getBalances,
  (req, res) => {
    res.status(200).json(res.locals.balanceSummary);
})

// catch-all route handler for any requests to an unknown route
app.use((req, res) => res.status(404));

// global error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: "Express error handler caught unknown middleware error",
    status: 500,
    message: { err: "An error occurred" },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj);
  return res.status(errorObj.status).json(errorObj.message);
});

module.exports = app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("Server listening on PORT", PORT);
});
