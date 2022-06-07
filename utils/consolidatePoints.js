const consolidatePoints = (transactions) => {
  const consolidated = [];
  
  // iterate over transactions
  for (let transaction of transactions) {
    const match = consolidated.find((el) => el.payer === transaction.payer);
    if (match === undefined || transaction.points > 0) {
      consolidated.push({ ...transaction });
    }
    if (transaction.points < 0 && transaction.points < match.points) {
      match.points += transaction.points;
    }
    if (transaction.points < 0 && transaction.points === match.points) {
      consolidated.splice(consolidated.indexOf(match), 1);
    }
    // break if transaction points > match points?

  }

  return consolidated;
}

module.exports = consolidatePoints;