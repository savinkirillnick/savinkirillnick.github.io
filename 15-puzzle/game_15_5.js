export default class Game{

    constructor() {
        // Создаём новый элемент <style>
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .puzzle-container {
                width: 100%;
                height: 100%;
                display: grid;
                grid-template-columns: repeat(4, 25%);
                grid-template-rows: repeat(4, 25%);
            }
            .tile {
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #006699;
                color: white;
                font-size: 10vw;
                cursor: pointer;
                border: 2vw solid #3498db;
                margin: .5vw;
            }

            .tile.empty {
                background-color: transparent;
                cursor: default;
                border: 2vw solid transparent;
            }
            @media (orientation: landscape) {
                .tile {
                    border: 2vh solid #3498db;
                    margin: .5vh;
                    font-size: 10vh;
                }
            }
            
            @media (orientation: portrait) {
                .tile {
                    border: 2vw solid #3498db;
                    margin: .5vw;
                    font-size: 10vw;
                }
            }
        `;

        // Добавляем стиль в <head>
        document.head.appendChild(style);
        //Создаем основной слой
        this.container = document.createElement('div');
        this.container.className = 'puzzle-container';
        document.getElementById("game").innerHTML = "";
        document.getElementById("game").appendChild(this.container);
        this.size = 4;  // Размерность поля 4x4
        this.tiles = [];
    }


// Функция для создания и перемешивания плиток
    runGame() {
        this.tiles = Array.from({ length: this.size * this.size }, (_, i) => i);
        this.shuffle(this.tiles);
        this.renderTiles();
    }

// Функция рендеринга плиток
    renderTiles() {
        this.container.innerHTML = '';
        this.tiles.forEach(tile => {
            const tileElement = document.createElement('div');
            tileElement.className = 'tile' + (tile === 0 ? ' empty' : '');
            tileElement.textContent = tile !== 0 ? tile : '';
            tileElement.addEventListener('click', () => this.moveTile(tile));
            this.container.appendChild(tileElement);
        });
    }

// Функция перемешивания плиток
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        const solvable = this.isPuzzleSolvable(array);
        if (!solvable) {
            [array[array.indexOf(14)], array[array.indexOf(15)]] = [15, 14];
        }

    }

// Функция перемещения плитки
    moveTile(tile) {
        const emptyIndex = this.tiles.indexOf(0);
        const tileIndex = this.tiles.indexOf(tile);

        const emptyRow = Math.floor(emptyIndex / this.size);
        const emptyCol = emptyIndex % this.size;
        const tileRow = Math.floor(tileIndex / this.size);
        const tileCol = tileIndex % this.size;

        const isAdjacent = (Math.abs(emptyRow - tileRow) + Math.abs(emptyCol - tileCol)) === 1;

        if (isAdjacent) {
            this.tiles[emptyIndex] = tile;
            this.tiles[tileIndex] = 0;
            this.renderTiles();
        }
        const solved = this.isPuzzleSolved(this.tiles);
        if (solved){
            this.endGame();
        }
    }

    // Конец игры. показываем сообщение с кнопкой перезапуска
    endGame() {
        document.getElementById("game").innerHTML = "";
        
        let divName = document.createElement('div');
        divName.className = 'congratulation-name';
        divName.innerText = "Congratulation!";
        document.getElementById("game").appendChild(divName);
        
        let divDesc = document.createElement('div');
        divDesc.className = 'congratulation-desc';
        divDesc.innerText = "You've been arranged tiles in a row!";
        document.getElementById("game").appendChild(divDesc);

        let divButton = document.createElement('div');
        divButton.className = 'congratulation-button';
        divButton.innerText = "Play Again";
        document.getElementById("game").appendChild(divButton);
        
        divButton.addEventListener('click', async function() {
            this.runGame(); // Запуск игры
        });
    }
    
    isPuzzleSolvable(tiles) {
        // 1. Находим номер строки пустой клетки (0) начиная снизу.
        const emptyTileRow = 1 + Math.floor(tiles.indexOf(0) / 4);
        
        // 2. Считаем количество инверсий (пар чисел, где большее стоит перед меньшим)
        let inversions = 0;
        
        for (let i = 0; i < tiles.length - 1; i++) {
            for (let j = i + 1; j < tiles.length; j++) {
                // Игнорируем пустую клетку при подсчете инверсий
                if (tiles[i] !== 0 && tiles[j] !== 0 && tiles[i] > tiles[j]) {
                    inversions++;
                }
            }
        }
        
        // 3. Применяем правило: головоломка решаема, если сумма инверсий и строки пустой клетки четная
        return ((emptyTileRow + inversions) % 2 === 0);
    }

    // Альтернативная функция для проверки завершенного состояния
    isPuzzleSolved(tiles) {
        // Проверяем, что массив содержит правильную последовательность
        for (let i = 0; i < tiles.length - 1; i++) {
            if (tiles[i] !== i + 1) {
                return false;
            }
        }
        // Иначе все элементы на месте и последний элемент это 0
        return true;
    }

}
