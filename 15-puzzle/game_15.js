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
                width: 20vw;
                height: 20vw;
                border: 2vw solid #3498db;
                margin: .5vw;
            }

            .tile.empty {
                background-color: transparent;
                cursor: default;
                border: 2vw solid transparent;
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
    }
}