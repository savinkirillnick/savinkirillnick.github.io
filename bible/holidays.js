// Функции расчета церковных праздников
function calculateEaster(year) {
    // Формула Гаусса для расчета Пасхи
    let a = year % 19;
    let b = Math.floor(year / 100);
    let c = year % 100;
    let d = Math.floor(b / 4);
    let e = b % 4;
    let f = Math.floor((b + 8) / 25);
    let g = Math.floor((b - f + 1) / 3);
    let h = ((19 * a + b - d - g + 15) % 30);
    let i = Math.floor(c / 4);
    let k = c % 4;
    let l = ((32 + 2 * e + 2 * i - h - k) % 7);
    let m = Math.floor((a + 11 * h + 22 * l) / 451);
    let n = (h + l - 7 * m + 114) % 31;
    let month = Math.floor((h + l - 7 * m + 114) / 31);
    let day = n + 1;
    return new Date(year, month - 1, day);
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Перечень постоянных праздников
let fixedHolidays = [
    { date: "01-01", name: "Новый Год" },          // Новогодний праздник
    { date: "01-07", name: "Рождество Христово" }, // Рождество
    { date: "01-19", name: "Крещение Господне" },  // Крещение
    { date: "02-15", name: "Сретение Господне" },  // Сретение
    { date: "03-25", name: "Благовещение Пресвятой Богородицы" }, // Благовещение
    { date: "11-04", name: "Покров Пресвятой Богородицы" },       // Покров
    { date: "12-04", name: "Введение во храм Пресвятой Богородицы" } // Введение
];

// Основные посты
let fastPeriods = [
    { startDate: "11-28", endDate: "01-06", name: "Филипповский пост" },      // Филипповка
    { startDate: "01-15", endDate: "02-14", name: "Посленовогодний пост" },   // Посленовогодний пост
    { startDate: null, endDate: null, name: "Великий пост" },                 // Великий пост (начало рассчитывается относительно Пасхи)
    { startDate: "08-14", endDate: "08-27", name: "Успенский пост" },         // Успенский пост
    { startDate: "08-28", endDate: "09-13", name: "Пост перед Успением" },    // Пост перед Успением
    { startDate: "12-28", endDate: "01-05", name: "Рождественский пост" }     // Рождественский пост
];

// Основная логика программы
function getChurchCalendar(year) {
    const easterDay = calculateEaster(year);
    const weekdaysBeforePentecost = 49; // Пятидесятница наступает ровно через 49 дней после Пасхи
    const pentecostSunday = new Date(easterDay.getTime());
    pentecostSunday.setDate(pentecostSunday.getDate() + weekdaysBeforePentecost);

    const holidays = [];

    // Добавление Пасхи и Пятидесятницы
    holidays.push({ date: formatDate(easterDay), name: "Пасха" });
    holidays.push({ date: formatDate(pentecostSunday), name: "Пятидесятница" });

    // Добавление постоянных праздников
    fixedHolidays.forEach(holiday => {
        const holidayDate = new Date(`${year}-${holiday.date}`);
        holidays.push({ date: formatDate(holidayDate), name: holiday.name });
    });

    // Определим начало и конец Великого поста
    const greatLentStart = new Date(easterDay.getTime());
    greatLentStart.setDate(greatLentStart.getDate() - 48); // Великий пост начинается за 48 дней до Пасхи
    const greatLentEnd = new Date(easterDay.getTime()); // Заканчивается накануне Пасхи
    greatLentEnd.setDate(greatLentEnd.getDate() - 1);

    fastPeriods.forEach(period => {
        period.startDate = period.startDate ? `${year}-${period.startDate}` : formatDate(greatLentStart);
        period.endDate = period.endDate ? `${year}-${period.endDate}` : formatDate(greatLentEnd);
    });

    return { holidays, fastPeriods };
}

// Вспомогательная функция форматирования даты в формат YYYY-MM-DD
function formatDate(dateObj) {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
}

// Определение ближайшего праздника и поста
function findNearestHolidayAndFast(currentDate, calendarData) {
    const sortedHolidays = [...calendarData.holidays].sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedFasts = [...calendarData.fastPeriods].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    let nextHoliday = null;
    let currentFast = null;

    sortedHolidays.forEach(holiday => {
        const holidayDate = new Date(holiday.date);
        if (holidayDate > currentDate) {
            nextHoliday = holiday;
            return false; // Остановимся сразу, как нашли ближайший будущий праздник
        }
    });

    sortedFasts.forEach(fastPeriod => {
        const startDate = new Date(fastPeriod.startDate);
        const endDate = new Date(fastPeriod.endDate);
        if (currentDate >= startDate && currentDate <= endDate) {
            currentFast = fastPeriod;
            return false; // Остановимся сразу, как нашли активный пост
        }
    });

    return { nextHoliday, currentFast };
}
