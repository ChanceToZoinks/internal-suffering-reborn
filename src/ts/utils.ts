export const clamp = (num: number, min: number, max: number) => {
  return Math.min(Math.max(num, min), max);
};

export const skill_from_id = (id: string) => {
  return game.skills.getObjectByID(id);
};

export const get_account_age = () => {
  return Date.now() - game.stats.General.get(GeneralStats.AccountCreationDate);
};

export const is_suffering = () => {
  return game.currentGamemode.namespace === "suffering";
};
