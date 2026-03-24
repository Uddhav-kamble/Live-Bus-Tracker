import axios from 'axios'

const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default axios.create({ baseURL: base })
