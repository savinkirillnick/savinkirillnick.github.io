class Surah {
  constructor() {
    this.mark = this.mark.bind(this);
    
    //Загружаем последнюю просмотренную суру
    const { translate, surah, chapterIndex } = this.lastSeen();
    this.translate = translate; // текущий перевод
    this.surah = surah; // текущая книга
    this.chapterIndex = chapterIndex; // текущий индекс раздела
    console.log(translate, surah, chapterIndex);
    this.loadedSurahs = new Map(); // кэш загруженных сур
    this.currentData = null; // текущие данные суры
    this.marks = JSON.parse(this.getCookie(`quran-${this.translate}-${this.surah}`)); // Закладки
    this.markColor = 'gold';
  }

  // Получаем последнюю просмотренную суру
  lastSeen() {
    let translate = 'kuliev';
    let surah = 'surah1';
    let chapterIndex = 0;
    try {
      const lastSurahData = JSON.parse(this.getCookie('quran-last-surah'));
      if (lastSurahData) {
        translate = lastSurahData.translate || translate;
        surah = lastSurahData.surah || surah;
        chapterIndex = lastSurahData.chapterIndex || chapterIndex;
      }
    } catch(error) {
      console.log('Ошибка при чтении последней суры:', error);
    }
    return {
      translate: translate,
      surah: surah,
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

  // Установить суру
  setSurah(surah) {
    if (this.surah !== surah) {
      this.surah = surah;
      this.currentData = null; // сбрасываем текущие данные
    }
    return this;
  }

  // Установить раздел
  setChapterIndex(chapterIndex) {
    this.chapterIndex = Math.max(0, chapterIndex);
    return this;
  }

  // Получить индекс раздела по его номеру
  getChapterIndex(chapterNumber) {
    let chapterIndex = 0;
    if (this.currentData) {
      this.currentData.chapters.forEach((chapter, index) => {
        if (chapterNumber === chapter.chapter) {
          chapterIndex = index;
        }
      });
    }
    return chapterIndex;
  }

  // Получить ключ для кэша
  getCacheKey(translate, surah) {
    return `books/${translate}/${surah}`;
  }

  // Загрузить данные книги
  async loadSurahData(translate = this.translate, surah = this.surah) {
    const cacheKey = this.getCacheKey(translate, surah);
    
    // Проверяем кэш
    if (this.loadedSurahs.has(cacheKey)) {
      this.currentData = this.loadedSurahs.get(cacheKey);
      return this.currentData;
    }

    try {
      // Динамически импортируем файл
      const module = await import(`./${cacheKey}.js`);
      
      // Получаем данные из модуля (предполагаем, что экспорт имеет имя книги)
      const surahData = module[surah];
      
      if (!surahData) {
        throw new Error(`Данные для книги ${surah} не найдены в файле`);
      }

      // Сохраняем в кэш
      this.loadedSurahs.set(cacheKey, surahData);
      this.currentData = surahData;
      
      return surahData;
    } catch (error) {
      console.error(`Ошибка загрузки книги ${cacheKey}:`, error);
      throw error;
    }
  }

  // Показать текст главы
  async showText(translate = this.translate, surah = this.surah, chapterIndex = this.chapterIndex) {

    // сохраняем просмотренную суру в память
    const data = JSON.stringify({translate: translate, surah: surah, chapterIndex: chapterIndex});
    this.setCookie('quran-last-surah',data,3653);
    
    // Обновляем параметры
    this.setTranslate(translate).setSurah(surah).setChapterIndex(chapterIndex);
    
    // Загружаем данные если нужно
    if (!this.currentData || 
        this.getCacheKey(translate, surah) !== this.getCacheKey(this.translate, this.surah)) {
      await this.loadSurahData(translate, surah);
    }

    // Проверяем валидность индекса
    if (chapterIndex < 0 || chapterIndex >= this.currentData.chapters.length) {
      throw new Error(`Раздел с индексом ${chapterIndex} не найдена в суре ${surah}. Доступно разделов: ${this.currentData.chapters.length}`);
    }

    // Получаем главу по индексу
    const chapterData = this.currentData.chapters[chapterIndex];
    
    if (!chapterData) {
      throw new Error(`Глава ${chapter} не найдена в суре ${surah}`);
    }

    // Форматируем вывод
    return this.formatChapterOutput(chapterData);
  }

  // Форматировать вывод аятов
  formatChapterOutput(chapterData) {
    const title = this.currentData.title;
    const { chapter, ayats } = chapterData;
    
    let output = `<h2>${title}</h2>`;
    output += `<h3>Аяты ${chapter}</h3>`;
    let v = 0;
    ayats.forEach(ayat => {
        let index = -1;

        // проверяем, есть ли данный аят в маркировках
        try {
           index = this.marks[this.surah][this.chapterIndex].indexOf(v);
        } catch (error) {
            console.log(error);
        }
        let styler = "";
      if (index !== -1) {
        styler = `style="background-color: ${this.markColor};" `;
      }

      if (ayat.num === 0) {
        output += `<p><span ${styler}onclick="mark(surah='${this.surah}', chapter=${this.chapterIndex}, ayat=${v}, item=this);">${ayat.ayat}</span></p>`;
      } else {
        output += `<p><span ${styler}onclick="mark(surah='${this.surah}', chapter=${this.chapterIndex}, ayat=${v}, item=this);"><span class="num">${ayat.num}</span> ${ayat.ayat}</span></p>`;
      }
      v += 1;
    });
    return output;
  }

  mark(surah, chapter, ayat, item) {
    if (item.style.backgroundColor === this.markColor) {
      item.style.backgroundColor = "unset";
      let index = -1;
      try {
        index = this.marks[surah][chapter].indexOf(ayat);
      } catch(error) {
        console.log(error);
      }
      if (index !== -1) {
        this.marks[surah][chapter].splice(index, 1);
      }
    } else {
      item.style.backgroundColor = this.markColor;
        if (!this.marks) {
          this.marks = {};
        }
        if (!this.marks[surah]) {
          this.marks[surah] = {};
        }
        if (!this.marks[surah][chapter]) {
          this.marks[surah][chapter] = [];
        }
        this.marks[surah][chapter].push(ayat);
    }
    this.setCookie(`quran-${this.translate}-${this.surah}`, JSON.stringify(this.marks),3653);
  }
  
  // Получить текущий раздел (объект)
  getCurrentChapter() {
    if (!this.currentData || !this.currentData.chapters[this.chapterIndex]) {
      return null;
    }
    return this.currentData.chapters[this.chapterIndex];
  }

  // Получить номер текущего раздела
  getCurrentChapterNumber() {
    const chapter = this.getCurrentChapter();
    return chapter ? chapter.chapter : null;
  }

  // Получить список доступных разделов
  async getChaptersList(translate = this.translate, surah = this.surah) {
    await this.loadSurahData(translate, surah);
    return this.currentData.chapters.map((ch, index) => ({
      index: index,
      number: ch.chapter,
      title: `Аяты ${ch.chapter}`
    }));
  }

// Перейти к следующему разделу
  async nextChapter() {
    if (!this.currentData) return null;
    
    if (this.chapterIndex < this.currentData.chapters.length - 1) {
      this.chapterIndex++;
      return this.showText(this.translate, this.surah, this.chapterIndex);
    }
    return null;
  }

  // Перейти к предыдущему разделу
  async previousChapter() {
    if (!this.currentData) return null;
    
    if (this.chapterIndex > 0) {
      this.chapterIndex--;
      return this.showText(this.translate, this.surah, this.chapterIndex);
    }
    return null;
  }

  // Получить информацию о текущем разделе
  getSurahInfo() {
    if (!this.currentData) return null;
    
    return {
      treat: this.currentData.treat,
      title: this.currentData.title,
      translate: this.translate,
      surah: this.surah,
      chapterIndex: this.chapterIndex,
      chapterNumber: this.getCurrentChapterNumber(),
      totalChapters: this.currentData.chapters.length
    };
  }

  // Очистить кэш (опционально)
  clearCache() {
    this.loadedSurahs.clear();
    this.currentData = null;
  }

  // Очистить конкретную суру из кэша
  clearSurahFromCache(translate, surah) {
    const cacheKey = this.getCacheKey(translate, surah);
    this.loadedSurahs.delete(cacheKey);
    
    // Если это текущая сура, сбрасываем currentData
    if (this.currentData && cacheKey === this.getCacheKey(this.translate, this.surah)) {
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
        this.lib = {
            name: 'Коран',
            surah: [
                { title: '1. Открывающая Коран', link: 'surah1'},
                { title: '2. Корова', link: 'surah2'},
                { title: '3. Семейство Имрана', link: 'surah3'},
                { title: '4. Женщины', link: 'surah4'},
                { title: '5. Трапеза', link: 'surah5'},
                { title: '6. Скот', link: 'surah6'},
                { title: '7. Ограды', link: 'surah7'},
                { title: '8. Трофеи', link: 'surah8'},
                { title: '9. Покаяние', link: 'surah9'},
                { title: '10. Йунус (Иона)', link: 'surah10'},
                { title: '11. Худ', link: 'surah11'},
                { title: '12. Йусуф (Иосиф)', link: 'surah12'},
                { title: '13. Гром', link: 'surah13'},
                { title: '14. Ибрахим (Авраам)', link: 'surah14'},
                { title: '15. Xиджp', link: 'surah15'},
                { title: '16. Пчелы', link: 'surah16'},
                { title: '17. Ночной перенос', link: 'surah17'},
                { title: '18. Пещера', link: 'surah18'},
                { title: '19. Мapьям (Мария)', link: 'surah19'},
                { title: '20. Тa Xa', link: 'surah20'},
                { title: '21. Пророки', link: 'surah21'},
                { title: '22. Паломничество', link: 'surah22'},
                { title: '23. Верующие', link: 'surah23'},
                { title: '24. Свет', link: 'surah24'},
                { title: '25. Различение', link: 'surah25'},
                { title: '26. Поэты', link: 'surah26'},
                { title: '27. Муравьи', link: 'surah27'},
                { title: '28. Рассказ', link: 'surah28'},
                { title: '29. Паук', link: 'surah29'},
                { title: '30. Римляне', link: 'surah30'},
                { title: '31. Лукмaн', link: 'surah31'},
                { title: '32. Земной поклон', link: 'surah32'},
                { title: '33. Союзники', link: 'surah33'},
                { title: '34. Сава', link: 'surah34'},
                { title: '35. Творец', link: 'surah35'},
                { title: '36. Иа Син', link: 'surah36'},
                { title: '37. Выстроившиеся в ряды', link: 'surah37'},
                { title: '38. Сад', link: 'surah38'},
                { title: '39. Толпы', link: 'surah39'},
                { title: '40. Прощающий', link: 'surah40'},
                { title: '41. Разъяснены', link: 'surah41'},
                { title: '42. Совет', link: 'surah42'},
                { title: '43. Украшения', link: 'surah43'},
                { title: '44. Дым', link: 'surah44'},
                { title: '45. Коленопреклоненные', link: 'surah45'},
                { title: '46. Барханы', link: 'surah46'},
                { title: '47. Мухаммад', link: 'surah47'},
                { title: '48. Победа', link: 'surah48'},
                { title: '49. Комнаты', link: 'surah49'},
                { title: '50. Каф', link: 'surah50'},
                { title: '51. Рассеивающие прах', link: 'surah51'},
                { title: '52. Гора', link: 'surah52'},
                { title: '53. Звезда', link: 'surah53'},
                { title: '54. Месяц', link: 'surah54'},
                { title: '55. Милостливый', link: 'surah55'},
                { title: '56. Событие', link: 'surah56'},
                { title: '57. Железо', link: 'surah57'},
                { title: '58. Препирающаяся', link: 'surah58'},
                { title: '59. Сбор', link: 'surah59'},
                { title: '60. Испытуемая', link: 'surah60'},
                { title: '61. Ряды', link: 'surah61'},
                { title: '62. Собрание', link: 'surah62'},
                { title: '63. Лицемеры', link: 'surah63'},
                { title: '64. Взаимное обделение', link: 'surah64'},
                { title: '65. Развод', link: 'surah65'},
                { title: '66. Запрещение', link: 'surah66'},
                { title: '67. Власть', link: 'surah67'},
                { title: '68. Письменная трость', link: 'surah68'},
                { title: '69. Неминуемое', link: 'surah69'},
                { title: '70. Ступени', link: 'surah70'},
                { title: '71. Нух (Ной)', link: 'surah71'},
                { title: '72. Джинны', link: 'surah72'},
                { title: '73. Закутавшийся', link: 'surah73'},
                { title: '74. Завернувшийся', link: 'surah74'},
                { title: '75. Воскресение', link: 'surah75'},
                { title: '76. Человек', link: 'surah76'},
                { title: '77. Посылаемые', link: 'surah77'},
                { title: '78. Весть', link: 'surah78'},
                { title: '79. Исторгающие', link: 'surah79'},
                { title: '80. Нахмурился', link: 'surah80'},
                { title: '81. Скручивание', link: 'surah81'},
                { title: '82. Раскалывание', link: 'surah82'},
                { title: '83. Обвешивающие', link: 'surah83'},
                { title: '84. Разверзнется', link: 'surah84'},
                { title: '85. Созвездия Зодиака', link: 'surah85'},
                { title: '86. Ночной путник', link: 'surah86'},
                { title: '87. Всевышний', link: 'surah87'},
                { title: '88. Покрывающее', link: 'surah88'},
                { title: '89. Заря', link: 'surah89'},
                { title: '90. Город', link: 'surah90'},
                { title: '91. Солнце', link: 'surah91'},
                { title: '92. Ночь', link: 'surah92'},
                { title: '93. Утро', link: 'surah93'},
                { title: '94. Раскрытие', link: 'surah94'},
                { title: '95. Смоковница', link: 'surah95'},
                { title: '96. Сгусток крови', link: 'surah96'},
                { title: '97. Предопределение', link: 'surah97'},
                { title: '98. Ясное знамение', link: 'surah98'},
                { title: '99. Сотрясение', link: 'surah99'},
                { title: '100. Скачущие', link: 'surah100'},
                { title: '101. Великое бедствие', link: 'surah101'},
                { title: '102. Страсть к преумножению', link: 'surah102'},
                { title: '103. Предвечернее время', link: 'surah103'},
                { title: '104. Хулитель', link: 'surah104'},
                { title: '105. Слон', link: 'surah105'},
                { title: '106. Курайшиты', link: 'surah106'},
                { title: '107. Мелочь', link: 'surah107'},
                { title: '108. Изобилие', link: 'surah108'},
                { title: '109. Неверующие', link: 'surah109'},
                { title: '110. Помощь', link: 'surah110'},
                { title: '111. Пальмовые волокна', link: 'surah111'},
                { title: '112. Очищение веры', link: 'surah112'},
                { title: '113. Рассвет', link: 'surah113'},
                { title: '114. Люди', link: 'surah114'},
            ]
        };
        this.short = {
            surah1: {full: 'Открывающая Коран'},
            surah2: {full: 'Корова'},
            surah3: {full: 'Семейство Имрана'},
            surah4: {full: 'Женщины'},
            surah5: {full: 'Трапеза'},
            surah6: {full: 'Скот'},
            surah7: {full: 'Ограды'},
            surah8: {full: 'Трофеи'},
            surah9: {full: 'Покаяние'},
            surah10: {full: 'Йунус (Иона)'},
            surah11: {full: 'Худ'},
            surah12: {full: 'Йусуф (Иосиф)'},
            surah13: {full: 'Гром'},
            surah14: {full: 'Ибрахим (Авраам)'},
            surah15: {full: 'Xиджp'},
            surah16: {full: 'Пчелы'},
            surah17: {full: 'Ночной перенос'},
            surah18: {full: 'Пещера'},
            surah19: {full: 'Мapьям (Мария)'},
            surah20: {full: 'Тa Xa'},
            surah21: {full: 'Пророки'},
            surah22: {full: 'Паломничество'},
            surah23: {full: 'Верующие'},
            surah24: {full: 'Свет'},
            surah25: {full: 'Различение'},
            surah26: {full: 'Поэты'},
            surah27: {full: 'Муравьи'},
            surah28: {full: 'Рассказ'},
            surah29: {full: 'Паук'},
            surah30: {full: 'Римляне'},
            surah31: {full: 'Лукмaн'},
            surah32: {full: 'Земной поклон'},
            surah33: {full: 'Союзники'},
            surah34: {full: 'Сава'},
            surah35: {full: 'Творец'},
            surah36: {full: 'Иа Син'},
            surah37: {full: 'Выстроившиеся в ряды'},
            surah38: {full: 'Сад'},
            surah39: {full: 'Толпы'},
            surah40: {full: 'Прощающий'},
            surah41: {full: 'Разъяснены'},
            surah42: {full: 'Совет'},
            surah43: {full: 'Украшения'},
            surah44: {full: 'Дым'},
            surah45: {full: 'Коленопреклоненные'},
            surah46: {full: 'Барханы'},
            surah47: {full: 'Мухаммад'},
            surah48: {full: 'Победа'},
            surah49: {full: 'Комнаты'},
            surah50: {full: 'Каф'},
            surah51: {full: 'Рассеивающие прах'},
            surah52: {full: 'Гора'},
            surah53: {full: 'Звезда'},
            surah54: {full: 'Месяц'},
            surah55: {full: 'Милостливый'},
            surah56: {full: 'Событие'},
            surah57: {full: 'Железо'},
            surah58: {full: 'Препирающаяся'},
            surah59: {full: 'Сбор'},
            surah60: {full: 'Испытуемая'},
            surah61: {full: 'Ряды'},
            surah62: {full: 'Собрание'},
            surah63: {full: 'Лицемеры'},
            surah64: {full: 'Взаимное обделение'},
            surah65: {full: 'Развод'},
            surah66: {full: 'Запрещение'},
            surah67: {full: 'Власть'},
            surah68: {full: 'Письменная трость'},
            surah69: {full: 'Неминуемое'},
            surah70: {full: 'Ступени'},
            surah71: {full: 'Нух (Ной)'},
            surah72: {full: 'Джинны'},
            surah73: {full: 'Закутавшийся'},
            surah74: {full: 'Завернувшийся'},
            surah75: {full: 'Воскресение'},
            surah76: {full: 'Человек'},
            surah77: {full: 'Посылаемые'},
            surah78: {full: 'Весть'},
            surah79: {full: 'Исторгающие'},
            surah80: {full: 'Нахмурился'},
            surah81: {full: 'Скручивание'},
            surah82: {full: 'Раскалывание'},
            surah83: {full: 'Обвешивающие'},
            surah84: {full: 'Разверзнется'},
            surah85: {full: 'Созвездия Зодиака'},
            surah86: {full: 'Ночной путник'},
            surah87: {full: 'Всевышний'},
            surah88: {full: 'Покрывающее'},
            surah89: {full: 'Заря'},
            surah90: {full: 'Город'},
            surah91: {full: 'Солнце'},
            surah92: {full: 'Ночь'},
            surah93: {full: 'Утро'},
            surah94: {full: 'Раскрытие'},
            surah95: {full: 'Смоковница'},
            surah96: {full: 'Сгусток крови'},
            surah97: {full: 'Предопределение'},
            surah98: {full: 'Ясное знамение'},
            surah99: {full: 'Сотрясение'},
            surah100: {full: 'Скачущие'},
            surah101: {full: 'Великое бедствие'},
            surah102: {full: 'Страсть к преумножению'},
            surah103: {full: 'Предвечернее время'},
            surah104: {full: 'Хулитель'},
            surah105: {full: 'Слон'},
            surah106: {full: 'Курайшиты'},
            surah107: {full: 'Мелочь'},
            surah108: {full: 'Изобилие'},
            surah109: {full: 'Неверующие'},
            surah110: {full: 'Помощь'},
            surah111: {full: 'Пальмовые волокна'},
            surah112: {full: 'Очищение веры'},
            surah113: {full: 'Рассвет'},
            surah114: {full: 'Люди'}
        };
    }
}







