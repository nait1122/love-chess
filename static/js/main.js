document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const boardElement = document.getElementById('board');
  const player1Element = document.getElementById('player1');
  const player2Element = document.getElementById('player2');
  const diceContainer = document.getElementById('dice-container');
  const diceElement = document.getElementById('dice');
  const diceFace = document.querySelector('.dice-face');
  const femaleSwitch = document.getElementById('switch-female');
  const maleSwitch = document.getElementById('switch-male');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalText = document.getElementById('modal-text');
  const modalButton = document.getElementById('modal-button');
  // Editor DOM Elements
  const editorModal = document.getElementById('editor-modal');
  const closeEditorButton = document.getElementById('close-editor');
  const editorGrid = document.getElementById('editor-grid');
  const menuButton = document.querySelector('.menu-icons .icon-button:last-child'); // The hamburger menu
  // New Editor DOM elements
  const setListContainer = document.getElementById('set-list-container');
  const addNewSetButton = document.getElementById('add-new-set');

  // --- Game Configuration ---
  // This is now a fallback/default task list
  const defaultTasks = [
    "夸对方三个优点。", "给对方一个深情的拥抱，持续10秒。", "模仿对方一个可爱的表情或口头禅。",
    "说出第一次见面的地点和天气。", "给对方唱一首情歌的副歌部分。", "用三种不同的方式称呼对方。",
    "帮对方按摩肩膀1分钟。", "分享一件最近让你觉得很幸福的小事。", "两人十指紧扣，对视15秒。",
    "说出对方最喜欢的一道菜。", "下一回合，你来帮对方掷骰子。", "拍一张搞怪的合影。",
    "喂对方吃一小块零食。", "用一句土味情话'撩'对方。", "答应对方一个小小的要求（不能太过分哦）。",
    "分享一个你自己的小秘密。", "认真地对对方说'我爱你'。", "一起计划下一次约会的内容。",
    "互相给对方起一个可爱的昵称。", "快速说出对方的一个缺点（说完要抱抱）。", "帮对方倒一杯水。",
    "讲述一件对方做过的让你很感动的事。", "背诵对方的手机号码。", "闭上眼睛，通过触摸来猜对方的身体部位。",
    "交换角色，用对方的语气说一句话。", "一起看手机里最早的一张合照。", "真诚地感谢对方为你做的一件事。",
    "挠对方痒痒10秒。", "约定一件想和对方一起完成的事。", "给对方一个额头吻。"
  ];

  let cellTasks = []; // This will hold the task for each cell

  const boardSize = 40;
  // Reverting to the previous, more compact layout
  const cellCoordinates = [
    { c: 6, r: 0 }, { c: 5, r: 0 }, { c: 4, r: 0 }, { c: 3, r: 0 }, { c: 2, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 0 },
    { c: 0, r: 1 },
    { c: 1, r: 1 }, { c: 2, r: 1 }, { c: 3, r: 1 }, { c: 4, r: 1 }, { c: 5, r: 1 }, { c: 6, r: 1 },
    { c: 6, r: 2 },
    { c: 5, r: 2 }, { c: 4, r: 2 }, { c: 3, r: 2 }, { c: 2, r: 2 }, { c: 1, r: 2 }, { c: 0, r: 2 },
    { c: 0, r: 3 }, { c: 0, r: 4 },
    { c: 1, r: 4 }, { c: 2, r: 4 }, { c: 3, r: 4 }, { c: 4, r: 4 }, { c: 5, r: 4 }, { c: 6, r: 4 },
    { c: 6, r: 5 }, { c: 6, r: 6 },
    { c: 5, r: 6 }, { c: 4, r: 6 }, { c: 3, r: 6 }, { c: 2, r: 6 }, { c: 1, r: 6 }, { c: 0, r: 6 },
    { c: 0, r: 7 }, { c: 1, r: 7 }, { c: 2, r: 7 }
  ];

  const boardLayout = [
    { index: 21, type: 'flag', icon: '��' },
    { index: 39, type: 'finish', icon: '🏆' }
  ];

  // --- Game State ---
  let players = [
    { id: 1, name: '女', position: 0, element: null, avatar: '/lovechess/static/images/avatar_female.png' },
    { id: 2, name: '男', position: 0, element: null, avatar: '/lovechess/static/images/avatar_male.png' }
  ];
  let currentPlayerIndex = 0;
  let isGameActive = true;
  let cellElements = [];

  // New data structure for gameplay versions
  let gameplayData = {};

  const diceButton = document.getElementById('dice');
  const resetButton = document.getElementById('reset-button');
  const editTasksButton = document.getElementById('edit-tasks-button');

  // --- Functions ---

  function loadGameplayData() {
    const savedData = localStorage.getItem('loveLudoGameplayData');
    if (savedData) {
      gameplayData = JSON.parse(savedData);
    } else {
      // First time load: create default structure
      gameplayData = {
        activeSetId: 'basic',
        gameplaySets: {
          'basic': { id: 'basic', name: '基础版', type: 'random' }
        }
      };
      saveGameplayData();
    }
  }

  function saveGameplayData() {
    localStorage.setItem('loveLudoGameplayData', JSON.stringify(gameplayData));
  }

  function loadCellTasks() {
    const savedTasks = localStorage.getItem('loveLudoCellTasks');
    if (savedTasks) {
      cellTasks = JSON.parse(savedTasks);
    } else {
      // Initialize with default tasks
      cellTasks = Array(boardSize).fill("安全格，休息一下吧~");
      // Pre-fill one as requested
      cellTasks[4] = "说出对方最吸引你的一个特质。";
    }
  }

  function saveCellTasks() {
    localStorage.setItem('loveLudoCellTasks', JSON.stringify(cellTasks));
  }

  function createPlayerElements() {
    const boardContainer = document.getElementById('board-container');
    players.forEach(player => {
      if (player.element) return;
      const playerElement = document.createElement('div');
      playerElement.id = `player-${player.id}`;
      playerElement.classList.add('player');
      playerElement.style.backgroundImage = `url(${player.avatar})`;
      boardContainer.appendChild(playerElement);
      player.element = playerElement;
    });
  }

  /**
   * Creates the game board UI
   */
  function createBoard() {
    const boardContainer = document.getElementById('board-container');
    boardContainer.innerHTML = '';
    cellElements = []; // Clear old elements

    const grid = document.createElement('div');
    grid.className = 'grid';

    const rows = 9;
    const cols = 7;
    const cellWidth = containerWidth / cols;
    const cellHeight = cellWidth; // Force square cells

    // Set the board's height dynamically to fit the square grid
    boardElement.style.height = `${rows * cellHeight}px`;

    cellCoordinates.forEach((coord, i) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');

      const gap = 4; // The visual gap between cells
      cell.style.left = `${coord.c * cellWidth + gap / 2}px`;
      cell.style.top = `${coord.r * cellHeight + gap / 2}px`;
      cell.style.width = `${cellWidth - gap}px`;
      cell.style.height = `${cellHeight - gap}px`;

      const specialCell = boardLayout.find(c => c.index === i);
      if (specialCell) {
        cell.innerHTML = `<span class="special-icon">${specialCell.icon}</span>`;
      } else {
        cell.textContent = i + 1;
      }
      grid.appendChild(cell);
      cellElements.push(cell);
    });

    boardLayout.forEach(special => {
      const cell = cellElements[special.index];
      if (cell) {
        const icon = document.createElement('div');
        icon.className = 'cell-icon';
        icon.textContent = special.icon;
        cell.appendChild(icon);
        cell.dataset.special = special.type;
      }
    });

    boardContainer.appendChild(grid);
  }

  /**
   * Updates the position of a player's piece on the board
   */
  function updatePlayerPosition(player) {
    const cell = cellElements[player.position];
    if (!cell) return;

    const otherPlayer = players.find(p => p.id !== player.id);
    let offset = 0;
    if (otherPlayer && player.position === otherPlayer.position) {
      offset = player.id === 1 ? -10 : 10;
    }

    player.element.style.left = `${cell.offsetLeft + cell.offsetWidth / 2 - player.element.offsetWidth / 2 + offset}px`;
    player.element.style.top = `${cell.offsetTop + cell.offsetHeight / 2 - player.element.offsetHeight / 2}px`;
  }

  function animateMove(player, end, callback) {
    const start = player.position;
    let current = start;
    const direction = (end > start) ? 1 : -1;

    const step = () => {
      if ((direction === 1 && current >= end) || (direction === -1 && current <= end)) {
        if (callback) callback();
        return;
      }

      current += direction;
      player.position = current;

      player.element.classList.add('is-moving');

      updatePlayerPosition(player);

      player.element.addEventListener('animationend', function handler() {
        player.element.classList.remove('is-moving');
        setTimeout(step, 50);
      }, { once: true });
    };

    step();
  }

  function setupDiceFaces() {
    const faces = diceElement.querySelectorAll('.face');
    const faceDots = {
      front: 1, back: 6,
      right: 2, left: 5,
      top: 3, bottom: 4
    };

    faces.forEach(face => {
      const side = Array.from(face.classList).find(c => faceDots[c]);
      if (!side) return;

      const numDots = faceDots[side];
      face.setAttribute('data-dots', numDots);

      const patterns = {
        1: ['p1'], 2: ['p2', 'p7'], 3: ['p2', 'p1', 'p7'],
        4: ['p2', 'p3', 'p6', 'p7'], 5: ['p2', 'p3', 'p1', 'p6', 'p7'],
        6: ['p2', 'p3', 'p4', 'p5', 'p6', 'p7']
      };

      const pattern = patterns[numDots] || [];
      pattern.forEach(pClass => {
        const dot = document.createElement('span');
        dot.classList.add('dot', pClass);
        face.appendChild(dot);
      });
    });
  }

  /**
   * Rolls the dice and moves the player
   */
  function rollDice() {
    if (!isGameActive) return;
    isGameActive = false;

    const roll = Math.floor(Math.random() * 6) + 1;

    // Random tumbling animation
    const randomX = (Math.floor(Math.random() * 4) + 4) * 360;
    const randomY = (Math.floor(Math.random() * 4) + 4) * 360;
    diceElement.style.transition = 'transform 1s ease-out';
    diceElement.style.transform = `rotateX(${randomX}deg) rotateY(${randomY}deg)`;

    setTimeout(() => {
      const rotations = {
        1: 'rotateY(0deg)',
        2: 'rotateY(-90deg)',
        3: 'rotateX(-90deg)',
        4: 'rotateX(90deg)',
        5: 'rotateY(90deg)',
        6: 'rotateY(180deg)'
      };
      diceElement.style.transition = 'transform 0.5s ease-in';
      diceElement.style.transform = rotations[roll];

      setTimeout(() => {
        const player = players[currentPlayerIndex];
        let endPosition = player.position + roll;

        const onMoveComplete = () => {
          const specialCell = boardLayout.find(c => c.index === player.position);
          // If it's a special move cell, handle that first. The task will be triggered after.
          if (specialCell && (specialCell.type === 'forward' || specialCell.type === 'backward')) {
            handleSpecialCell(player, specialCell);
          } else {
            // For normal cells, just trigger a task.
            triggerTask();
          }
        };

        if (endPosition >= boardSize - 1) {
          endPosition = boardSize - 1;
          animateMove(player, endPosition, () => endGame(player));
        } else {
          animateMove(player, endPosition, onMoveComplete);
        }
      }, 700);
    }, 1000);
  }

  /**
   * Handles landing on a special cell
   */
  function handleSpecialCell(player, cell) {
    let message = `${player.name} 踩到了特殊格子!`;
    if (cell.type === 'backward') {
      message = `${player.name} 踩到了后退格!`;
    } else if (cell.type === 'flag') {
      message = `${player.name} 到达安全区!`;
    }

    showModal(`特殊格子: ${cell.icon}`, message, "继续");
    modalButton.onclick = () => {
      modal.style.display = 'none';
      if (cell.type === 'backward') {
        let endPos = player.position + cell.value;
        if (endPos < 0) endPos = 0;

        // After the special move, trigger a task.
        animateMove(player, endPos, triggerTask);

      } else {
        // For non-moving special cells like 'flag', just trigger a task.
        triggerTask();
      }
    };
  }

  /**
   * Switches to the next player
   */
  function switchPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    femaleSwitch.classList.toggle('active', currentPlayerIndex === 0);
    maleSwitch.classList.toggle('active', currentPlayerIndex === 1);
    isGameActive = true;
  }

  /**
   * Ends the game and shows a winner message
   */
  function endGame(winner) {
    isGameActive = false;
    showModal('游戏结束!', `恭喜玩家 ${winner.name} 获得了胜利!`, '再来一局');
    modalButton.onclick = resetGame;
  }

  /**
   * Shows a modal dialog
   */
  function showModal(title, text, buttonText) {
    modalTitle.textContent = title;
    modalText.textContent = text;
    modalButton.textContent = buttonText;
    modal.style.display = 'flex';
  }

  /**
   * Resets the game to its initial state
   */
  function resetGame() {
    modal.style.display = 'none';
    players.forEach(p => p.position = 0);
    currentPlayerIndex = 0;
    isGameActive = true;

    diceElement.style.transition = 'transform 0.5s';
    diceElement.style.transform = 'rotateY(0deg)';

    femaleSwitch.classList.add('active');
    maleSwitch.classList.remove('active');
    players.forEach(updatePlayerPosition);
  }

  function triggerTask() {
    const activeSet = gameplayData.gameplaySets[gameplayData.activeSetId];
    let task = "安全格，休息一下吧~";

    if (activeSet.type === 'random') {
      task = defaultTasks[Math.floor(Math.random() * defaultTasks.length)];
    } else { // 'cell_based'
      const player = players[currentPlayerIndex];
      task = activeSet.tasks[player.position] || task;
    }

    showModal('情侣任务 ❤️', task, "任务完成");
    modalButton.onclick = () => {
      modal.style.display = 'none';
      switchPlayer();
    };
  }

  // --- Editor Functions ---
  function renderEditor() {
    renderSetManager();
    renderTaskGrid();
  }

  function renderSetManager() {
    setListContainer.innerHTML = '';
    Object.values(gameplayData.gameplaySets).forEach(set => {
      const setButton = document.createElement('button');
      setButton.className = 'set-btn';
      setButton.textContent = set.name;
      setButton.dataset.setId = set.id;
      if (set.id === gameplayData.activeSetId) {
        setButton.classList.add('active');
      }
      setButton.addEventListener('click', () => switchActiveSet(set.id));
      setListContainer.appendChild(setButton);
    });
  }

  function renderTaskGrid() {
    editorGrid.innerHTML = '';
    const activeSet = gameplayData.gameplaySets[gameplayData.activeSetId];

    if (activeSet.type === 'random') {
      editorGrid.innerHTML = '<p style="text-align: center; padding: 20px;">"基础版"使用随机任务，无需编辑。</p>';
      return;
    }

    for (let i = 0; i < boardSize; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'cell-task-input';
      input.value = activeSet.tasks[i] || '';
      input.dataset.index = i;

      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        activeSet.tasks[index] = e.target.value;
        saveGameplayData();
      });

      const item = document.createElement('div');
      item.className = 'editor-item';
      const number = document.createElement('span');
      number.className = 'cell-number';
      number.textContent = `${i + 1}:`;
      item.appendChild(number);
      item.appendChild(input);
      editorGrid.appendChild(item);
    }
  }

  function switchActiveSet(setId) {
    gameplayData.activeSetId = setId;
    saveGameplayData();
    renderEditor(); // Re-render the whole editor to reflect the change
  }

  function addNewSet() {
    const newId = `custom_${Date.now()}`;
    const newSetName = `自定义玩法 ${Object.keys(gameplayData.gameplaySets).length}`;
    gameplayData.gameplaySets[newId] = {
      id: newId,
      name: newSetName,
      type: 'cell_based',
      tasks: Array(boardSize).fill("点击编辑任务...")
    };
    switchActiveSet(newId);
  }

  function openEditor() {
    renderEditor();
    editorModal.style.display = 'flex';
  }

  function closeEditor() {
    editorModal.style.display = 'none';
  }

  /**
   * Initializes the entire game.
   */
  function init() {
    createBoard();
    createPlayerElements();
    loadGameplayData();
    loadCellTasks();
    setupEventListeners();
    setupDiceFaces();
    resetGame();
  }

  function setupEventListeners() {
    diceContainer.addEventListener('click', rollDice);
    addNewSetButton.addEventListener('click', addNewSet);
    menuButton.addEventListener('click', openEditor);
    closeEditorButton.addEventListener('click', closeEditor);
    femaleSwitch.addEventListener('click', () => {
      if (!isGameActive && currentPlayerIndex !== 0) return;
      currentPlayerIndex = 0;
      femaleSwitch.classList.add('active');
      maleSwitch.classList.remove('active');
    });
    maleSwitch.addEventListener('click', () => {
      if (!isGameActive && currentPlayerIndex !== 1) return;
      currentPlayerIndex = 1;
      maleSwitch.classList.add('active');
      femaleSwitch.classList.remove('active');
    });
    window.addEventListener('resize', () => {
      createBoard();
      players.forEach(updatePlayerPosition);
    });
  }

  init();
}); 