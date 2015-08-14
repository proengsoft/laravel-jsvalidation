/*!
 * Laravel Javascript Validation
 *
 * https://github.com/proengsoft/laravel-jsvalidation
 *
 * Helper functions used by validators
 *
 * Copyright (c) 2014 Proengsoft
 * Released under the MIT license
 */

$.extend(true, laravelValidation, {

    helpers: {

        /**
         * Gets the file information from file input
         *
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
         *
         * Gets the selectors for th specified field names
         *
         * @param names
         * @returns {string}
         */
        selector: function (names) {
            var selector = [];
            if (!$.isArray(names))  {
                names = [names];
            }
            for (var i = 0; i < names.length; i++) {
                selector.push("[name='" + names[i] + "']");
            }
            return selector.join();
        },


        /**
         * Check if element has numeric rules
         *
         * @param element
         * @returns {boolean}
         */
        hasNumericRules: function (element) {

            var numericRules = ['laravelNumeric', 'laravelInteger'];
            var found = false;

            var validator = $.data(element.form, "validator");
            var objRules = validator.settings.rules[element.name];

            for (var i = 0; i < numericRules.length; i++) {
                found = found || numericRules[i] in objRules;
            }

            return found;
        },


        /**
         * Return the string length using PHP function
         * http://php.net/manual/en/function.strlen.php
         * http://phpjs.org/functions/strlen/
         *
         * @param string
         */
        strlen: function (string) {
            return strlen(string);
        },


        /**
         * Get the size of the object depending of his type
         *
         * @param obj
         * @param element
         * @param value
         * @returns int
         */
        getSize: function getSize(obj, element, value) {

            if (this.hasNumericRules(element) && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value)) {
                return parseFloat(value);
            } else if ($.isArray(value)) {
                return parseFloat(value.length);
            } else if (element.type === 'file') {
                return parseFloat(Math.ceil(this.fileinfo(element).size));
            }

            return parseFloat(this.strlen(value));
        },


        /**
         * Return specified rule from element
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
         * Return he timestamp of value passed using format or default format in element*
         *
         * @param value
         * @param format
         * @returns {boolean|int}
         */
        parseTime: function (value, format) {

            var timeValue = false;
            var fmt = new DateFormatter();

            if ($.type(format) === 'object') {
                var dateRule=this.getLaravelValidation('DateFormat', format)
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
                if (timeValue) {
                    timeValue = Math.round((timeValue.getTime() / 1000));
                }
            }

            return timeValue;
        },

        /**
         * Returns Unix timestamp based on PHP function strototime
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
        }



    }
});