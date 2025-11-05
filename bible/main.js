class Book {
  constructor() {
    this.translate = 'syno'; // текущий перевод
    this.book = 'byt'; // текущая книга
    this.chapterIndex = 0; // текущий индекс главы
    this.loadedBooks = new Map(); // кэш загруженных книг
    this.currentData = null; // текущие данные книги
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
      const module = await import(`./${translate}-${book}.js`);
      
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
      console.error(`Ошибка загрузки книги ${translate}-${book}:`, error);
      throw error;
    }
  }

  // Показать текст главы
  async showText(translate = this.translate, book = this.book, chapterIndex = this.chapterIndex) {
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
    
    let output = `<h2>${treat} - ${title}</h2>`;
    output += `<h3>Глава ${chapter}</h3>`;
    output += `<p>`;
    verses.forEach(verse => {
      if (verse.num === 0) {
        output += `</p><p>`
        output += `${verse.verse}`;
      } else {
        output += `<span class="num">${verse.num}</span>${verse.verse} `;
      }
    });
    output += `</p>`;
    return output;
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
}


