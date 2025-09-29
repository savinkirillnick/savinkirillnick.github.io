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

    endGame() {
        
        document.getElementById("game").innerHTML = "";
        document.getElementById("game").appendChild(this.container);
        
        let divName = document.createElement('div');
        divName.className = 'congratulation-name';
        document.getElementById("game").appendChild(divName);
        divName.innerHTML = "Congratulation!";
        
        let divDesc = document.createElement('div');
        divDesc.className = 'congratulation-desc';
        document.getElementById("game").appendChild(divDesc);
        divDesc.innerHTML = "You've been arranged tiles in a row!";

        let divButton = document.createElement('div');
        divButton.className = 'congratulation-button';
        document.getElementById("game").appendChild(divButton);
        divButton.innerHTML = "Play Again";
        
        divButton.addEventListener('click', async function() {
            this.runGame(); // Запуск игры
        });
    }
    
    isPuzzleSolvable(tiles) {
        // Проверяем, что массив содержит ровно 16 элементов (15 чисел + пустая клетка)
        if (!Array.isArray(tiles) || tiles.length !== 16) {
            throw new Error('Массив должен содержать 16 элементов');
        }
        
        // Проверяем, что все числа от 0 до 15 присутствуют (0 - пустая клетка)
        const sorted = [...tiles].sort((a, b) => a - b);
        for (let i = 0; i < 16; i++) {
            if (sorted[i] !== i) {
                throw new Error('Массив должен содержать числа от 0 до 15');
            }
        }
        
        // 1. Находим позицию пустой клетки (0)
        const emptyTileRow = Math.floor(tiles.indexOf(0) / 4);
        
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
        
        // 3. Применяем правило: головоломка решаема, если:
        // - пустая клетка в нечетной строке (считая снизу) И количество инверсий четное
        // - пустая клетка в четной строке (считая снизу) И количество инверсий нечетное
        const isEvenRowFromBottom = (3 - emptyTileRow) % 2 === 0;
        
        return (isEvenRowFromBottom && inversions % 2 !== 0) || 
            (!isEvenRowFromBottom && inversions % 2 === 0);
    }

    // Альтернативная функция для проверки завершенного состояния
    isPuzzleSolved(tiles) {
        // Проверяем, что массив содержит правильную последовательность
        for (let i = 0; i < tiles.length - 1; i++) {
            if (tiles[i] !== i + 1) {
                return false;
            }
        }
        // Последний элемент должен быть 0 (пустая клетка)
        return tiles[tiles.length - 1] === 0;
    }

}
