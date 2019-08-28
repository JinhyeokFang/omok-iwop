<template>
  <div id="app">
    <div id="header">
      <h1>
      ㅇㅗㅁㅗㄱ
      </h1>
    </div>
    <div v-if="!room">
      <div id="nameForm">
        <input id="nameInput" type="text" v-model="userName" placeholder="이름">
        <button id="createButton" @click="create(userName)">
          새로운 방 만들기
        </button>
      </div>
      <ul id="roomList" >
        <li class="room" @click="join(room)" :class="{full: room.status == 1}" v-for="room in roomList" :key="room.roomId">
          {{ room.player1.name }}의 방
        </li>
      </ul>
    </div>
    <Game :roomId=roomId :userName=userName v-else />
  </div>
</template>

<script>
import Game from './components/Game'

export default {
  name: 'app',
  components: {
    Game
  },
  sockets: {
    getRoomList(data) {
      this.roomList = data.list
    },
    updateRoomId(data) {
      this.roomId = data.roomId
    }
  },
  data() {
    return {
      room: false,
      roomId: null,
      userName: null,
      roomList: []
    }
  },
  methods: {
    join(room) {
      if (room.status != 0) {
        alert("이 방은 이미 게임을 시작했습니다.");
        return;
      }

      if (this.userName == null || this.userName == '') {
        alert("이름을 입력하지 않으면 게임을 시작할 수 없습니다.");
        return;
      }

      this.roomId = room.roomId;
      this.room = true;

      this.$socket.emit('join', { roomId: this.roomId, userName: this.userName });
    },
    create(userName) {
      if (this.userName == null || this.userName == '') {
        alert("이름을 입력하지 않으면 게임을 시작할 수 없습니다.");
        return;
      }

      this.roomId = this.roomList.length;
      this.room = true;
      this.$socket.emit('create', { userName: this.userName });
    }
  }
}
</script>

<style>
  body {
    margin: 0;
  }

  h1 {
    margin: 0;
  }
  ul,li{
    list-style: none;
  }
  #header{
    width: 100%;
    height: 50px;
    display: flex;
    box-shadow: 5px 0px 5px lightgray;
    background-color: #fff;
    justify-content: center;
    align-items: center;
  }
  #app {
    background-color: #eee;
    width: 100vw;
    height: 100vh;
  }

  #roomList{
    list-style: none;
    width: 90vw;
    margin: 2vh 0;
    padding: 0;
  }

  #nameForm{
    width: 90vw;
    margin: 1vh auto;
    margin-top: 0;
    padding-top: 1vh;
    display:flex;
    justify-content: center;
  }

  #nameInput {
    box-sizing: border-box;
    width: 70vw;
    height: 5vh;
    margin: 5px;
    border: none;
    padding-left: 15px;
    box-shadow: 0px 0px 5px lightgray;
  }

  #createButton {
    box-sizing: border-box;

    width: 19vw;
    height: 5vh;
    margin: 5px;
    border: none;
    padding: 0;
    box-shadow: 0px 0px 5px lightgray;
    background-color: white;
  }

  Game {
    width: 100vw;
  }

  .room {
    box-shadow: 0px 0px 5px lightgray;
    background-color: white;
    width: 89.2vw;
    margin-left: 5.4vw;
    margin-bottom: 2vh;
    padding: 0;
    height: 10vh;
    opacity: 1;
  }

  .full {
    opacity: 0.5;
  }
</style>
