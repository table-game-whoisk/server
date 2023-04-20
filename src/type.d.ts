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

type CardType = "equip" | "trop" | "clue";
declare interface CardProp {
  id: string;
  name: string;
  describe: string;
  type: CardType;
  EffectId: string;
  Effect: CardEffectProp;
}

declare interface CardEffectProp {}

declare interface Task {
  date: Date;
  action: () => void;
}
