import { API_V2, API_V3, API_V4, API_V5 } from '../config/constants'

export const getTopcoderReactLib = () => {
  window.CONFIG = {
    API: {
      V2: API_V2,
      V3: API_V3,
      V4: API_V4,
      V5: API_V5,
      MM_BROKER: '/api'
    }
  }
  window.TRU_FRONT_END = true
  const reactLib = require('topcoder-react-lib')
  return reactLib
}
