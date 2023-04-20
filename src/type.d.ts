declare interface UserProp {
  id: string;
  avatar: string;
  nickname: string;
}

declare interface CharacterProp {
  health: number;
  attack: number;
  defense: number;
  dodge: number;
}

declare const enum CardType {
  equip = "equip",
  clue = "clue",
  prop = "prop"
}
declare const enum TrggierType {}
declare interface CardProp {
  id: string;
  name: string;
  describe: string;
  type: CardType;
  EffectId: string;
  triggerTime: TrggierType | null;
  Effect: CardEffectProp;
}

declare interface CardEffectProp {
  id: string;
}

declare interface Task {
  date: Date;
  action: () => void;
}
