type userId = string;
type roomId = string;

// DB
declare interface UserProp {
  id: string;
  ip: string;
  nickname?: string;
}

declare interface CharacterProp {
  id: string;
  name: string;
  type: string;
  health: number;
  attack: number;
  defense: number;
  dodge: number;
  SkillId?: string;
  Skill?: SkillProp | null;
}

declare interface SkillProp {
  id: string;
  name: string;
  describe: string;
  effectType: EffectType;
  duration?: number; // 约定 -1 为永久
  timing: EffetcTime; // 发动时机
  target: EffectTarget;
  // 对角色属性影响
  health?: number;
  attack?: number;
  defense?: number;
  dodge?: number;

  // 对玩家回合影响
  action?: RoundAction;
  roundNumber?: number;
  // 对卡牌影响
  cardOrigin?: CardOrigin;
  cardType?: cardType;
  drop?: number;
  gain?: number;
}

declare interface CardProp {
  id: string;
  type: cardType;
  name: string;
  trigger: trigger;
  describe: string;
  SkillId?: string;
  Skill?: SkillProp | null;
}

// game material
declare type trigger = "even" | "odd";
declare type cardType = "trop" | "prop" | "action" | "clue";
declare type gameStep = "start" | "character" | "round" | "vote" | "end";
declare type EffectType = "characterEffect" | "roundEffect" | "cardSetpEffect";
declare type EffetcTime = "selfRound" | "ortherRound" | "anytime";
declare type EffectTarget = "self" | "anyone" | "all";
declare type CardOrigin = "center" | "anyone";
declare type RoundAction = "mute" | "gainCard" | "useCard";

declare interface CharacterEffect {
  health: number;
  attack: number;
  defense: number;
  dodge: number;
}

declare interface RoundEffect {
  action: RoundAction;
  roundNumber: number;
}

declare interface CardSetpEffect {
  cardOrigin: CardOrigin;
  cardType?: cardType;
  drop: number; // 约定 -1 为失去cardtype 对应的所有牌
  gain: number;
}

declare interface Skill<T extends EffectType> {
  id: string;
  name: string;
  describe: string;
  effectType: EffectType;
  timing: EffetcTime; // 发动时机
  duration?: number;
  effect: T extends "characterEffect" ? CharacterEffect : T extends "roundEffect" ? RoundEffect : CardSetpEffect;
}

// ws
declare type roomStatus = "ready" | "playing";

declare type playerStatus = "offline" | "online" | "ready" | "playing" | "out" | "mute";

declare type EffectTarget = "self" | "anyone" | "all";

declare type messageType =
  | "info"
  | "create"
  | "enter"
  | "exit"
  | "ready"
  | "start"
  | "character"
  | "round"
  | "vote"
  | "card"
  | "drop"
  | "skill"
  | "message"
  | "getMessage"
  | "error";

declare interface PlayerInfo {
  id: string;
  status: string;
  avatarUrl: string | null;
  character: CharacterProp | null;
  cardList: CardProp[];
  nickname: string | null;
}

declare interface Message {
  timestamp: number;
  messageFrom: PlayerInfo;
  to?: userId | userId[] | undefined;
  message: string;
}

declare interface RoomInfo {
  roomId: string | null;
  status: string | null;
  owner: string | null;
  gameStep: Game.gameStep | null;
  members: PlayerInfo[] | null;
}

declare interface SelecteCharacter {
  character?: CharacterProp;
  characterList?: CharacterProp[];
}

declare interface MessageData<T extends messageType = "messages"> {
  type: messageType;
  player?: PlayerInfo;
  room?: RoomInfo | null;
  timestamp?: number;
  to?: userId | userId[];
  msg?: string;
  roomId?: roomId;
  content?: T extends "messages"
    ? string
    : T extends "character"
    ? SelecteCharacter
    : T extends "round"
    ? PlayerInfo
    : T extends "card"
    ? DealCard
    : T extends "drop"
    ? CardProp[]
    : string;
  messages?: Message[];
}

declare interface DealCard {
  to?: userId;
  cards?: CardProp[];
  card?: CardProp;
}

declare interface Task {
  date: Date;
  action: () => void;
}

// test
namespace Test {
  declare interface Listener {
    userId: string;
    socket: WebSocket.websocket;
    message: () => Promise<MessageData>;
    send: (message: MessageData) => void;
  }
}
