/*!
 * Laravel Javascript Validation
 *
 * https://github.com/proengsoft/laravel-jsvalidation
 *
 * Helper functions used by validators
 *
 * Copyright (c) 2017 Proengsoft
 * Released under the MIT license
 */

import strlen from 'locutus/php/strings/strlen';
import array_diff from 'locutus/php/array/array_diff';
import strtotime from 'locutus/php/datetime/strtotime';
import is_numeric from 'locutus/php/var/is_numeric';

$.extend(true, laravelValidation, {

    helpers: {

        /**
         * Numeric rules
         */
        numericRules: ['Integer', 'Numeric'],

        /**
         * Gets the file information from file input.
         *
         * @param fieldObj
         * @param index
         * @returns {{file: *, extension: string, size: number}}
         */
        fileinfo: function (fieldObj, index) {
            var FileName = fieldObj.value;
            index = typeof index !== 'undefined' ? index : 0;
            if ( fieldObj.files !== null ) {
                if (typeof fieldObj.files[index] !== 'undefined') {
                    return {
                        file: FileName,
                        extension: FileName.substr(FileName.lastIndexOf('.') + 1),
                        size: fieldObj.files[index].size / 1024,
                        type: fieldObj.files[index].type
                    };
                }
            }
            return false;
        },


        /**
         * Gets the selectors for th specified field names.
         *
         * @param names
         * @returns {string}
         */
        selector: function (names) {
            var selector = [];
            if (! this.isArray(names))  {
                names = [names];
            }
            for (var i = 0; i < names.length; i++) {
                selector.push("[name='" + names[i] + "']");
            }
            return selector.join();
        },


        /**
         * Check if element has numeric rules.
         *
         * @param element
         * @returns {boolean}
         */
        hasNumericRules: function (element) {
            return this.hasRules(element, this.numericRules);
        },

        /**
         * Check if element has passed rules.
         *
         * @param element
         * @param rules
         * @returns {boolean}
         */
        hasRules: function (element, rules) {

            var found = false;
            if (typeof rules === 'string') {
                rules = [rules];
            }

            var validator = $.data(element.form, "validator");
            var listRules = [];
            var cache = validator.arrayRulesCache;
            if (element.name in cache) {
                $.each(cache[element.name], function (index, arrayRule) {
                    listRules.push(arrayRule);
                });
            }
            if (element.name in validator.settings.rules) {
                listRules.push(validator.settings.rules[element.name]);
            }
            $.each(listRules, function(index,objRules){
                if ('laravelValidation' in objRules) {
                    var _rules=objRules.laravelValidation;
                    for (var i = 0; i < _rules.length; i++) {
                        if ($.inArray(_rules[i][0],rules) !== -1) {
                            found = true;
                            return false;
                        }
                    }
                }
            });

            return found;
        },

        /**
         * Return the string length using PHP function.
         * http://php.net/manual/en/function.strlen.php
         * http://phpjs.org/functions/strlen/
         *
         * @param string
         */
        strlen: function (string) {
            return strlen(string);
        },

        /**
         * Get the size of the object depending of his type.
         *
         * @param obj
         * @param element
         * @param value
         * @returns int
         */
        getSize: function getSize(obj, element, value) {

            if (this.hasNumericRules(element) && this.is_numeric(value)) {
                return parseFloat(value);
            } else if (this.isArray(value)) {
                return parseFloat(value.length);
            } else if (element.type === 'file') {
                return parseFloat(Math.floor(this.fileinfo(element).size));
            }

            return parseFloat(this.strlen(value));
        },


        /**
         * Return specified rule from element.
         *
         * @param rule
         * @param element
         * @returns object
         */
        getLaravelValidation: function(rule, element) {

            var found = undefined;
            $.each($.validator.staticRules(element), function(key, rules) {
                if (key==="laravelValidation") {
                    $.each(rules, function (i, value) {
                        if (value[0]===rule) {
                            found=value;
                        }
                    });
                }
            });

            return found;
        },

        /**
         * Return he timestamp of value passed using format or default format in element.
         *
         * @param value
         * @param format
         * @returns {boolean|int}
         */
        parseTime: function (value, format) {

            var timeValue = false;
            var fmt = new DateFormatter();

            if (typeof value === 'number' && typeof format === 'undefined') {
                return value;
            }

            if (typeof format === 'object') {
                var dateRule = this.getLaravelValidation('DateFormat', format);
                if (dateRule !== undefined) {
                    format = dateRule[1][0];
                } else {
                    format = null;
                }
            }

            if (format == null) {
                timeValue = this.strtotime(value);
            } else {
                timeValue = fmt.parseDate(value, format);
                if (timeValue instanceof Date && fmt.formatDate(timeValue, format) === value) {
                    timeValue = Math.round((timeValue.getTime() / 1000));
                } else {
                    timeValue = false;
                }
            }

            return timeValue;
        },

        /**
         * Compare a given date against another using an operator.
         *
         * @param validator
         * @param value
         * @param element
         * @param params
         * @param operator
         * @return {boolean}
         */
        compareDates: function (validator, value, element, params, operator) {

            var timeCompare = this.parseTime(params);

            if (!timeCompare) {
                var target = this.dependentElement(validator, element, params);
                if (target === undefined) {
                    return false;
                }
                timeCompare = this.parseTime(validator.elementValue(target), target);
            }

            var timeValue = this.parseTime(value, element);
            if (timeValue === false) {
                return false;
            }

            switch (operator) {
                case '<':
                    return timeValue < timeCompare;

                case '<=':
                    return timeValue <= timeCompare;

                case '==':
                case '===':
                    return timeValue === timeCompare;

                case '>':
                    return timeValue > timeCompare;

                case '>=':
                    return timeValue >= timeCompare;

                default:
                    throw new Error('Unsupported operator.');
            }
        },

        /**
         * This method allows you to intelligently guess the date by closely matching the specific format.
         *
         * @param value
         * @param format
         * @returns {Date}
         */
        guessDate: function (value, format) {
            var fmt = new DateFormatter();
            return fmt.guessDate(value, format)
        },

        /**
         * Returns Unix timestamp based on PHP function strototime.
         * http://php.net/manual/es/function.strtotime.php
         * http://phpjs.org/functions/strtotime/
         *
         * @param text
         * @param now
         * @returns {*}
         */
        strtotime: function (text, now) {
            return strtotime(text, now)
        },

        /**
         * Returns if value is numeric.
         * http://php.net/manual/es/var.is_numeric.php
         * http://phpjs.org/functions/is_numeric/
         *
         * @param mixed_var
         * @returns {*}
         */
        is_numeric: function (mixed_var) {
            return is_numeric(mixed_var)
        },

        /**
         * Check whether the argument is of type Array.
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Polyfill
         *
         * @param arg
         * @returns {boolean}
         */
        isArray: function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        },

        /**
         * Returns Array diff based on PHP function array_diff.
         * http://php.net/manual/es/function.array_diff.php
         * http://phpjs.org/functions/array_diff/
         *
         * @param arr1
         * @param arr2
         * @returns {*}
         */
        arrayDiff: function (arr1, arr2) {
            return array_diff(arr1, arr2);
        },

        /**
         * Check whether two arrays are equal to one another.
         *
         * @param arr1
         * @param arr2
         * @returns {*}
         */
        arrayEquals: function (arr1, arr2) {
            if (! this.isArray(arr1) || ! this.isArray(arr2)) {
                return false;
            }
            
            if (arr1.length !== arr2.length) {
                return false;
            }
            
            return $.isEmptyObject(this.arrayDiff(arr1, arr2));
        },

        /**
         * Makes element dependant from other.
         *
         * @param validator
         * @param element
         * @param name
         * @returns {*}
         */
        dependentElement: function(validator, element, name) {

            var el=validator.findByName(name);

            if ( el[0]!==undefined  && validator.settings.onfocusout ) {
                var event = 'blur';
                if (el[0].tagName === 'SELECT' ||
                    el[0].tagName === 'OPTION' ||
                    el[0].type === 'checkbox' ||
                    el[0].type === 'radio'
                ) {
                    event = 'click';
                }

                var ruleName = '.validate-laravelValidation';
                el.off( ruleName )
                    .off(event + ruleName + '-' + element.name)
                    .on( event + ruleName + '-' + element.name, function() {
                        $( element ).valid();
                    });
            }

            return el[0];
        },

        /**
         * Parses error Ajax response and gets the message.
         *
         * @param response
         * @returns {string[]}
         */
        parseErrorResponse: function (response) {
            var newResponse = ['Whoops, looks like something went wrong.'];
            if ('responseText' in response) {
                var errorMsg = response.responseText.match(/<h1\s*>(.*)<\/h1\s*>/i);
                if (this.isArray(errorMsg)) {
                    newResponse = [errorMsg[1]];
                }
            }
            return newResponse;
        },

        /**
         * Escape string to use as Regular Expression.
         *
         * @param str
         * @returns string
         */
        escapeRegExp: function (str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },

        /**
         * Generate RegExp from wildcard attributes.
         *
         * @param name
         * @returns {RegExp}
         */
        regexFromWildcard: function (name) {
            var nameParts = name.split('[*]');
            if (nameParts.length === 1) nameParts.push('');

            return new RegExp('^' + nameParts.map(function(x) {
                return laravelValidation.helpers.escapeRegExp(x)
            }).join('\\[[^\\]]*\\]') + '$');
        },

        /**
         * Merge additional laravel validation rules into the current rule set.
         *
         * @param {object} rules
         * @param {object} newRules
         * @returns {object}
         */
        mergeRules: function (rules, newRules) {
            var rulesList = {
                'laravelValidation': newRules.laravelValidation || [],
                'laravelValidationRemote': newRules.laravelValidationRemote || []
            };

            for (var key in rulesList) {
                if (rulesList[key].length === 0) {
                    continue;
                }

                if (typeof rules[key] === "undefined") {
                    rules[key] = [];
                }

                rules[key] = rules[key].concat(rulesList[key]);
            }

            return rules;
        },

        /**
         * HTML entity encode a string.
         *
         * @param string
         * @returns {string}
         */
        encode: function (string) {
            return $('<div/>').text(string).html();
        },

        /**
         * Lookup name in an array.
         *
         * @param validator
         * @param {string} name Name in dot notation format.
         * @returns {*}
         */
        findByArrayName: function (validator, name) {
            var sqName = name.replace(/\.([^\.]+)/g, '[$1]'),
                lookups = [
                    // Convert dot to square brackets. e.g. foo.bar.0 becomes foo[bar][0]
                    sqName,
                    // Append [] to the name e.g. foo becomes foo[] or foo.bar.0 becomes foo[bar][0][]
                    sqName + '[]',
                    // Remove key from last array e.g. foo[bar][0] becomes foo[bar][]
                    sqName.replace(/(.*)\[(.*)\]$/g, '$1[]')
                ];

            for (var i = 0; i < lookups.length; i++) {
                var elem = validator.findByName(lookups[i]);
                if (elem.length > 0) {
                    return elem;
                }
            }

            return $(null);
        },

        /**
         * Attempt to find an element in the DOM matching the given name.
         * Example names include:
         *    - domain.0 which matches domain[]
         *    - customfield.3 which matches customfield[3]
         *
         * @param validator
         * @param {string} name
         * @returns {*}
         */
        findByName: function (validator, name) {
            // Exact match.
            var elem = validator.findByName(name);
            if (elem.length > 0) {
                return elem;
            }

            // Find name in data, using dot notation.
            var delim = '.',
                parts  = name.split(delim);
            for (var i = parts.length; i > 0; i--) {
                var reconstructed = [];
                for (var c = 0; c < i; c++) {
                    reconstructed.push(parts[c]);
                }

                elem = this.findByArrayName(validator, reconstructed.join(delim));
                if (elem.length > 0) {
                    return elem;
                }
            }

            return $(null);
        },

        /**
         * If it's an array element, get all values.
         *
         * @param validator
         * @param element
         * @returns {*|string}
         */
        allElementValues: function (validator, element) {
            if (element.name.indexOf('[]') !== -1) {
                return validator.findByName(element.name).map(function (i, e) {
                    return validator.elementValue(e);
                }).get();
            }

            return validator.elementValue(element);
        }
    }
});
