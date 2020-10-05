/*!
 * Laravel Javascript Validation
 *
 * https://github.com/proengsoft/laravel-jsvalidation
 *
 * Copyright (c) 2017 Proengsoft
 * Released under the MIT license
 */

var laravelValidation;
laravelValidation = {

    implicitRules: ['Required','Confirmed'],

    /**
     * Initialize laravel validations.
     */
    init: function () {

        // jquery-validation requires the field under validation to be present. We're adding a dummy hidden
        // field so that any errors are not visible.
        var constructor = $.fn.validate;
        $.fn.validate = function( options ) {
            var name = 'proengsoft_jsvalidation'; // must match the name defined in JsValidatorFactory.newFormRequestValidator
            var $elm = $(this).find('input[name="' + name + '"]');
            if ($elm.length === 0) {
                $('<input>').attr({type: 'hidden', name: name}).appendTo(this);
            }

            return constructor.apply(this, [options]);
        };

        // Disable class rules and attribute rules
        $.validator.classRuleSettings = {};
        $.validator.attributeRules = function () {};

        $.validator.dataRules = this.arrayRules;
        $.validator.prototype.arrayRulesCache = {};

        // Register validations methods
        this.setupValidations();
    },

    arrayRules: function(element) {

        var rules = {},
            validator = $.data( element.form, "validator"),
            cache = validator.arrayRulesCache;

        // Is not an Array
        if (element.name.indexOf('[') === -1) {
            return rules;
        }

        if (! (element.name in cache)) {
            cache[element.name] = {};
        }

        $.each(validator.settings.rules, function(name, tmpRules) {
            if (name in cache[element.name]) {
                rules = laravelValidation.helpers.mergeRules(rules, cache[element.name][name]);
            } else {
                cache[element.name][name] = {};

                var nameRegExp = laravelValidation.helpers.regexFromWildcard(name);
                if (element.name.match(nameRegExp)) {
                    var newRules = $.validator.normalizeRule(tmpRules) || {};
                    cache[element.name][name] = newRules;

                    rules = laravelValidation.helpers.mergeRules(rules, newRules);
                }
            }
        });

        return rules;
    },

    setupValidations: function () {

        /**
         * Get CSRF token.
         *
         * @param params
         * @returns {string}
         */
        var getCsrfToken = function (params) {
            return params[0][1][1];
        };

        /**
         * Whether to validate all attributes.
         *
         * @param params
         * @returns {boolean}
         */
        var isValidateAll = function (params) {
            return params[0][1][2];
        };

        /**
         * Determine whether the rule is implicit.
         *
         * @param params
         * @returns {boolean}
         */
        var isImplicit = function (params) {
            var implicit = false;
            $.each(params, function (i, parameters) {
                implicit = implicit || parameters[3];
            });

            return implicit;
        };

        /**
         * Get form method from a validator instance.
         *
         * @param validator
         * @returns {string}
         */
        var formMethod = function (validator) {
            var formMethod = $(validator.currentForm).attr('method');
            if ($(validator.currentForm).find('input[name="_method"]').length) {
                formMethod = $(validator.currentForm).find('input[name="_method"]').val();
            }

            return formMethod;
        };

        /**
         * Get AJAX parameters for remote requests.
         *
         * @param validator
         * @param element
         * @param params
         * @param data
         * @returns {object}
         */
        var ajaxOpts = function (validator, element, params, data) {
            return {
                mode: 'abort',
                port: 'validate' + element.name,
                dataType: 'json',
                data: data,
                context: validator.currentForm,
                url: $(validator.currentForm).attr('action'),
                type: formMethod(validator),
                beforeSend: function (xhr) {
                    var token = getCsrfToken(params);
                    if (formMethod(validator) !== 'get' && token) {
                        return xhr.setRequestHeader('X-XSRF-TOKEN', token);
                    }
                },
            };
        };

        /**
         * Validate a set of local JS based rules against an element.
         *
         * @param validator
         * @param values
         * @param element
         * @param rules
         * @returns {boolean}
         */
        var validateLocalRules = function (validator, values, element, rules) {
            var validated = true,
                previous = validator.previousValue(element);

            $.each(rules, function (i, param) {
                var implicit = param[3] || laravelValidation.implicitRules.indexOf(param[0]) !== -1;
                var rule = param[0];
                var message = param[2];

                if (! implicit && validator.optional(element)) {
                    validated = "dependency-mismatch";
                    return false;
                }

                if (laravelValidation.methods[rule] !== undefined) {
                    $.each(values, function(index, value) {
                        validated = laravelValidation.methods[rule].call(validator, value, element, param[1], function(valid) {
                            validator.settings.messages[element.name].laravelValidationRemote = previous.originalMessage;
                            if (valid) {
                                var submitted = validator.formSubmitted;
                                validator.prepareElement(element);
                                validator.formSubmitted = submitted;
                                validator.successList.push(element);
                                delete validator.invalid[element.name];
                                validator.showErrors();
                            } else {
                                var errors = {};
                                errors[ element.name ]
                                    = previous.message
                                    = typeof message === "function" ? message( value ) : message;
                                validator.invalid[element.name] = true;
                                validator.showErrors(errors);
                            }
                            validator.showErrors(validator.errorMap);
                            previous.valid = valid;
                        });

                        // Break loop.
                        if (validated === false) {
                            return false;
                        }
                    });
                } else {
                    validated = false;
                }

                if (validated !== true) {
                    if (!validator.settings.messages[element.name] ) {
                        validator.settings.messages[element.name] = {};
                    }

                    validator.settings.messages[element.name].laravelValidation= message;

                    return false;
                }

            });

            return validated;
        };

        /**
         * Create JQueryValidation check to validate Laravel rules.
         */

        $.validator.addMethod("laravelValidation", function (value, element, params) {
            var rules = [],
                arrayRules = [];
            $.each(params, function (i, param) {
                // put Implicit rules in front
                var isArrayRule = param[4].indexOf('[') !== -1;
                if (param[3] || laravelValidation.implicitRules.indexOf(param[0]) !== -1) {
                    isArrayRule ? arrayRules.unshift(param) : rules.unshift(param);
                } else {
                    isArrayRule ? arrayRules.push(param) : rules.push(param);
                }
            });

            // Validate normal rules.
            var localRulesResult = validateLocalRules(this, [value], element, rules);

            // Validate items of the array using array rules.
            var arrayValue = ! Array.isArray(value) ? [value] : value;
            var arrayRulesResult = validateLocalRules(this, arrayValue, element, arrayRules);

            return localRulesResult && arrayRulesResult;
        }, '');


        /**
         * Create JQueryValidation check to validate Remote Laravel rules.
         */
        $.validator.addMethod("laravelValidationRemote", function (value, element, params) {

            if (! isImplicit(params) && this.optional( element )) {
                return "dependency-mismatch";
            }

            var previous = this.previousValue( element ),
                validator, data;

            if (! this.settings.messages[ element.name ]) {
                this.settings.messages[ element.name ] = {};
            }
            previous.originalMessage = this.settings.messages[ element.name ].laravelValidationRemote;
            this.settings.messages[ element.name ].laravelValidationRemote = previous.message;

            if (laravelValidation.helpers.arrayEquals(previous.old, value) || previous.old === value) {
                return previous.valid;
            }

            previous.old = value;
            validator = this;
            this.startRequest( element );

            data = $(validator.currentForm).serializeArray();
            data.push({'name': '_jsvalidation', 'value': element.name});
            data.push({'name': '_jsvalidation_validate_all', 'value': isValidateAll(params)});

            $.ajax( ajaxOpts(validator, element, params, data) )
                .always(function( response, textStatus ) {
                    var errors, message, submitted, valid;

                    if (textStatus === 'error') {
                        valid = false;
                        response = laravelValidation.helpers.parseErrorResponse(response);
                    } else if (textStatus === 'success') {
                        valid = response === true || response === "true";
                    } else {
                        return;
                    }

                    validator.settings.messages[ element.name ].laravelValidationRemote = previous.originalMessage;

                    if ( valid ) {
                        submitted = validator.formSubmitted;
                        validator.prepareElement( element );
                        validator.formSubmitted = submitted;
                        validator.successList.push( element );
                        delete validator.invalid[ element.name ];
                        validator.showErrors();
                    } else {
                        errors = {};
                        message = response || validator.defaultMessage( element, "remote" );
                        errors[ element.name ]
                            = previous.message
                            = typeof message === "function" ? message( value ) : message[0];
                        validator.invalid[ element.name ] = true;
                        validator.showErrors( errors );
                    }
                    validator.showErrors(validator.errorMap);
                    previous.valid = valid;
                    validator.stopRequest( element, valid );
                }
            );
            return "pending";
        }, '');

        /**
         * Create JQueryValidation check to form requests.
         */
        $.validator.addMethod("laravelValidationFormRequest", function (value, element, params) {

            var validator = this,
                previous = validator.previousValue(element);

            var data = $(validator.currentForm).serializeArray();
            data.push({name: '__proengsoft_form_request', value: 1}); // must match FormRequest.JS_VALIDATION_FIELD

            // Skip AJAX if the value remains the same as a prior request.
            if (JSON.stringify(previous.old) === JSON.stringify(data)) {
                if (! previous.valid) {
                    validator.showErrors(previous.errors || {});
                }

                return previous.valid;
            }

            previous.old = data;
            this.startRequest( element );

            $.ajax(ajaxOpts(validator, element, params, data))
                .always(function( response, textStatus ) {
                    var errors = {},
                        valid = textStatus === 'success' && (response === true || response === 'true');

                    if (valid) {
                        validator.resetInternals();
                        validator.toHide = validator.errorsFor( element );
                    } else {
                        $.each( response, function( fieldName, errorMessages ) {
                            var errorElement = laravelValidation.helpers.findByName(validator, fieldName)[0];
                            if (errorElement) {
                                errors[errorElement.name] = laravelValidation.helpers.encode(errorMessages[0] || '');
                            }
                        });

                        // Failed to find the error fields so mark the form as valid otherwise user
                        // will be left in limbo with no visible error messages.
                        if ($.isEmptyObject(errors)) {
                            valid = true;
                        }
                    }

                    previous.valid = valid;
                    previous.errors = errors;
                    validator.showErrors(errors);
                    validator.stopRequest(element, valid);
                });

            return 'pending';
        }, '');
    }
};

$(function() {
    laravelValidation.init();
});
