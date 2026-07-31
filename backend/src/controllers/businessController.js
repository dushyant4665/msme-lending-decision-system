import prisma from '../db.js'

export const createBusiness = async (req, res) => {
  const { ownerName, pan, businessType, monthlyRevenue } = req.body

  try {
    const business = await prisma.business.create({
      data: { ownerName, pan, businessType, monthlyRevenue: Number(monthlyRevenue) }
    })

    await prisma.auditLog.create({
      data: {
        action: 'BUSINESS_CREATED',
        details: `Business ${business.id} created for ${ownerName}`
      }
    })

    res.status(201).json({ success: true, data: business })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create business' })
  }
}

export const getBusiness = async (req, res) => {
  const { id } = req.params

  try {
    const business = await prisma.business.findUnique({ where: { id } })
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' })
    }
    res.json({ success: true, data: business })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch business' })
  }
}