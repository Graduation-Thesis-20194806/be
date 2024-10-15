export const memoizedMs = (str: string) => {
  const timeUnits = {
    d: 86400,
    h: 3600,
    m: 60,
    s: 1,
  };
  const match = str.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error('Chuỗi thời gian không hợp lệ');
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  return value * timeUnits[unit] * 1000;
};
