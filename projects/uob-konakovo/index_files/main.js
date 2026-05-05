/* ==========================================================================
   UOB Konakovo v7 — Unified JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {

    // --- Current Date ---
    (function() {
        var el = document.getElementById('currentDate');
        if (!el) return;
        var months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
        var now = new Date();
        el.textContent = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear() + ' г.';
    })();

    // --- Sidebar Submenu Toggle ---
    window.toggleSubmenu = function(element) {
        var submenu = element.nextElementSibling;
        var arrow = element.querySelector('.arrow');
        var isOpen = submenu.classList.contains('open');

        document.querySelectorAll('.submenu').forEach(function(sub) {
            sub.classList.remove('open');
        });
        document.querySelectorAll('.arrow').forEach(function(arr) {
            arr.classList.remove('rotated');
        });

        if (!isOpen) {
            submenu.classList.add('open');
            if (arrow) arrow.classList.add('rotated');
        }
    };

    // --- Mark current page in sidebar ---
    (function() {
        var currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.submenu-link').forEach(function(link) {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('current');
                var submenu = link.closest('.submenu');
                if (submenu) {
                    submenu.classList.add('open');
                    var menuLink = submenu.previousElementSibling;
                    if (menuLink) {
                        var arrow = menuLink.querySelector('.arrow');
                        if (arrow) arrow.classList.add('rotated');
                    }
                }
            }
        });
        // Direct links
        document.querySelectorAll('.menu-link[href]').forEach(function(link) {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
        // Nav bar
        document.querySelectorAll('.nav-link').forEach(function(link) {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    })();

    // --- Sticky Nav Shadow ---
    (function() {
        var nav = document.querySelector('.nav-bar');
        if (!nav) return;
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                nav.classList.add('sticky-shadow');
            } else {
                nav.classList.remove('sticky-shadow');
            }
        }, {passive: true});
    })();

    // --- Mobile Menu ---
    (function() {
        var btn = document.getElementById('mobileMenuBtn');
        var sidebar = document.getElementById('sidebar');
        var backdrop = document.getElementById('mobileBackdrop');
        if (!btn || !sidebar) return;

        // Create close button
        var closeBtn = document.createElement('button');
        closeBtn.className = 'sidebar-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Закрыть меню');
        sidebar.insertBefore(closeBtn, sidebar.firstChild);

        function openMenu() {
            sidebar.classList.add('mobile-open');
            if (backdrop) backdrop.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            sidebar.classList.remove('mobile-open');
            if (backdrop) backdrop.classList.remove('show');
            document.body.style.overflow = '';
        }

        btn.addEventListener('click', function() {
            if (sidebar.classList.contains('mobile-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        closeBtn.addEventListener('click', closeMenu);

        if (backdrop) {
            backdrop.addEventListener('click', closeMenu);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
                closeMenu();
            }
        });
    })();

    // --- Cookie Consent ---
    (function() {
        var banner = document.getElementById('cookieBanner');
        var btn = document.getElementById('cookieAccept');
        if (!banner || !btn) return;

        if (localStorage.getItem('cookie_consent') === '1') {
            banner.classList.add('hidden');
            return;
        }

        btn.addEventListener('click', function() {
            localStorage.setItem('cookie_consent', '1');
            banner.classList.add('hidden');
        });
    })();

    // --- Accessibility Mode ---
    (function() {
        var btn = document.getElementById('accessibilityBtn');
        if (!btn) return;

        if (localStorage.getItem('accessible_mode') === '1') {
            document.body.classList.add('accessible-mode');
            btn.title = 'Обычная версия';
        }

        btn.addEventListener('click', function() {
            document.body.classList.toggle('accessible-mode');
            var isOn = document.body.classList.contains('accessible-mode');
            localStorage.setItem('accessible_mode', isOn ? '1' : '0');
            btn.title = isOn ? 'Обычная версия' : 'Версия для слабовидящих';
        });
    })();

    // --- Plans Toggle (NOKO page) ---
    window.togglePlans = function() {
        var list = document.getElementById('plansList');
        var icon = document.getElementById('plansIcon');
        if (!list) return;
        list.classList.toggle('open');
        if (icon) icon.classList.toggle('rotated');
    };

    // --- Method Accordion (Методическая копилка) ---
    window.toggleMethod = function(btn) {
        if (!btn) return;
        var content = btn.nextElementSibling;
        var icon = btn.querySelector('.method-toggle-icon');
        if (content) content.classList.toggle('open');
        if (icon) icon.classList.toggle('rotated');
    };

    // --- Scroll to Top ---
    (function() {
        var btn = document.getElementById('scrollTopBtn');
        if (!btn) return;

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });

        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    })();

    // --- Site Search ---
    (function() {
        // Search index with all pages
        var searchIndex = [
            {
                url: 'index.html',
                title: 'Главная страница',
                keywords: 'главная управление образования новости госуслуги безопасность дорожная пожарная горячая линия запись детский сад школа'
            },
            {
                url: 'dokumenty.html',
                title: 'Документы',
                keywords: 'документы нормативные акты приказы постановления распоряжения регламенты положения'
            },
            {
                url: 'kontakty.html',
                title: 'Контакты',
                keywords: 'контакты адрес телефон email руководство начальник архипова ольга алексеевна режим работы график'
            },
            {
                url: 'attestacia.html',
                title: 'Аттестация педагогических работников',
                keywords: 'аттестация педагогические работники учителя категория квалификация первая высшая'
            },
            {
                url: 'noko.html',
                title: 'НОКО',
                keywords: 'ноко независимая оценка качество образования условия планы мероприятия'
            },
            {
                url: 'monitoring.html',
                title: 'Мониторинг эффективности',
                keywords: 'мониторинг эффективность деятельность руководителей статистика показатели критерии'
            },
            {
                url: 'gia-ege.html',
                title: 'ЕГЭ',
                keywords: 'егэ единый государственный экзамен 11 класс расписание экзамены итоговая аттестация'
            },
            {
                url: 'gia-oge.html',
                title: 'ОГЭ',
                keywords: 'огэ основной государственный экзамен 9 класс расписание экзамены итоговая аттестация'
            },
            {
                url: 'gia-sochinenie.html',
                title: 'Итоговое сочинение',
                keywords: 'итоговое сочинение изложение допуск егэ 11 класс темы направления'
            },
            {
                url: 'gia-sobesedovanie.html',
                title: 'Итоговое собеседование',
                keywords: 'итоговое собеседование устное допуск огэ 9 класс русский язык'
            },
            {
                url: 'roditelyam-pitanie.html',
                title: 'Школьное питание',
                keywords: 'питание горячее питание школьное питание завтрак обед бесплатное льготное меню столовая'
            },
            {
                url: 'roditelyam-zapis.html',
                title: 'Приём в 1 класс',
                keywords: 'приём запись первый класс первоклассник зачисление школа документы заявление'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Летние лагеря',
                keywords: 'летние лагеря отдых оздоровление каникулы путёвки детский отдых лето'
            },
            {
                url: 'roditelyam-oplata.html',
                title: 'Родительская плата',
                keywords: 'родительская плата оплата детский сад доу дошкольное компенсация возврат расчёт квитанция'
            },
            {
                url: 'privacy.html',
                title: 'Политика конфиденциальности',
                keywords: 'политика конфиденциальности персональные данные защита информации обработка gdpr'
            },
            {
                url: 'rekvizity.html',
                title: 'Реквизиты организации',
                keywords: 'реквизиты инн кпп огрн адрес телефон email контакты юридический адрес окпо окато октмо учредители руководство архипова'
            },
            // Documents from attestacia.html
            {
                url: 'attestacia.html',
                title: 'Ссылки на порядок аттестации педагогических работников (Тверская область)',
                keywords: 'аттестация педагогические работники порядок ссылки тверская область'
            },
            {
                url: 'attestacia.html',
                title: 'Образец заявления на категорию «педагог-методист»',
                keywords: 'аттестация заявление педагог методист категория образец'
            },
            {
                url: 'attestacia.html',
                title: 'Перечень документов на квалификационную категорию «педагог-методист»',
                keywords: 'аттестация педагог методист перечень документов категория квалификация'
            },
            {
                url: 'attestacia.html',
                title: 'Ответственные за аттестацию',
                keywords: 'аттестация ответственные педагогические работники'
            },
            // Documents from dokumenty.html
            {
                url: 'dokumenty.html',
                title: 'Положение об Управлении образования',
                keywords: 'положение управление образования устав документы нормативные'
            },
            {
                url: 'dokumenty.html',
                title: 'Устав',
                keywords: 'устав управление образования документы'
            },
            {
                url: 'dokumenty.html',
                title: 'Порядок учёта детей, подлежащих обучению',
                keywords: 'порядок учёт дети обучение школа'
            },
            {
                url: 'dokumenty.html',
                title: 'Постановление о закреплении территорий за школами',
                keywords: 'постановление закрепление территории школы'
            },
            // Documents from gia-ege.html
            {
                url: 'gia-ege.html',
                title: 'Порядок проведения ЕГЭ-2026',
                keywords: 'егэ порядок проведение 2026 приказ минпросвещения рособрнадзор'
            },
            {
                url: 'gia-ege.html',
                title: 'Порядок проведения ГВЭ-2026',
                keywords: 'гвэ порядок проведение 2026 приказ минпросвещения'
            },
            {
                url: 'gia-ege.html',
                title: 'Проект приказа: расписание ЕГЭ на 2026 г.',
                keywords: 'егэ расписание 2026 проект приказ экзамен'
            },
            {
                url: 'gia-ege.html',
                title: 'Проект приказа: расписание ГВЭ на 2026 г.',
                keywords: 'гвэ расписание 2026 проект приказ экзамен'
            },
            {
                url: 'gia-ege.html',
                title: 'Приказ Министерства образования Тверской области от 06.10.2025 № 773-ПК',
                keywords: 'егэ приказ министерство образования тверская область 773'
            },
            {
                url: 'gia-ege.html',
                title: 'Приказ Министерства образования Тверской области от 15.10.2025 № 792-ПК',
                keywords: 'егэ приказ министерство образования тверская область 792'
            },
            {
                url: 'gia-ege.html',
                title: 'Приказ Министерства образования Тверской области от 16.01.2026 № 24-ПК',
                keywords: 'егэ приказ министерство образования тверская область 24'
            },
            {
                url: 'gia-ege.html',
                title: 'Приказ Министерства образования Тверской области от 19.11.2025 № 860-ПК',
                keywords: 'егэ приказ министерство образования тверская область 860'
            },
            {
                url: 'gia-ege.html',
                title: 'Приказ Министерства образования Тверской области от 19.11.2025 № 861-ПК',
                keywords: 'егэ приказ министерство образования тверская область 861'
            },
            {
                url: 'gia-ege.html',
                title: 'Приказ Министерства образования Тверской области от 28.10.2025 № 820-ПК',
                keywords: 'егэ приказ министерство образования тверская область 820'
            },
            // Documents from gia-oge.html
            {
                url: 'gia-oge.html',
                title: 'Порядок проведения ОГЭ-2026',
                keywords: 'огэ порядок проведение 2026 приказ минпросвещения'
            },
            {
                url: 'gia-oge.html',
                title: 'Приказ № 78-ПК',
                keywords: 'огэ приказ 78'
            },
            {
                url: 'gia-oge.html',
                title: 'Соглашение об организации обучения — МБОУ СОШ пос. Озерки',
                keywords: 'огэ соглашение обучение озерки школа'
            },
            // Documents from gia-sobesedovanie.html
            {
                url: 'gia-sobesedovanie.html',
                title: 'Методические рекомендации по организации и проведению ИС-9 2026',
                keywords: 'собеседование методические рекомендации 9 класс 2026'
            },
            {
                url: 'gia-sobesedovanie.html',
                title: 'Приказ Управления образования (собеседование)',
                keywords: 'собеседование приказ управление образования'
            },
            {
                url: 'gia-sobesedovanie.html',
                title: 'Приказ № 896-ПК (собеседование)',
                keywords: 'собеседование приказ 896'
            },
            {
                url: 'gia-sobesedovanie.html',
                title: 'Приказ № 897-ПК (собеседование)',
                keywords: 'собеседование приказ 897'
            },
            {
                url: 'gia-sobesedovanie.html',
                title: 'Приказ № 909-ПК (собеседование)',
                keywords: 'собеседование приказ 909'
            },
            {
                url: 'gia-sobesedovanie.html',
                title: 'Приказ № 958-ПК (собеседование)',
                keywords: 'собеседование приказ 958'
            },
            {
                url: 'gia-sobesedovanie.html',
                title: 'Собеседование второй срок — Приказ МБОУ СОШ №7',
                keywords: 'собеседование второй срок школа 7 приказ'
            },
            // Documents from gia-sochinenie.html
            {
                url: 'gia-sochinenie.html',
                title: 'Приказ Министерства образования Тверской области от 15.10.2025 № 792-ПК (сочинение)',
                keywords: 'сочинение приказ министерство образования тверская область 792'
            },
            {
                url: 'gia-sochinenie.html',
                title: 'Приказ Министерства образования Тверской области от 28.10.2025 № 819-ПК',
                keywords: 'сочинение приказ министерство образования тверская область 819'
            },
            {
                url: 'gia-sochinenie.html',
                title: 'Приказ Министерства образования Тверской области от 30.10.2025 № 828-ПК',
                keywords: 'сочинение приказ министерство образования тверская область 828'
            },
            {
                url: 'gia-sochinenie.html',
                title: 'Приказ Управления образования (сочинение)',
                keywords: 'сочинение приказ управление образования'
            },
            {
                url: 'gia-sochinenie.html',
                title: 'Письмо Рособрнадзора от 24.10.2025 № 04-363',
                keywords: 'сочинение письмо рособрнадзор 363'
            },
            {
                url: 'gia-sochinenie.html',
                title: 'Методические рекомендации по организации и проведению ИС-11 2025-26',
                keywords: 'сочинение методические рекомендации 11 класс 2025 2026'
            },
            {
                url: 'gia-sochinenie.html',
                title: 'Правила заполнения бланков 2025-26',
                keywords: 'сочинение правила заполнение бланки 2025 2026'
            },
            {
                url: 'gia-sochinenie.html',
                title: 'Сборник отчётных форм сочинения (изложения) 2025-26',
                keywords: 'сочинение изложение сборник отчёт формы 2025 2026'
            },
            // Documents from monitoring.html
            {
                url: 'monitoring.html',
                title: 'Информация (мониторинг)',
                keywords: 'мониторинг эффективность информация'
            },
            {
                url: 'monitoring.html',
                title: 'Эффективность ДОУ Конаковского МО',
                keywords: 'мониторинг эффективность доу детский сад конаково'
            },
            {
                url: 'monitoring.html',
                title: 'Эффективность СОШ Конаковского МО',
                keywords: 'мониторинг эффективность школы сош конаково'
            },
            {
                url: 'monitoring.html',
                title: 'МБОУ НОШ п. 2-ое Моховое (мониторинг)',
                keywords: 'мониторинг школа моховое начальная'
            },
            {
                url: 'monitoring.html',
                title: 'МБОУ ООШ д. Старое Мелково — Эффективность',
                keywords: 'мониторинг школа мелково эффективность'
            },
            {
                url: 'monitoring.html',
                title: 'МБОУ СКШ № 4 — информация по МЭДР ОО (ОВЗ)',
                keywords: 'мониторинг школа 4 овз эффективность'
            },
            {
                url: 'monitoring.html',
                title: 'ОДО Конаковского МО (мониторинг)',
                keywords: 'мониторинг одо дополнительное образование конаково'
            },
            // Documents from noko.html
            {
                url: 'noko.html',
                title: 'Приказ НОКО 2025',
                keywords: 'ноко приказ 2025 независимая оценка качество'
            },
            {
                url: 'noko.html',
                title: 'Отчёт 2025 НОКО Конаковского муниципального округа',
                keywords: 'ноко отчёт 2025 конаково независимая оценка качество'
            },
            // Documents from roditelyam-lager.html
            {
                url: 'roditelyam-lager.html',
                title: 'Приказ о создании реестра (лагеря)',
                keywords: 'лагерь отдых реестр приказ лето'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Приказ об организации отдыха 2026',
                keywords: 'лагерь отдых организация приказ 2026 лето'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Приказ лагеря МБОУ СОШ №3',
                keywords: 'лагерь отдых школа 3 приказ'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Акт приёмки лагеря 2026',
                keywords: 'лагерь отдых акт приёмка 2026'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Приказ о назначении начальников лагерей 2026',
                keywords: 'лагерь отдых начальник назначение приказ 2026'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Приказ о мониторинге ЛОК 2026',
                keywords: 'лагерь отдых мониторинг лок приказ 2026'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'ЛОЛ 2026',
                keywords: 'лагерь отдых лол 2026 лето'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Палатки 2026',
                keywords: 'лагерь отдых палатки 2026 лето'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Приказ отряды досуга и отдыха',
                keywords: 'лагерь отдых отряды досуг приказ'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Приказ открытие ЛТО 2026 (8-10 классы)',
                keywords: 'лагерь трудовой лто отдых приказ 2026 8 9 10 класс'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Приказ о временном трудоустройстве 2026',
                keywords: 'лагерь трудоустройство работа приказ 2026'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Приложение к приказу (трудоустройство на 29.01.25)',
                keywords: 'лагерь трудоустройство приложение приказ'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Предоставление путёвок',
                keywords: 'лагерь отдых путёвки предоставление'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Заявления на лагерь 2026',
                keywords: 'лагерь отдых заявление путёвка 2026'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Приложения к приказу по выдаче путёвок',
                keywords: 'лагерь отдых путёвка приказ приложение'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Безопасность детей (лагерь)',
                keywords: 'лагерь отдых безопасность дети'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Питание на базе других ОУ 2026',
                keywords: 'лагерь отдых питание школа 2026'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Приказ о брокеражной комиссии 2026',
                keywords: 'лагерь отдых питание брокераж комиссия приказ 2026'
            },
            {
                url: 'roditelyam-lager.html',
                title: 'Приказы по датам (лагерь)',
                keywords: 'лагерь отдых приказы даты'
            },
            // Documents from roditelyam-oplata.html
            {
                url: 'roditelyam-oplata.html',
                title: 'Постановление № 709 от 30.05.2014 — Родительская плата',
                keywords: 'родительская плата постановление 709 оплата детский сад'
            },
            {
                url: 'roditelyam-oplata.html',
                title: 'Постановление № 777 от 20.09.2018 — Изменения',
                keywords: 'родительская плата постановление 777 изменения оплата детский сад'
            },
            {
                url: 'roditelyam-oplata.html',
                title: 'Постановление № 1250 от 02.12.2022 — Мобилизованные',
                keywords: 'родительская плата постановление 1250 мобилизованные оплата детский сад льготы'
            },
            {
                url: 'roditelyam-oplata.html',
                title: 'Постановление № 93 от 26.02.2024 (родительская плата)',
                keywords: 'родительская плата постановление 93 оплата детский сад'
            },
            {
                url: 'roditelyam-oplata.html',
                title: 'Постановление № 1850 от 11.11.2025 (родительская плата)',
                keywords: 'родительская плата постановление 1850 оплата детский сад'
            },
            {
                url: 'roditelyam-oplata.html',
                title: 'Постановление № 2078 от 18.12.2025 (родительская плата)',
                keywords: 'родительская плата постановление 2078 оплата детский сад'
            },
            {
                url: 'roditelyam-oplata.html',
                title: 'Постановление о закреплении ДОО за территориями 2026',
                keywords: 'родительская плата закрепление территории детский сад доо 2026'
            },
            // Documents from roditelyam-pitanie.html
            {
                url: 'roditelyam-pitanie.html',
                title: 'Постановление № 246 от 13.02.2026 (питание)',
                keywords: 'питание школа постановление 246 горячее питание'
            },
            {
                url: 'roditelyam-pitanie.html',
                title: 'Постановление № 259 от 17.02.2026 (питание)',
                keywords: 'питание школа постановление 259 горячее питание'
            },
            {
                url: 'roditelyam-pitanie.html',
                title: 'Постановление № 298 от 20.02.2026 (питание)',
                keywords: 'питание школа постановление 298 горячее питание'
            },
            // Documents from roditelyam-zapis.html
            {
                url: 'roditelyam-zapis.html',
                title: 'Информация о приёме в 1 класс',
                keywords: 'приём запись первый класс школа документы заявление первоклассник'
            }
        ];

        var searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        // Create dropdown element
        var dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.style.display = 'none';
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(dropdown);

        // Search function
        function performSearch(query) {
            if (!query || query.length < 2) {
                dropdown.style.display = 'none';
                return;
            }

            query = query.toLowerCase().trim();
            var results = [];

            // Search through index
            searchIndex.forEach(function(page) {
                var titleMatch = page.title.toLowerCase().indexOf(query) !== -1;
                var keywordMatch = page.keywords.toLowerCase().indexOf(query) !== -1;

                if (titleMatch || keywordMatch) {
                    results.push({
                        url: page.url,
                        title: page.title,
                        score: titleMatch ? 2 : 1 // Title matches have higher priority
                    });
                }
            });

            // Sort by score (higher first)
            results.sort(function(a, b) {
                return b.score - a.score;
            });

            // Limit to 6 results
            results = results.slice(0, 6);

            displayResults(results, query);
        }

        // Display results
        function displayResults(results, query) {
            if (results.length === 0) {
                dropdown.innerHTML = '<div class="search-no-results">Ничего не найдено</div>';
                dropdown.style.display = 'block';
                return;
            }

            var html = '';
            results.forEach(function(result) {
                // Highlight matching text
                var highlightedTitle = result.title.replace(
                    new RegExp('(' + escapeRegex(query) + ')', 'gi'),
                    '<strong>$1</strong>'
                );
                html += '<a href="' + result.url + '" class="search-result-item">' + highlightedTitle + '</a>';
            });

            dropdown.innerHTML = html;
            dropdown.style.display = 'block';
        }

        // Escape regex special characters
        function escapeRegex(str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        // Event listeners
        searchInput.addEventListener('input', function() {
            performSearch(this.value);
        });

        searchInput.addEventListener('focus', function() {
            if (this.value.length >= 2) {
                performSearch(this.value);
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Handle keyboard navigation
        searchInput.addEventListener('keydown', function(e) {
            var items = dropdown.querySelectorAll('.search-result-item');
            if (items.length === 0) return;

            var activeIndex = -1;
            items.forEach(function(item, index) {
                if (item.classList.contains('active')) {
                    activeIndex = index;
                }
            });

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (activeIndex < items.length - 1) {
                    if (activeIndex >= 0) items[activeIndex].classList.remove('active');
                    items[activeIndex + 1].classList.add('active');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeIndex > 0) {
                    items[activeIndex].classList.remove('active');
                    items[activeIndex - 1].classList.add('active');
                }
            } else if (e.key === 'Enter') {
                if (activeIndex >= 0) {
                    e.preventDefault();
                    items[activeIndex].click();
                }
            } else if (e.key === 'Escape') {
                dropdown.style.display = 'none';
            }
        });
    })();

});
