// backend/src/services/decisionEngine.js
export const runDecisionEngine = (business, loan) => {
  const reasonCodes = []
  let score = 700

  if (business.monthlyRevenue >= 100000) {
  score += 30
  reasonCodes.push("GOOD_REVENUE")
}

if (loan.amount <= business.monthlyRevenue * 2) {
  score += 20
  reasonCodes.push("LOW_RISK")
}
  const estimatedMonthlyEmi = loan.amount / loan.tenureMonths
  const emiToRevenueRatio = estimatedMonthlyEmi / business.monthlyRevenue
  const loanToRevenueMultiple = loan.amount / business.monthlyRevenue

  if (emiToRevenueRatio > 0.5) {
    score -= 150
    reasonCodes.push('HIGH_LOAN_RATIO')
  } else if (emiToRevenueRatio > 0.3) {
    score -= 80
    reasonCodes.push('MODERATE_LOAN_RATIO')
  }

  if (loanToRevenueMultiple > 10) {
    score -= 200
    reasonCodes.push('DATA_INCONSISTENCY')
  }

  if (business.monthlyRevenue < 20000) {
    score -= 100
    reasonCodes.push('LOW_REVENUE')
  }

  if (loan.tenureMonths < 3 || loan.tenureMonths > 60) {
    score -= 50
    reasonCodes.push('TENURE_RISK')
  }

  score = Math.max(300, Math.min(900, score))

  const approved = score >= 600 && !reasonCodes.includes('DATA_INCONSISTENCY')

  if (reasonCodes.length === 0) {
    reasonCodes.push('CLEAN_PROFILE')
  }

  return { creditScore: score, approved, reasonCodes }
}