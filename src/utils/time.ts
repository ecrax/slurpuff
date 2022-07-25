export const toMiliseconds = (hrs: number, min: number, sec: number) =>
  (hrs * 60 * 60 + min * 60 + sec) * 1000;
