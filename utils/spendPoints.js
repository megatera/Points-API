/*
@description: calculates point expenditure (oldest first)
@param: array of points to spend sorted by age
@param: target spend
@return: summary array of point spend by payer (eg. [{ payer: payer1, points: -x }, { payer: payer2, points: -y }, ...}])
*/

const spendPoints = (pointsToSpend, targetSpend) => {
  const pointSummary = [];
  
  let i = 0;
  while (targetSpend > 0) {
    // look for matching payer in pointSummary
    const match = pointSummary.find((entry) => entry.payer === pointsToSpend[i].payer);

    // if value of points in this pointsToSpend entry is greater than or equal to targetSpend
    if (pointsToSpend[i].points >= targetSpend) {
      // if match exists, update points
      // else push payer detail and value of targetSpend to pointSummary
      if (match) {
        match.points -= targetSpend
      } else {
        pointSummary.push({ payer: pointsToSpend[i].payer, points: targetSpend * -1 });
      }

      // zero out targetSpend
      targetSpend = 0;
    }

    // if this entry of saved points is less than the targetSpend
    if (pointsToSpend[i].points < targetSpend) {
      // if match exists, update points
      // push payer detail and value of the points in this pointsToSpend entry to pointSummary
      if (match) {
        match.points -= pointsToSpend[i].points
      } else {
        pointSummary.push({ payer: pointsToSpend[i].payer, points: pointsToSpend[i].points * -1 });
      }

      // deduct the points in this pointsToSpend entry from targetSpend
      targetSpend -= pointsToSpend[i].points;

      // increment pointsToSpend index
      i++;
    }
  }

  return pointSummary;
}

module.exports = spendPoints;