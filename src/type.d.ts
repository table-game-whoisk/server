type userId = string;
type roomId = string;

// DB
declare interface UserProp {
  id: string;
  ip: string;
  nickname?: string;
}
type materialType = "character" | "card" | "clue";
type cardType = "trop" | "prop" | "action" | "clue";

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
  duration?: number;
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
  describe: string;
  SkillId?: string;
  Skill?: SkillProp | null;
}

// game material
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

declare type playerStatus = "offline" | "online" | "ready" | "playing";

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
  | "message"
  | "getMessage"
  | "error";

declare interface PlayerInfo {
  id: string;
  status: string;
  avatarUrl: string | null;
  character: CharacterProp | null;
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
  characteList?: CharacterProp[];
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
    : string;
  messages?: Message[];
}

declare interface Task {
  date: Date;
  action: () => void;
}

namespace Game {
  // 公用类型
  type deck = "center" | "hands" | "equip" | "bulletin";
  type gameStep = "start" | "character" | "round" | "vote" | "end";

  // 角色类
  interface Character {
    id: string;
    name: string;
    attribiute: Attribute;
    skill: {
      name: string;
      describe: string;
      effect: skillEffect;
    } | null;
  }

  interface Attribute {
    health: number;
    attack: number;
    defense: number;
    dodge: number;
  }

  interface skillEffect {
    //  对角色属性作用，对卡牌作用，对角色动作，对游戏步骤作用
    to: string | string[];
    duration: number; //回合数
    character?: Attribute;
    action?: "pickUp" | "drop" | "use" | "mute"; // 抓牌，弃牌，出牌，禁止
    card?: {
      drop: number | null;
      pickUp: number | null;
      where: deck | string | string[] | null; // 中央牌组 ,手牌，装备区,线索区,其他玩家
      type: cardType | null; //卡牌类型
    };
  }

  // 卡牌类
  type cardType = "trap" | "action" | "cule";

  interface Card {
    id: string;
    name: string;
    type: cardType;
    describe: string;
    effect?: skillEffect;
  }

  // 线索类
  interface Clue {
    id: string;
    key: string; // 谜底
    point: string[]; // 关联id 父线索，子线索
    riddle: string; // 谜面
  }
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
