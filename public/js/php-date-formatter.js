/*!
 * @copyright Copyright &copy; Kartik Visweswaran, Krajee.com, 2014
 * @version 1.3.0
 *
 * Date formatter utility library, that allows you to format date and 
 * time variables or Date objects using PHP DateTime format.
 * @see http://php.net/manual/en/function.date.php
 * 
 * Authors:
 *      [Kartik Visweswaran](https://github.com/kartik-v)
 *      [Enrica R](https://github.com/Erik-r)
 *
 * For more JQuery plugins visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */
var defaultConfig = {
    dateSettings: {
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        months: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        meridiem: ['AM', 'PM']
    },
    separators: /[ \-+\/\.T:@]/g,
    validParts: /[djDlwSFmMnyYaAgGhHisU]/g
};

var DateFormatter = function (options) {
    var config = $.extend(true, defaultConfig, options);
    this.dateSettings = config.dateSettings;
    this.separators = config.separators;
    this.validParts = config.validParts;
};

DateFormatter.prototype = {
    constructor: DateFormatter,
    parseDate: function (vDate, vFormat) {
        if (!vDate) {
            return undefined;
        }
        if (vDate instanceof Date) {
            return vDate;
        }
        if (typeof vDate == 'number') {
            return new Date(vDate);
        }
        var self = this,
            parsedDateTime = {
                date: null,
                year: null,
                month: null,
                day: null,
                dayOfWeek: null,
                hour: 0,
                min: 0,
                sec: 0
            };

        if (vDate instanceof Date) {
            return vDate;
        } else if (typeof vDate == 'string') {
            var vFormatParts = vFormat.match(self.validParts);
            if (!vFormatParts || vFormatParts.length === 0) {
                throw new Error("Invalid date format definition.");
            }
            var vDateParts = vDate.replace(self.separators, '\0').split('\0');
            var i, vDateFlag = false , vTimeFlag = false;
            for (i = 0; i < vDateParts.length; i++) {
                switch (vFormatParts[i]) {
                    case 'y':
                    case 'Y':
                        if (vDateParts[i].length == 2) {
                            parsedDateTime.year = parseInt(((parseInt(vDateParts[i]) < 70) ? '20' : '19') + vDateParts[i]);
                        } else if (vDateParts[i].length == 4) {
                            parsedDateTime.year = parseInt(vDateParts[i]);
                        }
                        vDateFlag = true;
                        break;
                    case 'm':
                    case 'n':
                    case 'M':
                    case 'F':
                        var vMonth;
                        if (isNaN(vDateParts[i])) {
                            vMonth = self.dateSettings.monthsShort.indexOf(vDateParts[i]);
                            if (vMonth > -1) {
                                parsedDateTime.month = vMonth + 1;
                            }
                            vMonth = self.dateSettings.months.indexOf(vDateParts[i]);
                            if (vMonth > -1) {
                                parsedDateTime.month = vMonth + 1;
                            }
                        } else {
                            if (parseInt(vDateParts[i]) >= 1 && parseInt(vDateParts[i]) <= 12) {
                                parsedDateTime.month = parseInt(vDateParts[i]);
                            }
                        }
                        vDateFlag = true;
                        break;
                    case 'd':
                    case 'j':
                        if (parseInt(vDateParts[i]) >= 1 && parseInt(vDateParts[i]) <= 31) {
                            parsedDateTime.day = parseInt(vDateParts[i]);
                        }
                        vDateFlag = true;
                        break;
                    case 'g':
                    case 'h':
                        var vMeriIndex = (vFormatParts.indexOf('a') > -1) ? vFormatParts.indexOf('a') :
                            (vFormatParts.indexOf('A') > -1) ? vFormatParts.indexOf('A') : -1;

                        if (vMeriIndex > -1) {
                            var vMeriOffset = (vDateParts[vMeriIndex].toLowerCase == self.dateSettings.meridiem[0].toLowerCase) ? 0 :
                                (vDateParts[vMeriIndex].toLowerCase == self.dateSettings.meridiem[1].toLowerCase) ? 12 : -1;

                            if (parseInt(vDateParts[i]) >= 1 && parseInt(vDateParts[i]) <= 12 && vMeriOffset > -1) {
                                parsedDateTime.hour = parseInt(vDateParts[i]) + vMeriOffset - 1;
                            } else if (parseInt(vDateParts[i]) >= 0 && parseInt(vDateParts[i]) <= 23) {
                                parsedDateTime.hour = parseInt(vDateParts[i]);
                            }
                        } else if (parseInt(vDateParts[i]) >= 0 && parseInt(vDateParts[i]) <= 23) {
                            parsedDateTime.hour = parseInt(vDateParts[i]);
                        }
                        vTimeFlag = true;
                        break;
                    case 'G':
                    case 'H':
                        if (parseInt(vDateParts[i]) >= 0 && parseInt(vDateParts[i]) <= 23) {
                            parsedDateTime.hour = parseInt(vDateParts[i]);
                        }
                        vTimeFlag = true;
                        break;
                    case 'i':
                        if (parseInt(vDateParts[i]) >= 0 && parseInt(vDateParts[i]) <= 59) {
                            parsedDateTime.min = parseInt(vDateParts[i]);
                        }
                        vTimeFlag = true;
                        break;
                    case 's':
                        if (parseInt(vDateParts[i]) >= 0 && parseInt(vDateParts[i]) <= 59) {
                            parsedDateTime.sec = parseInt(vDateParts[i]);
                        }
                        vTimeFlag = true;
                }
            }
            if (vDateFlag === true && parsedDateTime.year && parsedDateTime.month && parsedDateTime.day) {
                parsedDateTime.date = new Date(parsedDateTime.year, parsedDateTime.month - 1, parsedDateTime.day, parsedDateTime.hour, parsedDateTime.min, parsedDateTime.sec, 0);
                // parsedDateTime.dayOfWeek = parsedDateTime.date.getDay();
                return parsedDateTime.date;
            } else if (vTimeFlag === true) {
                parsedDateTime.date = new Date(0, 0, 0, parsedDateTime.hour, parsedDateTime.min, parsedDateTime.sec, 0);
                return parsedDateTime.date;
            } else {
                return false;
            }
        }
    },
    guessDate: function (vDateStr, vFormat) {
        var self = this;
        if (typeof vDateStr != 'string') {
            return vDateStr;
        }

        var vParts = vDateStr.replace(self.separators, '\0').split('\0'),
            vFormatParts = vFormat.match(self.validParts),
            vPattern = /^[djmn]/g;

        if (vPattern.test(vFormatParts[0])) {

            var vDate = new Date(),
                vDigit = 0, i;

            for (i = 0; i < vParts.length; i++) {
                vDigit = 2;
                switch (i) {
                    case 0:
                        if (vFormatParts[0] == 'm' || vFormatParts[0] == 'n') {
                            vDate.setMonth(parseInt(vParts[i].substr(0, 2)) - 1);
                        } else {
                            vDate.setDate(parseInt(vParts[i].substr(0, 2)));
                        }
                        break;
                    case 1:
                        if (vFormatParts[0] == 'm' || vFormatParts[0] == 'n') {
                            vDate.setDate(parseInt(vParts[i].substr(0, 2)));

                        } else {
                            vDate.setMonth(parseInt(vParts[i].substr(0, 2)) - 1);
                        }
                        break;
                    case 2:
                        var year = vDate.getFullYear();

                        if (vParts[i].length < 4) {
                            vDate.setFullYear(parseInt(year.toString().substr(0, 4 - vParts[i].length) + vParts[i]));
                            vDigit = vParts[i].length;
                        } else {
                            vDate.setFullYear = parseInt(vParts[i].substr(0, 4));
                            vDigit = 4;
                        }
                        break;
                    case 3:
                        vDate.setHours(parseInt(vParts[i].substr(0, 2)));
                        break;
                    case 4:
                        vDate.setMinutes(parseInt(vParts[i].substr(0, 2)));
                        break;
                    case 5:
                        vDate.setSeconds(parseInt(vParts[i].substr(0, 2)));
                }
                if (vParts[i].substr(vDigit).length > 0) {
                    vParts.splice(i + 1, 0, vParts[i].substr(vDigit));
                }
            }
            return vDate;
        }
    },
    formatDate: function (vDate, vFormat) {
        var self = this;
        if (typeof vDate == 'string') {
            vDate = self.parseDate(vDate, vFormat);
            if (vDate == false) {
                return false;
            }
        }
        if (vDate instanceof Date) {
            var i, vChar, vDateStr = '', self = this;
            var validParts = /[djDlwSFmMnyYaAgGhHisU]/;
            for (i = 0; i < vFormat.length; i++) {
                vChar = vFormat.charAt(i);
                if (validParts.test(vChar) == true) {
                    switch (vChar) {
                        case 'j':
                            vDateStr += vDate.getDate();
                            break;
                        case 'd':
                            vDateStr += ((vDate.getDate() <= 9) ? '0' : '') + vDate.getDate();
                            break;
                        case 'D':
                            vDateStr += self.dateSettings.daysShort[vDate.getDay()];
                            break;
                        case 'l':
                            vDateStr += self.dateSettings.days[vDate.getDay()];
                            break;
                        case 'w':
                            vDateStr += vDate.getDay();
                            break;
                        case 'S':
                            var vDay = vDate.getDay();
                            if (vDay == 1 || vDay == 21 || vDay == 31) {
                                vDateStr += 'st';
                            } else if (vDay == 2 || vDay == 22) {
                                vDateStr += 'nd';
                            } else if (vDay == 3 || vDay == 23) {
                                vDateStr += 'rd';
                            } else {
                                vDateStr += 'th';
                            }
                            break;
                        case 'n':
                            vDateStr += vDate.getMonth() + 1;
                            break;
                        case 'm':
                            vDateStr += ((vDate.getMonth() <= 8) ? '0' : '') + (vDate.getMonth() + 1);
                            break;
                        case 'F':
                            vDateStr += self.dateSettings.months[vDate.getMonth()];
                            break;
                        case 'M':
                            vDateStr += self.dateSettings.monthsShort[vDate.getMonth()];
                            break;
                        case 'Y':
                            vDateStr += vDate.getFullYear();
                            break;
                        case 'y':
                            vDateStr += vDate.getFullYear().toString().substr(2);
                            break;
                        case 'g':
                            vDateStr += (vDate.getHours() % 12) + 1;
                            break;
                        case 'G':
                            vDateStr += vDate.getHours();
                            break;
                        case 'h':
                            vDateStr += ((vDate.getHours() % 12 <= 8) ? '0' : '') + ((vDate.getHours() % 12) + 1);
                            break;
                        case 'H':
                            vDateStr += ((vDate.getHours() <= 9) ? '0' : '') + vDate.getHours();
                            break;
                        case 'a':
                        case 'A':
                            vDateStr += (vDate.getHours <= 12) ? self.dateSettings.meridiem[0] : self.dateSettings.meridiem[1];
                            break;
                        case 'i':
                            vDateStr += ((vDate.getMinutes() <= 9) ? '0' : '') + vDate.getMinutes();
                            break;
                        case 's':
                            vDateStr += ((vDate.getSeconds() <= 9) ? '0' : '') + vDate.getSeconds();
                            break;
                        case 'U':
                            vDateStr += Math.round((vDate.getTime() / 1000));
                            break;
                    }

                } else {
                    vDateStr += vChar;
                }
            }
            return vDateStr;
        }
    }
};
