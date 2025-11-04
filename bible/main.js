class Book {
  constructor() {
    this.translate = 'syno'; // текущий перевод
    this.book = 'byt'; // текущая книга
    this.chapter = '1'; // текущая глава
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
  setChapter(chapter) {
    this.chapter = chapter;
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
  async showText(translate = this.translate, book = this.book, chapter = this.chapter) {
    // Обновляем параметры
    this.setTranslate(translate).setBook(book).setChapter(chapter);
    
    // Загружаем данные если нужно
    if (!this.currentData || 
        this.getCacheKey(translate, book) !== this.getCacheKey(this.translate, this.book)) {
      await this.loadBookData(translate, book);
    }

    // Находим нужную главу
    const chapterData = this.currentData.chapters.find(ch => ch.chapter === chapter);
    
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
    
    verses.forEach(verse => {
      output += `<p><span class="num">${verse.num}</span> ${verse.verse}</p>`;
    });
    
    return output;
  }

  // Получить список доступных глав
  async getChaptersList(translate = this.translate, book = this.book) {
    await this.loadBookData(translate, book);
    return this.currentData.chapters.map(ch => ({
      number: ch.chapter,
      title: `Глава ${ch.chapter}`
    }));
  }

  // Получить информацию о текущей книге
  getBookInfo() {
    if (!this.currentData) return null;
    
    return {
      treat: this.currentData.treat,
      title: this.currentData.title,
      translate: this.translate,
      book: this.book,
      chapter: this.chapter,
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
