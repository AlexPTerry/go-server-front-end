window.onload = function() {
    const boardSize = 19;
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
  
    const goBoard = document.getElementById('go-board');
    let currentPlayer = 'black';
  
    const ghostStone = createGhostStone(currentPlayer);
    goBoard.appendChild(ghostStone);
  
    const socket = new WebSocket('ws://192.168.1.72:8080/game');
  
    socket.onopen = function() {
      console.log("Connected to server");
    };
  
    socket.onmessage = function(event) {
    message = JSON.parse(event.data);
      if (message.type == 'json') {
        gameState = JSON.parse(message.data);
        console.log("Board updated");
        board = gameState.board;
        currentPlayer = gameState.blackTurn ? 'black' : 'white';
        ghostStone.className = 'stone ghost ' + currentPlayer;
        placeAllStones();
      } else {
        console.log(message.data);
        if (message.data === ("Found game!")) {
          goBoard.addEventListener('mousemove', handleMouseMove);
          goBoard.addEventListener('mouseout', hideGhostStone);
          goBoard.addEventListener('click', handleMouseClick);
        }
      }
    };
  
    socket.onerror = function(error) {
      console.error("WebSocket Error:", error);
    };
  
    drawLines();
  
    function handleMouseMove(event) {
        const {i, j, x, y} = getEventCoordinates(event);
        updateGhostStone(i, j, x, y);
    }
  
    function handleMouseClick(event) {
        const {i, j, x, y} = getEventCoordinates(event);
        if (cellIsEmpty(i, j)) {
            placeStone(i, j, x, y);
            updateGhostStone(i, j, x, y);
            socket.send(currentPlayer + "." + i + "." + j);
            currentPlayer = (currentPlayer === 'black') ? 'white' : 'black';
            ghostStone.className = 'stone ghost ' + currentPlayer;
        }
    }

    function deleteStone(i, j) {
        board[i][j] = 0;
    
        const stoneToDelete = document.querySelector(`.stone[data-i="${i}"][data-j="${j}"]`);
        if (stoneToDelete) {
            goBoard.removeChild(stoneToDelete);
        }
    }
  
    function getEventCoordinates(event) {
        const rect = goBoard.getBoundingClientRect();
        const i = Math.round((event.clientY - rect.top - (rect.height * 0.0275)) / (rect.height * 0.05263));
        const j = Math.round((event.clientX - rect.left - (rect.width * 0.0275)) / (rect.width * 0.05263));
        const x = j * rect.width * 0.05263 + rect.width * 0.0275;
        const y = i * rect.height * 0.05263 + rect.height * 0.0275;
        return {i, j, x, y};
    }
  
    function cellIsEmpty(i, j) {
        return board[i] && board[i][j] === 0;
    }
  
    function updateGhostStone(i, j, x, y) {
        if (cellIsEmpty(i, j)) {
            ghostStone.style.visibility = `visible`;
            ghostStone.style.left = `calc(${(((100 - 5.75) / (boardSize - 1)) * j + 2.75)}%)`;
            ghostStone.style.top = `calc(${(((100 - 5.75) / (boardSize - 1)) * i + 2.75)}%)`;
        } else {
            hideGhostStone();
        }
    }
  
    function hideGhostStone() {
        ghostStone.style.visibility = 'hidden';
    }


    function placeStone(i, j, x, y) {
        board[i][j] = currentPlayer;
        const offsetPercentage = 0.005;
        const xOffset = ((Math.random() - 0.5) * offsetPercentage) * 100;
        const yOffset = ((Math.random() - 0.5) * offsetPercentage) * 100;
        const stone = createStone(currentPlayer);
        stone.style.left = `calc(${(((100 - 5.75) / (boardSize - 1)) * j + 2.75 + xOffset)}%)`;
        stone.style.top = `calc(${(((100 - 5.75) / (boardSize - 1)) * i + 2.75 + yOffset)}%)`;
        stone.setAttribute('data-i', i);
        stone.setAttribute('data-j', j);
        goBoard.appendChild(stone);
    }
    
    
    function createStone(color) {
        const stone = document.createElement('div');
        stone.className = 'stone ' + color;
        return stone;
    }
  
    function createGhostStone(color) {
        const ghost = createStone(color);
        ghost.className += ' ghost';
        return ghost;
    }
  
    function drawLines() {
        for (let i = 0; i < boardSize; i++) {
            const position = ((100 - 5.75) / (boardSize - 1)) * i + 2.75 + '%';
            goBoard.appendChild(createLine(position, 'horizontal'));
            goBoard.appendChild(createLine(position, 'vertical'));
        }
    }
  
    function createLine(position, orientation) {
        const line = document.createElement('div');
        line.className = 'line ' + orientation;
        line.style[orientation === 'horizontal' ? 'top' : 'left'] = position;
        return line;
    }

    function placeStarPoint(i, j) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `calc(${(((100 - 5.75) / (boardSize - 1)) * j + 2.75)}% + 0.125%)`;
        star.style.top = `calc(${(((100 - 5.75) / (boardSize - 1)) * i + 2.75)}% + 0.125%)`;
        goBoard.appendChild(star);
    }

    function deleteAllStones() {
        // Remove all stones from the visual board
        const stones = document.querySelectorAll('.stone:not(.ghost)');
        stones.forEach(stone => {
            goBoard.removeChild(stone);
        });
    }

    function placeAllStones() {
        // First, clear the board
        deleteAllStones();
    
        // Now, place stones according to the board array
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[i][j] !== 0) {
                    const x = j * goBoard.getBoundingClientRect().width * 0.05263 + goBoard.getBoundingClientRect().width * 0.0275;
                    const y = i * goBoard.getBoundingClientRect().height * 0.05263 + goBoard.getBoundingClientRect().height * 0.0275;
                    const stone = createStone(board[i][j] === 1 ? 'black' : 'white');
                    stone.style.left = `calc(${(((100 - 5.75) / (boardSize - 1)) * j + 2.75)}%)`;
                    stone.style.top = `calc(${(((100 - 5.75) / (boardSize - 1)) * i + 2.75)}%)`;
                    goBoard.appendChild(stone);
                }
            }
        }
    }

    const point_positions = [3, 9, 15];
    for (let i of point_positions) {
      for (let j of point_positions) {
        placeStarPoint(i, j);
      }
    }
  };
