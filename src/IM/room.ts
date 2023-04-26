import { TimerTask } from "../utils/timerTask";
import { Player } from "./player";

function getRandomIndex(n: number, m: number) {
  const results: number[] = [];
  if (n > m) {
    return results;
  }
  while (results.length < n) {
    const randomNumber = Math.floor(Math.random() * (m + 1));
    if (!results.includes(randomNumber)) {
      results.push(randomNumber);
    }
  }
  return results;
}

export interface RoomOption {
  id: string;
  owner: string;
  memberCount?: number;
  subject?: string;
}

export class Room {
  static roomList = new Map<string, Room>();

  id: string;
  members = new Set<Player>();
  owner: string;
  status: RoomStatus = RoomStatus.end;
  memberCount: number;
  subject?: string;

  messages: Message[] = [];
  currentPlayer: Player | null = null;
  undercoverKey: string[] = [];

  constructor({ id, owner, memberCount, subject }: RoomOption) {
    this.id = id;
    this.owner = owner;
    this.memberCount = memberCount || 4;
    this.subject = subject;
  }

  static createRoom(roomOptions: RoomOption, player: Player) {
    const room = new Room(roomOptions);
    Room.roomList.set(room.id, room);
    room.addMember(player);
  }
  static destroyRoom(roomId: RoomId) {
    Room.roomList.delete(roomId);
  }
  static findRoom(roomId: RoomId) {
    return Room.roomList.get(roomId) || null;
  }

  setStatus(status: RoomStatus) {
    this.status = status;
    if (status === RoomStatus.addKey) {
      this.members.forEach((player) => player.sendInfo());
      TimerTask.register({
        date: new Date(Date.now() + 1000 * 1.5),
        action: () => {
          this.members.forEach((player) => player.sendNotice(NoticeType.key));
        }
      });
    } else if (status === RoomStatus.round) {
      let playingMembers = this.residuePlayers();
      if (playingMembers) {
        this.addMessage("请玩家轮流发言");
        playingMembers.forEach((player) => (player.voteCount = 0));
        const currentPlayer = playingMembers[0];
        currentPlayer && this.setRound(this, currentPlayer);
      }
    } else if (status === RoomStatus.vote) {
      let playingMembers = this.residuePlayers();
      if (playingMembers) {
        playingMembers.forEach((player) => {
          player.isVoted = false;
          player.status = PlayerStatus.playing;
        });
      }
      this.members.forEach((player) => player.sendInfo());
      TimerTask.register({
        date: new Date(Date.now() + 1000 * 1.5),
        action: () => {
          this.members.forEach((player) => {
            player.sendNotice(NoticeType.vote);
          });
        }
      });
    } else if (status === RoomStatus.end) {
      this.messages = [];
      this.undercoverKey = [];
      this.currentPlayer = null;
      this.members.forEach((player) => player.resetPlayer());
      this.members.forEach((player) => player.sendInfo());
    }
  }

  addMember(player: Player) {
    if (this.findMember(player.id)) {
      player.sendEroor("你已经在房间内了");
      return;
    }
    if (this.members.size >= this.memberCount) {
      player.sendEroor("房间已满");
      return;
    }
    if (this.status !== RoomStatus.end) {
      player.sendEroor("该房间在游戏中");
      return;
    }
    player.room = this;
    this.members.add(player);
    this.members.forEach((player) => {
      player.sendInfo();
    });
  }
  findMember(id: PlayerId): Player | null {
    let player: Player | null = null;
    this.members.forEach((p) => {
      if (p.id === id) {
        player = p;
      }
    });
    return player;
  }
  removeMember(player: Player) {
    this.members.forEach((p) => {
      if (player.id === p.id) {
        this.members.delete(p);
      }
    });
    if (this.members.size === 0) {
      Room.destroyRoom(this.id);
    } else {
      // 重新任命房主
      if (this.owner === player.id) {
        const newPlayer = [...this.members][0];
        this.owner = newPlayer.id;
      }
      this.members.forEach((player) => player.sendInfo());
    }
  }
  disslove() {
    this.members.forEach((player) => {
      player.setStatus(PlayerStatus.online);
      player.room = null;
      // 通知玩家
      this.members.delete(player);
    });
  }
  getInfo(): RoomInfo {
    const { id, members, messages, owner, memberCount, subject, status, currentPlayer, undercoverKey } = this;
    let membersInfo: PlayerInfo[] = [];
    members.forEach(({ id, avatar, status, nickname, voteCount }) =>
      membersInfo.push({ id, avatar, status, nickname, voteCount })
    );
    return {
      id,
      members: membersInfo,
      messages,
      owner,
      memberCount,
      subject,
      status,
      currentPlayer: currentPlayer
        ? {
            id: currentPlayer.id,
            avatar: currentPlayer.avatar,
            nickname: currentPlayer.nickname,
            status: currentPlayer.status,
            voteCount: currentPlayer.voteCount
          }
        : null,
      undercoverKey
    };
  }
  addMessage(text: string, player?: Player) {
    if (player?.status === PlayerStatus.mute) {
      player.sendEroor("其他玩家回合时，不能发言");
      return;
    }
    if (player?.status === PlayerStatus.out) {
      player.sendEroor("被淘汰玩家不能发言");
      return;
    }
    if (player && this.status === RoomStatus.round) {
      const playingMembers = this.residuePlayers();
      if (playingMembers) {
        player.status = PlayerStatus.mute;
        this.setNextRoundPlayer(player);
      }
    }
    const messageFrom = {
      id: player ? player.id : "0",
      nickname: player ? player.nickname : "system",
      avatar: player ? player.avatar : ""
    };

    this.messages.push({
      timestamp: Date.now(),
      messageFrom,
      message: text
    });
    this.members.forEach((player) => player.sendInfo());
  }
  setMembersRole(key: string, player: Player) {
    const members = [...this.members];
    player.key = key;
    player.sendInfo();

    if (members.filter((player) => player.key).length === this.memberCount) {
      let undercoverCount = Math.ceil(members.length * 0.2);
      getRandomIndex(undercoverCount, members.length - 1).forEach((index) => {
        members[index].role = "undercover";
        members[index].key && this.undercoverKey.push(members[index].key!);
      });
      this.setStatus(RoomStatus.round);
    }
  }
  setRound(room: Room, currentPlayer: Player) {
    room.currentPlayer = currentPlayer;
    TimerTask.register({
      date: new Date(Date.now() + 1000 * 1),
      action: () => room.addMessage(`${currentPlayer.nickname}回合开始`)
    });
    currentPlayer.sendNotice(NoticeType.testimony);
    const playingMembers = room.residuePlayers();
    if (playingMembers) {
      playingMembers.forEach((player) => {
        player.status = currentPlayer.id === player.id ? PlayerStatus.playing : PlayerStatus.mute;
      });
    }
    room.members.forEach((player) => player.sendInfo());

    TimerTask.register({
      date: new Date(Date.now() + 1000 * 60),
      action: () => room.setNextRoundPlayer.call(room, currentPlayer)
    });
  }

  handleVote(voteId: PlayerId, player: Player) {
    let playingMembers = this.residuePlayers();
    if (playingMembers) {
      const count = playingMembers.reduce((sum, currnt) => {
        if (currnt.id === voteId) {
          currnt.voteCount += 1;
        }
        return (sum += currnt.voteCount);
      }, 0);
      if (count === playingMembers.length) {
        let index = playingMembers.reduce((maxIndex, current, currRoundIndex, arr) => {
          if (current.voteCount > arr[maxIndex].voteCount) {
            return currRoundIndex;
          }
          return maxIndex;
        }, 0);
        if (playingMembers[index].voteCount > 1) {
          playingMembers[index].setStatus(PlayerStatus.out);
          const { nickname, role, key } = playingMembers[index];
          TimerTask.register({
            date: new Date(Date.now() + 1000 * 3),
            action: () => {
              this.addMessage(`玩家${nickname}出局，身份是${role === "civilian" ? "平民" : "卧底"},他关键词：${key}`);
            }
          });
        }
        TimerTask.register({
          date: new Date(Date.now() + 1000 * 1),
          action: () => {
            this.setStatus(RoomStatus.round);
          }
        });
      }
      playingMembers.forEach((p) => p.sendInfo());
    }
  }

  setNextRoundPlayer(currentPlayer: Player) {
    if (this.currentPlayer?.id === currentPlayer.id) {
      let playingMembers = this.residuePlayers();
      if (!playingMembers) return;
      if (playingMembers.length <= 0) return;
      const currRoundIndex = playingMembers.findIndex((item) => item.id === currentPlayer.id);
      const nextPlayer = playingMembers[currRoundIndex + 1] || null;
      nextPlayer
        ? this.setRound(this, nextPlayer)
        : this.status === RoomStatus.round
        ? this.setStatus(RoomStatus.vote)
        : null;
    }
  }

  // outPlayer(playerId: PlayerId, player: Player) {
  //   if (player.role !== "undercover") {
  //     return;
  //   }
  //   let playingMembers = this.residuePlayers();
  //   if (playingMembers) {
  //     let outPlayer = playingMembers.find((p) => p.id === playerId);
  //     if (outPlayer) {
  //       if (outPlayer.role === "undercover") {
  //         player.sendEroor("你不能淘汰你的同盟");
  //         return;
  //       }
  //       outPlayer.setStatus(PlayerStatus.out);
  //       const { nickname, role, key } = outPlayer;
  //       TimerTask.register({
  //         date: new Date(Date.now() + 1000 * 3),
  //         action: () => {
  //           this.addMessage(`玩家${nickname}被卧底淘汰出局,他关键词：${key}`);
  //         }
  //       });
  //     }

  //     TimerTask.register({
  //       date: new Date(Date.now() + 1000 * 2),
  //       action: () => {
  //         this.setStatus(RoomStatus.round);
  //       }
  //     });
  //   }
  // }

  residuePlayers() {
    const members = [...this.members];
    const playingMembers = members.filter((player) => player.status !== PlayerStatus.out);

    let undercoverCount = 0;
    playingMembers.forEach((player) => {
      if (player.role === "undercover") {
        undercoverCount += 1;
      }
    });

    if (undercoverCount === 0 || playingMembers.length - undercoverCount === undercoverCount) {
      this.addMessage(undercoverCount === 0 ? "平民胜利" : "卧底胜利");
      TimerTask.register({
        date: new Date(Date.now() + 1000 * 2),
        action: () => {
          this.setStatus(RoomStatus.end);
        }
      });

      return null;
    }

    return playingMembers;
  }
}
