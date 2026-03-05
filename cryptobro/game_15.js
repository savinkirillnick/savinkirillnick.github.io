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
                color: white;
                font-size: 10vw;
                cursor: pointer;
                width: 24vw;
                height: 24vw;
                background: url(https://raw.githubusercontent.com/savinkirillnick/cryptogame/main/blue_tile.png);
                background-repeat: no-repeat;
                background-size: cover;
                margin: .5vw;
                opacity: 1;
                transition: opacity 1.0s ease;
            }

            .tile.empty {
                background: none;
                cursor: default;
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
        const firstElement = this.tiles.shift();
        this.tiles.push(firstElement);
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

//Функция проверки решимости пятнашек
    isSolvable(arr) {
        let inversions = 0;
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] && arr[j] && arr[i] > arr[j]) {
                    inversions++;
                }
            }
        }
        return inversions % 2 === 0; // Проверка на четность инверсий
    }

// Функция перемешивания плиток
    shuffle(tiles) {

        do {
            // Перемешиваем массив
            for (let i = tiles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
            }
        } while (this.isSolvable(tiles)); // Проверяем на разрешенность, если не подходит, перемешиваем снова


        /*
        let i = 15;
        for (let n = 0; n < 2048; n++) {
            const side = Math.floor(Math.random() * 4);
            let j = i;
            switch (side) {
                case 0:
                    j = i - 4 < 0 ? i + 4 : i - 4;
                    break;
                case 1:
                    j = i + 1 > 15 ? i - 1 : i + 1;
                    break;
                case 2:
                    j = i - 1 < 0 ? i + 1 : i - 1;
                    break;
                case 2:
                    j = i + 4 > 15 ? i - 4 : i + 4;
                    break;
                default:
                    j = i;
                    break;
            }
            [array[i], array[j]] = [array[j], array[i]];
            i = j;
        }
    */
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
        if (this.checkWin()){
            user.addKeys();
            createCongrat(translate["note_congratulation"][user["lang"]], translate["games_win"][user["lang"]] + " 🔑");
            const tiles = document.querySelectorAll('.tile');
            tiles.forEach((div) => {
              div.style.opacity = '0';
            });
            setTimeout(() => {
                this.runGame();
                tiles.forEach((div) => {
                  div.style.opacity = '1';
                });
            }, 1000);
        }
    }

    checkWin() {
        const state = document.querySelectorAll('.tile');
        for(let i=1;i<16;i++){
            if(parseInt(state[i-1].innerHTML)!=i){
                return false;
            }
        }
        return true;
    }
}