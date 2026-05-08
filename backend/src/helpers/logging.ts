export function log(message: string, error?: unknown) {
  if (error) {
    console.log(
      new Date().toISOString(),
      "Error:",
      message,
      `Error message: ${error instanceof Error ? error.message : "No message"}`,
      JSON.stringify(error),
      `Error stack: ${error instanceof Error ? error.stack : "No stack trace"}`,
    );
  } else {
    console.log(new Date().toISOString(), message);
  }
}
