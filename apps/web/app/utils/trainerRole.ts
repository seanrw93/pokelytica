export const ROLES = ["Gym Leader", "Elite Four", "Champion", "Rival"] as const;
export type Role = (typeof ROLES)[number];

export const getTrainerRole = (title: string): Role => {
  if (title.includes("Gym Leader")) return "Gym Leader";
  if (title.includes("Elite Four")) return "Elite Four";
  if (title.includes("Champion")) return "Champion";
  return "Rival";
};
