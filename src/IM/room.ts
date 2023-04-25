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
      TimerTask.register({
        date: new Date(Date.now() + 1000 * 3),
        action: () => {
          this.members.forEach((player) => player.sendNotice(NoticeType.key));
        }
      });
    } else if (status === RoomStatus.round) {
      let playingMembers = this.residuePlayers();
      if (playingMembers) {
        const currentPlayer = playingMembers[0];
        currentPlayer && this.setRound(this, currentPlayer);
      }
    } else if (status === RoomStatus.vote) {
      let playingMembers = this.residuePlayers();
      if (playingMembers) {
        playingMembers.forEach((player) => (player.status = PlayerStatus.playing));
      }
      TimerTask.register({
        date: new Date(Date.now() + 1000 * 3),
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
  addMessage(text: string, player?: Player, type?: NoticeType.key | NoticeType.vote) {
    if (player?.status === PlayerStatus.mute) {
      player.sendEroor("其他玩家回合时，不能发言");
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
      type,
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
    currentPlayer.sendNotice(NoticeType.testimony);
    room.members.forEach((player) => {
      player.status = player.status === PlayerStatus.playing ? PlayerStatus.mute : player.status;
    });
    currentPlayer.status = PlayerStatus.playing;
    room.members.forEach((player) => player.sendInfo());

    TimerTask.register({
      date: new Date(Date.now() + 1000 * 10),
      action: () => room.setNextRoundPlayer.call(room, currentPlayer)
    });
  }

  handleVote(voteId: PlayerId, player: Player) {
    let count = 0;
    let playingMembers = this.residuePlayers();
    if (playingMembers) {
      playingMembers.forEach((p) => {
        if (p.id === voteId) p.voteCount += 1;
        count += p.voteCount;
      });
      player.sendInfo();
      if (count === playingMembers.length) {
        let outPlyer: Player = playingMembers[0];
        outPlyer &&
          playingMembers.forEach((player) => {
            outPlyer = player.voteCount > outPlyer.voteCount ? player : outPlyer;
            player.voteCount = 0; // 统计完票数后 归零
          });
        outPlyer.setStatus(PlayerStatus.out);

        TimerTask.register({
          date: new Date(Date.now() + 1000 * 3),
          action: () => {
            this.setStatus(RoomStatus.round);
          }
        });
      }
    }
  }

  setNextRoundPlayer(currentPlayer: Player) {
    if (this.currentPlayer?.id === currentPlayer.id) {
      let playingMembers = this.residuePlayers();
      if (!playingMembers) return;
      if (playingMembers.length <= 0) return;
      const currRoundIndex = playingMembers.findIndex((item) => item.id === currentPlayer.id);
      const nextPlayer = playingMembers[currRoundIndex + 1] || null;
      nextPlayer ? this.setRound(this, nextPlayer) : this.setStatus(RoomStatus.vote);
    }
  }

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
      this.setStatus(RoomStatus.end);
      return null;
    }
    return playingMembers;
  }
  
}
