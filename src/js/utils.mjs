/**
 * 
 * @param {Number} num 
 * @param {Number} min 
 * @param {Number} max 
 */
export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
}

/**
 * 
 * @param {Number} id
 * @return {Skill | undefined}
 */
export const skill_from_id = (id) => {
  return game.skills.getObjectByID(id);
}

/**
 * 
 * @returns Time since account creation in milliseconds.
 */
export const get_account_age = () => {
  return Date.now() - game.stats.General.get(GeneralStats.AccountCreationDate);
}
