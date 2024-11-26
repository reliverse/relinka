export const errorHandler = (error: Error, customMessage?: string) => {
  const separator = "─".repeat(71);
  console.error("│" + separator);
  console.error("│  AN ERROR OCCURRED:\n│ ", error.message);
  console.error("│" + separator);
  if (customMessage) {
    console.error("│  " + customMessage);
  } else {
    console.error(
      "│  If this issue is related to @reliverse/relinka itself, please\n│  report the details at https://github.com/reliverse/relinka/issues",
    );
  }
  console.error("╰" + separator);
  process.exit(1);
};
