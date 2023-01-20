import { skill_from_id, get_account_age, is_suffering, clamp } from "./utils";

export interface ISufferingConfig {
  hard_level_cap: number;
  starting_level_cap: number;
  num_skill_disables_to_cap: number;
  icon_url: string;
  icon_url_large: string;
  sidebar_category_name?: string;
  sidebar_item_name?: string;
}

export class InternalSufferingServiceData implements ISufferingConfig {
  #hard_level_cap: number;
  #soft_level_cap: number;
  #starting_level_cap: number;
  #num_skill_disables_to_cap: number;
  #icon_url: string;
  #icon_url_large: string;
  #sidebar_category_name: string;
  #sidebar_item_name: string;

  constructor(cfg: ISufferingConfig) {
    ({
      hard_level_cap: this.#hard_level_cap,
      starting_level_cap: this.#starting_level_cap,
      num_skill_disables_to_cap: this.#num_skill_disables_to_cap,
      icon_url: this.#icon_url,
      icon_url_large: this.#icon_url_large,
      sidebar_category_name: this.#sidebar_category_name = "Internal Suffering",
      sidebar_item_name: this.#sidebar_item_name = "Level Cap"
    } = cfg);
    this.#soft_level_cap = this.#starting_level_cap;
  }

  get hard_level_cap() {
    return this.#hard_level_cap;
  }

  get num_skill_disables_to_cap() {
    return this.#num_skill_disables_to_cap;
  }

  get icon_url() {
    return this.#icon_url;
  }

  get icon_url_large() {
    return this.#icon_url_large;
  }

  get level_cap_increment() {
    return Math.ceil(
      (this.hard_level_cap - this.starting_level_cap) /
        this.num_skill_disables_to_cap
    );
  }

  get logo_html() {
    return `<img class="suffering__logo-img" src="${this.icon_url_large}" />`;
  }

  get num_skills_disabled() {
    return game.skills.filter((x) => !x.isCombat && !x.isUnlocked).length - 3; // Firemaking, Farming, Town disabled at start
  }

  get sidebar_category_name() {
    return this.#sidebar_category_name;
  }

  get sidebar_item_name() {
    return this.#sidebar_item_name;
  }

  get soft_level_cap() {
    return this.#soft_level_cap;
  }

  set soft_level_cap(val) {
    this.#soft_level_cap = clamp(val, this.soft_level_cap, this.hard_level_cap);
  }

  get starting_level_cap() {
    return this.#starting_level_cap;
  }
}

export default class InternalSufferingService {
  #ctx: ModContext;
  #data: InternalSufferingServiceData;

  private constructor(ctx: ModContext, cfg: ISufferingConfig) {
    this.#ctx = ctx;
    this.#data = new InternalSufferingServiceData(cfg);
  }

  #disable_skill_and_raise_level_cap(skill: AnySkill) {
    if (
      !is_suffering ||
      !skill.isUnlocked ||
      this.#data.num_skills_disabled >= this.#data.num_skill_disables_to_cap
    )
      return;

    SwalLocale.fire({
      iconHtml: this.#data.logo_html,
      title: `Disable ${skill.name}?`,
      text: "You won't be able to undo this.",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, disable it!"
    } as SweetAlertOptions).then((result: any) => {
      if (result.isConfirmed) {
        this.#log(`Disabling skill ${skill.name}...`);
        skill.setUnlock(false);
        this.#data.soft_level_cap += this.#data.level_cap_increment;
        SwalLocale.fire({
          iconHtml: this.#data.logo_html,
          title: `${skill.name} disabled.`,
          text: `Skills are now capped at level ${this.#data.soft_level_cap}.`
        });

        this.#log("Updating sidebar...");
        // Remove the disable dropdown from the disabled skill
        sidebar
          .category("Non-Combat")
          .item(`melvorD:${skill.name}`)
          .removeAllSubitems();
        // update the Internal Suffering level tracker sidebar item
        sidebar
          .category(this.#data.sidebar_category_name)
          .item(
            this.#data.sidebar_item_name,
            this.#sidebar_level_cap_config(
              this.#data.soft_level_cap,
              this.#data.hard_level_cap
            )
          );
        // update the skill levels of all skills in the side bar
        ["Combat", "Non-Combat"].forEach((category: string) => {
          sidebar.category(category, (cats) => {
            cats.items().forEach((its) => {
              const sk = skill_from_id(its.id);
              if (!sk?.isUnlocked) return;

              cats.item(
                its.id,
                this.#sidebar_level_cap_config(sk.level, sk.levelCap)
              );
            });
          });
        });
        sidebar.category("Combat").item("melvorD:Attack").click();
      }
    });
  }

  #init_sidebar() {
    this.#log("Creating sidebar items and binding disable buttons...");
    sidebar.category(
      this.#data.sidebar_category_name,
      { before: "Combat", toggleable: false },
      (suffering) => {
        suffering.item(this.#data.sidebar_item_name, {
          ...this.#sidebar_level_cap_config(
            this.#data.soft_level_cap,
            this.#data.hard_level_cap
          ),
          ...{ icon: this.#data.icon_url }
        });
      }
    );

    const self = this; // js is such a dogshit language omfg
    sidebar
      .category("Non-Combat")
      .items()
      .forEach((x) => {
        const skill = skill_from_id(x.id);
        if (skill?.id === "melvorD:Magic" || !skill?.isUnlocked) return;

        x.subitem("Disable", {
          onClick() {
            self.#disable_skill_and_raise_level_cap(skill);
          }
        });
      });
  }

  #log(msg: any, ...opts: any[]) {
    console.log(`[Suffering] ${msg}`, ...opts);
  }

  #patch_baseManager_onEnemyDeath() {
    this.#log("Patching BaseManager.onEnemyDeath...");
    const self = this;
    this.#ctx
      // @ts-ignore
      .patch(BaseManager, "onEnemyDeath")
      .replace(function (this: BaseManager, _r) {
        const final_boss = cloudManager.hasTotHEntitlement
          ? "melvorTotH:TheHeraldPhase3"
          : "melvorF:BaneInstrumentOfFear";
        let _a, _b;
        this.enemy.processDeath();
        this.addMonsterStat(MonsterStats.KilledByPlayer);
        if (
          ((_a = this.enemy.monster) === null || _a === void 0
            ? void 0
            : _a.pet) !== undefined
        ) {
          // @ts-ignore
          let kills = this.game.stats.monsterKillCount(this.enemy.monster);
          // @ts-ignore
          if (this.enemy.monster.id === "melvorD:Golbin")
            kills += this.game.stats.GolbinRaid.get(RaidStats.GolbinsKilled);
          // @ts-ignore
          if (kills >= this.enemy.monster.pet.kills)
            // @ts-ignore
            this.game.petManager.unlockPet(this.enemy.monster.pet.pet);
        }
        if (
          is_suffering() &&
          ((_b = this.enemy.monster) === null || _b === void 0
            ? void 0
            : _b.id) === final_boss &&
          // @ts-ignore
          this.game.stats.monsterKillCount(this.enemy.monster) === 1
        )
          self.#show_beat_game();
        return false;
      });
  }

  #patch_skill_capXPForGamemode() {
    this.#log("Patching Skill.capXPForGamemode...");
    this.#ctx
      // @ts-ignore
      .patch(Skill, "capXPForGamemode")
      .replace(function (this: AnySkill, _o) {
        const xp_cap = exp.level_to_xp(this.levelCap + 1) - 1;
        if (this.xp > xp_cap) {
          // @ts-ignore
          this._xp = xp_cap;
          this.renderQueue.xpCap = true;
        }
      });
  }

  #patch_skill_renderXPCap() {
    this.#log("Patching Skill.renderXPCap...");
    this.#ctx
      // @ts-ignore
      .patch(Skill, "renderXPCap")
      .replace(function (this: AnySkill, _o) {
        if (!this.renderQueue.xpCap) return;
        const xp_notice = document.getElementById(
          `adventure-mode-xp-limit-notice-${this.id}`
        );
        if (xp_notice !== null) {
          xp_notice.innerHTML =
            '<br><i class="fa fa-info-circle mr-1"></i>Skill Level Limit reached. Disable a skill to continue earning Skill XP.';
          const xp_cap = exp.level_to_xp(this.levelCap + 1) - 1;
          if (this.xp < xp_cap) {
            hideElement(xp_notice);
          } else {
            showElement(xp_notice);
          }
        }
        this.renderQueue.xpCap = false;
      });
  }

  #patch_skill_levelCap() {
    this.#log("Patching Skill.levelCap...");
    const self = this;
    // @ts-ignore
    this.#ctx.patch(Skill, "levelCap").get(() => {
      return self.#data.soft_level_cap;
    });
  }

  #show_beat_game() {
    showFireworks();
    SwalLocale.fire({
      iconHtml: this.#data.logo_html,
      title: "You won!",
      text: `Congratulations! You finished with a time of ${formatAsTimePeriod(
        get_account_age()
      )}`,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yay!"
    });
  }

  #sidebar_level_cap_config(
    top: number | string,
    bottom: number | string
  ): SidebarItemConfig {
    return { aside: `(${top} / ${bottom})` };
  }

  static init(ctx: ModContext, cfg: ISufferingConfig) {
    const service = new InternalSufferingService(ctx, cfg);

    service.#log("Intializing...");
    service.#log("Trans rights are human rights.");

    service.#ctx.onCharacterLoaded((_c) => {
      service.#data.soft_level_cap =
        service.#data.starting_level_cap +
        service.#data.level_cap_increment * service.#data.num_skills_disabled;
    });

    service.#ctx.onInterfaceReady((_c) => {
      if (!is_suffering) return;

      service.#patch_skill_levelCap();
      service.#patch_skill_capXPForGamemode();
      service.#patch_skill_renderXPCap();
      service.#patch_baseManager_onEnemyDeath();
      service.#init_sidebar();
    });
  }
}
