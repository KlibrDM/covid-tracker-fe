export const ColorToHex = (color: number) => {
  let hex = color.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}
