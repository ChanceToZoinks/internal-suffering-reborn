import InternalSufferingService from "./internal_suffering_service.mjs";

import Gamemode from "../data/gamemode.json";

/**
 * @param {ModContext} ctx 
 */
export async function setup(ctx) {
  await ctx.gameData.addPackage(Gamemode);

  const api = new InternalSufferingService(ctx, cloudManager.hasTotHEntitlement ? 120 : 99, 10, 9);
  api.init_suffering();
}
