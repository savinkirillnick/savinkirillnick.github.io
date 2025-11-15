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
    if (chapter === "0") {
      output += `<h3>Предисловие</h3>`;
    } else {
      output += `<h3>Глава ${chapter}</h3>`;
    }
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



class Lib {
  constructor(){
    this.lib = [
      { name: 'Ветхий Завет',
      groups: [
      { name: 'Пятикнижие Моисеево',
      books: [
      { title: 'Бытие', link: 'byt'},
      { title: 'Исход', link: 'ish'},
      { title: 'Левит', link: 'lev'},
      { title: 'Числа', link: 'chis'},
      { title: 'Второзаконие', link: 'vtor'},
      ]},
      {name: 'Исторические',
      books: [
      { title: 'Иисуса Навина', link: 'nav'},
      { title: 'Судей Израилевых', link: 'sud'},
      { title: 'Руфь', link: 'ruf'},
      { title: '1-я Царств', link: 'tsar1'},
      { title: '2-я Царств', link: 'tsar2'},
      { title: '3-я Царств', link: 'tsar3'},
      { title: '4-я Царств', link: 'tsar4'},
      { title: '1-я Паралипо&shy;менон', link: 'par1'},
      { title: '2-я Паралипо&shy;менон', link: 'par2'},
      { title: '1-я Ездры', link: 'ezdr1'},
      { title: '2-я Ездры', link: 'ezdr2'},
      { title: 'Неемии', link: 'neem'},
      { title: 'Товит', link: 'tov'},
      { title: 'Иудифь', link: 'iudif'},
      { title: 'Есфирь', link: 'esf'},
      { title: '1-я Макка&shy;вей&shy;ская', link: 'mak1'},
      { title: '2-я Макка&shy;вей&shy;ская', link: 'mak2'},
      { title: '3-я Макка&shy;вей&shy;ская', link: 'mak3'},
      ]},
      {name: 'Учительские',
      books: [
      { title: 'Иова', link: 'iov'},
      { title: 'Псалтирь', link: 'ps'},
      { title: 'Притчей Соломоновых', link: 'prit'},
      { title: 'Екклезиаста', link: 'ekkl'},
      { title: 'Песни Песней Соломона', link: 'pesn'},
      { title: 'Премудрости Соломона', link: 'prem'},
      { title: 'Премудрости Иисуса, сына Сирахова', link: 'sir'},
      ]},
      {name: 'Пророческие',
      books: [
      { title: 'Исаии', link: 'isa'},
      { title: 'Иеремии', link: 'ier'},
      { title: 'Плач Иеремии', link: 'plch'},
      { title: 'Послание Иеремии', link: 'posi'},
      { title: 'Варуха', link: 'varh'},
      { title: 'Иезекииля', link: 'iez'},
      { title: 'Даниила', link: 'dan'},
      { title: 'Осии', link: 'os'},
      { title: 'Иоиля', link: 'ioil'},
      { title: 'Амоса', link: 'am'},
      { title: 'Авдия', link: 'avd'},
      { title: 'Ионы', link: 'io'},
      { title: 'Михея', link: 'mih'},
      { title: 'Наума', link: 'naum'},
      { title: 'Аввакума', link: 'avv'},
      { title: 'Софонии', link: 'sof'},
      { title: 'Аггея', link: 'ag'},
      { title: 'Захари', link: 'zah'},
      { title: 'Малахии', link: 'mal'},
      { title: '3-я Ездры', link: 'ezdr3'},
      ]},
      ]},
      { name: 'Новый Завет',
      groups: [
      { name: 'Евангелие',
      books: [
      { title: 'От Матфея', link: 'mf'},
      { title: 'От Марка', link: 'mk'},
      { title: 'От Луки', link: 'lk'},
      { title: 'От Иоанна', link: 'ion'},
      ]},
      {name: 'Деяния',
      books: [
      { title: 'Деяния святых Апостолов', link: 'dean'},
      ]},
      {name: 'Соборные послания',
      books: [
      { title: 'Иакова', link: 'iak'},
      { title: '1-е Петра', link: 'pet1'},
      { title: '2-е Петра', link: 'pet2'},
      { title: '1-е Иоанна', link: 'ion1'},
      { title: '2-е Иоанна', link: 'ion2'},
      { title: '3-е Иоанна', link: 'ion3'},
      { title: 'Иуды', link: 'iud'},
      ]},
      {name: 'Послания св. Апостола Петра',
      books: [
      { title: 'К римлянам', link: 'rim'},
      { title: 'К коринфянам 1-е', link: 'kor1'},
      { title: 'К коринфянам 2-е', link: 'kor2'},
      { title: 'К галатам', link: 'gal'},
      { title: 'К ефесянам', link: 'ef'},
      { title: 'К филиппий&shy;цам', link: 'flp'},
      { title: 'К колоссянам', link: 'kol'},
      { title: 'К фессало&shy;ни&shy;кий&shy;цам 1-е', link: 'fes1'},
      { title: 'К фессало&shy;ни&shy;кий&shy;цам 2-е', link: 'fes2'},
      { title: 'К Тимофею 1-е', link: 'tim1'},
      { title: 'К Тимофею 2-е', link: 'tim2'},
      { title: 'К Титу', link: 'tit'},
      { title: 'К Филимону', link: 'flm'},
      { title: 'К евреям', link: 'evr'},
      ]},
      {name: 'Пророческая',
      books: [
      { title: 'Откровение Иоанна Богослова (Апокалипсис)', link: 'otkr'},
      ]},
      ]},
    ];
    this.short = {
      byt: {s:'Быт', full:'Бытие'},
      ish: {s:'Исх', full:'Исход'},
      lev: {s:'Лев', full:'Левит'},
      chis: {s:'Чис', full:'Числа'},
      vtor: {s:'Втор', full:'Второзаконие'},
      nav: {s:'Нав', full:'Иисус Навин'},
      sud: {s:'Суд', full:'Книга Судей'},
      ruf: {s:'Руф', full:'Руфь'},
      tsar1: {s:'1Цар', full:'1-я Царств'},
      tsar2: {s:'2Цар', full:'2-я Царств'},
      tsar3: {s:'3Цар', full:'3-я Царств'},
      tsar4: {s:'4Цар', full:'4-я Царств'},
      par1: {s:'1Пар', full:'1-я Паралипоменон'},
      par2: {s:'2Пар', full:'2-я Паралипоменон'},
      ezdr1: {s:'1Ездр', full:'1-я Ездры'},
      ezdr2: {s:'2Ездр', full:'2-я Ездры'},
      neem: {s:'Неем', full:'Неемия'},
      tov: {s:'Тов', full:'Товит'},
      iudif: {s:'Иудиф', full:'Иудифь'},
      esf: {s:'Есф', full:'Есфирь'},
      mak1: {s:'1Мак', full:'1-я Маккавейская'},
      mak2: {s:'2Мак', full:'2-я Маккавейская'},
      mak3: {s:'3Мак', full:'3-я Маккавейская'},
      iov: {s:'Иов', full:'Иов'},
      ps: {s:'Пс', full:'Псалтирь'},
      prit: {s:'Притч', full:'Притчи'},
      ekkl: {s:'Еккл', full:'Екклесиаст'},
      pesn: {s:'Песн', full:'Песнь Песней'},
      prem: {s:'Прем', full:'Премудрость Соломона'},
      sir: {s:'Сир', full:'Сирах'},
      isa: {s:'Ис', full:'Исаия'},
      ier: {s:'Иер', full:'Иеремия'},
      plch: {s:'Плч', full:'Плач Иеремии'},
      posi: {s:'ПослИер', full:'Послание Иеремии'},
      varh: {s:'Вар', full:'Варух'},
      iez: {s:'Иез', full:'Иезекииль'},
      dan: {s:'Дан', full:'Даниил'},
      os: {s:'Ос', full:'Осия'},
      ioil: {s:'Иоил', full:'Иоиль'},
      am: {s:'Ам', full:'Амос'},
      avd: {s:'Авд', full:'Авдий'},
      io: {s:'Ион', full:'Иона'},
      mih: {s:'Мих', full:'Михей'},
      naum: {s:'Наум', full:'Наум'},
      avv: {s:'Авв', full:'Аввакум'},
      sof: {s:'Соф', full:'Софония'},
      ag: {s:'Аг', full:'Аггей'},
      zah: {s:'Зах', full:'Захария'},
      mal: {s:'Мал', full:'Малахия'},
      ezdr3: {s:'3Ездр', full:'3-я Ездры'},
      mf: {s:'Мф', full:'От Матфея'},
      mk: {s:'Мк', full:'От Марка'},
      lk: {s:'Лк', full:'От Луки'},
      ion: {s:'Ин', full:'От Иоанна'},
      dean: {s:'Деян', full:'Деяния'},
      iak: {s:'Иак', full:'Иакова'},
      pet1: {s:'1Пет', full:'1-е Петра'},
      pet2: {s:'2Пет', full:'2-е Петра'},
      ion1: {s:'1Ин', full:'1-е Иоанна'},
      ion2: {s:'2Ин', full:'2-е Иоанна'},
      ion3: {s:'3Ин', full:'3-е Иоанна'},
      iud: {s:'Иуд', full:'Иуды'},
      rim: {s:'Рим', full:'Римлянам'},
      kor1: {s:'1Кор', full:'1-е Коринфянам'},
      kor2: {s:'2Кор', full:'2-е Коринфянам'},
      gal: {s:'Гал', full:'Галатам'},
      ef: {s:'Еф', full:'к Ефесянам'},
      flp: {s:'Флп', full:'Филиппийцам'},
      kol: {s:'Кол', full:'Колоссянам'},
      fes1: {s:'1Фес', full:'1-е Фессалоникийцам'},
      fes2: {s:'2Фес', full:'2-е Фессалоникийцам'},
      tim1: {s:'1Тим', full:'1-е Тимофею'},
      tim2: {s:'2Тим', full:'2-е Тимофею'},
      tit: {s:'Тит', full:'Титу'},
      flm: {s:'Флм', full:'Филимону'},
      evr: {s:'Евр', full:'Евреям'},
      otkr: {s:'Откр', full:'Откровение'},
    };
  }
}

