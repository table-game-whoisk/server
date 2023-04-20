import { TimerTask } from "../utils/timerTask";
import { Player } from "./player";
import { Room } from "./room";

export class Character implements CharacterProp {
  health: number = Math.floor(Math.random() * 3 + 3);
  attack: number = Math.floor(Math.random() * 2 + 1);
  defense: number = Math.floor(Math.random() * 2 + 1);
  dodge: number = Math.floor(Math.random() * 2 + 1);
  // equip: any[] = []; //装备
  // cardList: any[] = [];

  getCharacterProp(): CharacterProp {
    const { health, attack, defense, dodge } = this;
    return { health, attack, defense, dodge };
  }
}

export class Game {
  status: GameStatus;
  room: Room;
  currentRound: string | null = null;

  constructor(room: Room) {
    room.roomNotice("游戏开始...");
    this.status = GameStatus.character;
    this.room = room;
    this.run();
  }

  run() {
    // 1. 给每个玩家分配基本属性
    // 2. 给每个玩家随机分配 其他玩家的通关密码
    // 2. 开始回合
    //   2-1. 玩家选择真话或者假话，超时不选系统选择
    //   2-2. 玩家抽牌
    //   2-3. 玩家出牌
    //   2-4. 玩家选择是否攻击其他玩家
    //   2-5. 玩家弃牌，若没有弃牌，超时后系统自动弃牌

    TimerTask.register({
      date: new Date(Date.now() + 1000 * 2),
      action: () => {
        const { room } = this;
        const members = [...room.members].sort(() => Math.random() - 0.5);
        [...room.members].forEach((player, index) => {
          player.setCharacter();
          player.fakeKey = {
            index,
            nickname: members[index].nickname,
            key: members[index].key
          };
        });
        let firstPlayer = (this.room.getMembers() || [])[0] || null;
        firstPlayer && this.setRound(firstPlayer.id);
      }
    });
  }

  setRound(id: string) {
    const { room } = this;
    this.currentRound = id;
    const currRoundPlayer = [...room.members].find((player) => player.id === id) || null;
    if (currRoundPlayer) {
      room.roomNotice(`${currRoundPlayer.nickname}的回合开始`);
      currRoundPlayer.sendInfo();
    }

    TimerTask.register({
      date: new Date(Date.now() + 1000 * 10),
      action: () => {
        const { game } = room;
        if (!game) return;
        if (game.currentRound === id) {
          let members = [...room.members];
          if (members.length <= 0) return;
          const currRoundIndex = members.findIndex((item) => item.id === id);
          const nextPlayer = members[(currRoundIndex + 1) % members.length] || null;
          nextPlayer && game.setRound(nextPlayer.id);
        }
      }
    });
  }
  checkMessage(message: string, player: Player) {
    if (message.replace("#", "") === player.key) {
      player.setPlayerStatus(PlayerStatus.end);
      let count = 0;
      player.room?.members.forEach((p) => {
        if (p.status === PlayerStatus.end) count += 1;
        if (count >= Math.floor(player.room?.memberCount || 4 * 0.8)) {
          this.status = GameStatus.end;
        }
      });
      return true;
    }
  }
}
