/*!
 * Laravel Javascript Validation
 *
 * https://github.com/proengsoft/laravel-jsvalidation
 *
 * Copyright (c) 2014 Proengsoft
 * Released under the MIT license
 */

(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define( ["jquery", "./jquery.validate.min"], factory );
    } else {
        factory( jQuery );
    }
}(function( $ ) {


(function() {

    var helpers, methods;

    helpers = {

        /**
         * Gets the file information from file input
         * @param fieldObj
         * @returns {{file: *, extension: string, size: number}}
         */
        fileinfo: function (fieldObj) {
            var FileName = fieldObj.value;
            return {
                file: FileName,
                extension: FileName.substr(FileName.lastIndexOf('.') + 1),
                size: fieldObj.files[0].size / 1024
            };
        },

        /**
         * Gets the selectors for th specified field names
         * @param names
         * @returns {string}
         */
        selector: function (names) {
            var selector = [];
            if (!$.isArray(names)) names=[names];
            for (var i=0; i< names.length; i++) {
                selector.push("[name='"+names[i]+"']");
            }
            return selector.join();
        },

        /**
         * Gets the specified form element
         * @param element
         * @param name
         * @returns {*}
         */
        getElement: function getElement(element, name) {
            var $form =  $(element).closest('form');
            var elementCache= {};
            var $el = $form
                .find(helpers.selector(name))
                // .find( "input"+selectorName+", select"+selectorName+", textarea"+selectorName )
                .not( ":submit, :reset, :image, [readonly]" )
                .filter( function() {
                    // select only the first element for each name
                    if ( this.name in elementCache ) {
                        return false;
                    }
                    elementCache[ this.name ] = true;
                    return true;
                });
            // / If check element not found, return false
            if ($el=='' || $el == 'undefined' || $el.length==0) {
                return false;
            }
            return $el;
        },

        /**
         * Check if element has numeric rules
         * @param element
         * @returns {boolean}
         */
        hasNumericRules: function (element){
            var numericRules = ['laravelNumeric', 'laravelInteger'];
            var found = false;
            var validator = $.data( element.form, "validator" );
            var objRules =validator.settings.rules[element.name];
            for (var i=0; i< numericRules.length; i++) {
                found = found || numericRules[i] in objRules;
            }
            return found;
        },

        strlen: function strlen(string) {
            //  discuss at: http://phpjs.org/functions/strlen/
            // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: Sakimori
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            //    input by: Kirk Strobeck
            // bugfixed by: Onno Marsman
            //  revised by: Brett Zamir (http://brett-zamir.me)
            //        note: May look like overkill, but in order to be truly faithful to handling all Unicode
            //        note: characters and to this function in PHP which does not count the number of bytes
            //        note: but counts the number of characters, something like this is really necessary.
            //   example 1: strlen('Kevin van Zonneveld');
            //   returns 1: 19
            //   example 2: ini_set('unicode.semantics', 'on');
            //   example 2: strlen('A\ud87e\udc04Z');
            //   returns 2: 3

            var str = string + '';
            var i = 0,
                chr = '',
                lgth = 0;

            if (!this.php_js || !this.php_js.ini || !this.php_js.ini['unicode.semantics'] || this.php_js.ini[
                    'unicode.semantics'].local_value.toLowerCase() !== 'on') {
                return string.length;
            }

            var getWholeChar = function(str, i) {
                var code = str.charCodeAt(i);
                var next = '',
                    prev = '';
                if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
                    if (str.length <= (i + 1)) {
                        throw 'High surrogate without following low surrogate';
                    }
                    next = str.charCodeAt(i + 1);
                    if (0xDC00 > next || next > 0xDFFF) {
                        throw 'High surrogate without following low surrogate';
                    }
                    return str.charAt(i) + str.charAt(i + 1);
                } else if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
                    if (i === 0) {
                        throw 'Low surrogate without preceding high surrogate';
                    }
                    prev = str.charCodeAt(i - 1);
                    if (0xD800 > prev || prev > 0xDBFF) { //(could change last hex to 0xDB7F to treat high private surrogates as single characters)
                        throw 'Low surrogate without preceding high surrogate';
                    }
                    return false; // We can pass over low surrogates now as the second component in a pair which we have already processed
                }
                return str.charAt(i);
            };

            for (i = 0, lgth = 0; i < str.length; i++) {
                if ((chr = getWholeChar(str, i)) === false) {
                    continue;
                } // Adapt this line at the top of any loop, passing in the whole string and the current iteration and returning a variable to represent the individual character; purpose is to treat the first part of a surrogate pair as the whole character and then ignore the second part
                lgth++;
            }
            return lgth;
        },

        /**
         * Get the size of the object depending of his type
         * @param obj
         * @param element
         * @param value
         * @returns int
         */
        getSize: function getSize(obj, element, value ) {
            if (helpers.hasNumericRules(element) && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value )) {
                return value;
            } else if ($.isArray(value)) {
                return value.length;
            } else if (element.type == 'file') {
                return helpers.fileinfo(element).size;
            }
            return helpers.strlen(value);
        },

        /**
         * Return he timestamp of value passed using format or default format in element*
         * @param value
         * @param format
         * @returns {boolean|int}
         */
        time: function (value, format) {
            var timeValue = false;
            var fmt = new DateFormatter();
            if ($.type(format) == 'object') {
                if ('laravelDateFormat' in $.validator.staticRules(format)) {
                    format=$.validator.staticRules(format).laravelDateFormat[0];
                } else {
                    format=null;
                }
            }
            if (format==null) {
                timeValue = helpers.strtotime(value);
            } else {
                timeValue=fmt.parseDate(value,format);
                if (timeValue!=false) {
                    timeValue=parseInt(fmt.formatDate(timeValue,'U'));
                }
            }
            return timeValue;
        },

        /**
         * Returns Unix timestamp basent on PHP function strototime
         * @param text
         * @param now
         * @returns {*}
         */
        strtotime: function (text, now) {
            //  discuss at: http://phpjs.org/functions/strtotime/
            //     version: 1109.2016
            // original by: Caio Ariede (http://caioariede.com)
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: Caio Ariede (http://caioariede.com)
            // improved by: A. Matías Quezada (http://amatiasq.com)
            // improved by: preuter
            // improved by: Brett Zamir (http://brett-zamir.me)
            // improved by: Mirko Faber
            //    input by: David
            // bugfixed by: Wagner B. Soares
            // bugfixed by: Artur Tchernychev
            //        note: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
            //   example 1: strtotime('+1 day', 1129633200);
            //   returns 1: 1129719600
            //   example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
            //   returns 2: 1130425202
            //   example 3: strtotime('last month', 1129633200);
            //   returns 3: 1127041200
            //   example 4: strtotime('2009-05-04 08:30:00 GMT');
            //   returns 4: 1241425800

            var parsed, match, today, year, date, days, ranges, len, times, regex, i, fail = false;

            if (!text) {
                return fail;
            }

            // Unecessary spaces
            text = text.replace(/^\s+|\s+$/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/[\t\r\n]/g, '')
                .toLowerCase();

            // in contrast to php, js Date.parse function interprets:
            // dates given as yyyy-mm-dd as in timezone: UTC,
            // dates with "." or "-" as MDY instead of DMY
            // dates with two-digit years differently
            // etc...etc...
            // ...therefore we manually parse lots of common date formats
            match = text.match(
                /^(\d{1,4})([\-\.\/\:])(\d{1,2})([\-\.\/\:])(\d{1,4})(?:\s(\d{1,2}):(\d{2})?:?(\d{2})?)?(?:\s([A-Z]+)?)?$/);

            if (match && match[2] === match[4]) {
                if (match[1] > 1901) {
                    switch (match[2]) {
                        case '-':
                        { // YYYY-M-D
                            if (match[3] > 12 || match[5] > 31) {
                                return fail;
                            }

                            return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
                                    match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
                        }
                        case '.':
                        { // YYYY.M.D is not parsed by strtotime()
                            return fail;
                        }
                        case '/':
                        { // YYYY/M/D
                            if (match[3] > 12 || match[5] > 31) {
                                return fail;
                            }

                            return new Date(match[1], parseInt(match[3], 10) - 1, match[5],
                                    match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
                        }
                    }
                } else if (match[5] > 1901) {
                    switch (match[2]) {
                        case '-':
                        { // D-M-YYYY
                            if (match[3] > 12 || match[1] > 31) {
                                return fail;
                            }

                            return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                                    match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
                        }
                        case '.':
                        { // D.M.YYYY
                            if (match[3] > 12 || match[1] > 31) {
                                return fail;
                            }

                            return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                                    match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
                        }
                        case '/':
                        { // M/D/YYYY
                            if (match[1] > 12 || match[3] > 31) {
                                return fail;
                            }

                            return new Date(match[5], parseInt(match[1], 10) - 1, match[3],
                                    match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
                        }
                    }
                } else {
                    switch (match[2]) {
                        case '-':
                        { // YY-M-D
                            if (match[3] > 12 || match[5] > 31 || (match[1] < 70 && match[1] > 38)) {
                                return fail;
                            }

                            year = match[1] >= 0 && match[1] <= 38 ? +match[1] + 2000 : match[1];
                            return new Date(year, parseInt(match[3], 10) - 1, match[5],
                                    match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
                        }
                        case '.':
                        { // D.M.YY or H.MM.SS
                            if (match[5] >= 70) { // D.M.YY
                                if (match[3] > 12 || match[1] > 31) {
                                    return fail;
                                }

                                return new Date(match[5], parseInt(match[3], 10) - 1, match[1],
                                        match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
                            }
                            if (match[5] < 60 && !match[6]) { // H.MM.SS
                                if (match[1] > 23 || match[3] > 59) {
                                    return fail;
                                }

                                today = new Date();
                                return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                                        match[1] || 0, match[3] || 0, match[5] || 0, match[9] || 0) / 1000;
                            }

                            return fail; // invalid format, cannot be parsed
                        }
                        case '/':
                        { // M/D/YY
                            if (match[1] > 12 || match[3] > 31 || (match[5] < 70 && match[5] > 38)) {
                                return fail;
                            }

                            year = match[5] >= 0 && match[5] <= 38 ? +match[5] + 2000 : match[5];
                            return new Date(year, parseInt(match[1], 10) - 1, match[3],
                                    match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
                        }
                        case ':':
                        { // HH:MM:SS
                            if (match[1] > 23 || match[3] > 59 || match[5] > 59) {
                                return fail;
                            }

                            today = new Date();
                            return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                                    match[1] || 0, match[3] || 0, match[5] || 0) / 1000;
                        }
                    }
                }
            }

            // other formats and "now" should be parsed by Date.parse()
            if (text === 'now') {
                return now === null || isNaN(now) ? new Date()
                    .getTime() / 1000 | 0 : now | 0;
            }
            if (!isNaN(parsed = Date.parse(text))) {
                return parsed / 1000 | 0;
            }

            date = now ? new Date(now * 1000) : new Date();
            days = {
                'sun': 0,
                'mon': 1,
                'tue': 2,
                'wed': 3,
                'thu': 4,
                'fri': 5,
                'sat': 6
            };
            ranges = {
                'yea': 'FullYear',
                'mon': 'Month',
                'day': 'Date',
                'hou': 'Hours',
                'min': 'Minutes',
                'sec': 'Seconds'
            };

            function lastNext(type, range, modifier) {
                var diff, day = days[range];

                if (typeof day !== 'undefined') {
                    diff = day - date.getDay();

                    if (diff === 0) {
                        diff = 7 * modifier;
                    } else if (diff > 0 && type === 'last') {
                        diff -= 7;
                    } else if (diff < 0 && type === 'next') {
                        diff += 7;
                    }

                    date.setDate(date.getDate() + diff);
                }
            }

            function process(val) {
                var splt = val.split(' '), // Todo: Reconcile this with regex using \s, taking into account browser issues with split and regexes
                    type = splt[0],
                    range = splt[1].substring(0, 3),
                    typeIsNumber = /\d+/.test(type),
                    ago = splt[2] === 'ago',
                    num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1);

                if (typeIsNumber) {
                    num *= parseInt(type, 10);
                }

                if (ranges.hasOwnProperty(range) && !splt[1].match(/^mon(day|\.)?$/i)) {
                    return date['set' + ranges[range]](date['get' + ranges[range]]() + num);
                }

                if (range === 'wee') {
                    return date.setDate(date.getDate() + (num * 7));
                }

                if (type === 'next' || type === 'last') {
                    lastNext(type, range, num);
                } else if (!typeIsNumber) {
                    return false;
                }

                return true;
            }

            times = '(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec' +
            '|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?' +
            '|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)';
            regex = '([+-]?\\d+\\s' + times + '|' + '(last|next)\\s' + times + ')(\\sago)?';

            match = text.match(new RegExp(regex, 'gi'));
            if (!match) {
                return fail;
            }

            for (i = 0, len = match.length; i < len; i++) {
                if (!process(match[i])) {
                    return fail;
                }
            }

            // ECMAScript 5 only
            // if (!match.every(process))
            //    return false;

            return (date.getTime() / 1000);
        },

        isTimezone: function (value) {
            var timezones = ["Africa/Abidjan","Africa/Accra","Africa/Addis_Ababa","Africa/Algiers","Africa/Asmara","Africa/Bamako","Africa/Bangui","Africa/Banjul","Africa/Bissau","Africa/Blantyre","Africa/Brazzaville","Africa/Bujumbura","Africa/Cairo","Africa/Casablanca","Africa/Ceuta","Africa/Conakry","Africa/Dakar","Africa/Dar_es_Salaam","Africa/Djibouti","Africa/Douala","Africa/El_Aaiun","Africa/Freetown","Africa/Gaborone","Africa/Harare","Africa/Johannesburg","Africa/Juba","Africa/Kampala","Africa/Khartoum","Africa/Kigali","Africa/Kinshasa","Africa/Lagos","Africa/Libreville","Africa/Lome","Africa/Luanda","Africa/Lubumbashi","Africa/Lusaka","Africa/Malabo","Africa/Maputo","Africa/Maseru","Africa/Mbabane","Africa/Mogadishu","Africa/Monrovia","Africa/Nairobi","Africa/Ndjamena","Africa/Niamey","Africa/Nouakchott","Africa/Ouagadougou","Africa/Porto-Novo","Africa/Sao_Tome","Africa/Tripoli","Africa/Tunis","Africa/Windhoek","America/Adak","America/Anchorage","America/Anguilla","America/Antigua","America/Araguaina","America/Argentina/Buenos_Aires","America/Argentina/Catamarca","America/Argentina/Cordoba","America/Argentina/Jujuy","America/Argentina/La_Rioja","America/Argentina/Mendoza","America/Argentina/Rio_Gallegos","America/Argentina/Salta","America/Argentina/San_Juan","America/Argentina/San_Luis","America/Argentina/Tucuman","America/Argentina/Ushuaia","America/Aruba","America/Asuncion","America/Atikokan","America/Bahia","America/Bahia_Banderas","America/Barbados","America/Belem","America/Belize","America/Blanc-Sablon","America/Boa_Vista","America/Bogota","America/Boise","America/Cambridge_Bay","America/Campo_Grande","America/Cancun","America/Caracas","America/Cayenne","America/Cayman","America/Chicago","America/Chihuahua","America/Costa_Rica","America/Creston","America/Cuiaba","America/Curacao","America/Danmarkshavn","America/Dawson","America/Dawson_Creek","America/Denver","America/Detroit","America/Dominica","America/Edmonton","America/Eirunepe","America/El_Salvador","America/Fortaleza","America/Glace_Bay","America/Godthab","America/Goose_Bay","America/Grand_Turk","America/Grenada","America/Guadeloupe","America/Guatemala","America/Guayaquil","America/Guyana","America/Halifax","America/Havana","America/Hermosillo","America/Indiana/Indianapolis","America/Indiana/Knox","America/Indiana/Marengo","America/Indiana/Petersburg","America/Indiana/Tell_City","America/Indiana/Vevay","America/Indiana/Vincennes","America/Indiana/Winamac","America/Inuvik","America/Iqaluit","America/Jamaica","America/Juneau","America/Kentucky/Louisville","America/Kentucky/Monticello","America/Kralendijk","America/La_Paz","America/Lima","America/Los_Angeles","America/Lower_Princes","America/Maceio","America/Managua","America/Manaus","America/Marigot","America/Martinique","America/Matamoros","America/Mazatlan","America/Menominee","America/Merida","America/Metlakatla","America/Mexico_City","America/Miquelon","America/Moncton","America/Monterrey","America/Montevideo","America/Montserrat","America/Nassau","America/New_York","America/Nipigon","America/Nome","America/Noronha","America/North_Dakota/Beulah","America/North_Dakota/Center","America/North_Dakota/New_Salem","America/Ojinaga","America/Panama","America/Pangnirtung","America/Paramaribo","America/Phoenix","America/Port-au-Prince","America/Port_of_Spain","America/Porto_Velho","America/Puerto_Rico","America/Rainy_River","America/Rankin_Inlet","America/Recife","America/Regina","America/Resolute","America/Rio_Branco","America/Santa_Isabel","America/Santarem","America/Santiago","America/Santo_Domingo","America/Sao_Paulo","America/Scoresbysund","America/Sitka","America/St_Barthelemy","America/St_Johns","America/St_Kitts","America/St_Lucia","America/St_Thomas","America/St_Vincent","America/Swift_Current","America/Tegucigalpa","America/Thule","America/Thunder_Bay","America/Tijuana","America/Toronto","America/Tortola","America/Vancouver","America/Whitehorse","America/Winnipeg","America/Yakutat","America/Yellowknife","Antarctica/Casey","Antarctica/Davis","Antarctica/DumontDUrville","Antarctica/Macquarie","Antarctica/Mawson","Antarctica/McMurdo","Antarctica/Palmer","Antarctica/Rothera","Antarctica/Syowa","Antarctica/Troll","Antarctica/Vostok","Arctic/Longyearbyen","Asia/Aden","Asia/Almaty","Asia/Amman","Asia/Anadyr","Asia/Aqtau","Asia/Aqtobe","Asia/Ashgabat","Asia/Baghdad","Asia/Bahrain","Asia/Baku","Asia/Bangkok","Asia/Beirut","Asia/Bishkek","Asia/Brunei","Asia/Choibalsan","Asia/Chongqing","Asia/Colombo","Asia/Damascus","Asia/Dhaka","Asia/Dili","Asia/Dubai","Asia/Dushanbe","Asia/Gaza","Asia/Harbin","Asia/Hebron","Asia/Ho_Chi_Minh","Asia/Hong_Kong","Asia/Hovd","Asia/Irkutsk","Asia/Jakarta","Asia/Jayapura","Asia/Jerusalem","Asia/Kabul","Asia/Kamchatka","Asia/Karachi","Asia/Kashgar","Asia/Kathmandu","Asia/Khandyga","Asia/Kolkata","Asia/Krasnoyarsk","Asia/Kuala_Lumpur","Asia/Kuching","Asia/Kuwait","Asia/Macau","Asia/Magadan","Asia/Makassar","Asia/Manila","Asia/Muscat","Asia/Nicosia","Asia/Novokuznetsk","Asia/Novosibirsk","Asia/Omsk","Asia/Oral","Asia/Phnom_Penh","Asia/Pontianak","Asia/Pyongyang","Asia/Qatar","Asia/Qyzylorda","Asia/Rangoon","Asia/Riyadh","Asia/Sakhalin","Asia/Samarkand","Asia/Seoul","Asia/Shanghai","Asia/Singapore","Asia/Taipei","Asia/Tashkent","Asia/Tbilisi","Asia/Tehran","Asia/Thimphu","Asia/Tokyo","Asia/Ulaanbaatar","Asia/Urumqi","Asia/Ust-Nera","Asia/Vientiane","Asia/Vladivostok","Asia/Yakutsk","Asia/Yekaterinburg","Asia/Yerevan","Atlantic/Azores","Atlantic/Bermuda","Atlantic/Canary","Atlantic/Cape_Verde","Atlantic/Faroe","Atlantic/Madeira","Atlantic/Reykjavik","Atlantic/South_Georgia","Atlantic/St_Helena","Atlantic/Stanley","Australia/Adelaide","Australia/Brisbane","Australia/Broken_Hill","Australia/Currie","Australia/Darwin","Australia/Eucla","Australia/Hobart","Australia/Lindeman","Australia/Lord_Howe","Australia/Melbourne","Australia/Perth","Australia/Sydney","Europe/Amsterdam","Europe/Andorra","Europe/Athens","Europe/Belgrade","Europe/Berlin","Europe/Bratislava","Europe/Brussels","Europe/Bucharest","Europe/Budapest","Europe/Busingen","Europe/Chisinau","Europe/Copenhagen","Europe/Dublin","Europe/Gibraltar","Europe/Guernsey","Europe/Helsinki","Europe/Isle_of_Man","Europe/Istanbul","Europe/Jersey","Europe/Kaliningrad","Europe/Kiev","Europe/Lisbon","Europe/Ljubljana","Europe/London","Europe/Luxembourg","Europe/Madrid","Europe/Malta","Europe/Mariehamn","Europe/Minsk","Europe/Monaco","Europe/Moscow","Europe/Oslo","Europe/Paris","Europe/Podgorica","Europe/Prague","Europe/Riga","Europe/Rome","Europe/Samara","Europe/San_Marino","Europe/Sarajevo","Europe/Simferopol","Europe/Skopje","Europe/Sofia","Europe/Stockholm","Europe/Tallinn","Europe/Tirane","Europe/Uzhgorod","Europe/Vaduz","Europe/Vatican","Europe/Vienna","Europe/Vilnius","Europe/Volgograd","Europe/Warsaw","Europe/Zagreb","Europe/Zaporozhye","Europe/Zurich","Indian/Antananarivo","Indian/Chagos","Indian/Christmas","Indian/Cocos","Indian/Comoro","Indian/Kerguelen","Indian/Mahe","Indian/Maldives","Indian/Mauritius","Indian/Mayotte","Indian/Reunion","Pacific/Apia","Pacific/Auckland","Pacific/Chatham","Pacific/Chuuk","Pacific/Easter","Pacific/Efate","Pacific/Enderbury","Pacific/Fakaofo","Pacific/Fiji","Pacific/Funafuti","Pacific/Galapagos","Pacific/Gambier","Pacific/Guadalcanal","Pacific/Guam","Pacific/Honolulu","Pacific/Johnston","Pacific/Kiritimati","Pacific/Kosrae","Pacific/Kwajalein","Pacific/Majuro","Pacific/Marquesas","Pacific/Midway","Pacific/Nauru","Pacific/Niue","Pacific/Norfolk","Pacific/Noumea","Pacific/Pago_Pago","Pacific/Palau","Pacific/Pitcairn","Pacific/Pohnpei","Pacific/Port_Moresby","Pacific/Rarotonga","Pacific/Saipan","Pacific/Tahiti","Pacific/Tarawa","Pacific/Tongatapu","Pacific/Wake","Pacific/Wallis","UTC"];
            return timezones.indexOf(value)!=-1;
        }

    };


    methods = function() {

        /**
         * "Validate" optional attributes.
         * Always returns true, just lets us put sometimes in rules.*
         */
        $.validator.addMethod("laravelSometimes", function(value, element, params) {
            return true;
        }, $.validator.format(""));

        /**
         * Validate the given attribute is filled if it is present.
         */
        $.validator.addMethod("laravelFilled", function(value, element, params) {
            return $.validator.methods.required.call(this, value, element, true);
        }, $.validator.format("The field is required"));

        /**
         *Validate that a required attribute exists.
         */
        $.validator.addMethod("laravelRequired", function(value, element, params) {
            return $.validator.methods.required.call(this, value, element, true);
        }, $.validator.format("The field is required."));

        /**
         * Validate that an attribute exists when any other attribute exists.
         */
        $.validator.addMethod("laravelRequiredWith", function(value, element, params) {
            var validator=this,
                required=false;
            $.each(params,function(i,param) {
                var $el = helpers.getElement(element,param);
                required=required || $el==false || $.validator.methods.required.call(validator, $el.val(),$el[0],true);
            });
            if (required) {
                return  $.validator.methods.required.call(this, value, element, true);
            }
            return true;
        }, $.validator.format("The field is required when any of {0} {1} {2} {3} is present."));

        /**
         * Validate that an attribute exists when all other attribute exists.
         */
        $.validator.addMethod("laravelRequiredWithAll", function(value, element, params) {
            var validator=this,
                required=true;
            $.each(params,function(i,param) {
                var $el = helpers.getElement(element,param);
                required=required && ($el==false || $.validator.methods.required.call(validator, $el.val(),$el[0],true));
            });
            if (required) {
                return  $.validator.methods.required.call(this, value, element, true);
            }
            return true;
        }, $.validator.format("The field is required when {0} {1} {2} {3} is present."));

        /**
         * Validate that an attribute exists when any other attribute does not exists.
         */
        $.validator.addMethod("laravelRequiredWithout", function(value, element, params) {
            return  ! $.validator.methods.laravelRequiredWith.call(this, value, element,params );
        }, $.validator.format("The field is required when any of {0} {1} {2} {3} is not present."));

        /**
         * Validate that an attribute exists when all other attribute does not exists.
         */
        $.validator.addMethod("laravelRequiredWithoutAll", function(value, element, params) {
            return  ! $.validator.methods.laravelRequiredWithAll.call(this, value, element,params );
        }, $.validator.format("The field is required when {0} {1} {2} {3} is present."));

        /**
         * Validate that an attribute exists when another attribute has a given value.
         */
        $.validator.addMethod("laravelRequiredIf", function(value, element, params) {
            var $el = helpers.getElement(element,params[0]);
            if ($el==false) {
                return true;
            } else if ($el.val()==params[1]) {
                return $.validator.methods.required.call(this, value, element, true);
            } else {
                return true;
            }

        }, $.validator.format("The :attribute field is required when {0} is {1}."));

        /**
         * Validate that an attribute has a matching confirmation.
         */
        $.validator.addMethod("laravelConfirmed", function(value, element, params) {
            return $.validator.methods.equalTo.call(this, value, element, helpers.selector(params[0]));
        }, $.validator.format("The field confirmation does not match."));

        /**
         * Validate that two attributes match.
         */
        $.validator.addMethod("laravelSame", function(value, element, params) {
            return this.optional(element) ||
                $.validator.methods.equalTo.call(this, value, element, helpers.selector(params));
        }, $.validator.format("The field must match with {0}"));

        /**
         * Validate that an attribute is different from another attribute.
         */
        $.validator.addMethod("laravelDifferent", function(value, element, params) {
            return this.optional(element) ||
                ! $.validator.methods.equalTo.call(this, value, element, helpers.selector(params));
        }, $.validator.format("The field and {0} must be different."));

        /**
         * Validate that an attribute was "accepted".
         * This validation rule implies the attribute is "required".
         */
        $.validator.addMethod("laravelAccepted", function(value, element, params) {
            var regex = new RegExp("^(?:(yes|on|1|true))$",'i');
            return regex.test(value);
        }, $.validator.format("The field must be accepted."));

        /**
         * Validate that an attribute is an array.
         */
        $.validator.addMethod("laravelArray", function(value, element, params) {
            return this.optional(element) ||
                $.isArray(value);
        }, $.validator.format("The :attribute must be an array."));

        /**
         * Validate that an attribute is a boolean.
         */
        $.validator.addMethod("laravelBoolean", function(value, element, params) {
            var regex= new RegExp("^(?:(true|false|1|0))$",'i');
            return this.optional(element) ||  regex.test(value);
        }, $.validator.format("The field must be true or false"));

        /**
         * Validate that an attribute is an integer.
         */
        $.validator.addMethod("laravelInteger", function(value, element, params) {
            var regex= new RegExp("^(?:-?\\d+)$",'i');
            return this.optional(element) ||  regex.test(value);
        }, $.validator.format("The field must be must be a integer."));

        /**
         * Validate that an attribute is numeric.
         */
        $.validator.addMethod("laravelNumeric", function(value, element, params) {
            return this.optional(element) ||
                $.validator.methods.number.call(this, value, element, true);
        }, $.validator.format("The field must be must be a number."));

        /**
         * Validate that an attribute is a string.
         */
        $.validator.addMethod("laravelString", function(value, element, params) {
            return this.optional(element) ||
                typeof value == 'string';
        }, $.validator.format("The field must be string"));

        /**
         * The field under validation must be numeric and must have an exact length of value.
         */
        $.validator.addMethod("laravelDigits", function(value, element, params) {
            return this.optional(element) ||
                ($.validator.methods.number.call(this, value, element, true)
                && value.length==params);
        }, $.validator.format("The field must be {0} digits."));

        /**
         * The field under validation must have a length between the given min and max.
         */
        $.validator.addMethod("laravelDigitsBetween", function(value, element, params) {
            return this.optional(element) ||
                ($.validator.methods.number.call(this, value, element, true)
                && value.length>=params[0] && value.length<=params[1]);
        }, $.validator.format("The field must be beetwen {0} and {1} digits."));

        /**
         * Validate the size of an attribute.
         */
        $.validator.addMethod("laravelSize", function(value, element, params) {
            return this.optional(element) ||
                helpers.getSize(this, element,value) == params[0];
        }, $.validator.format("The field must be {0}"));

        /**
         * Validate the size of an attribute is between a set of values.
         */
        $.validator.addMethod("laravelBetween", function(value, element, params) {
            return this.optional(element) ||
                ( helpers.getSize(this, element,value) >= params[0] && helpers.getSize(this,element,value) <= params[1]);
        }, $.validator.format("The field must be between {0} and {1}"));

        /**
         * Validate the size of an attribute is greater than a minimum value.
         */
        $.validator.addMethod("laravelMin", function(value, element, params) {
            return this.optional(element) ||
                helpers.getSize(this, element,value) >= params[0];
        }, $.validator.format("The field must be at least {0}"));

        /**
         * Validate the size of an attribute is less than a maximum value.
         */
        $.validator.addMethod("laravelMax", function(value, element, params) {
            return this.optional(element) ||
                helpers.getSize(this, element,value) <= params[0];
        }, $.validator.format("The field may not be greater than {0}"));

        /**
         *  Validate an attribute is contained within a list of values.
         */
        $.validator.addMethod("laravelIn", function(value, element, params) {
            return this.optional(element) ||
                params.indexOf(value.toString()) != -1;
        }, $.validator.format("The selected :attribute is invalid"));

        /**
         *  Validate an attribute is not contained within a list of values.
         */
        $.validator.addMethod("laravelNotIn", function(value, element, params) {
            return this.optional(element) ||
                params.indexOf(value.toString()) == -1;
        }, $.validator.format("The selected :attribute is invalid"));

        /**
         *  Validate the uniqueness of an attribute value on a given database table.
         */
        $.validator.addMethod("laravelUnique", function(value, element, params) {
            // @todo: Validate the uniqueness of an attribute value on a given database table.
            return this.optional(element) || true;
        }, $.validator.format("Not implemented"));

        /**
         *  Validate the existence of an attribute value in a database table.
         */
        $.validator.addMethod("laravelExists", function(value, element, params) {
            // @todo: Validate the existence of an attribute value in a database table.
            return this.optional(element) || true;
        }, $.validator.format("Not implemented"));

        /**
         *  Validate that an attribute is a valid IP.
         */
        $.validator.addMethod("laravelIp", function(value, element, params) {
            return this.optional(element) ||
                /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(value) ||
                /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(value);
        }, $.validator.format("The :attribute must be a valid IP address."));

        /**
         *  Validate that an attribute is a valid e-mail address.
         */
        $.validator.addMethod("laravelEmail", function(value, element, params) {
            return this.optional(element) ||
                $.validator.methods.email.call(this, value, element, true);
        }, $.validator.format("The :attribute must be a valid email address."));

        /**
         * Validate that an attribute is a valid URL.
         */
        $.validator.addMethod("laravelUrl", function(value, element, params) {
            return this.optional( element ) ||
                /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test( value );
        }, $.validator.format("The :attribute format is invalid"));

        /**
         * Validate that an attribute is an active URL.
         */
        $.validator.addMethod("laravelActiveUrl", function(value, element, params) {
            // @todo: Validate that an attribute is an active URL.
            return $.validator.methods.laravelUrl.call(this, value, element, true);
        }, $.validator.format("The :attribute is not a valid URL."));

        /**
         * Validate the MIME type of a file upload attribute is in a set of MIME types.
         */
        $.validator.addMethod("laravelImage", function(value, element, params) {
            return $.validator.methods.laravelMimes.call(this, value, element, ['jpeg', 'png', 'gif', 'bmp', 'svg']);
        }, $.validator.format("The :attribute must be a file of type: {0}."));


        /**
         * Validate the MIME type of a file upload attribute is in a set of MIME types.
         */
        $.validator.addMethod("laravelMimes", function(value, element, params) {
            return this.optional(element) ||
                (!window.File || !window.FileReader || !window.FileList || !window.Blob) ||
                params.indexOf(helpers.fileinfo(element).extension)!=-1;
        }, $.validator.format("The :attribute must be a file of type: {0}."));

        /**
         * Validate that an attribute contains only alphabetic characters.
         */
        $.validator.addMethod("laravelAlpha", function(value, element, params) {
            var regex = new RegExp("^(?:^[a-z]+$)$",'i');
            return this.optional(element) || regex.test(value);

        }, $.validator.format("The :attribute may only contain letters."));

        /**
         * Validate that an attribute contains only alpha-numeric characters.
         */
        $.validator.addMethod("laravelAlphaNum", function(value, element, params) {
            var regex = new RegExp("^(?:^[a-z0-9]+$)$",'i');
            return  this.optional(element) || regex.test(value);
        }, $.validator.format("The :attribute may only contain letters and numbers."));

        /**
         * Validate that an attribute contains only alphabetic characters.
         */
        $.validator.addMethod("laravelAlphaDash", function(value, element, params) {
            var regex = new RegExp("^(?:^[\\w\\-_]+$)$",'i');
            return  this.optional(element) || regex.test(value);
        }, $.validator.format("The :attribute may only contain letters, numbers, and dashes."));

        /**
         * Validate that an attribute passes a regular expression check.
         */
        $.validator.addMethod("laravelRegex", function(value, element, params) {
            var invalidModifiers=['x','s','u','X','U','A'];
            // Converting php regular expression
            var phpReg= new RegExp('^(?:\/)(.*\\\/?[^\/]*|[^\/]*)(?:\/)([gmixXsuUAJ]*)?$');
            var matches=params[0].match(phpReg);
            if (matches==null) return false;
            // checking modifiers
            var php_modifiers=[];
            if (matches[2]!=undefined) {
                php_modifiers=matches[2].split('');
                for (var i=0; i<php_modifiers.length<i ;i++) {
                    if (invalidModifiers.indexOf(php_modifiers[i])!=-1) {
                        return true;
                    }
                }
            }
            var regex = new RegExp("^(?:"+matches[1]+")$",php_modifiers.join());
            return  this.optional(element) || regex.test(value);
        }, $.validator.format("The :attribute format is invalid."));

        /**
         * Validate that an attribute is a valid date.
         */
        $.validator.addMethod("laravelDate", function(value, element, params) {
            return this.optional(element) ||(helpers.strtotime(value)!=false);
        }, $.validator.format("The :attribute is not a valid date"));

        /**
         * Validate that an attribute matches a date format.
         */
        $.validator.addMethod("laravelDateFormat", function(value, element, params) {
            return this.optional(element) || helpers.time(value,params[0])!=false;
        }, $.validator.format("The :attribute does not match the format {0)"));

        /**
         * Validate the date is before a given date.
         */
        $.validator.addMethod("laravelBefore", function(value, element, params) {
            var timeValue=helpers.time(value, element);
            return this.optional(element) || (timeValue !=false && timeValue < params[0]);
        }, $.validator.format("The :attribute must be a date before {0}."));

        /**
         * Validate the date is after a given date.
         */
        $.validator.addMethod("laravelAfter", function(value, element, params) {
            var timeValue=helpers.time(value, element);
            return this.optional(element) || (timeValue !=false && timeValue > params[0]);
        }, $.validator.format("The :attribute must be a date after {0}."));

        /**
         * Validate that an attribute is a valid date.
         */
        $.validator.addMethod("laravelTimezone", function(value, element, params) {
            return this.optional(element) || helpers.isTimezone(value);
        }, $.validator.format("The :attribute is not a valid date"));
    }

    /**
     * Loading validators
     */
    methods();

})();

}));