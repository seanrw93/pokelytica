export const getSpriteUrl = (species: string) => {
  if (!species) return "";
  return `https://play.pokemonshowdown.com/sprites/gen5/${species.toLowerCase().replace(/[^a-z0-9]/g, "")}.png`;
};

