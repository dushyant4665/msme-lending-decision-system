import { useState } from 'react'
import './App.css'
import { createBusiness, createLoan, generateDecision, getDecisionStatus } from './api'

const businessTypes = ['retail', 'manufacturing', 'services']

const waitForDecision = (loanId) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const res = await getDecisionStatus(loanId)
        if (res.data.status === 'completed') {
          clearInterval(interval)
          resolve(res.data.data)
        }
      } catch (err) {
        clearInterval(interval)
        reject(err)
      }
    }, 1000)
  })
}

function App() {
  const [form, setForm] = useState({
    ownerName: '',
    pan: '',
    businessType: 'retail',
    monthlyRevenue: '',
    amount: '',
    tenureMonths: '',
    purpose: ''
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    setStatusText('Submitting application...')

    try {
      const businessRes = await createBusiness({
        ownerName: form.ownerName,
        pan: form.pan,
        businessType: form.businessType,
        monthlyRevenue: Number(form.monthlyRevenue)
      })

      const loanRes = await createLoan({
        businessId: businessRes.data.data.id,
        amount: Number(form.amount),
        tenureMonths: Number(form.tenureMonths),
        purpose: form.purpose
      })

      setStatusText('Evaluating your application...')
      await generateDecision(loanRes.data.data.id)

      const decision = await waitForDecision(loanRes.data.data.id)
      setResult(decision)
    } catch (err) {
      setError(err.response?.data?.message || 'something went wrong, try again')
    } finally {
      setLoading(false)
      setStatusText('')
    }
  }

  const scorePercent = result ? Math.round(((result.creditScore - 300) / 600) * 100) : 0
  const reasonList = result ? result.reasonCodes.split(',') : []

  return (
    <div className="page">
      <div className="shell">
        <header className="header">
          <span className="tag">MSME Lending</span>
          <h1>Loan Application</h1>
          <p>Fill in business and loan details to get a credit decision.</p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <div className="section">
            <h2>Business details</h2>
            <div className="row">
              <div className="field">
                <label>Owner name</label>
                <input name="ownerName" value={form.ownerName} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>PAN</label>
                <input name="pan" value={form.pan} onChange={handleChange} required />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Business type</label>
                <select name="businessType" value={form.businessType} onChange={handleChange}>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Monthly revenue (₹)</label>
                <input name="monthlyRevenue" type="number" value={form.monthlyRevenue} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Loan request</h2>
            <div className="row">
              <div className="field">
                <label>Loan amount (₹)</label>
                <input name="amount" type="number" value={form.amount} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Tenure (months)</label>
                <input name="tenureMonths" type="number" value={form.tenureMonths} onChange={handleChange} required />
              </div>
            </div>
            <div className="field">
              <label>Purpose</label>
              <input name="purpose" value={form.purpose} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? statusText || 'Processing...' : 'Get decision'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result">
            <div className="result-top">
              <span className={`badge ${result.approved ? 'approved' : 'rejected'}`}>
                {result.approved ? 'Approved' : 'Rejected'}
              </span>
              <span className="score-number">{result.creditScore}</span>
            </div>

            <div className="score-bar">
              <div
                className={`score-fill ${result.approved ? 'approved' : 'rejected'}`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>

            <div className="reasons">
              {reasonList.map((code) => (
                <span key={code} className="reason-chip">
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App