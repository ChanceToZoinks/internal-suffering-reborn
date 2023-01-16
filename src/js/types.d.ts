interface ModContext {
  gameData: {
    addPackage: (data: string | GameDataPackage) => Promise<void>;
    buildPackage: (builder: (p: any) => void) => { package: GameDataPackage; add: () => Promise<void>; };
  };
  characterStorage: ModStorage;
  accountStorage: ModStorage;
  settings: {
    section: (name: string) => {
      get: (name: string) => unknown;
      set: (name: string, value: any) => void;
      add: (config: SettingConfig | SettingConfig[]) => void;
    };
    type: (name: string, config: SettingConfig) => void;
  };
  getResourceUrl: (resourcePath: string) => string;
  loadTemplates: (resourcePath: string) => void;
  loadStylesheet: (resourcePath: string) => void;
  loadScript: (resourcePath: string) => Promise<void>;
  loadModule: (resourcePath: string) => Promise<any>;
  loadData: (resourcePath: string) => Promise<any>;
  onModsLoaded: (callback: ModContextCallback) => void;
  onCharacterSelectionLoaded: (callback: ModContextCallback) => void;
  onCharacterLoaded: (callback: ModContextCallback) => void;
  onInterfaceReady: (callback: ModContextCallback) => void;
  api: (endpoints: Record<string, unknown>) => any;
  patch: (classHandle: ClassDecorator, methodName: string) => Patch;
  isPatched: (classHandle: ClassDecorator, methodName: string) => boolean;
}

interface GameDataPackage {
  data?: Record<string, any>;
  modifications?: Record<string, any>;
}

interface ModStorage {
  setItem(key: string, data: any): void;
  getItem(key: string): any;
  removeItem(key: string): void;
  clear(): void;
}

interface SettingConfig {
  type: 'text' | 'number' | 'switch' | 'dropdown' | 'button' | 'checkbox-group' | 'radio-group' | 'label' | 'custom';
  name: string;
  default: unknown;
  label: string;
  hint: string;
  render(name: string, onChange: () => void, config: SettingConfig): HTMLElement;
  onChange(value: unknown, previousValue: unknown): void | boolean | string;
  get(root: HTMLElement): unknown;
  set(root: HTMLElement, value: unknown): void;
}

interface Patch {
  before(hook: (...args: any[]) => unknown): void;
  after(hook: (returnValue: any, ...args: any[]) => unknown): void;
  replace(replacement: (o: (...args: any[]) => any, ...args: any[]) => any): void;
}

type ModContextCallback = (ctx: ModContext) => void;

interface UI {
  create(component: any, host: Element): Element;
  createStatic(template: string, host: Element): Element;
  createStore(props: any): any;
}

declare const ui: UI;

declare class Game implements Serializable, EncodableObject {
  private loopInterval;
  private loopStarted;
  disableClearOffline: boolean;
  private isUnpausing;
  private previousTickTime;
  private enableRendering;
  private maxOfflineTicks;
  registeredNamespaces: NamespaceMap;
  /** Contains dummy namespaces used for unregistered data that is to be kept/displayed */
  private dummyNamespaces;
  openPage?: Page;
  /** Standard Normal Attack. Preinitialized for use as default variable. */
  normalAttack: SpecialAttack;
  /** Special Attack used to store the effect of the Absorbing Shield. */
  itemEffectAttack: ItemEffectAttack;
  /** Empty Equipment Item. Used as a placeholder for equipment slots that are empty. */
  emptyEquipmentItem: EquipmentItem;
  /** Empty Food Item. Used as a placeholder for food slots that are empty */
  emptyFoodItem: FoodItem;
  /** Unknown Combat Area. Used as a default value when a monster has no area, and for class initialization. */
  unknownCombatArea: CombatArea;
  decreasedEvasionStackingEffect: StackingEffect;
  activeActionPage: Page;
  /** Save state property. Last time the game processed time outside of golbin raid. */
  private tickTimestamp;
  /** Last time the game was locally saved */
  private saveTimestamp;
  /** Save state property. Currently active action */
  activeAction: ActiveAction | undefined;
  /** Save state property. Currently paused action */
  pausedAction: ActiveAction | undefined;
  /** Save State Property. If the game is currently paused. */
  private _isPaused;
  /** Save State Property. If the player has read the Merchant's permite item. */
  merchantsPermitRead: boolean;
  /** Save state property. Current gamemode */
  currentGamemode: Gamemode;
  /** Save state property. Name of loaded character. */
  characterName: string;
  /** Save state property. */
  bank: Bank;
  /** Save state property. */
  combat: CombatManager;
  /** Save state property. */
  golbinRaid: RaidManager;
  /** Save State Property. */
  minibar: Minibar;
  /** Save State Property. */
  petManager: PetManager;
  /** Save State Property. */
  shop: Shop;
  /** Save State Property. */
  itemCharges: ItemCharges;
  /** Save State Property. */
  tutorial: Tutorial;
  /** Save State Property. */
  potions: PotionManager;
  /** Save State Property. */
  stats: Statistics;
  /** Save State Property. */
  settings: Settings;
  /** Save State Property. */
  gp: GP;
  /** Save State Property. */
  slayerCoins: SlayerCoins;
  /** Save State Property. */
  raidCoins: RaidCoins;
  /** Save State Property. Stores playfab news that the user has read. */
  readNewsIDs: string[];
  /** Save State Property. Stores the last version of the game the user has loaded. */
  lastLoadedGameVersion: string;
  completion: Completion;
  attack: Attack;
  strength: Strength;
  defence: Defence;
  hitpoints: Hitpoints;
  ranged: Ranged;
  prayer: Prayer;
  slayer: Slayer;
  thieving: Thieving;
  firemaking: Firemaking;
  mining: Mining;
  woodcutting: Woodcutting;
  herblore: Herblore;
  smithing: Smithing;
  altMagic: AltMagic;
  runecrafting: Runecrafting;
  crafting: Crafting;
  fletching: Fletching;
  summoning: Summoning;
  fishing: Fishing;
  cooking: Cooking;
  agility: Agility;
  astrology: Astrology;
  farming: Farming;
  township: Township;
  lore: Lore;
  eventManager: EventManager;
  private dropWeightCache;
  refundedAstrology: boolean;
  renderQueue: {
    title: boolean;
    combatMinibar: boolean;
    activeSkills: boolean;
  };
  attackStyles: NamespaceRegistry<AttackStyle>;
  stackingEffects: NamespaceRegistry<StackingEffect>;
  specialAttacks: NamespaceRegistry<SpecialAttack>;
  items: ItemRegistry;
  pages: NamespaceRegistry<Page>;
  actions: NamespaceRegistry<Action>;
  /** Registry of all active actions */
  activeActions: NamespaceRegistry<ActiveAction>;
  /** Registry of all passive actions */
  passiveActions: NamespaceRegistry<PassiveAction>;
  private _passiveTickers;
  private actionPageMap;
  private skillPageMap;
  /** Registery of all skills */
  skills: NamespaceRegistry<AnySkill>;
  /** Registry of all skills that have mastery */
  masterySkills: NamespaceRegistry<SkillWithMastery<MasteryAction, MasterySkillData>>;
  monsters: NamespaceRegistry<Monster>;
  monsterAreas: Map<Monster, CombatArea | SlayerArea>;
  combatPassives: NamespaceRegistry<CombatPassive>;
  combatAreas: NamespaceRegistry<CombatArea>;
  combatAreaDisplayOrder: NamespacedArray<CombatArea>;
  slayerAreas: NamespaceRegistry<SlayerArea>;
  slayerAreaDisplayOrder: NamespacedArray<SlayerArea>;
  dungeons: NamespaceRegistry<Dungeon>;
  dungeonDisplayOrder: NamespacedArray<Dungeon>;
  combatEvents: NamespaceRegistry<CombatEvent>;
  prayers: NamespaceRegistry<ActivePrayer>;
  standardSpells: NamespaceRegistry<StandardSpell>;
  curseSpells: NamespaceRegistry<CurseSpell>;
  auroraSpells: NamespaceRegistry<AuroraSpell>;
  ancientSpells: NamespaceRegistry<AncientSpell>;
  archaicSpells: NamespaceRegistry<ArchaicSpell>;
  pets: NamespaceRegistry<Pet>;
  gamemodes: NamespaceRegistry<Gamemode>;
  private steamAchievements;
  itemSynergies: Map<EquipmentItem, ItemSynergy[]>;
  randomGemTable: DropTable;
  randomSuperiorGemTable: DropTable;
  private softDataRegQueue;
  get playerCombatLevel(): number;
  get isPaused(): boolean;
  get isGolbinRaid(): boolean;
  /** Quick refereence for player modifiers */
  get modifiers(): PlayerModifiers;
  constructor();
  fetchAndRegisterDataPackage(url: string): Promise<void>;
  /** Performs the registration of a data package to the game */
  registerDataPackage(dataPackage: GameDataPackage): void;
  queueForSoftDependencyReg<T extends IDData>(data: T, object: SoftDataDependant<T>): void;
  postDataRegistration(): void;
  private registerAttackStyles;
  private registerItemData;
  private registerAttackData;
  private registerStackingEffectData;
  private registerCombatPassiveData;
  private registerMonsterData;
  private registerCombatAreaData;
  private registerSlayerAreaData;
  private registerDungeonData;
  private registerCombatEventData;
  private registerPrayerData;
  private registerStandardSpellData;
  private registerCurseSpellData;
  private registerAuroraSpellData;
  private registerAncientSpellData;
  private registerArchaicSpellData;
  private registerPets;
  private registerShopCategories;
  private registerShopPurchases;
  private registerShopUpgradeChains;
  private registerItemSynergies;
  private registerGamemodes;
  private registerSteamAchievements;
  private registerPages;
  /** Registers a skill. Returns the constructed instance of the skill */
  registerSkill<T extends AnySkill>(namespace: DataNamespace, constructor: new (namespace: DataNamespace, game: Game) => T & Partial<PassiveAction> & Partial<ActiveAction> & Partial<StatProvider>): T;
  private applyDataModifications;
  getPlayerModifiersFromData(data: PlayerModifierData): PlayerModifierObject;
  getRequirementFromData(data: AnyRequirementData): AnyRequirement;
  getDungeonRequirement(data: DungeonRequirementData): DungeonRequirement;
  getLevelRequirement(data: SkillLevelRequirementData): SkillLevelRequirement;
  getSlayerItemRequirement(data: SlayerItemRequirementData): SlayerItemRequirement;
  getItemFoundRequirement(data: ItemFoundRequirementData): ItemFoundRequirement;
  getMonsterKilledRequirement(data: MonsterKilledRequirementData): MonsterKilledRequirement;
  getShopPurchaseRequirement(data: ShopPurchaseRequirementData): ShopPurchaseRequirement;
  getTownshipBuildingRequirement(data: TownshipBuildingRequirementData): TownshipBuildingRequirement;
  getAllSkillLevelRequirement(data: AllSkillLevelRequirementData): AllSkillLevelRequirement;
  getSlayerTaskRequirement(data: SlayerTaskRequirementData): SlayerTaskRequirement;
  getCompletionRequirement(data: CompletionRequirementData): CompletionRequirement;
  getDummyData(fullID: string): DummyData;
  constructDummyObject<T>(id: string, constructor: new (namespace: DataNamespace, localID: string, game: Game) => T): T;
  startMainLoop(): void;
  stopMainLoop(): void;
  pauseActiveSkill(fromBlur?: boolean): void;
  unpauseActiveSkill(fromFocus?: boolean): Promise<void>;
  /** Attempts to stop the currently active action, if it belongs to a skill other than the specified one.
   *  Returns true if the active action could not be stopped
   */
  idleChecker(action: ActiveAction | undefined): boolean;
  stopActiveAction(): void;
  /** Things to do after a save has loaded */
  onLoad(): void;
  /** Processes time since the last setInterval */
  private processTime;
  /** Runs the specified amount of game ticks */
  private runTicks;
  private tick;
  queueRequirementRenders(): void;
  private render;
  private renderGameTitle;
  /** Updates the state of the combat minibar */
  private renderCombatMinibar;
  /** Renders which skills are active in the sidebar */
  private renderActiveSkills;
  private loop;
  private getErrorLog;
  private showBrokenGame;
  clearActiveAction(save?: boolean): void;
  private getOfflineTimeDiff;
  processOffline(): Promise<void>;
  private snapShotOffline;
  private createOfflineModal;
  /** Resets properties used to track offline progress */
  private resetOfflineTracking;
  /** Puts the game in a state where offline will progress the amount specified */
  testForOffline(timeToGoBack: number): Promise<void>;
  testCombatInitializationStatParity(): void;
  generateSaveString(): string;
  /** Attempts to get a header from a save string. If save is invalid, returns undefined instead. */
  getHeaderFromSaveString(saveString: string): Promise<SaveGameHeader | SaveLoadError>;
  private getSaveHeader;
  encode(writer: SaveWriter): SaveWriter;
  decode(reader: SaveWriter, version: number): void;
  deserialize(reader: DataReader, version: number, idMap: NumericIDMap): void;
  getLootTableWeight(table: [number, number, number][]): number;
  getItemFromLootTable(table: [number, number, number][]): OldItemQuantity2;
  getSkillUnlockCount(): number;
  getSkillUnlockCost(): number;
  /** Checks a single skill requirement and optionally displays an error message to the player */
  checkSkillRequirement(requirement: SkillLevelRequirement, notifyOnFailure?: boolean): boolean;
  /** Checks a requirement for all skill levels, and optionally displays an error message to the player */
  checkAllSkillLevelRequirement(requirement: AllSkillLevelRequirement, notifyOnFailure?: boolean): boolean;
  /** Checks a single dungeon completion requirement and optionally displays an error message to the player */
  checkDungeonRequirement(requirement: DungeonRequirement, notifyOnFailure?: boolean): boolean;
  /** Checks a completion requirement and optionally displays an error message to the player */
  checkCompletionRequirement(requirement: CompletionRequirement, notifyOnFailure?: boolean): boolean;
  /** Checks a slayer item requirement, and optionally displays an error message to the player */
  checkSlayerItemRequirement(requirement: SlayerItemRequirement, notifyOnFailure?: boolean, slayerLevelReq?: number): boolean;
  /** Checks a shop purchase requirement, and optionally displays an error message to the player */
  checkShopPurchaseRequirement(requirement: ShopPurchaseRequirement, notifyOnFailure?: boolean): boolean;
  /** Checks a slayer task requirement, and optionally displays an error message to the player */
  checkSlayerTaskRequirement(requirement: SlayerTaskRequirement, notifyOnFailure?: boolean): boolean;
  checkItemFoundRequirement(requirement: ItemFoundRequirement, notifyOnFailure?: boolean): boolean;
  checkMonsterKilledRequirement(requirement: MonsterKilledRequirement, notifyOnFailure?: boolean): boolean;
  checkTownshipTaskRequirement(requirement: TownshipTaskCompletionRequirement, notifyOnFailure?: boolean): boolean;
  checkTownshipBuildingRequirement(requirement: TownshipBuildingRequirement, notifyOnFailure?: boolean): boolean;
  /** Checks a single requirement and optionally displays an error message to the player */
  checkRequirement(requirement: AnyRequirement, notifyOnFailure?: boolean, slayerLevelReq?: number): boolean;
  /** Checks an array of rqeuirements, and optionally displays an error message to the player for the first failed requirement */
  checkRequirements(requirements: AnyRequirement[], notifyOnFailure?: boolean, slayerLevelReq?: number): boolean;
  /** Returns true if the player owns the item in their bank or equipment */
  isItemOwned(item: AnyItem): boolean;
  /** Returns the Combat or Slayer area a monster is found in */
  getMonsterArea(monster: Monster): CombatArea | SlayerArea;
  getPageForAction(action: Action): Page | undefined;
  getPageForActiveAction(): Page;
  getPagesForSkill(skill: AnySkill): Page[] | undefined;
  constructEventMatcher(data: GameEventMatcherData): GameEventMatcher;
  /** Processes an event */
  processEvent(event: GameEvent, interval?: number): void;
  checkSteamAchievements(): void;
  private isAchievementMet;
  /** Sets up the current gamemode to it's starting state */
  setupCurrentGamemode(): void;
  getItemFromOldID(itemID: number, idMap: NumericIDMap): AnyItem | undefined;
  /** Converts the data from an old format save */
  convertFromOldFormat(save: NewSaveGame, idMap: NumericIDMap): void;
  /** Takes the old offline variable and converts it to the new skill format */
  convertOldOffline(offline: OldOffline, idMap: NumericIDMap): void;
}
declare type DummyData = {
  dataNamespace: DataNamespace;
  localID: string;
};
interface OfflineSnapshot {
  gp: number;
  slayercoins: number;
  prayerPoints: number;
  experience: Map<AnySkill, number>;
  levels: Map<AnySkill, number>;
  food: AnyItemQuantity[];
  quiverItem: AnyItemQuantity;
  summon1: AnyItem;
  summon2: AnyItem;
  bank: Map<AnyItem, number>;
  loot: Map<AnyItem, number>;
  monsterKills: Map<Monster, number>;
  dungeonCompletion: Map<Dungeon, number>;
  taskCompletions: number[];
  summoningMarks: Map<SummoningRecipe, number>;
  itemCharges: Map<AnyItem, number>;
  cookingStockpile: Map<CookingCategory, AnyItemQuantity>;
  meteorite: MiningNodeSnapshot;
  onyxNode: MiningNodeSnapshot;
  orichaNode: MiningNodeSnapshot;
  ceruleanNode: MiningNodeSnapshot;
}
interface MiningNodeSnapshot {
  totalFound: number;
  hpFound: number;
}

interface BaseSkillData {
  /** IDs of pets to register to skill */
  pets?: string[];
  /** Rare drops that may drop on each action of the skill */
  rareDrops?: RareSkillDropData[];
  /** Information on what should appear on a skill's minibar */
  minibar?: MinibarData;
  /** Custom milestones that are not autogenerated */
  customMilestones?: MilestoneData[];
}
interface RareSkillDropData {
  /** Item that drops */
  itemID: string;
  altItemID?: string;
  /** The quantity of the item that drops */
  quantity: number;
  /** Chance for the drop */
  chance: RareSkillDropChance;
  /** Requirements for the drop */
  requirements: AnyRequirementData[];
}
declare type RareSkillDropChance = FixedSkillDropChance | LevelScalingSkillDropChance | TotalMasteryScalingSkillDropChance;
declare type FixedSkillDropChance = {
  type: 'Fixed';
  chance: number;
};
interface ScalingChance {
  baseChance: number;
  scalingFactor: number;
  maxChance: number;
}
interface LevelScalingSkillDropChance extends ScalingChance {
  type: 'LevelScaling';
}
interface TotalMasteryScalingSkillDropChance extends ScalingChance {
  type: 'TotalMasteryScaling';
}
interface RareSkillDrop {
  /** The item that drops */
  item: AnyItem;
  altItem?: AnyItem;
  /** The quantity of the item that drops */
  quantity: number;
  /** The chance for the item to drop */
  chance: RareSkillDropChance;
  /** The requirements for the item to drop */
  requirements: AnyRequirement[];
}
interface MinibarData {
  /** Items that by default should be in the minibar item selection */
  defaultItems: string[];
  /** Shop Upgrades that should display on the minibar */
  upgrades: string[];
  /** Pets that should display on the minibar */
  pets: string[];
}
interface MinibarOptions {
  defaultItems: Set<EquipmentItem>;
  upgrades: ShopPurchase[];
  pets: Pet[];
}
declare class SkillRenderQueue {
  xp: boolean;
  level: boolean;
  xpCap: boolean;
  /** The previous level that was rendered */
  previousLevel: number;
  lock: boolean;
}
/** Base class for all skills */
declare abstract class Skill<DataType extends BaseSkillData> extends NamespacedObject implements EncodableObject {
  /** Game object to which this skill is registered to */
  protected game: Game;
  /** Readonly. Returns the current level of the skill. */
  get level(): number;
  /** Readonly. Returns the current xp of the skill */
  get xp(): number;
  /** Readonly. Returns the percent progress of the skill to the next level */
  get nextLevelProgress(): number;
  /** Readonly. Localized name of skill */
  get name(): string;
  /** Readonly: URL of skills icon image */
  get media(): string;
  get hasMastery(): boolean;
  /** If the skill is a combat skill or not */
  get isCombat(): boolean;
  /** Readonly: If the skill has a Skilling Minibar */
  get hasMinibar(): boolean;
  /** Pets that can be rolled after completing an action for the skill */
  pets: Pet[];
  /** Rare item drops that occur on an action */
  private rareDrops;
  minibarOptions: MinibarOptions;
  protected milestones: MilestoneLike[];
  /** Sorts the milestones by skill level (ascending) */
  protected sortMilestones(): void;
  /** Readonly. Returns the current virtual level of the skill */
  get virtualLevel(): number;
  /** Maximum skill level achievable */
  get levelCap(): 120 | 99;
  /** The level the skill should start at */
  get startingLevel(): number;
  /** Maximum skill level achievable during the tutorial */
  get tutorialLevelCap(): number;
  get isUnlocked(): boolean;
  /** Stores the current level of the skill */
  private _level;
  /** Stores the current xp of the skill */
  private _xp;
  /** Stores if the skill is unlocked */
  private _unlocked;
  /** Media of string without CDN */
  protected abstract readonly _media: string;
  abstract renderQueue: SkillRenderQueue;
  constructor(namespace: DataNamespace, id: string,
    /** Game object to which this skill is registered to */
    game: Game);
  protected getItemForRegistration(id: string): AnyItem;
  onLoad(): void;
  render(): void;
  private renderXP;
  private renderLevel;
  private renderLockStatus;
  private fireLevelUpModal;
  private getNewMilestoneHTML;
  /** Rendering for the xp cap message */
  private renderXPCap;
  /**
   * Adds experience to the skill
   * @param amount The unmodified experience to add
   * @param masteryAction Optional, the action the xp came from
   * @returns True if the xp added resulted in a level increase
   */
  addXP(amount: number, masteryAction?: NamespacedObject): boolean;
  /** Caps skill experience during the tutorial */
  private capXPForTutorial;
  /** Caps skill experience based on the current gamemode */
  private capXPForGamemode;
  /** Method for performing a level up on this skill */
  private levelUp;
  /**
   * Gets the modified xp to add to the skill
   * @param amount The unmodified experience
   * @param masteryAction Optional, the action the xp came from
   * @returns The experience with modifiers applied
   */
  modifyXP(amount: number, masteryAction?: NamespacedObject): number;
  /**
   * Gets the percentage xp modifier for a skill
   * @param masteryAction Optional, the action the xp came from
   */
  getXPModifier(masteryAction?: NamespacedObject): number;
  /** Gets the uncapped doubling chance for this skill.
   *  This should be overrode to add skill specific bonuses
   */
  protected getUncappedDoublingChance(action?: NamespacedObject): number;
  /** Gets the clamped doubling chance for this skill */
  protected getDoublingChance(action?: NamespacedObject): number;
  /** Gets the gp gain modifier for this skill */
  protected getGPModifier(action?: NamespacedObject): number;
  /** Sets the experience of the skill to the specified value */
  setXP(value: number): void;
  setUnlock(isUnlocked: boolean): void;
  /** Callback function for attempted to unlock the skill */
  unlockOnClick(): void;
  rollForPets(interval: number): void;
  /** Method called when skill is leveled up */
  protected onLevelUp(oldLevel: number, newLevel: number): void;
  protected rollForRareDrops(level: number, rewards: Rewards): void;
  private getRareDropChance;
  /** Callback function for showing the milestones for this skill */
  openMilestoneModal(): void;
  encode(writer: SaveWriter): SaveWriter;
  decode(reader: SaveWriter, version: number): void;
  convertOldXP(xp: number): void;
  registerData(namespace: DataNamespace, data: DataType): void;
  /** Method called after all game data has been registered. */
  postDataRegistration(): void;
  testTranslations(): void;
}
interface ActionMastery {
  xp: number;
  level: number;
}
interface MasteryLevelUnlockData {
  /** Utilized only for game bonuses, gives language ID */
  descriptionID?: number;
  description: string;
  level: number;
}
declare class MasteryLevelUnlock {
  private skill;
  level: number;
  get description(): string;
  private _descriptionID?;
  private _description;
  constructor(data: MasteryLevelUnlockData, skill: SkillWithMastery<MasteryAction, MasterySkillData>);
}
/** Base Data type for skills which have mastery */
interface MasterySkillData extends BaseSkillData {
  masteryTokenID?: string;
  masteryLevelUnlocks?: MasteryLevelUnlockData[];
}
declare class MasterySkillRenderQueue<ActionType extends MasteryAction> extends SkillRenderQueue {
  actionMastery: Set<ActionType>;
  masteryPool: boolean;
}
/** Base class for skills that have mastery */
declare abstract class SkillWithMastery<ActionType extends MasteryAction, DataType extends MasterySkillData> extends Skill<DataType> {
  get hasMastery(): boolean;
  actions: NamespaceRegistry<ActionType>;
  protected actionMastery: Map<MasteryAction, ActionMastery>;
  private _masteryPoolXP;
  get masteryLevelCap(): number;
  /** The mastery token for this skill. Must be registered as data. */
  masteryToken?: TokenItem;
  /** Readonly. Returns the percent of the base mastery pool xp the skill an reach */
  get masteryPoolCapPercent(): number;
  /** Readonly. Returns the base mastery pool xp cap the skill has */
  get baseMasteryPoolCap(): number;
  /** Readonly. Returns the maximum amount of Mastery Pool XP the skill can have */
  get masteryPoolCap(): number;
  /** Readonly. Returns the current Mastery Pool XP the skill has */
  get masteryPoolXP(): number;
  /** The chance to recieve a mastery token for this skill per action */
  get masteryTokenChance(): number;
  abstract renderQueue: MasterySkillRenderQueue<ActionType>;
  /** Sorted array of all mastery actions for the skill */
  sortedMasteryActions: ActionType[];
  private masteryLevelUnlocks;
  totalMasteryActions: CompletionMap;
  private _totalCurrentMasteryLevel;
  private toStrang?;
  onLoad(): void;
  /** Rendering hook for when the page is changed to this skill */
  onPageChange(): void;
  /** Rendering hook for when skill modifiers change */
  onModifierChange(): void;
  render(): void;
  renderActionMastery(): void;
  renderMasteryPool(): void;
  /**
   * Callback function to level up a mastery with pool xp
   * @param action The action object to level up
   * @param levels The number of levels to increase the action by
   */
  levelUpMasteryWithPoolXP(action: ActionType, levels: number): void;
  private exchangePoolXPForActionXP;
  /**
   * Adds mastery xp and mastery pool xp for completing an action with the given interval
   * @param action The action object to give mastery xp to
   * @param interval The interval of the action performed
   */
  addMasteryForAction(action: ActionType, interval: number): void;
  /**
   * Adds mastery xp for the specified action
   * @param action The action object to give mastery xp to
   * @param xp The experience to add to the action. Modifiers will not be applied.
   * @returns True, if the mastery level was increased
   */
  addMasteryXP(action: ActionType, xp: number): boolean;
  protected onMasteryLevelUp(action: ActionType, oldLevel: number, newLevel: number): void;
  /** Fires a modal indicating the skill has reached the maximum mastery level */
  private fireMaximumMasteryModal;
  /** Method fired when a mastery pool bonus is lost/gained */
  protected onMasteryPoolBonusChange(oldBonusLevel: number, newBonusLevel: number): void;
  protected wasPoolBonusChanged(oldBonusLevel: number, newBonusLevel: number, tier: number): boolean;
  addMasteryPoolXP(xp: number): void;
  /** Gets if a particular mastery pool tier active */
  isPoolTierActive(tier: number): boolean;
  /** Gets the change in mastery pool bonus level if xp is added/removed */
  getPoolBonusChange(xp: number): number;
  /** Gets the level of mastery pool bonus active based on an amount of pool xp */
  getMasteryCheckPointLevel(xp: number): number;
  private updateTotalCurrentMasteryLevel;
  /** Returns the sum of all current mastery levels */
  get totalCurrentMasteryLevel(): number;
  getTotalCurrentMasteryLevels(namespace: string): number;
  getMaxTotalMasteryLevels(namespace: string): number;
  addTotalCurrentMasteryToCompletion(completion: CompletionMap): void;
  /** The maximum total mastery level obtainable for the skill */
  get trueMaxTotalMasteryLevel(): number;
  /** Readonly. Returns the total amount of mastery XP earned for the skill */
  get totalMasteryXP(): number;
  /** Returns the total number of actions that have mastery that are currently unlocked */
  protected totalUnlockedMasteryActions: number;
  /** Calculates the numer of mastery actions unlocked for this skill. By default, updated on skill level up. */
  protected abstract getTotalUnlockedMasteryActions(): number;
  /** Returns the total number of actions that have mastery for this skill */
  protected get trueTotalMasteryActions(): number;
  /** Gets the mastery pool progress for the skill in %  */
  protected get masteryPoolProgress(): number;
  /**
   * Gets the modified mastery xp to add for performing an action.
   * @param action The action object to compute mastery xp for
   * @param interval The interval of the action performed
   * @returns The modified XP to add
   */
  getMasteryXPToAddForAction(action: ActionType, interval: number): number;
  /**
   * Gets the mastery XP to add to the pool for performing an action
   * @param xp The modified action mastery xp
   * @returns The mastery XP to add to the pool
   */
  getMasteryXPToAddToPool(xp: number): number;
  getMasteryXPModifier(action: ActionType): number;
  getMasteryLevel(action: ActionType): number;
  getMasteryXP(action: ActionType): number;
  get isAnyMastery99(): boolean;
  /** Gets the flat change in [ms] for the given masteryID */
  protected getFlatIntervalModifier(action: ActionType): number;
  /** Gets the percentage change in interval for the given masteryID */
  protected getPercentageIntervalModifier(action: ActionType): number;
  protected modifyInterval(interval: number, action: ActionType): number;
  constructor(namespace: DataNamespace, id: string, game: Game);
  protected onLevelUp(oldLevel: number, newLevel: number): void;
  registerData(namespace: DataNamespace, data: DataType): void;
  postDataRegistration(): void;
  protected computeTotalMasteryActions(): void;
  getMasteryProgress(action: ActionType): MasteryProgress;
  /** Updates all mastery displays in the DOM for the given action */
  updateMasteryDisplays(action: ActionType): void;
  /** Callback function for opening the spend mastery xp modal */
  openSpendMasteryXPModal(): void;
  /** Callback function for opening the mastery level unlocks modal */
  openMasteryLevelUnlockModal(): void;
  /** Callback function for opening the mastery pool bonus modal */
  openMasteryPoolBonusModal(): void;
  /** Rolls for all pets that have been registered to the skill */
  rollForPets(interval: number): void;
  encode(writer: SaveWriter): SaveWriter;
  decode(reader: SaveWriter, version: number): void;
  /** Converts the old mastery array for the skill */
  convertOldMastery(oldMastery: OldMasteryData, idMap: NumericIDMap): void;
  protected abstract getActionIDFromOldID(oldActionID: number, idMap: NumericIDMap): string;
}
interface MasteryProgress {
  xp: number;
  level: number;
  percent: number;
  nextLevelXP: number;
}
/** Base class for gathering skills. E.g. Skills that return resources but does not consume them. */
declare abstract class GatheringSkill<ActionType extends MasteryAction, DataType extends MasterySkillData> extends SkillWithMastery<ActionType, DataType> implements ActiveAction, Serializable {
  /** Timer for skill action */
  protected actionTimer: Timer;
  abstract renderQueue: GatheringSkillRenderQueue<ActionType>;
  /** If the skill is the currently active skill */
  isActive: boolean;
  get activeSkills(): this[];
  /** Returns if the skill can currently stop */
  protected get canStop(): boolean;
  /** Gets the rewards for the current action of the skill */
  protected abstract readonly actionRewards: Rewards;
  /** Gets the interval for the next action to perform */
  protected abstract readonly actionInterval: number;
  /** Gets the level for the current action of the skill */
  protected abstract readonly actionLevel: number;
  /** Mastery Object for the currently running action */
  protected abstract readonly masteryAction: ActionType;
  /** If the action state should be reset after save load */
  protected shouldResetAction: boolean;
  /** Mastery Level for the currently running action */
  protected get masteryLevel(): number;
  /** Gets the interval of the currently running action in [ms] */
  protected get currentActionInterval(): number;
  /** Modified interval for mastery XP/summoning calculations */
  protected abstract masteryModifiedInterval: number;
  /** Is the potion for the skill active */
  get isPotionActive(): boolean;
  get activePotion(): PotionItem | undefined;
  /** Processes a tick of time for the skill */
  activeTick(): void;
  /** Rendering hook for when the player's equipment changes */
  abstract onEquipmentChange(): void;
  onPageChange(): void;
  /** Performs rendering for the skill */
  render(): void;
  /** Gets debugging information for the skill */
  getErrorLog(): string;
  /** Starts up the skill with whatever selections have been made. Returns true if the skill was successfully started. */
  start(): boolean;
  /** Returns true if action stopped successfully */
  stop(): boolean;
  /** Method that occurs on stopping a skill, but before saving.
   *  Usage is for state changes required
   */
  protected onStop(): void;
  /** Starts the timer for the skill with the actionInterval */
  protected startActionTimer(): void;
  /** Hook for state mutatations at start of action */
  protected abstract preAction(): void;
  /** Hook for state mutatations at end of action
   *  Things that should go here:
   *  Potion Usage, Glove Charge Usage, Action/Interval Statistics
   *  Renders required after an action
   *  Tutorial Tracking
   */
  protected abstract postAction(): void;
  /** Performs the main action for the skill, then determines if it should continue */
  protected action(): void;
  /** Addes rewards to player, returns false if skill should stop */
  protected addActionRewards(): boolean;
  /** Rolls to add a mastery token to action rewards */
  protected addMasteryToken(rewards: Rewards): void;
  /** Adds rewards that are common to all skills for a successful action */
  protected addCommonRewards(rewards: Rewards): void;
  /** Adds the mastery XP reward for the current action */
  protected addMasteryXPReward(): void;
  protected resetActionState(): void;
  encode(writer: SaveWriter): SaveWriter;
  decode(reader: SaveWriter, version: number): void;
  /** Deserializes the skills state data */
  deserialize(reader: DataReader, version: number, idMap: NumericIDMap): void;
}
/** Base class for crafting skills. E.g. Skills that consume resources to make other resources. */
declare abstract class CraftingSkill<T extends MasteryAction, DataType extends MasterySkillData> extends GatheringSkill<T, DataType> {
  /** Gets the costs for the currently selected recipe */
  protected abstract getCurrentRecipeCosts(): Costs;
  /** Gets the ingredient preservation chance for the currently selected recipe */
  protected get actionPreservationChance(): number;
  /** Records statistics for preserving resources */
  protected abstract recordCostPreservationStats(costs: Costs): void;
  /** Records statistics for consuming resources */
  protected abstract recordCostConsumptionStats(costs: Costs): void;
  /** Gets the message for when the player does not have the required costs for an action */
  protected abstract noCostsMessage: string;
  /** Gets the preservation chance for the skill for a given masteryID */
  protected getPreservationChance(action: T, chance: number): number;
  protected getPreservationCap(): number;
  /** Performs the main action for the skill, stopping if the required resources are not met */
  protected action(): void;
}
declare class DummyActiveAction extends NamespacedObject implements ActiveAction {
  get name(): string;
  get media(): string;
  get activeSkills(): AnySkill[];
  getErrorLog(): string;
  isActive: boolean;
  stop(): boolean;
  activeTick(): void;
  constructor(dummyData: DummyData);
}
interface BasicSkillRecipeData extends IDData {
  baseExperience: number;
  level: number;
}
/** Base class for skill recipes with a level requirement and fixed xp */
declare abstract class BasicSkillRecipe extends MasteryAction {
  baseExperience: number;
  level: number;
  constructor(namespace: DataNamespace, data: BasicSkillRecipeData);
}
interface SingleProductRecipeData extends BasicSkillRecipeData {
  productId: string;
}
/** Base class for skill recipes that produce a single product item */
declare class SingleProductRecipe extends BasicSkillRecipe {
  get name(): string;
  get media(): string;
  product: AnyItem;
  constructor(namespace: DataNamespace, data: SingleProductRecipeData, game: Game);
}
interface SkillCategoryData extends IDData {
  media: string;
  name: string;
}
declare class SkillCategory extends NamespacedObject {
  protected skill: AnySkill;
  get media(): string;
  get name(): string;
  private _name;
  private _media;
  constructor(namespace: DataNamespace, data: SkillCategoryData, skill: AnySkill);
}
declare class GatheringSkillRenderQueue<ActionType extends MasteryAction> extends MasterySkillRenderQueue<ActionType> {
  progressBar: boolean;
}
declare type ItemCurrencyObject = {
  items: AnyItemQuantity[];
  gp: number;
  sc: number;
};
/** Class to manage the item, gp, and slayer coin costs of crafting skills */
declare class Costs {
  protected game: Game;
  get gp(): number;
  get sc(): number;
  get raidCoins(): number;
  protected _items: Map<AnyItem, number>;
  protected _gp: number;
  protected _sc: number;
  protected _raidCoins: number;
  constructor(game: Game);
  /** Adds an item by its unique string identifier */
  addItemByID(itemID: string, quantity: number): void;
  addItem(item: AnyItem, quantity: number): void;
  addGP(amount: number): void;
  addSlayerCoins(amount: number): void;
  addRaidCoins(amount: number): void;
  /**
   * Gets an ItemQuantity array to interface with UI classes
   */
  getItemQuantityArray(): AnyItemQuantity[];
  /** Increments the stat provided by the gp cost */
  recordGPStat(tracker: StatTracker, stat: number): void;
  /** Increments the stat provided by the slayer coin cost */
  recordSCStat(tracker: StatTracker, stat: number): void;
  /** Increments the stat provided by the quantity of all item costs */
  recordBulkItemStat(tracker: StatTracker, stat: number): void;
  /** Increments the stat provided by the base sale cost of all item costs */
  recordBulkItemValueStat(tracker: StatTracker, stat: number): void;
  /** Increments the Item stat provided for all item costs by their quantity */
  recordIndividualItemStat(stat: ItemStats): void;
  /** Resets all stored costs */
  reset(): void;
  /** Checks if the player has all the costs */
  checkIfOwned(): boolean;
  /** Consumes all the stored costs from the player */
  consumeCosts(): void;
}
/** Class to manage the gain of rewards from crafting skills */
declare class Rewards extends Costs {
  private _xp;
  addXP(skill: AnySkill, amount: number): void;
  getXP(skill: AnySkill): number;
  /** Gives the currently set rewards to the player, returns true if not all items were given */
  giveRewards(): boolean;
  /** Forcefully gives the currently set rewards to the player, ignoring bank space for the items */
  forceGiveRewards(): boolean;
  reset(): void;
}
declare type AnySkill = Skill<any>;
declare type SidebarCategoryBuilder = (category: SidebarCategoryWrapper) => unknown;
declare type SidebarItemBuilder = (item: SidebarItemWrapper) => unknown;
declare type SidebarSubitemBuilder = (subitem: SidebarSubitemWrapper) => unknown;
interface SidebarWrapper {
  category(id: string, builder?: SidebarCategoryBuilder): SidebarCategoryWrapper;
  category(id: string, config?: SidebarCategoryConfig, builder?: SidebarCategoryBuilder): SidebarCategoryWrapper;
  categories(): SidebarCategoryWrapper[];
  removeCategory(id: string): void;
  removeAllCategories(): void;
  render(): void;
}
interface SidebarCategoryConfig {
  rootClass?: string | null;
  categoryClass?: string | null;
  name?: string | HTMLElement | null;
  nameClass?: string | null;
  toggleable?: boolean | null;
  before?: string | null;
  after?: string | null;
  onClick?: () => unknown | null;
  onRender?: (elements: SidebarCategoryRenderCallbackParameter) => unknown;
}
interface SidebarCategoryRenderCallbackParameter {
  rootEl: HTMLLIElement;
  categoryEl: HTMLDivElement;
  nameEl: HTMLSpanElement;
  toggleEl?: HTMLElement;
}
interface SidebarCategoryWrapper {
  id: string;
  rootEl?: HTMLLIElement;
  categoryEl?: HTMLDivElement;
  nameEl?: HTMLSpanElement;
  toggleEl?: HTMLElement;
  click(): void;
  toggle(force?: boolean): void;
  item(id: string, builder?: SidebarItemBuilder): SidebarItemWrapper;
  item(id: string, config?: SidebarItemConfig, builder?: SidebarItemBuilder): SidebarItemWrapper;
  items(): SidebarItemWrapper[];
  remove(): void;
  removeItem(id: string): void;
  removeAllItems(): void;
}
interface SidebarItemConfig {
  rootClass?: string | null;
  itemClass?: string | null;
  icon?: string | HTMLElement | null;
  iconClass?: string | null;
  name?: string | HTMLElement | null;
  nameClass?: string | null;
  aside?: string | HTMLElement | null;
  asideClass?: string | null;
  link?: string | null;
  ignoreToggle?: boolean | null;
  before?: string | null;
  after?: string | null;
  onClick?: () => unknown | null;
  onRender?: (elements: SidebarItemRenderCallbackParameter) => unknown;
}
interface SidebarItemRenderCallbackParameter {
  rootEl: HTMLLIElement;
  itemEl: HTMLAnchorElement;
  iconEl: HTMLSpanElement;
  nameEl: HTMLSpanElement;
  asideEl?: HTMLElement;
  subMenuEl?: HTMLElement;
}
interface SidebarItemWrapper {
  id: string;
  rootEl?: HTMLLIElement;
  itemEl?: HTMLAnchorElement;
  iconEl?: HTMLSpanElement;
  nameEl?: HTMLSpanElement;
  asideEl?: HTMLElement;
  subMenuEl?: HTMLUListElement;
  click(): void;
  toggle(force?: boolean): void;
  subitem(id: string, builder?: SidebarSubitemBuilder): SidebarSubitemWrapper;
  subitem(id: string, config?: SidebarSubitemConfig, builder?: SidebarSubitemBuilder): SidebarSubitemWrapper;
  subitems(): SidebarSubitemWrapper[];
  remove(): void;
  removeSubitem(id: string): void;
  removeAllSubitems(): void;
  category: SidebarCategoryWrapper;
}
interface SidebarSubitemConfig {
  rootClass?: string | null;
  subitemClass?: string | null;
  name?: string | HTMLElement | null;
  nameClass?: string | null;
  aside?: string | HTMLElement | null;
  asideClass?: string | null;
  link?: string | null;
  before?: string;
  after?: string;
  onClick?: () => unknown | null;
  onRender?: (elements: SidebarSubitemRenderCallbackParameter) => unknown;
}
interface SidebarSubitemRenderCallbackParameter {
  rootEl: HTMLLIElement;
  subitemEl: HTMLAnchorElement;
  nameEl: HTMLSpanElement;
  asideEl?: HTMLElement;
}
interface SidebarSubitemWrapper {
  id: string;
  rootEl?: HTMLLIElement;
  subitemEl?: HTMLAnchorElement;
  nameEl?: HTMLSpanElement;
  asideEl?: HTMLElement;
  click(): void;
  remove(): void;
  item: SidebarItemWrapper;
}
declare class Sidebar {
  private rootSelector;
  rootEl?: HTMLUListElement;
  private rendered;
  private categories;
  private categoriesOrder;
  constructor(rootSelector: string);
  get isRendered(): boolean;
  render(): void;
  getCategory(id: string): SidebarCategory | undefined;
  getAllCategories(): SidebarCategory[];
  addCategory(id: string, config?: SidebarCategoryConfig): SidebarCategory;
  removeCategory(id: string): void;
  removeAllCategories(): void;
  configureCategory(id: string, config: SidebarCategoryConfig): void;
  private orderCategory;
  private renderCategories;
}
declare class SidebarCategory {
  id: string;
  private config;
  rootEl?: HTMLLIElement;
  categoryEl?: HTMLDivElement;
  nameEl?: HTMLSpanElement;
  toggleEl?: HTMLElement;
  private rendered;
  private expanded;
  private items;
  private itemsOrder;
  constructor(id: string, config?: SidebarCategoryConfig);
  get isRendered(): boolean;
  configure(config?: SidebarCategoryConfig): void;
  render(): void;
  toggle(force?: boolean): void;
  click(): void;
  getItem(id: string): SidebarItem | undefined;
  getAllItems(): SidebarItem[];
  addItem(id: string, config?: SidebarItemConfig): SidebarItem;
  removeItem(id: string): void;
  removeAllItems(): void;
  configureItem(id: string, config: SidebarItemConfig): void;
  private orderItem;
  private renderItems;
  private update;
  private updateRootEl;
  private updateCategoryEl;
  private updateNameEl;
  private updateToggle;
}
declare class SidebarItem {
  id: string;
  private config;
  rootEl?: HTMLLIElement;
  itemEl?: HTMLAnchorElement;
  iconEl?: HTMLSpanElement;
  nameEl?: HTMLSpanElement;
  asideEl?: HTMLElement;
  subMenuEl?: HTMLUListElement;
  private rendered;
  private expanded;
  private subitems;
  private subitemsOrder;
  constructor(id: string, config?: SidebarItemConfig);
  get isRendered(): boolean;
  get ignoreToggle(): boolean;
  configure(config?: SidebarItemConfig): void;
  render(): void;
  toggle(force?: boolean): void;
  click(): void;
  getSubitem(id: string): SidebarSubitem | undefined;
  getAllSubitems(): SidebarSubitem[];
  addSubitem(id: string, config?: SidebarSubitemConfig): SidebarSubitem;
  removeSubitem(id: string, removingAll?: boolean): void;
  removeAllSubitems(): void;
  configureSubitem(id: string, config: SidebarSubitemConfig): void;
  private orderSubitem;
  private renderSubitems;
  private update;
  private updateRoot;
  private updateItem;
  private updateIcon;
  private updateName;
  private updateAside;
}
declare class SidebarSubitem {
  id: string;
  private config;
  rootEl?: HTMLLIElement;
  subitemEl?: HTMLAnchorElement;
  nameEl?: HTMLSpanElement;
  asideEl?: HTMLElement;
  private rendered;
  constructor(id: string, config?: SidebarSubitemConfig);
  get isRendered(): boolean;
  configure(config?: SidebarSubitemConfig): void;
  render(): void;
  click(): void;
  private update;
  private updateRoot;
  private updateSubitem;
  private updateName;
  private updateAside;
}
declare const sidebar: SidebarWrapper;
declare function openLink(e: MouseEvent): void;
declare class Gamemode { };
declare function createNewCharacterInSlot(slotID: Number, gamemode: Gamemode, characterName: string): Promise<void>;
declare let currentCharacter: number;
