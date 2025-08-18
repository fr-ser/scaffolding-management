export function log(message: string, error?: Error) {
  if (error) {
    console.log(
      new Date().toISOString(),
      "Error:",
      message,
      `Error message: ${error?.message || "No message"}`,
      JSON.stringify(error),
      `Error stack: ${error?.stack || "No stack trace"}`,
    );
  } else {
    console.log(new Date().toISOString(), message);
  }
}
