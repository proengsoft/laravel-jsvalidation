/*!
 * Laravel Javascript Validation
 *
 * https://github.com/proengsoft/laravel-jsvalidation
 *
 * Copyright (c) 2014 Proengsoft
 * Released under the MIT license
 */

var laravelValidation;
laravelValidation = {

    implicitRules: ['Required','Confirmed'],

    /**
     * Initialize laravel validations
     */
    init: function () {

        // Disable class rules and attribute rules
        $.validator.classRuleSettings = {};
        $.validator.normalizeAttributeRule = function(){};

        // Register validations methods
        this.setupValidations();
        
    },


    setupValidations: function () {

        /**
         * Create JQueryValidation check to validate Laravel rules
         */

        $.validator.addMethod("laravelValidation", function (value, element, params) {
            var validator = this;
            var validated = true;

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
                    validated = laravelValidation.methods[rule].call(validator, value, element, param[1]);
                    /*
                } else if($.validator.methods[rule]!==undefined) {
                    validated = $.validator.methods[rule].call(validator, value, element, param[1]);
                    */
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

        }, "");


        /**
         * Create JQueryValidation check to validate Remote Laravel rules
         */

        $.validator.addMethod("laravelValidationRemote", function (value, element, params) {

            var implicit = false,
                check = params[0][1],
                attribute = check[0],
                token = check[1];

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

            if ( previous.old === value ) {
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
            ).always(function( response, textStatus, errorThrown ) {
                    var errors, message, submitted, valid;

                    if (textStatus === 'error') {
                        valid = false;
                        if ('responseText' in response) {
                            var errorMsg = response.responseText.match(/<h1\s*>(.*)<\/h1\s*>/i);
                            if ($.isArray(errorMsg)) {
                                response = [errorMsg[1]];
                            }
                        } else {
                            response = ["Whoops, looks like something went wrong."];
                        }
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


        }, "");

    }


};

$(function() {
    laravelValidation.init();
});
