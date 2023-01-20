import InternalSufferingService from "./InternalSufferingService";
import Gamemode from "../data/gamemode.json";

import "../css/styles.css";
import Icon from "../img/icon.png";
import LargeIcon from "../img/icon_large.png";

export async function setup(ctx: ModContext) {
  await ctx.gameData.addPackage(Gamemode);

  InternalSufferingService.init(ctx, {
    hard_level_cap: cloudManager.hasTotHEntitlement ? 120 : 99,
    starting_level_cap: 10,
    num_skill_disables_to_cap: 9,
    icon_url: ctx.getResourceUrl(Icon),
    icon_url_large: ctx.getResourceUrl(LargeIcon)
  });
}
