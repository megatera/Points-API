/*
@description: consolidates transactions into array of points from oldest to newest
@param: sorted transactions array (oldest to newest)
@return: array of consolidated points
*/
const consolidatePoints = (transactions) => {
  const consolidated = [];
  
  // iterate over transactions
    // look for matching payer in consolidated array
    // if there is no match or transaction is a credit, push the transaction to the consolidated array
    // if transaction is a debit but does not break even with the match, deduct value of the transaction from the match in consolidated
    // if transaction is a debit and breaks even with the match, remove match from consolidated array
  // assumes transactions would not result in a negative payer balance
  for (let transaction of transactions) {
    const match = consolidated.find((el) => el.payer === transaction.payer);
    if (match === undefined || transaction.points > 0) {
      consolidated.push({ ...transaction });
    }
    if (transaction.points < 0 && Math.abs(transaction.points) < match.points) {
      match.points += transaction.points;
    }
    if (transaction.points < 0 && Math.abs(transaction.points) === match.points) {
      consolidated.splice(consolidated.indexOf(match), 1);
    }
  }

  return consolidated;
}

module.exports = consolidatePoints;