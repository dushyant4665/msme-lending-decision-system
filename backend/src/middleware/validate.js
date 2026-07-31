export const validateBusinessInput = (req, res, next) => {
  const { ownerName, pan, businessType, monthlyRevenue } = req.body

  if (!ownerName || !pan || !businessType || !monthlyRevenue) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  if (!panRegex.test(pan.toUpperCase())) {
    return res.status(400).json({ success: false, message: 'Invalid PAN format' })
  }

  if (isNaN(monthlyRevenue) || Number(monthlyRevenue) <= 0) {
    return res.status(400).json({ success: false, message: 'Monthly revenue must be greater than zero' })
  }

  next()
}

export const validateLoanInput = (req, res, next) => {
  const { businessId, amount, tenureMonths, purpose } = req.body

  if (!businessId || !amount || !tenureMonths || !purpose) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Loan amount must be greater than zero' })
  }

  if (isNaN(tenureMonths) || Number(tenureMonths) <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid tenure' })
  }

  next()
}