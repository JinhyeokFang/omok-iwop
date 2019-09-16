const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
var room = [];
app.use(express.static('dist'));
server.listen(8080);
io.on('connection', socket => {
  socket.emit('getRoomList', { list: room });
  socket.on('join', data => {
    room[getRoomIndex(data.roomId)].player2 = {
      name: data.userName,
      id: socket.id
    };
    room[getRoomIndex(data.roomId)].status = 1;
    io.to(room[getRoomIndex(data.roomId)].player1.id).emit('startGame', {value: 1, userList: [{name: room[getRoomIndex(data.roomId)].player1.name}, {name: room[getRoomIndex(data.roomId)].player2.name}]});
    io.to(room[getRoomIndex(data.roomId)].player2.id).emit('startGame', {value: 2, userList: [{name: room[getRoomIndex(data.roomId)].player1.name}, {name: room[getRoomIndex(data.roomId)].player2.name}]});
    io.emit('getRoomList', { list: room }); 
  });
  socket.on('create', data => {
    let roomId = new Date().getTime() + new Date().getMilliseconds();
    room.push({ player1: { name: data.userName, id: socket.id }, player2: null, map: new Array(1000).fill(0), turn: 1, status: 0, id: 0, roomId });
    io.emit('getRoomList', { list: room });
    socket.emit('updateRoomId', { roomId });
  });
  socket.on('change', data => {
    data.y -= 1;
    room[getRoomIndex(data.roomId)].map[getBlockID(data.x, data.y)] = data.value;
    room[getRoomIndex(data.roomId)].turn = (room[getRoomIndex(data.roomId)].turn - 2) * -1 + 1;
    if (!checkGameIsEnded(data.x, data.y, (room[getRoomIndex(data.roomId)].turn - 2) * -1 + 1, getRoomIndex(data.roomId))) {
      io.to(room[getRoomIndex(data.roomId)].player1.id).emit('changed', { turn: room[getRoomIndex(data.roomId)].turn, map: room[getRoomIndex(data.roomId)].map, winnerExist: false, prevClickedBlock: getBlockID(data.x, data.y)});
      io.to(room[getRoomIndex(data.roomId)].player2.id).emit('changed', { turn: room[getRoomIndex(data.roomId)].turn, map: room[getRoomIndex(data.roomId)].map, winnerExist: false, prevClickedBlock: getBlockID(data.x, data.y)});
    } else {
      room[getRoomIndex(data.roomId)].status = 1;
      room[getRoomIndex(data.roomId)].turn = 3;
      io.to(room[getRoomIndex(data.roomId)].player1.id).emit('changed', { turn: room[getRoomIndex(data.roomId)].turn, map: room[getRoomIndex(data.roomId)].map, winnerExist: true, prevClickedBlock: getBlockID(data.x, data.y)});
      io.to(room[getRoomIndex(data.roomId)].player2.id).emit('changed', { turn: room[getRoomIndex(data.roomId)].turn, map: room[getRoomIndex(data.roomId)].map, winnerExist: true, prevClickedBlock: getBlockID(data.x, data.y)});
    }
  });
  socket.on('disconnect', () => {
    if (room.length == 0)
      return;

    let data = { roomId: null, id: null };
    room.find((item, index) => {
      if (item.player1.id == socket.id) {
        data.roomId = index;
        data.id = 1;
      } else if (item.player2 != null && item.player2.id == socket.id) {
        data.roomId = index;
        data.id = 2;
      }
    });

    if ( !data.roomId || !data.id )
      return;

   if (room[data.roomId].status == 1) {
      room[data.roomId].status = 0;
      if (room[data.roomId].player1.id == socket.id) 
        room[data.roomId].player1 = room[data.roomId].player2;
      room[data.roomId].player2 = null;

      io.to(room[data.roomId].player1.id).emit('changed', { turn: room[data.roomId].turn, map: room[data.roomId].map, winnerExist: true, prevClickedBlock: getBlockID(data.x, data.y)});
      io.to(room[data.roomId].player1.id).emit('userChanged', { userList: [{name: room[data.roomId].player1.name}]});
    } else {
      if (room[data.roomId].player1.id != socket.id) 
        room[data.roomId].player1 = room[data.roomId].player2;
      else if (room[data.roomId].player2 == null) {
        room.splice(data.roomId, 1);
        io.emit('getRoomList', { list: room });
        return;
      }
      room[data.roomId].player2 = null;

      io.to(room[data.roomId].player1.id).emit('userChanged', { userList: [{name: room[data.roomId].player1.name}]});
    }

    io.emit('getRoomList', { list: room });
  });
});
let getBlockID = (x, y) => { return y + 19 * x + 1 };
let getRoomIndex = roomId => room.findIndex(room => room.roomId == roomId);                                                                                                                                                                                        
let checkGameIsEnded = (x, y, turn, roomId) => {
    y += 19
    x -= 1;
    let numberOfBlocks = [0, 0, 0, 0];
    let tempX, tempY;
    for (let h = 0; h < 8; h++) {
        tempX = x;
        tempY = y;

        for (let i = 0; i < 5; i++) {
            if (18 < tempX || tempX < 0 || 18 < tempY || tempY < 0) break;

            if (room[roomId].map[getBlockID(tempX, tempY)] != turn) break;

            if (h <= 5) {
                if (parseInt(h / 2) == h / 2) tempX++
                else tempX--
            }

            if (h == 0 || h == 3 || h == 6) tempY++
            else if (h == 1 || h == 2 || h == 7) tempY--

            numberOfBlocks[parseInt(h / 2)]++;
        }
    }

    if (numberOfBlocks[0] >= 6 || numberOfBlocks[1] >= 6 || numberOfBlocks[2] >= 6 || numberOfBlocks[3] >= 6)
        return true;
    return false;
};
