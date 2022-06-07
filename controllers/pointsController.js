const consolidatePoints = require("../utils/consolidatePoints");

const transactions = [];
const balances = {};

const pointsController = {};

pointsController.getBalances = (req, res, next) => {
  res.locals.balanceSummary = balances;
  return next();
}

pointsController.addTransactions = (req, res, next) => {
  const { payer, points, timestamp } = req.body;

  // validate request parameters
  if (payer === undefined || points === undefined) {
    return next({
      log: "Express error handler caught in spend points controller. ERROR: Invalid request: Missing parameters",
      status: 400,
      message: { err: "Invalid request: Missing parameter(s)" }
    })
  }

  if (typeof payer !== 'string' || isNaN(points)) {
    return next({
      log: "Express error handler caught in spend points controller. ERROR: Invalid request: Incorrect parameter data type",
      status: 400,
      message: { err: "Invalid parameter(s)" }
    })
  }

  if (balances[payer] + points < 0 || (!balances[payer] && points < 0)) {
    return next({
      log: "Express error handler caught in spend points controller. ERROR: Invalid request: Transaction will result in negative payer balance",
      status: 400,
      message: { err: "Invalid request" }
    })
  }

  // add to transactions array and sort by oldest to newest
  transactions.push({ payer: payer, points: points, timestamp: timestamp });
  transactions.sort((a, b) => { return new Date(a.timestamp) - new Date(b.timestamp) });

  // update balance
  if (!balances[payer]) {
    balances[payer] = 0;
  }
  balances[payer] += points;

  res.locals.newBalance = {};
  res.locals.newBalance[payer] = balances[payer];

  return next();
}

pointsController.spendPoints = (req, res, next) => {
  let { points } = req.body;

  if (points < 0 || isNaN(points)) {
    return next({
      log: "Express error handler caught in spend points controller. ERROR: Invalid points parameter. Expected points to be a number greater than 0.",
      status: 400,
      message: { err: "Invalid points parameter." }
    })
  }

  const pointsByAge = consolidatePoints(transactions);

  const totalBalance = pointsByAge.reduce((total, entry) => { 
    total += entry.points;
    return total;
  }, 0);

  if (totalBalance < points) {
    return next({
      log: "Express error handler caught in spend points controller. ERROR: Not enough points to spend.",
      status: 400,
      message: { err: "Not enough points to spend." }
    })
  }

  res.locals.pointSummary = [];
  
  // calculate point spend and push payer details to pointSummary and update transactions/balances
  let i = 0;
  while (points > 0) {
    if (pointsByAge[i].points > points) {
      res.locals.pointSummary.push({ payer: pointsByAge[i].payer, points: points * -1 });
      transactions.push({ payer: pointsByAge[i].payer, points: points * -1, timestamp: new Date().toISOString()});
      balances[pointsByAge[i].payer] -= points;
      points = 0;
    }

    if (pointsByAge[i].points <= points) {
      res.locals.pointSummary.push({ payer: pointsByAge[i].payer, points: pointsByAge[i].points * -1 });
      transactions.push({ payer: pointsByAge[i].payer, points: points * -1, timestamp: new Date().toISOString()});
      balances[pointsByAge[i].payer] -= pointsByAge[i].points;
      points = points - pointsByAge[i].points;
      i++;
    }
  }
  
  return next();
}

module.exports = pointsController;