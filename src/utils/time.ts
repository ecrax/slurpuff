export const toMiliseconds = (hrs: number, min: number, sec: number) =>
  (hrs * 60 * 60 + min * 60 + sec) * 1000;

export const msToTime = (_s: number) => {
  let s = _s;

  const ms = s % 1000;
  s = (s - ms) / 1000;
  const secs = s % 60;
  s = (s - secs) / 60;
  const mins = s % 60;
  const hrs = (s - mins) / 60;

  return { hrs, mins };
};

export const msToTimeString = (_s: number) => {
  const { hrs, mins } = msToTime(_s);
  return (hrs > 0 ? hrs + " Hours " : "") + (mins > 0 ? mins + " Minutes" : "");
};