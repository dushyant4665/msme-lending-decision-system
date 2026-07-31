import prisma from '../db.js'

export const createLoanApplication = async (req, res) => {
  const { businessId, amount, tenureMonths, purpose } = req.body

  try {
    const business = await prisma.business.findUnique({ where: { id: businessId } })
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' })
    }

    const loan = await prisma.loanApplication.create({
      data: {
        businessId,
        amount: Number(amount),
        tenureMonths: Number(tenureMonths),
        purpose
      }
    })

    await prisma.auditLog.create({
      data: {
        action: 'LOAN_SUBMITTED',
        details: `Loan ${loan.id} submitted for business ${businessId}, amount ${amount}`
      }
    })

    res.status(201).json({ success: true, data: loan })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create loan application' })
  }
}

export const getLoanApplication = async (req, res) => {
  const { id } = req.params

  try {
    const loan = await prisma.loanApplication.findUnique({
      where: { id },
      include: { business: true, decision: true }
    })
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan application not found' })
    }
    res.json({ success: true, data: loan })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch loan application' })
  }
}