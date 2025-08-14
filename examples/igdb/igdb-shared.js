/**
 * Helper functions
 */

app.shared.secondsToHours = (seconds) =>
  seconds ? `${Math.floor(seconds / 3600)}h` : "-";
