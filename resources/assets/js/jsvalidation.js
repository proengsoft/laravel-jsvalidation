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

        // Disable class rules and attribute rules
        $.validator.classRuleSettings = {};
        $.validator.attributeRules = function () {
            this.rules = {}
        };

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
        if (element.name.indexOf('[') === -1 ) {
            return rules;
        }

        if (! (element.name in cache) ) {
            cache[element.name]={};
        }

        $.each(validator.settings.rules, function(name, tmpRules){
            if (name in cache[element.name]) {
                $.extend(rules, cache[element.name][name]);
            } else {
                cache[element.name][name]={};
                var nameRegExp = laravelValidation.helpers.regexFromWildcard(name);
                if (element.name.match(nameRegExp)) {
                    var newRules = $.validator.normalizeRule( tmpRules ) || {};
                    cache[element.name][name]=newRules;
                    $.extend(rules, newRules);
                }
            }
        });

        return rules;
    },

    setupValidations: function () {

        /**
         * Create JQueryValidation check to validate Laravel rules.
         */

        $.validator.addMethod("laravelValidation", function (value, element, params) {
            var validator = this;
            var validated = true;
            var previous = this.previousValue( element );

            // put Implicit rules in front
            var rules=[];
            $.each(params, function (i, param) {
                if (param[3] || laravelValidation.implicitRules.indexOf(param[0])!== -1) {
                    rules.unshift(param);
                } else {
                    rules.push(param);
                }
            });

            $.each(rules, function (i, param) {
                var implicit = param[3] || laravelValidation.implicitRules.indexOf(param[0])!== -1;
                var rule = param[0];
                var message = param[2];

                if ( !implicit && validator.optional( element ) ) {
                    validated="dependency-mismatch";
                    return false;
                }

                if (laravelValidation.methods[rule]!==undefined) {
                    validated = laravelValidation.methods[rule].call(validator, value, element, param[1], function(valid) {
                        validator.settings.messages[ element.name ].laravelValidationRemote = previous.originalMessage;
                        if ( valid ) {
                            var submitted = validator.formSubmitted;
                            validator.prepareElement( element );
                            validator.formSubmitted = submitted;
                            validator.successList.push( element );
                            delete validator.invalid[ element.name ];
                            validator.showErrors();
                        } else {
                            var errors = {};
                            errors[ element.name ] = previous.message = $.isFunction( message ) ? message( value ) : message;
                            validator.invalid[ element.name ] = true;
                            validator.showErrors( errors );
                        }
                        validator.showErrors(validator.errorMap);
                        previous.valid = valid;
                    });
                } else {
                    validated=false;
                }

                if (validated !== true) {
                    if (!validator.settings.messages[ element.name ] ) {
                        validator.settings.messages[ element.name ] = {};
                    }
                    validator.settings.messages[element.name].laravelValidation= message;
                    return false;
                }

            });
            return validated;

        }, '');


        /**
         * Create JQueryValidation check to validate Remote Laravel rules.
         */
        $.validator.addMethod("laravelValidationRemote", function (value, element, params) {

            var implicit = false,
                check = params[0][1],
                attribute = element.name,
                token = check[1],
                validateAll = check[2];

            $.each(params, function (i, parameters) {
                implicit = implicit || parameters[3];
            });


            if ( !implicit && this.optional( element ) ) {
                return "dependency-mismatch";
            }

            var previous = this.previousValue( element ),
                validator, data;

            if (!this.settings.messages[ element.name ] ) {
                this.settings.messages[ element.name ] = {};
            }
            previous.originalMessage = this.settings.messages[ element.name ].laravelValidationRemote;
            this.settings.messages[ element.name ].laravelValidationRemote = previous.message;

            var param = typeof param === "string" && { url: param } || param;

            if (laravelValidation.helpers.arrayEquals(previous.old, value) || previous.old === value) {
                return previous.valid;
            }

            previous.old = value;
            validator = this;
            this.startRequest( element );

            data = $(validator.currentForm).serializeArray();

            data.push({
                'name': '_jsvalidation',
                'value': attribute
            });

            data.push({
                'name': '_jsvalidation_validate_all',
                'value': validateAll
            });

            var formMethod = $(validator.currentForm).attr('method');
            if($(validator.currentForm).find('input[name="_method"]').length) {
                formMethod = $(validator.currentForm).find('input[name="_method"]').val();
            }

            $.ajax( $.extend( true, {
                mode: "abort",
                port: "validate" + element.name,
                dataType: "json",
                data: data,
                context: validator.currentForm,
                url: $(validator.currentForm).attr('action'),
                type: formMethod,

                beforeSend: function (xhr) {
                    if ($(validator.currentForm).attr('method').toLowerCase() !== 'get' && token) {
                        return xhr.setRequestHeader('X-XSRF-TOKEN', token);
                    }
                }
            }, param )
            ).always(function( response, textStatus ) {
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
                        errors[ element.name ] = previous.message = $.isFunction( message ) ? message( value ) : message[0];
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
    }
};

$(function() {
    laravelValidation.init();
});
