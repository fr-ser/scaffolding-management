export function sendMsgLog(message: string) {
  console.log(new Date().toISOString(), message)
}
export function sendErrorLog(message: string, error: Error) {
  console.log(new Date().toISOString(), 'Error:', message, error)
}
