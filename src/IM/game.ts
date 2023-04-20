import { TimerTask } from "../utils/timerTask";
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
  setGameStatus(status: GameStatus) {
    this.status = status;
    switch (status) {
    }
    this.room.members.forEach((player) => {
      player.sendInfo();
    });
  }
  run() {
    TimerTask.register({
      date: new Date(Date.now() + 1000 * 2),
      action: () => {
        this.room.members.forEach((player) => player.setCharacter());
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
          const currRoundIndex = [...room.members].findIndex((item) => item.id === id);
          const nextPlayer = [...room.members][currRoundIndex + 1] || null;
          if (nextPlayer) {
            game.setRound(nextPlayer.id);
          } else {
            game.handleVote();
          }
        }
      }
    });
  }

  handleVote() {
    const { room } = this;
    TimerTask.register({
      date: new Date(Date.now() + 1000 * 10),
      action: () => {
        room.members.forEach((player) => player.setCharacter());
        let firstPlayer = (this.room.getMembers() || [])[0] || null;
        firstPlayer && this.setRound(firstPlayer.id);
      }
    });
  }
}
