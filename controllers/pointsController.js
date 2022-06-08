const consolidatePoints = require("../utils/consolidatePoints");

const transactions = [];
const balances = {};

const pointsController = {};

pointsController.getBalances = (req, res, next) => {
  res.locals.balanceSummary = balances;
  return next();
}

pointsController.addTransaction = (req, res, next) => {
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

  // update payer balance
  if (!balances[payer]) {
    balances[payer] = 0;
  }
  balances[payer] += points;

  res.locals.newBalance = {};
  res.locals.newBalance[payer] = balances[payer];

  return next();
}

pointsController.spendPoints = (req, res, next) => {
  let { points: targetSpend } = req.body;

  // validate requested spend
  if (targetSpend < 0 || isNaN(targetSpend)) {
    return next({
      log: "Express error handler caught in spend points controller. ERROR: Invalid points parameter. Expected points to be a number greater than 0.",
      status: 400,
      message: { err: "Invalid points parameter." }
    })
  }

  // consolidate transactions into array of points by age (oldest to newest)
  const pointsByAge = consolidatePoints(transactions);

  // calculate total balance of points to determine if there are enough points to meet targetSpend
  const totalBalance = pointsByAge.reduce((total, entry) => { 
    total += entry.points;
    return total;
  }, 0);

  if (totalBalance < targetSpend) {
    return next({
      log: "Express error handler caught in spend points controller. ERROR: Not enough points to spend.",
      status: 400,
      message: { err: "Not enough points to spend." }
    })
  }

  res.locals.pointSummary = [];
  
  // loop through pointsByAge while there are still points that need to be spent
  let i = 0;
  while (targetSpend > 0) {
    // if value of points in this pointsByAge entry is greater than or equal to targetSpend
    if (pointsByAge[i].points >= targetSpend) {
      // push payer detail and value of targetSpend to pointSummary
      res.locals.pointSummary.push({ payer: pointsByAge[i].payer, points: targetSpend * -1 });

      // update transactions array with deduction of targetSpend points
      transactions.push({ payer: pointsByAge[i].payer, points: targetSpend * -1, timestamp: new Date().toISOString()});

      // update payer balance with deduction of targetSpend points
      balances[pointsByAge[i].payer] -= targetSpend;

      // zero out targetSpend
      targetSpend = 0;
    }

    // if this entry of saved points is less than the targetSpend
    if (pointsByAge[i].points < targetSpend) {
      // push payer detail and value of the points in this pointsByAge entry to pointSummary
      res.locals.pointSummary.push({ payer: pointsByAge[i].payer, points: pointsByAge[i].points * -1 });

      // update transactions array with deduction of the points in this pointsByAge entry
      transactions.push({ payer: pointsByAge[i].payer, points: pointsByAge[i].points * -1, timestamp: new Date().toISOString()});

      // update payer balance with deduction of the points in this pointsByAge entry
      balances[pointsByAge[i].payer] -= pointsByAge[i].points;

      // deduct the points in this pointsByAge entry from targetSpend
      targetSpend -= pointsByAge[i].points;

      // increment pointsByAge index
      i++;
    }
  }
  
  return next();
}

module.exports = pointsController;