import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
})

export const createBusiness = (data) => api.post('/business', data)
export const createLoan = (data) => api.post('/loan', data)
export const generateDecision = (loanId) => api.post(`/decision/${loanId}`)
export const getDecisionStatus = (loanId) => api.get(`/decision/${loanId}/status`)