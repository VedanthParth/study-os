import axios from 'axios'

import { config } from '@/config/env'

const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

export default apiClient
