/**
 * @author Aleksey Kuznetsov me@akuzn.com
 * @version 0.1.30
 * @url https://github.com/crusat/tempus-js
 * @description Library with date/time methods
 */
(function () {
    /**
     * TempusJS constructor.
     * @constructor
     * @namespace
     */
    var TempusJS = function () {
        // private
        var that = this;
        var version = '0.1.30';
        var locale = 'en_US';
        var weekStartsFromMonday = false;
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var locales = {
            "en_US": {
                "monthShortNames": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                "monthLongNames": ["January", "February", "March", "April", "May", "June", "July", "August",
                    "September", "October", "November", "December"],
                "daysShortNames": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                "daysLongNames": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            },
            "ru_RU": {
                "monthShortNames": ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
                "monthLongNames": ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август",
                    "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
                "daysShortNames": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
                "daysLongNames": ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
            }
        };
        var registeredFormats = {
            '%d': {
                format: function(date) {
                    return formattingWithNulls(date.day, 2);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {day: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{2}'
            },
            '%m': {
                format: function(date) {
                    return formattingWithNulls(date.month, 2);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {month: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{2}'
            },
            '%Y': {
                format: function(date) {
                    return formattingWithNulls(date.year, 4);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {year: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{4}'
            },
            '%w': {
                format: function(date) {
                    return that.getDayOfWeek(date);
                },
                parse: function(value) {
                    // impossible
                    return {};
                },
                parseLit: '\\d{1}'
            },
            '%a': {
                format: function(date) {
                    return locales[locale]["daysShortNames"][that.getDayOfWeek(date)];
                },
                parse: function(value) {
                    // impossible
                    return {};
                },
                parseLit: '\\w+'
            },
            '%A': {
                format: function(date) {
                    return locales[locale]["daysLongNames"][that.getDayOfWeek(date)];
                },
                parse: function(value) {
                    // impossible
                    return {};
                },
                parseLit: '\\w+'
            },
            '%b': {
                format: function(date) {
                    return locales[locale]["monthShortNames"][date.month-1];
                },
                parse: function(value) {
                    var month = that.getMonthNames().indexOf(value)+1;
                    return {month: month !== -1 ? month : undefined}
                },
                parseLit: '\\w+'
            },
            '%B': {
                format: function(date) {
                    return locales[locale]["monthLongNames"][date.month-1];
                },
                parse: function(value) {
                    var month = that.getMonthNames(true).indexOf(value)+1;
                    return {month: month !== -1 ? month : undefined}
                },
                parseLit: '\\w+'
            },
            '%H': {
                format: function(date) {
                    return formattingWithNulls(date.hours, 2);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {hours: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{2}'
            },
            '%M': {
                format: function(date) {
                    return formattingWithNulls(date.minutes, 2);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {minutes: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{2}'
            },
            '%S': {
                format: function(date) {
                    return formattingWithNulls(date.seconds, 2);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {seconds: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{2}'
            },
            '%s': {
                format: function(date) {
                    return that.time(date);
                },
                parse: function(value) {
                    var v = Number(value);
                    var date = new Date(Number(v*1000));
                    var obj = that.date(v);
                    return isNaN(v) ? {} : that.incDate(obj, date.getTimezoneOffset(), 'minutes');
                },
                parseLit: '\\d{1,10}'
            },
            '%F': {
                format: function(date) {
                    return formattingWithNulls(date.year, 4) + '-' + formattingWithNulls(date.month, 2) + '-' + formattingWithNulls(date.day, 2);
                },
                parse: function(value) {
                    var year = Number(value.slice(0,4));
                    var month = Number(value.slice(6,7));
                    var day = Number(value.slice(9,10));
                    return {
                        year: year,
                        month: month,
                        day: day
                    }
                },
                parseLit: '\\d{4}-\\d{2}-\\d{2}'
            },
            '%D': {
                format: function(date) {
                    return formattingWithNulls(date.month, 2) + '/' + formattingWithNulls(date.day, 2) + '/' + formattingWithNulls(date.year, 4)
                },
                parse: function(value) {
                    var month = Number(value.slice(0,2));
                    var day = Number(value.slice(3,5));
                    var year = Number(value.slice(6,10));
                    return {
                        year: year,
                        month: month,
                        day: day
                    }
                },
                parseLit: '\\d{2}\/\\d{2}\/\\d{4}'
            }
        };

        /**
         * Returns current timestamp (UTC) in seconds. If "date" parameter is not undefined, timestamp was received from this.
         * If date is object, {@link date} will apply for it.
         * @param date {object|string} Date as object (see {@link date}) or string (any formatted date, see examples)
         * @param format {string|undefined} Date format as string (see formats doc) or undefined for autodetect format.
         * @returns {number} UTC in seconds.
         * @example
         * // get current UTC
         * // returns 1384252977
         * tempus.time();
         * @example
         * // parse date and get UTC
         * // returns 1381795200
         * tempus.time('15.10.2013', '%d.%m.%Y');
         * @example
         * // returns 1381795200
         * tempus.time('15.10.2013');
         * @example
         * // returns 1383609600
         * tempus.time({year: 2013, month: 11, day: 5});
         * @example
         * // returns 1363046400
         * tempus.time('2013-03-12', '%Y-%m-%d');
         * @example
         * // returns 1363360860
         * tempus.time('2013-03-15 15:21', '%Y-%m-%d %H:%M');
         */
        this.time = function (date, format) {
            if (date !== undefined) {
                if (typeof date === 'string') {
                    date = this.parse(date, format);
                }
                return Math.floor((Date.UTC(
                        date.year !== undefined ? date.year : 1970,
                        date.month !== undefined ? date.month-1 : 0,
                        date.day !== undefined ? date.day : 1,
                        date.hours !== undefined ? date.hours : 0,
                        date.minutes !== undefined ? date.minutes : 0,
                        date.seconds !== undefined ? date.seconds : 0)) / 1000);
            } else {
                return Math.floor(new Date().getTime() / 1000);
            }
        };

        /**
         * Returns date object from timestamp (UTC). Or fix received object to default tempus date object.
         * @param date {number|object} Date as timestamp or object.
         * @param options {object|undefined} Options object.
         * @param options.week {bool} Add to response number of week. Default is false.
         * @param options.dayOfWeek {bool} Add to response day of week. Default is false.
         * @returns {object} date - Tempus date object.
         * @example
         * // returns {"year":2013,"month":11,"day":5,"hours":16,"minutes":1,"seconds":53}
         * tempus.date(1383667313);
         * @example
         * // returns {"year":2013,"month":11,"day":5,"hours":0,"minutes":0,"seconds":0}
         * tempus.date(1383609600);
         * @example
         * // returns {"year":1970,"month":1,"day":1,"hours":0,"minutes":0,"seconds":0}
         * tempus.date({});
         * @example
         * // returns {"year":2013,"month":10,"day":5,"hours":0,"minutes":0,"seconds":0}
         * tempus.date({year:2013, month:10, day:5});
         * @example
         * // returns {"year":2013,"month":10,"day":5,
         * //     "hours":0,"minutes":0,"seconds":0,"week":40,"dayOfWeek":6}
         * tempus.date({year:2013, month:10, day:5}, {week: true, dayOfWeek: true});
         */
        this.date = function(date, options) {
            var d;
            if (typeof date === "number") {
                var jsDate = new Date(date*1000);
                d = {
                    year: jsDate.getUTCFullYear(),
                    month: jsDate.getUTCMonth() + 1, // js default months beginning from 0.
                    day: jsDate.getUTCDate(),
                    hours: jsDate.getUTCHours(),
                    minutes: jsDate.getUTCMinutes(),
                    seconds: jsDate.getUTCSeconds()
                };
                if (options && options.week === true) {
                    d.week = that.getWeekNumber(d);
                }
                if (options && options.dayOfWeek === true) {
                    d.dayOfWeek = that.getDayOfWeek(d);
                }
            } else if (typeof date === "object") {
                d = {
                    year: date.year !== undefined ? date.year : 1970,
                    month: date.month !== undefined ? date.month : 1,
                    day: date.day !== undefined ? date.day : 1,
                    hours: date.hours !== undefined ? date.hours : 0,
                    minutes: date.minutes !== undefined ? date.minutes : 0,
                    seconds: date.seconds !== undefined ? date.seconds : 0
                };
                if (options && options.week === true) {
                    d.week = that.getWeekNumber(d);
                }
                if (options && options.dayOfWeek === true) {
                    d.dayOfWeek = that.getDayOfWeek(d);
                }
            } else {
                d = undefined;
            }
            return d;
        };

        /**
         * Returns a current date (in your time zone) as object or formatted string.
         * @param format {string|undefined} If format is undefined, returns is object. If not, formatted string - see {@link format}.
         * @returns {object|string} Tempus {@link date} object or formatted string.
         * @example
         * // returns {day: 21, dayOfWeek: 1, hours: 15, minutes: 10, month: 10, seconds: 3, timestamp: 1382353803, year: 2013};
         * tempus.now();
         * @example
         * // returns '21.10.2013'
         * tempus.now('%d.%m.%Y');
         */
        this.now = function (format) {
            var currentDate = new Date();
            var obj = {
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1, // js default months beginning from 0.
                day: currentDate.getDate(),
                dayOfWeek: currentDate.getDay(),
                hours: currentDate.getHours(),
                minutes: currentDate.getMinutes(),
                seconds: currentDate.getSeconds(),
                timestamp: Math.floor((currentDate.getTime() - currentDate.getTimezoneOffset() * 60000) / 1000)
            };
            return format === undefined ? obj : this.format(obj, format);
        };

        /**
         * If year is leap returns true.
         * @param year {number|undefined} A year for checking. If undefined - checking current year.
         * @returns {boolean} Results, leap year or not.
         * @example
         * // In 2013 returns false.
         * tempus.isLeapYear();
         * @example
         * // returns true
         * tempus.isLeapYear(2004);
         */
        this.isLeapYear = function (year) {
            year = year !== undefined ? Number(year) : this.now().year;
            if (year % 4 == 0) {
                if (year % 100 == 0) {
                    return year % 400 == 0;
                } else return true;
            }
            return false;
        };

        // get days count in month method
        // from 1 to 12
        /**
         * Returns days count in month.
         * @param month {number|string} If number (1..12) - month index, also you can send
         *     string - month name as (Jan..Dec), (January..December)
         *     or, for example, (Янв..Дек) if you change locale (see {@link setLocale}).
         * @param year {number|undefined} Year for checking. If it is undefined - leap year is false.
         * @returns {number|undefined} Returns days count or undefined if error occurred.
         * @example
         * // returns 30
         * tempus.getDaysCountInMonth(11, 2013);
         * @example
         * // returns 29
         * tempus.getDaysCountInMonth(2, 2012);
         * @example
         * // returns 28
         * tempus.getDaysCountInMonth(2);
         * @example
         * // returns 31
         * tempus.getDaysCountInMonth('Jan');
         * @example
         * // returns 30
         * tempus.getDaysCountInMonth('September');
         * @example
         * // returns 31
         * tempus.setLocale('ru_RU');
         * tempus.getDaysCountInMonth('Март');
         */
        this.getDaysCountInMonth = function (month, year) {
            var leapYear = year === undefined ? false : this.isLeapYear(year);
            if (typeof month === 'number') {
                if (month === 2) {
                    return daysInMonth[month - 1] + (leapYear ? 1 : 0);
                } else {
                    return daysInMonth[month - 1]
                }
            }
            if (typeof month === 'string') {
                var month_int = locales[locale]["monthShortNames"].indexOf(month);
                if (month_int === -1) {
                    month_int = locales[locale]["monthLongNames"].indexOf(month);
                }
                if (month_int === -1) {
                    return undefined;
                }
                month = month_int;
                if (month === 2) {
                    return daysInMonth[month] + (leapYear ? 1 : 0);
                } else {
                    return daysInMonth[month]
                }
            }
            return undefined;
        };

        /**
         * Returns array of month names. If longNames is undefined, short names was returned.
         * @param longNames {boolean} If true, long names was returning, else - short names.
         * @returns {Array} Array of month names.
         * @example
         * // returns ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
         * tempus.getMonthNames();
         * @example
         * // returns ["January","February","March","April","May","June",
         * //     "July","August","September","October","November","December"];
         * tempus.getMonthNames(true);
         * @example
         * // returns ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
         * tempus.setLocale('ru_RU');
         * tempus.getMonthNames();
         */
        this.getMonthNames = function (longNames) {
            if (longNames === true) {
                return locales[locale]["monthLongNames"];
            } else {
                return locales[locale]["monthShortNames"];
            }
        };

        /**
         * Returns array of day names. If longNames is undefined, short names was returned.
         * @param longNames {boolean} If true, long names was returning, else - short names.
         * @returns {Array} Array of day names.
         * @example
         * // returns ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
         * tempus.getDayNames();
         * @example
         * // returns ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
         * tempus.getDayNames(true);
         * @example
         * // returns ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
         * tempus.setLocale('ru_RU');
         * tempus.getDayNames();
         */
        this.getDayNames = function (longNames) {
            if (longNames === true) {
                return locales[locale]["daysLongNames"];
            } else {
                return locales[locale]["daysShortNames"];
            }
        };

        /**
         * Get day of week by Tomohiko Sakamoto's algorithm, 1993.
         * @param date {object} Tempus date object (see {@link date}).
         * @returns {number} Index day of week (0..6), 0 is Sunday.
         * @example
         * // returns 6
         * tempus.getDayOfWeek({year: 2013, month: 10, day: 5});
         * @example
         * // returns 0
         * tempus.getDayOfWeek({year: 2013, month: 10, day: 6});
         * @example
         * // returns 2
         * tempus.getDayOfWeek(tempus.now());
         */
        this.getDayOfWeek = function (date) {
            date = that.date(date);
            var year = date.year;
            var month = date.month;
            var day = date.day;
            var t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
            year -= month < 3;
            return Math.floor((year + year / 4 - year / 100 + year / 400 + t[month - 1] + day) % 7);
        };

        var calcDate = function(date, value, type, modif) {
            if (typeof date !== 'object') {
                return undefined;
            }

            var newDate = clone(date);

            if (typeof value === 'object') {
                newDate = that.date(newDate);
                return that.normalizeDate({
                    year: newDate.year + modif*(value.year !== undefined ? value.year : 0),
                    month: newDate.month + modif*(value.month !== undefined ? value.month : 0),
                    day: newDate.day + modif*(value.day !== undefined ? value.day : 0),
                    hours: newDate.hours + modif*(value.hours !== undefined ? value.hours : 0),
                    minutes: newDate.minutes + modif*(value.minutes !== undefined ? value.minutes : 0),
                    seconds: newDate.seconds + modif*(value.seconds !== undefined ? value.seconds : 0)
                });
            } else if (typeof value === 'number') {
                if (type === 'seconds') {
                    newDate.seconds += modif*Number(value);
                }
                if (type === 'minutes') {
                    newDate.minutes += modif*Number(value);
                }
                if (type === 'hours') {
                    newDate.hours += modif*Number(value);
                }
                if (type === 'day') {
                    newDate.day += modif*Number(value);
                }
                if (type === 'month') {
                    newDate.month += modif*Number(value);
                }
                if (type === 'year') {
                    newDate.year += modif*Number(value);
                }
                return that.normalizeDate(newDate);
            } else {
                return undefined;
            }
        };

        /**
         * Returns date object, increased on [value] [type].
         * @param date {object} Source date. Tempus date object (see {@link date}).
         * @param value {number|object} Any integer value or tempus date object (see {@link date}).
         * @param type {string} Value type. Can be 'seconds','minutes', 'hours', 'day', 'month', 'year'
         * @returns {object} Tempus date object.
         * @example
         * // returns {"year":2013,"month":10,"day":12,"hours":0,"minutes":0,"seconds":0}
         * tempus.incDate({year: 2013, month: 10, day: 5}, 7, 'day');
         * @example
         * // returns {"year":2014,"month":1,"day":13,"hours":0,"minutes":0,"seconds":0}
         * tempus.incDate({year: 2013, month: 10, day: 25}, 80, 'day');
         * @example
         * // returns {"year":2013,"month":12,"day":30,"hours":0,"minutes":0,"seconds":0}
         * tempus.incDate({year: 2013, month: 1, day: 30}, 11, 'month');
         * @example
         * // returns {"year":2015,"month":1,"day":1,"hours":0,"minutes":0,"seconds":0}
         * tempus.incDate({year: 2000, month: 1, day: 1}, 15, 'year');
         * @example
         * // returns {"year":2013,"month":6,"day":1,"hours":0,"minutes":0,"seconds":0}
         * tempus.incDate({year:2013, month: 1, day:1}, {month: 5});
         * @example
         * // returns {"year":2014,"month":4,"day":20,"hours":15,"minutes":10,"seconds":1}
         * tempus.incDate({year:2013, month: 3, day:10}, {year: 1, month: 1, day: 10,
         *     hours: 15, minutes: 10, seconds: 1});
         */
        this.incDate = function (date, value, type) {
            return calcDate(date, value, type, 1);
        };

        /**
         * Normalize date to valid.
         * @param date {object} Tempus date object (see {@link date}).
         * @returns {object} Tempus date object (see {@link date}).
         * @example
         * // returns {"day":1,"month":1,"year":2014,"hours":0,"minutes":0,"seconds":0}
         * tempus.normalizeDate({day:32,month:12,year:2013,hours:0,minutes:0,seconds:0});
         * @example
         * // returns {"day":15,"month":2,"year":2014,"hours":0,"minutes":0,"seconds":0}
         * tempus.normalizeDate({day:46,month:13,year:2013,hours:0,minutes:0,seconds:0});
         * @example
         * // returns {"day":3,"month":8,"year":2012,"hours":6,"minutes":59,"seconds":58}
         * tempus.normalizeDate({day:32,month:-5,year:2013,hours:55,minutes:0,seconds:-2});
         * @example
         * // returns {"day":19,"month":3,"year":2013,"hours":23,"minutes":0,"seconds":0}
         * tempus.normalizeDate({day:20,month:3,year:2013,hours:-1,minutes:0,seconds:0});
         */
        this.normalizeDate = function(date) {
            return clone(this.date(this.time(date)));
        };

        /**
         * Returns date object, decreased on [value] [type].
         * @param date {object} Source date. Tempus date object (see {@link date}).
         * @param value {number|object} Any integer value or tempus date object (see {@link date}).
         * @param type {string} Value type. Can be 'seconds','minutes', 'hours', 'day', 'month', 'year'
         * @returns {object} Tempus date object.
         * @example
         * // returns {"year":2013,"month":9,"day":28,"hours":0,"minutes":0,"seconds":0}
         * tempus.decDate({year: 2013, month: 10, day: 5}, 7, 'day');
         * @example
         * // returns {"year":2013,"month":8,"day":6,"hours":0,"minutes":0,"seconds":0}
         * tempus.decDate({year: 2013, month: 10, day: 25}, 80, 'day');
         * @example
         * // returns {"year":2012,"month":2,"day":30,"hours":0,"minutes":0,"seconds":0}
         * tempus.decDate({year: 2013, month: 1, day: 30}, 11, 'month');
         * @example
         * // returns {"year":1985,"month":1,"day":1,"hours":0,"minutes":0,"seconds":0}
         * tempus.decDate({year: 2000, month: 1, day: 1}, 15, 'year');
         * @example
         * // returns {"year":2012,"month":8,"day":1,"hours":0,"minutes":0,"seconds":0}
         * tempus.decDate({year:2013, month: 1, day:1}, {month: 5});
         * @example
         * // returns {"year":2012,"month":1,"day":30,"hours":8,"minutes":49,"seconds":59}
         * tempus.decDate({year:2013, month: 3, day:10}, {year: 1, month: 1, day: 10,
         *     hours: 15, minutes: 10, seconds: 1});
         */
        this.decDate = function (date, value, type) {
            return calcDate(date, value, type, -1);
        };

        /**
         * Returns integer of date between from [dateFrom] to [dateTo] as [type].
         * @param dateFrom {object} Tempus date object (see {@link date}).
         * @param dateTo {object} Tempus date object (see {@link date}).
         * @param type {string} Type. Can be 'seconds', 'minutes', 'hours', 'day', 'month', 'year'.
         * @returns {number|undefined} Value of [type] between dateFrom to dateTo.
         * @example
         * // returns 4
         * tempus.between({year: 2013, month: 11, day: 1}, {year: 2013, month: 11, day: 5}, 'day');
         * @example
         * // returns 6
         * tempus.between({year: 2013, month: 11, day: 1}, {year: 2014, month: 5, day: 5}, 'month');
         * @example
         * // returns 266400
         * tempus.between({year: 2013, month: 11, day: 1}, {year: 2014, month: 5, day: 5}, 'minutes');
         * @example
         * // returns 10224
         * tempus.between({year: 2013, month: 11, day: 1}, {year: 2015, month: 1, day: 1}, 'hours');
         * @example
         * // Happy New Year!
         * // returns 56
         * tempus.between(tempus.now(), {year: 2014, month: 1, day: 1}, 'day');
         * @example
         * // my current age
         * // returns 25
         * tempus.between({year: 1988, month: 3, day: 6}, tempus.now(), 'year');
         */
        this.between = function (dateFrom, dateTo, type) {
            var from = this.time(dateFrom);
            var to = this.time(dateTo);
            switch (type) {
                case 'year':
                    return Math.floor((to - from) / 31556952); // 365.2425 - average days in year. Here in seconds
                case 'month':
                    return Math.floor((to - from) / 2629746);
                case 'day':
                    return Math.floor((to - from) / 86400);
                case 'hours':
                    return Math.floor((to - from) / 3600);
                case 'minutes':
                    return Math.floor((to - from) / 60);
                case 'seconds':
                    return to - from;
                default:
                    return undefined;
            }
        };

        /**
         * Returns formatted string of date. You can use object or timestamp as parameter of method.
         * @param date {object|number} Tempus date object (see {@link date}) or timestamp.
         * @param format {string} Format of date. See index page for defaults.
         * @returns {string|undefined} Formatted string
         * @example
         * // returns '05.11.2013'
         * tempus.format({year: 2013, month: 11, day:5}, '%d.%m.%Y');
         * @example
         * // returns '2013-11-05 12:36:42'
         * tempus.format(tempus.now(), '%Y-%m-%d %H:%M:%S');
         * @example
         * // returns '20131105'
         * tempus.format(tempus.time(), '%Y%m%d');
         */
        this.format = function(date, format) {
            var result = format;
            var d;
            if ((typeof date === 'number')||(typeof date === 'object')) {
                d = this.date(date);
            } else {
                return undefined;
            }
            // formatting
            for (var key in registeredFormats) {
                if (registeredFormats.hasOwnProperty(key)) {
                    result = result.replace(key, registeredFormats[key].format(d));
                }
            }
            return result;
        };

        /**
         * Detecting format of date  as string.
         * @param str {string} Formatted date as string
         * @returns {string|undefined} Format of date or undefined if auto detect failed.
         * @example
         * // returns "%d.%m.%Y"
         * tempus.detectFormat('10.12.2013');
         * @example
         * // returns "%Y-%m-%d %H:%M"
         * tempus.detectFormat('2013-01-01 12:00');
         * @example
         * // returns "%d.%m.%Y"
         * tempus.detectFormat('01/02/2013');
         */
        this.detectFormat = function(str) {
            var defaultFormats = [
                '^%d\\.%m\\.%Y$', '^%Y-%m-%d$', '^%m/%d/%Y$', '^%Y-%m-%dT%H:%M:%S$',
                '^%d\\.%m\\.%Y %H:%M:%S$', '^%d\\.%m\\.%Y %H:%M$', '^%d\\.%m\\.%Y %H$',
                '^%Y-%m-%d %H:%M:%S$', '^%Y-%m-%d %H:%M$', '^%Y-%m-%d %H$',
                '^%m/%d/%Y %H:%M:%S$', '^%m/%d/%Y %H:%M$', '^%m/%d/%Y %H$',
                '^%Y$', '^%H:%M:%S$', '^%H:%M$'
            ];
            for (var i=0; i < defaultFormats.length; i++) {
                if (that.parse(str, defaultFormats[i]) !== undefined) {
                    return defaultFormats[i].slice(1,-1);
                }
            }
            return undefined;
        };

        /**
         * Returns date object from parsed string.
         * @param str {string} Formatted date string.
         * @param format {string|undefined} Format (see index page). If undefined, tempus will be auto detect format.
         * @returns {object|undefined} Tempus date object (see {@link date}).
         * @example
         * // returns {"day":21,"month":10,"year":2013,"hours":0,"minutes":0,"seconds":0}
         * tempus.parse('21.10.2013', '%d.%m.%Y');
         * @example
         * // returns {"day":5,"month":10,"year":2013,"hours":16,"minutes":20,"seconds":15}
         * tempus.parse('20131005162015', '%Y%m%d%H%M%S');
         * @example
         * // returns {"day":7,"month":5,"year":2012,"hours":0,"minutes":0,"seconds":0}
         * tempus.parse('2012-05-07', '%F');
         * @example
         * // returns {"day":1,"month":12,"year":2013,"hours":0,"minutes":0,"seconds":0}
         * tempus.parse('12/01/2013', '%D');
         * @example
         * // returns {"day":5,"month":12,"year":2010,"hours":0,"minutes":0,"seconds":0}
         * tempus.parse('05 Dec, 2010', '%d %b, %Y');
         * @example
         * // returns {"day":10,"month":10,"year":2010,"hours":0,"minutes":0,"seconds":0}
         * tempus.parse('10 October, 2010', '%d %B, %Y');
         * @example
         * // returns {"day":31,"month":12,"year":2012,"hours":0,"minutes":0,"seconds":0}
         * tempus.parse('31.12.2012');
         * @example
         * // returns {"year":2013,"month":3,"day":5,"hours":12,"minutes":31,"seconds":0}
         * tempus.parse('2013-03-05 12:31');
         */
        this.parse = function(str, format) {
            var key;
            var litsarr = [];
            if (format === undefined) {
                format = that.detectFormat(str);
            }
            format = '^'+format+'$';
            var format_re = format;
            for (key in registeredFormats) {
                if (registeredFormats.hasOwnProperty(key)) {
                    litsarr.push(key);
                    format_re = format_re.replace(new RegExp('('+key+')', 'g'), '('+registeredFormats[key].parseLit+')');
                }
            }
            var litsstr = new RegExp('('+litsarr.join('|')+')', 'g');
            var lits = format.match(litsstr);
            var re = new RegExp(format_re, 'g');
            var result = re.exec(str);
            var result2 = [];
            try {
                for (var i=1; i < result.length; i++) {
                    if (typeof result[i] === 'string') {
                        result2.push(result[i]);
                    }
                }
            } catch(e) {
                return undefined;
            }
            var resultdate = {};
            var tmpdate;
            for(key in lits) {
                if (lits.hasOwnProperty(key)&&(registeredFormats.hasOwnProperty(lits[key]))&&!isNaN(Number(key))) {
                    tmpdate = registeredFormats[lits[key]].parse(result2[key]);
                    resultdate = {
                        year: tmpdate.year != undefined ? tmpdate.year : resultdate.year,
                        month: tmpdate.month != undefined ? tmpdate.month : resultdate.month,
                        day: tmpdate.day != undefined ? tmpdate.day : resultdate.day,
                        hours: tmpdate.hours != undefined ? tmpdate.hours : resultdate.hours,
                        minutes: tmpdate.minutes != undefined ? tmpdate.minutes : resultdate.minutes,
                        seconds: tmpdate.seconds != undefined ? tmpdate.seconds : resultdate.seconds
                    };
                }
            }
            return this.date(resultdate);
        };

        /**
         * Just wrapper on setTimeout, this timeout in seconds (not a milliseconds).
         * @param callback {function} Callback.
         * @param timeout {number} Int or float number, timeout.
         * @returns {number} Default setTimeout identify.
         * @example
         * // Show message over 2 seconds.
         * var t = tempus.setTimeout(function() {
         *     alert("Hello over 2 seconds!");
         * }, 2);
         * @example
         * // Show message over 0.5 seconds.
         * var t = tempus.setTimeout(function() {
         *     alert("Hello over 0.5 seconds!");
         * }, 0.5);
         */
        this.setTimeout = function(callback, timeout) {
            return setTimeout(callback, Number(timeout)*1000);
        };

        /**
         * Just wrapper on setInterval, this timeout in seconds (not a milliseconds).
         * @param callback {function} Callback.
         * @param timeout {number} Int or float number, timeout.
         * @returns {number} Default setInterval identify.
         * @example
         * //  "Hello again!" 3x times every 2 seconds;
         * var x = 3;
         * var t = tempus.setInterval(function() {
         *     x--;
         *     if (x === 0) {
         *         clearInterval(t);
         *     };
         *     alert("Hello again!");
         * }, 2);
         */
        this.setInterval = function(callback, timeout) {
            return setInterval(callback, Number(timeout)*1000);
        };

        /**
         * Clock. Every second callback is calling with parameter "date".
         * "date" - is current date object. Also run callback immediately after starting.
         * @param callback {function} Callback.
         * @returns {number} Default setInterval identify.
         * @example
         * // Clock example
         * &lt;div id="tempus-clock-example"&gt;&lt;/div&gt;
         * &lt;script&gt;
         * var clock = tempus.clock(function(date) {
         *     document.getElementById('tempus-clock-example').innerHTML = tempus.format(date, "%H:%M:%S");
         * });
         * &lt;/script&gt;
         */
        this.clock = function(callback) {
            callback(that.now());
            return this.setInterval(function() {
                callback(that.now());
            }, 1);
        };

        /**
         * Alarms at [date]. After alarming self-destructs.
         * @param date {object} Tempus date object (see {@link date}).
         * @param callback {function} Callback.
         * @returns {number} Default setInterval identify.
         * @example
         * // Over 20 seconds show message "Alarmed at ..."
         * var alarmAt = tempus.incDate(tempus.now(), 20, 'seconds');
         * document.getElementById('tempus-alarm-example').innerHTML = tempus.format(alarmAt, '%H:%M:%S %d.%m.%Y');
         * var a = tempus.alarm(alarmAt, function(date) {
         *     alert('Alarmed at '+tempus.format(date, '%H:%M:%S %d.%m.%Y'));
         * });
         */
        this.alarm = function(date, callback) {
            var a = this.setInterval(function() {
                if (that.between(that.now(), date, 'seconds') === 0) {
                    callback(date);
                    clearInterval(a);
                }
            }, 1);
            return a;
        };

        /**
         * Validates date.
         * @param date {object|string} Tempus date object (see {@link date}) or formatted date string.
         * @param format {string|undefined} Format (see index page). If undefined, tempus will be auto detect format.
         * @returns {boolean} Valid or not valid.
         * @example
         * // returns false
         * tempus.validate({day:32,month:12,year:2013,hours:0,minutes:0,seconds:0});
         * @example
         * // returns false
         * tempus.validate({day:20,month:3,year:2013,hours:-1,minutes:0,seconds:0});
         * @example
         * // returns true
         * tempus.validate({day:1,month:1,year:2013,hours:0,minutes:0,seconds:0});
         * @example
         * // returns true
         * tempus.validate('2013-03-12', '%Y-%m-%d');
         * @example
         * // returns true
         * tempus.validate('16:00 08.08.2013', '%H:%M %d.%m.%Y');
         * @example
         * // returns false
         * tempus.validate('32.08.2013', '%d.%m.%Y');
         * @example
         * // returns false
         * tempus.validate('29.02.2013', '%d.%m.%Y');
         * @example
         * // returns true
         * tempus.validate('29.02.2012', '%d.%m.%Y');
         * @example
         * // returns false
         * tempus.validate('24:61 29.02.2012', '%H:%M %d.%m.%Y');
         * @example
         * // returns true
         * tempus.validate('00:00 01.01.2012', '%H:%M %d.%m.%Y');
         * @example
         * // returns false
         * tempus.validate('29.02.2012 24:00');
         * @example
         * // returns true
         * tempus.validate('29.02.2012 23:00');
         * @example
         * // returns false
         * tempus.validate('29.02.2013 23:00');
         */
        this.validate = function(date, format) {
            if (typeof date === 'string') {
                date = this.parse(date, format);
            }
            var normalizedDate = this.normalizeDate(date);
            return (date.year === normalizedDate.year)&&(date.month === normalizedDate.month)&&(date.day === normalizedDate.day)&&
                    (date.hours === normalizedDate.hours)&&(date.minutes === normalizedDate.minutes)&&(date.seconds === normalizedDate.seconds);
        };

        /**
         * Reformats date from one to other format.
         * @param date {string} Formatted date string.
         * @param formatFrom {string|undefined} Format (see index page). If undefined, tempus will be auto detect format.
         * @param formatTo {string} Format of date. See index page for defaults.
         * @returns {string|undefined} Returns a reformatted date string.
         * @example
         * // returns "12.03.2013"
         * tempus.reformat('2013-03-12', '%Y-%m-%d', '%d.%m.%Y');
         * @example
         * // returns "15.03.2013"
         * tempus.reformat('2013-03-15 16:00', '%Y-%m-%d %H:%M', '%d.%m.%Y');
         * @example
         * // returns "12:31 (Fri 15, 2013)"
         * tempus.reformat('2013-03-15T12:31:48', '%Y-%m-%dT%H:%M:%S', '%H:%M (%a %d, %Y)');
         * @example
         * // returns "2012-05-15"
         * tempus.reformat('15.05.2012', undefined, '%Y-%m-%d');
         */
        this.reformat = function(date, formatFrom, formatTo) {
            return this.format(this.parse(date, formatFrom), formatTo);
        };

        /**
         * Settings up locale. With this %a, %A, %b, %B was returning strings on needed languages. Default is "en_US".
         * For list locales see {@link getAvailableLocales}.
         * @param loc {string|undefined} Need locale. If undefined, "en_US" will be select.
         * @returns {undefined}
         * @example
         * // returns "2013, Ноябрь, 06, Среда"
         * tempus.setLocale("ru_RU");
         * tempus.now('%Y, %B, %d, %A');
         */
        this.setLocale = function(loc) {
            locale = loc || "en_US";
        };

        /**
         * Gets current value of locale.
         * @returns {string} Current locale.
         * @example
         * // returns "en_US"
         * tempus.getLocale();
         */
        this.getLocale = function() {
            return locale;
        };

        this.setWeekStartsFromMonday = function(v) {
            weekStartsFromMonday = v ? true : false;
            return weekStartsFromMonday;
        };
        this.getWeekStartsFromMonday = function() {
            return weekStartsFromMonday;
        };

        /**
         * Get available locales list.
         * @returns {Array} Array of available locales.
         * @example
         * // returns ["en_US", "ru_RU"]
         * tempus.getAvailableLocales();
         */
        this.getAvailableLocales = function() {
            return Object.keys(locales);
        };

        /**
         * Get current version of TempusJS.
         * @returns {string} Current version of TempusJS.
         * @example
         * // returns current version
         * tempus.getVersion();
         */
        this.getVersion = function() {
            return version;
        };

        /*
         * options.dateFrom - string or object
         * options.formatFrom - string|undefined
         * options.dateTo - string or object
         * options.formatTo - string|undefined
         * options.period - number (seconds)|string (seconds, minutes, hours, day, month, year)
         * options.format - results format, string
         * options.asObject - results is object
         * options.groupBy - group by someone
         */

        this.generateDates = function(options) {
            var tsFrom = options.dateFrom, tsTo = options.dateTo, period, result;
            // timestamp "from"
            if (typeof options.dateFrom === 'string') {
                tsFrom = that.parse(options.dateFrom, options.formatFrom);
            }
            tsFrom = that.time(tsFrom);
            // timestamp "to"
            if (typeof options.dateTo === 'string') {
                tsTo = that.parse(options.dateTo, options.formatTo);
            }
            tsTo = that.time(tsTo);
            // period
            if (typeof options.period === 'number') {
                period = {
                    year: 0,
                    month: 0,
                    day: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: options.period
                }
            } else if (typeof options.period === 'string') {
                period = {
                    year: options.period === 'year' ? 1 : 0,
                    month: options.period === 'month' ? 1 : 0,
                    day: options.period === 'day' ? 1 : 0,
                    hours: options.period === 'hours' ? 1 : 0,
                    minutes: options.period === 'minutes' ? 1 : 0,
                    seconds: options.period === 'seconds' ? 1 : 0
                }
            } else if (typeof options.period === 'object') {
                period = {
                    year: options.period.year !== undefined ? options.period.year : 0,
                    month: options.period.month !== undefined ? options.period.month : 0,
                    day: options.period.day !== undefined ? options.period.day : 0,
                    hours: options.period.hours !== undefined ? options.period.hours : 0,
                    minutes: options.period.minutes !== undefined ? options.period.minutes : 0,
                    seconds: options.period.seconds !== undefined ? options.period.seconds : 0
                }
            }

            // result
            if (options.groupBy === undefined) {
                result = options.asObject === true ? {} : [];
            } else {
                result = [];
                result.push([]);
                var prevValue = that.date(tsFrom, {week:true})[options.groupBy];
            }
            var addTo = function(array, value) {
                if (options.asObject === true) {
                    if (options.format !== undefined) {
                        array[that.format(value, options.format)] = {};
                    } else {
                        array[that.format(value, '%F %H:%M:%S')] = {};
                    }
                } else {
                    if (options.format !== undefined) {
                        array.push(that.format(value, options.format));
                    } else {
                        array.push(value);
                    }
                }
                return array;
            };

            for (; tsFrom <= tsTo; tsFrom = this.time(that.incDate(that.date(tsFrom), period))) {
                if (options.groupBy === undefined) {
                    addTo(result, tsFrom);
                } else {
                    if (that.date(tsFrom, {week:true})[options.groupBy] === prevValue) {
                        addTo(result[result.length-1], tsFrom);
                    } else {
                        result.push([]);
                        addTo(result[result.length-1], tsFrom);
                        prevValue = that.date(tsFrom, {week:true})[options.groupBy];
                    }
                }
            }
            return result;
        };

        this.registerFormat = function(value, formatFunc, parseFunc, parseLit) {
            registeredFormats[value] = {
                format: formatFunc,
                parse: parseFunc,
                parseLit: parseLit
            }
        };
        this.unregisterFormat = function(value) {
            delete registeredFormats[value];
        };

        this.getWeekNumber = function(date) {
            var weekNumber;
            var start;
            var currentDay = this.time(date);
            start = that.time({year: date.year});
            start -= that.getDayOfWeek(start)*86400;
            weekNumber = Math.floor((((currentDay - start)/86400 + (weekStartsFromMonday !== true ? 1 : 0))) / 7) + 1;
            return weekNumber;
        };

        // *** HELPERS ***
        var formattingWithNulls = function(val, symb_count) {
            var v = val.toString();
            while (v.length < symb_count) {
                v = '0' + v;
            }
            return v;
        };
        var clone = function(obj){
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        };
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(obj, start) {
                for (var i = (start || 0), j = this.length; i < j; i++) {
                    if (this[i] === obj) { return i; }
                }
                return -1;
            }
        }
    };

    window.tempus = new TempusJS();
})();
