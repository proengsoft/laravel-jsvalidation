/*!
 * Laravel Javascript Validation
 *
 * https://github.com/proengsoft/laravel-jsvalidation
 *
 * Metjods that implement Laravel Validations
 *
 * Copyright (c) 2014 Proengsoft
 * Released under the MIT license
 */


$.extend(true, laravelValidation, {

    methods: function(){
        
        var helpers=laravelValidation.helpers;
        
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
            return this.optional(element) || true;
        }, $.validator.format("Not implemented"));

        /**
         *  Validate the existence of an attribute value in a database table.
         */
        $.validator.addMethod("laravelExists", function(value, element, params) {
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
            return $.validator.methods.laravelUrl.call(this, value, element, true);
        }, $.validator.format("The :attribute is not a valid URL."));

        /**
         * Validate the MIME type of a file upload attribute is in a set of MIME types.
         */
        $.validator.addMethod("laravelImage", function(value, element, params) {
            return $.validator.methods.laravelMimes.call(this, value, element, ['jpg', 'png', 'gif', 'bmp', 'svg']);
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
            return this.optional(element) || helpers.parseTime(value,params[0])!=false;
        }, $.validator.format("The :attribute does not match the format {0)"));

        /**
         * Validate the date is before a given date.
         */
        $.validator.addMethod("laravelBefore", function(value, element, params) {
            var timeValue=helpers.parseTime(value, element);
            return this.optional(element) || (timeValue !=false && timeValue < params[0]);
        }, $.validator.format("The :attribute must be a date before {0}."));

        /**
         * Validate the date is after a given date.
         */
        $.validator.addMethod("laravelAfter", function(value, element, params) {
            var timeValue=helpers.parseTime(value, element);
            return this.optional(element) || (timeValue !=false && timeValue > params[0]);
        }, $.validator.format("The :attribute must be a date after {0}."));

        /**
         * Validate that an attribute is a valid date.
         */
        $.validator.addMethod("laravelTimezone", function(value, element, params) {
            return this.optional(element) || helpers.isTimezone(value);
        }, $.validator.format("The :attribute is not a valid date"));
    }
    
});
