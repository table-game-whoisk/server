declare const enum GameStatus {
  character = "character", // 选择角色阶段
  round = "round", // 回合阶段
  end = "end" // 游戏结束
}

declare interface FakeKey {
  index: number;
  nickname: string;
  key: string | null;
}

declare namespace Material {
  const enum EffectType {
    character = "character",
    card = "card",
    game = "game"
  }

  interface Card<T> {
    id: string;
    name: string;
    describe: string;
    type: CardType;
    Effect: T extends EffectType.character ? CharacterEffect : T extends EffectType.card ? CardEffect : null;
  }

  // 角色基本属性
  interface CharacterEffect {
    health: number;
    attack: number;
    defense: number;
    dodge: number;
  }

  // 卡牌得失
  interface CardEffect {
    drop: number;
    gain: number;
    from: 0 | 1 | 2; // 0自己，1其他玩家，2牌堆，
    to: 0 | 1 | 2;
  }

  interface GameEffect {}
}
