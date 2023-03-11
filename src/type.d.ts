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
  action?: "pickUp" | "drop" | "use" | "mute" | "attribute";
  duration?: number;

  health?: number;
  attack?: number;
  defense?: number;
  dodge?: number;

  where?: string; // 作用对象 牌组处，玩家处
  to?: string;
  drop?: number;
  pickUp?: number;
  cardType?: string; //卡牌类型

  effectStep?: string;
  effectType?: number;
}

declare interface CardProp {
  id: string;
  type: cardType;
  name: string;
  describe: string;
  SkillId?: string;
  Skill?: SkillProp | null;
}

// ws
declare type roomStatus = "ready" | "playing" | "end";

declare type playerStatus = "offline" | "online" | "ready" | "playing";

declare type messageType = "info" | "message" | "enter" | "start" | "exit" | "error";

declare interface MessageData {
  type: messageType;
  from?: userId;
  timestamp?: number;
  to?: userId | userId[];
  msg?: string;
  roomId?: roomId;
  content?: any;
}

declare interface Task {
  date: Date;
  action: () => void;
}

namespace Game {
  // 公用类型
  type deck = "center" | "hands" | "equip" | "bulletin";

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
