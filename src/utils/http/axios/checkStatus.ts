import type { ErrorMessageMode } from '/#/axios'

// TODO: Need to implement useMessage and useI18n hooks
// TODO: Need to implement userStore
// Create a simplified version here first, can be improved according to actual needs later

export function checkStatus(
  status: number,
  msg: string,
  _errorMessageMode: ErrorMessageMode = 'message',
): void {
  let errMessage = ''

  switch (status) {
    case 400:
      errMessage = `${msg}`
      break
    // 401: Not logged in
    case 401:
      errMessage = msg || 'Unauthorized, please login again'
      // TODO: Handle logout logic
      break
    case 403:
      errMessage = 'Access denied'
      break
    // 404: Request not found
    case 404:
      errMessage = 'Request error, resource not found'
      break
    case 405:
      errMessage = 'Request method not allowed'
      break
    case 408:
      errMessage = 'Request timeout'
      break
    case 500:
      errMessage = 'Server error'
      break
    case 501:
      errMessage = 'Network not implemented'
      break
    case 502:
      errMessage = 'Network error'
      break
    case 503:
      errMessage = 'Service unavailable'
      break
    case 504:
      errMessage = 'Network timeout'
      break
    case 505:
      errMessage = 'HTTP version not supported'
      break
    default:
  }

  if (errMessage) {
    // TODO: Show error message according to errorMessageMode
    console.error(`[HTTP Error ${status}]: ${errMessage}`)
  }
}

