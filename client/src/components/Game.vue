<template>
  <div>
    <div id="side">
        <div id="user">
            <h3>User List:</h3>
            <ul>
                <li :class="{active: myValue == turn && status == 1}">Me: {{ userName }}</li>
                <li :class="{active: myValue != turn && status == 1}">Counter: {{ userList.length != 0 ? userList[-1 * myValue + 2].name : '기다리는 중...'}}</li>
            </ul>
        </div>
        <button id="exit" @click=exit()>
            Exit
        </button>
    </div>
    <div id="boardWrapper">
      <div id="board">
        <div v-for="block in blocks" :key=block.id :class="{ block: true, black: isBlack(block.value), white: isWhite(block.value), prev: prevClickedBlock != null && prevClickedBlock == block.id}" :id=block.id @click="changeValue(block.id)">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'game',
  props: [
    'roomId',
    'userName'
  ],
  data() {
    return {
      turn: 1,
      myValue: 0,
      status: 0,
      blocks: [],
      userList: [],
      prevClickedBlock: null
    }
  },
  sockets: {
    startGame (data) {
      this.myValue = data.value;
      this.status = 1;
      this.userList = data.userList;
    },
    userChanged (data) {
      this.userList = data.userList;
      this.myValue = 1;
    },
    changed (data) {
      this.turn = data.turn;
      this.blocks = [];
      this.prevClickedBlock = data.prevClickedBlock;
      for (let i=1; i<=361; i++)
        this.blocks.push({
          id: i,
          value: data.map[i]
        });

      if (data.winnerExist)
        this.gameOver(data.winner);
    },
  },
  methods: {
    changeValue(id) {
      console.log(id, x, y);

      if (this.status != 1)
        return;

      let x = parseInt((id - 1) / 19) + 1;
      let y = id - (x * 19);

      if (!this.getBlockValueById(id) && this.turn == this.myValue) {
        this.$socket.emit('change', {x: x, y: y, value: this.myValue, roomId: this.roomId})
      } 
    },
    gameOver(winner) {
      this.status = 0;
      alert("게임 끝!");

      location.reload();
    },
    exit() {
      location.reload();
    },
    getBlockValueById (id) { return this.blocks[id - 1].value },
    isBlack(value) { return value == 1 },
    isWhite(value) { return value == 2 }
  },
  created() {
    for (let i=1; i<=361; i++) this.blocks.push({ id: i, value: 0 });

    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', () => {
        history.pushState(null, null, document.URL);
    });
    window.onbeforeunload = () => {if (this.status == 1) return '!'}
  }
}
</script>

<style>

ul{
  width: 20vh;
}
body {
  height: 100%;
  overflow: hidden;
    margin: 0px;
    font-family: 'Nanum Gothic', sans-serif;
}

#board {
  width: 76vh;
  height: 76vh;
  padding: 0.5vh;
  background-color: black;
}

#boardWrapper {
  width: 77vh;
  height: 77vh;
  padding: 1vh;
  margin: 5vh auto;
  background-color: white;
  box-shadow: 0px 0px 5px lightgray;
}

#side {
    float: left;
    width: 30vh;
    height: 93vh;
    background-color: lightgray;
    margin: -5vh 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

#user {
    width: 20vh;
    padding: 10px;
}

#exit {
  width: 100%;
  height: 10%;
  margin: 0;
  padding: 0;
  background-color: #bbb;
  border: none;
}

.active {
  border: 2px red solid;
}



.block {
    width: 4vh;
    height: 4vh;
    background-image: url("../assets/board1.png");
    background-size:     cover;
    background-repeat:   no-repeat;
    background-position: center center;    
    float: left;
}

.prev {
  border: 0.1vh black solid;
  width: 3.8vh;
  height: 3.8vh;
}

.black {
  background-image: url("../assets/board2.png");
}

.white {
  background-image: url("../assets/board3.png");
}
</style>
