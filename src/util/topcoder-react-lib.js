import { API_V2, API_V3, API_V4, API_V5, API_V6 } from '../config/constants'

export const getTopcoderReactLib = () => {
  window.CONFIG = {
    API: {
      V2: API_V2,
      V3: API_V3,
      V4: API_V4,
      V5: API_V5,
      V6: API_V6,
      MM_BROKER: '/api'
    }
  }
  window.TRU_FRONT_END = true
  const reactLib = require('topcoder-react-lib')
  return reactLib
}

export const isValidDownloadFile = async (blobFile) => {
  if (!blobFile) {
    return {
      success: false
    }
  }
  if (blobFile.type.indexOf('json') >= 0) {
    const backendResonse = JSON.parse(await blobFile.text())
    return {
      success: false,
      message: backendResonse.message || ''
    }
  }
  return {
    success: true
  }
}
