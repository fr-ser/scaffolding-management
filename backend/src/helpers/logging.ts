export function log(message: string, error?: Error) {
  if (error) {
    console.log(new Date().toISOString(), "Error:", message, JSON.stringify(error));
  } else {
    console.log(new Date().toISOString(), message);
  }
}
