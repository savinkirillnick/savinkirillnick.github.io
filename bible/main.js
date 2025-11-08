class Book {
  constructor() {
    this.mark = this.mark.bind(this);
    
    //Загружаем последнюю просмотренную книгу
    const { translate, book, chapterIndex } = this.lastSeen();
    this.translate = translate; // текущий перевод
    this.book = book; // текущая книга
    this.chapterIndex = chapterIndex; // текущий индекс главы
    console.log(translate, book, chapterIndex);
    this.loadedBooks = new Map(); // кэш загруженных книг
    this.currentData = null; // текущие данные книги
    this.marks = JSON.parse(this.getCookie(`bible-${this.translate}-${this.book}`)); // Закладки
    this.markColor = 'gold';
  }

  // Получаем последнюю просмотренную книгу
  lastSeen() {
    let translate = 'syno';
    let book = 'byt';
    let chapterIndex = 0;
    try {
      const lastBookData = JSON.parse(this.getCookie('bible-last-book'));
      if (lastBookData) {
        translate = lastBookData.translate || translate;
        book = lastBookData.book || book;
        chapterIndex = lastBookData.chapterIndex || chapterIndex;
      }
    } catch(error) {
      console.log('Ошибка при чтении последней книги:', error);
    }
    return {
      translate: translate,
      book: book,
      chapterIndex: chapterIndex
    };
  }
  
  // Установить перевод
  setTranslate(translate) {
    if (this.translate !== translate) {
      this.translate = translate;
      this.currentData = null; // сбрасываем текущие данные
    }
    return this;
  }

  // Установить книгу
  setBook(book) {
    if (this.book !== book) {
      this.book = book;
      this.currentData = null; // сбрасываем текущие данные
    }
    return this;
  }

  // Установить главу
  setChapterIndex(chapterIndex) {
    this.chapterIndex = Math.max(0, chapterIndex);
    return this;
  }

  // Получить ключ для кэша
  getCacheKey(translate, book) {
    return `${translate}-${book}`;
  }

  // Загрузить данные книги
  async loadBookData(translate = this.translate, book = this.book) {
    const cacheKey = this.getCacheKey(translate, book);
    
    // Проверяем кэш
    if (this.loadedBooks.has(cacheKey)) {
      this.currentData = this.loadedBooks.get(cacheKey);
      return this.currentData;
    }

    try {
      // Динамически импортируем файл
      const module = await import(`./${cacheKey}.js`);
      
      // Получаем данные из модуля (предполагаем, что экспорт имеет имя книги)
      const bookData = module[book];
      
      if (!bookData) {
        throw new Error(`Данные для книги ${book} не найдены в файле`);
      }

      // Сохраняем в кэш
      this.loadedBooks.set(cacheKey, bookData);
      this.currentData = bookData;
      
      return bookData;
    } catch (error) {
      console.error(`Ошибка загрузки книги ${cacheKey}:`, error);
      throw error;
    }
  }

  // Показать текст главы
  async showText(translate = this.translate, book = this.book, chapterIndex = this.chapterIndex) {

    // сохраняем просмотренную книгу в память
    const data = JSON.stringify({translate: translate, book: book, chapterIndex: chapterIndex});
    this.setCookie('bible-last-book',data,3653);
    
    // Обновляем параметры
    this.setTranslate(translate).setBook(book).setChapterIndex(chapterIndex);
    
    // Загружаем данные если нужно
    if (!this.currentData || 
        this.getCacheKey(translate, book) !== this.getCacheKey(this.translate, this.book)) {
      await this.loadBookData(translate, book);
    }

    // Проверяем валидность индекса
    if (chapterIndex < 0 || chapterIndex >= this.currentData.chapters.length) {
      throw new Error(`Глава с индексом ${chapterIndex} не найдена в книге ${book}. Доступно глав: ${this.currentData.chapters.length}`);
    }

    // Получаем главу по индексу
    const chapterData = this.currentData.chapters[chapterIndex];
    
    if (!chapterData) {
      throw new Error(`Глава ${chapter} не найдена в книге ${book}`);
    }

    // Форматируем вывод
    return this.formatChapterOutput(chapterData);
  }

  // Форматировать вывод главы
  formatChapterOutput(chapterData) {
    const { title, treat } = this.currentData;
    const { chapter, verses } = chapterData;
    
    let output = `<span class="gray">${treat}</span><h2>${title}</h2>`;
    output += `<h3>Глава ${chapter}</h3>`;
    output += `<p>`;
    let v = 0;
    verses.forEach(verse => {
        let index = -1;

        // проверяем, есть ли данный стих в маркировках
        try {
           index = this.marks[this.book][this.chapterIndex].indexOf(v);
        } catch (error) {
            console.log(error);
        }
        let styler = "";
      if (index !== -1) {
        styler = `style="background-color: ${this.markColor};" `;
      }

      if (verse.num === 0) {
        output += `</p><p>`
        output += `<span ${styler}onclick="mark(book='${this.book}', chapter=${this.chapterIndex}, verse=${v}, item=this);">${verse.verse}</span> `;
      } else {
        output += `<span ${styler}onclick="mark(book='${this.book}', chapter=${this.chapterIndex}, verse=${v}, item=this);"><span class="num">${verse.num}</span> ${verse.verse}</span> `;
      }
      v += 1;
    });
    output += `</p>`;
    return output;
  }

  mark(book, chapter, verse, item) {
    if (item.style.backgroundColor === this.markColor) {
      item.style.backgroundColor = "unset";
      let index = -1;
      try {
        index = this.marks[book][chapter].indexOf(verse);
      } catch(error) {
        console.log(error);
      }
      if (index !== -1) {
        this.marks[book][chapter].splice(index, 1);
      }
    } else {
      item.style.backgroundColor = this.markColor;
        if (!this.marks) {
          this.marks = {};
        }
        if (!this.marks[book]) {
          this.marks[book] = {};
        }
        if (!this.marks[book][chapter]) {
          this.marks[book][chapter] = [];
        }
        this.marks[book][chapter].push(verse);
    }
    this.setCookie(`bible-${this.translate}-${this.book}`, JSON.stringify(this.marks),3653);
  }
  
  // Получить текущую главу (объект)
  getCurrentChapter() {
    if (!this.currentData || !this.currentData.chapters[this.chapterIndex]) {
      return null;
    }
    return this.currentData.chapters[this.chapterIndex];
  }

  // Получить номер текущей главы
  getCurrentChapterNumber() {
    const chapter = this.getCurrentChapter();
    return chapter ? chapter.chapter : null;
  }

  // Получить список доступных глав
  async getChaptersList(translate = this.translate, book = this.book) {
    await this.loadBookData(translate, book);
    return this.currentData.chapters.map((ch, index) => ({
      index: index,
      number: ch.chapter,
      title: `Глава ${ch.chapter}`
    }));
  }

// Перейти к следующей главе
  async nextChapter() {
    if (!this.currentData) return null;
    
    if (this.chapterIndex < this.currentData.chapters.length - 1) {
      this.chapterIndex++;
      return this.showText(this.translate, this.book, this.chapterIndex);
    }
    return null;
  }

  // Перейти к предыдущей главе
  async previousChapter() {
    if (!this.currentData) return null;
    
    if (this.chapterIndex > 0) {
      this.chapterIndex--;
      return this.showText(this.translate, this.book, this.chapterIndex);
    }
    return null;
  }

  // Получить информацию о текущей книге
  getBookInfo() {
    if (!this.currentData) return null;
    
    return {
      treat: this.currentData.treat,
      title: this.currentData.title,
      translate: this.translate,
      book: this.book,
      chapterIndex: this.chapterIndex,
      chapterNumber: this.getCurrentChapterNumber(),
      totalChapters: this.currentData.chapters.length
    };
  }

  // Очистить кэш (опционально)
  clearCache() {
    this.loadedBooks.clear();
    this.currentData = null;
  }

  // Очистить конкретную книгу из кэша
  clearBookFromCache(translate, book) {
    const cacheKey = this.getCacheKey(translate, book);
    this.loadedBooks.delete(cacheKey);
    
    // Если это текущая книга, сбрасываем currentData
    if (this.currentData && cacheKey === this.getCacheKey(this.translate, this.book)) {
      this.currentData = null;
    }
  }

  // Работа с Cookie
  setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }
  getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }
  eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}























