export const toMiliseconds = (hrs: number, min: number, sec: number) =>
  (hrs * 60 * 60 + min * 60 + sec) * 1000;

  export const msToTime = (ms: number) => {
    const dtFromMillisec = new Date(ms * 1000);
    const hrs = dtFromMillisec.getHours();
    const mins = dtFromMillisec.getMinutes();

    return (
      (hrs > 0 ? hrs + " Hours " : "") + (mins > 0 ? mins + " Minutes" : "")
    );
  };
  