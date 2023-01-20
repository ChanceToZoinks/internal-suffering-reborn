import { clamp, skill_from_id, get_account_age } from "./utils.mjs";

import "../css/styles.css";

import Icon from "../img/icon.png";
import LargeIcon from "../img/icon_large.png";

export default class InternalSufferingService {
  /**
   * @param {ModContext} ctx
   * @param {Number} hard_level_cap
   * @param {Number} starting_level_cap
   * Clamped to [1, hard_level_cap]
   * @param {Number} num_skill_disables_to_cap
   * Number of skills that need to be disabled for the player to reach the hard level cap.
   */
  constructor(ctx, hard_level_cap, starting_level_cap, num_skill_disables_to_cap) {
    this._ctx = ctx;
    this._hard_level_cap = hard_level_cap;
    this._starting_level_cap = starting_level_cap;
    this._num_skill_disables_to_cap = num_skill_disables_to_cap;
    this._soft_level_cap = this._starting_level_cap;

    this._icon_url = ctx.getResourceUrl(Icon);
    this._icon_url_large = ctx.getResourceUrl(LargeIcon);
  }

  get ctx() {
    return this._ctx;
  }

  get hard_level_cap() {
    return this._hard_level_cap;
  }

  get icon_url() {
    return this._icon_url;
  }

  get icon_url_large() {
    return this._icon_url_large;
  }

  get level_cap_increment() {
    return Math.ceil((this.hard_level_cap - this.starting_level_cap) / this.num_skill_disables_to_cap)
  }

  get logo_html() {
    return `<img class="suffering__logo-img" src="${this.icon_url_large}" />`;
  }

  get num_skills_disabled() {
    return game.skills.filter(x => !x.isCombat && !x._unlocked).length - 3; // Firemaking, Farming, Town disabled at start
  }

  get num_skill_disables_to_cap() {
    return this._num_skill_disables_to_cap;
  }

  get sidebar_category_name() {
    return "Internal Suffering";
  }

  get sidebar_item_name() {
    return "Level Cap";
  }

  get soft_level_cap() {
    return this._soft_level_cap;
  }

  set soft_level_cap(val) {
    this._soft_level_cap = clamp(val, this.soft_level_cap, this.hard_level_cap)
  }

  get starting_level_cap() {
    return this._starting_level_cap;
  }

  get is_suffering() {
    return game.currentGamemode.namespace === "suffering";
  }

  #log(msg, ...opts) {
    console.log(`[Suffering] ${msg}`, ...opts);
  }

  /**
   * 
   * @param {Skill} skill 
   */
  #disable_skill_and_raise_level_cap(skill) {
    if (!this.is_suffering || !skill._unlocked || this.num_skills_disabled >= this.num_skill_disables_to_cap) return;

    SwalLocale.fire({
      iconHtml: this.logo_html,
      title: `Disable ${skill.name}?`,
      text: "You won't be able to undo this.",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, disable it!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.#log(`Disabling skill ${skill.name}...`);
        skill.setUnlock(false);
        this.soft_level_cap += this.level_cap_increment
        SwalLocale.fire({
          iconHtml: this.logo_html,
          title: `${skill.name} disabled.`,
          text: `Skills are now capped at level ${this.soft_level_cap}.`,
        });

        this.#log("Updating sidebar...");
        sidebar.category("Non-Combat").item(`melvorD:${skill.name}`).removeAllSubitems();
        sidebar.category(this.sidebar_category_name).item(this.sidebar_item_name, this.#sidebar_level_cap_config(this.soft_level_cap, this.hard_level_cap));
        sidebar.category("Combat").item("melvorD:Attack").click();
      }
    });
  }

  #init_sidebar() {
    this.#log("Creating sidebar items and binding disable buttons...");
    sidebar.category(this.sidebar_category_name, { before: "Combat", toggleable: false }, (suffering) => {
      suffering.item(this.sidebar_item_name, { ...this.#sidebar_level_cap_config(this.soft_level_cap, this.hard_level_cap), ...{ icon: this.icon_url } });
    })

    const self = this; // js is such a dogshit language omfg
    sidebar.category("Non-Combat").items().forEach(x => {
      const skill = skill_from_id(x.id);
      if (skill.id === "melvorD:Magic" || !skill._unlocked) return;

      x.subitem("Disable", {
        onClick() {
          self.#disable_skill_and_raise_level_cap(skill);
        }
      });
    });
  }

  #show_beat_game() {
    showFireworks();
    SwalLocale.fire({
      iconHtml: this.logo_html,
      title: "You won!",
      text: `Congratulations! You finished with a time of ${formatAsTimePeriod(get_account_age())}`,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yay!",
    });
  }

  #patch_baseManager_onEnemyDeath() {
    this.#log("Patching BaseManager.onEnemyDeath...");
    const self = this;
    this.ctx.patch(BaseManager, "onEnemyDeath").after(function (r) {
      const final_boss = cloudManager.hasTotHEntitlement ? "melvorTotH:TheHeraldPhase3" : "melvorF:BaneInstrumentOfFear";
      let _a, _b;
      this.enemy.processDeath();
      this.addMonsterStat(MonsterStats.KilledByPlayer);
      if (
        ((_a = this.enemy.monster) === null || _a === void 0
          ? void 0
          : _a.pet) !== undefined
      ) {
        let kills = this.game.stats.monsterKillCount(this.enemy.monster);
        if (this.enemy.monster.id === "melvorD:Golbin")
          kills += this.game.stats.GolbinRaid.get(RaidStats.GolbinsKilled);
        if (kills >= this.enemy.monster.pet.kills)
          this.game.petManager.unlockPet(this.enemy.monster.pet.pet);
      }
      if (
        self.is_suffering &&
        ((_b = this.enemy.monster) === null || _b === void 0 ? void 0 : _b.id) ===
        final_boss &&
        this.game.stats.monsterKillCount(this.enemy.monster) === 1
      )
        self.#show_beat_game();
      return false;
    })
  }

  #patch_skill_capXPForGamemode() {
    this.#log("Patching Skill.capXPForGamemode...");
    this.ctx.patch(Skill, "capXPForGamemode").replace(function (o) {
      const xp_cap = exp.level_to_xp(this.levelCap + 1) - 1;
      if (this._xp > xp_cap) {
        this._xp = xp_cap;
        this.renderQueue.xpCap = true;
      }
    });
  }

  #patch_skill_renderXPCap() {
    this.#log("Patching Skill.renderXPCap...");
    this.ctx.patch(Skill, "renderXPCap").replace(function (o) {
      if (!this.renderQueue.xpCap)
        return;
      const xp_notice = document.getElementById(`adventure-mode-xp-limit-notice-${this.id}`);
      if (xp_notice !== null) {
        xp_notice.innerHTML = "<br><i class=\"fa fa-info-circle mr-1\"></i>Skill Level Limit reached. Disable a skill to continue earning Skill XP.";
        const xp_cap = exp.level_to_xp(this.levelCap + 1) - 1;
        if (this._xp < xp_cap) {
          hideElement(xp_notice);
        }
        else {
          showElement(xp_notice);
        }
      }
      this.renderQueue.xpCap = false;
    });
  }

  #patch_skill_levelCap() {
    this.#log("Patching Skill.levelCap...");
    const self = this;
    this.ctx.patch(Skill, "levelCap").get(function () {
      return self.soft_level_cap;
    });
  }

  #sidebar_level_cap_config(top, bottom) {
    return { aside: `(${top} / ${bottom})` };
  }

  init_suffering() {
    this.#log("Intializing...");
    this.#log("Trans rights are human rights.");

    this.ctx.onCharacterLoaded(c => {
      this.soft_level_cap = this.starting_level_cap + (this.level_cap_increment * this.num_skills_disabled);
    });

    this.ctx.onInterfaceReady(c => {
      if (!this.is_suffering) return;

      this.#patch_skill_levelCap();
      this.#patch_skill_capXPForGamemode();
      this.#patch_skill_renderXPCap();
      this.#patch_baseManager_onEnemyDeath();
      this.#init_sidebar();
    });
  }
}
