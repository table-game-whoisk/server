declare const enum GameStatus {
  character = "character", // 选择角色阶段
  round = "round", // 回合阶段
  vote = "vote", // 投票阶段
  end = "end" // 游戏结束
}

namespace Material {
  class Character {}
  interface Card {}
  interface Effect {}
}
