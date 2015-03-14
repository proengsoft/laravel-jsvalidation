/*!
 * jQuery Validation Laravel Plugin v1.13.1
 *
 * https://github.com/proengsoft/laravel-jsvalidation
 *
 * Copyright (c) 2014 Proengsoft
 * Released under the MIT license
 *
 * @test:
 *      accepted: OK
 *      active_url: OK
 *      alpha: OK
 *      alpha_dash: OK
 *      alpha_num: OK
 *      array: OK
 *      beetween: OK revisra espais
 *      boolean: OK
 *      confirmed: OK
 *      digits: OK
 *      different: OK
 *      digits_between: OK
 *      email: ok
 *      exists : ---
 *      image: OK
 *      in :OK
 *      integer: OK
 *      ip: OK
 *      max: OK
 *      mimes: OK
 *      min: OK
 *      numeric: OK
 *      regex: OK
 *      require_if: OK
 *      require_with: OK
 *      required_without: OK
 *      required_without_all: OK
 *      require_all: OK
 *      size: OK
 *      size_numeric:OK
 *      string:OK
 *      timezone: OK
 *      url: OK
 *
 */

(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define( ["jquery", "./jqueryvalidation/jquery.validate"], factory );
    } else {
        factory( jQuery );
    }
}(function( $ ) {

    var imageMime = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/svg'];

    function fileinfo(fieldObj) {
        var FileName = fieldObj.value;
        return {
            file: FileName,
            extension: FileName.substr(FileName.lastIndexOf('.') + 1),
            size:fieldObj.files[0].size / 1024
        };
    }

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


    (function() {
        function selector(names) {
            var selector = [];
            if (!$.isArray(names)) names=[names];
            for (var i=0; i< names.length; i++) {
                selector.push("[name='"+names[i]+"']");
            }
            return selector.join();
        }

        function getElement(element, name) {
            var $form =  $(element).closest('form');
            var elementCache= {};
            var $el = $form
                .find(selector(name))
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
        }


        /**
         * Validate that an attribute exists when any other attribute exists.
         */
        $.validator.addMethod("laravelRequiredWith", function(value, element, params) {

            var validator=this;
            var required=false;

            $.each(params,function(i,param) {
                var $el = getElement(element,param);
                required=required || $el==false || $.validator.methods.required.call(validator, $el.val(),$el[0],true);
            });

            if (required) {
                return  $.validator.methods.required.call(this, value, element, true);
            }
            return true;

                //return $.validator.methods.require_from_group.call(this, value, element, [1,selector(params)]);
        }, $.validator.format("The field is required when any of {0} {1} {2} {3} is present."));


        /**
         * Validate that an attribute exists when all other attribute exists.
         */
        $.validator.addMethod("laravelRequiredWithAll", function(value, element, params) {

            var validator=this;
            var required=true;

            $.each(params,function(i,param) {
                var $el = getElement(element,param);
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
            var $el = getElement(element,params[0]);
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
            return $.validator.methods.equalTo.call(this, value, element, selector(params[0]));
        }, $.validator.format("The field confirmation does not match."));

        /**
         * Validate that two attributes match.
         */
        $.validator.addMethod("laravelSame", function(value, element, params) {
            return this.optional(element) ||
                $.validator.methods.equalTo.call(this, value, element, selector(params));
        }, $.validator.format("The field must match with {0}"));

        /**
         * Validate that an attribute is different from another attribute.
         */
        $.validator.addMethod("laravelDifferent", function(value, element, params) {
            return this.optional(element) ||
                ! $.validator.methods.equalTo.call(this, value, element, selector(params));
        }, $.validator.format("The field and {0} must be different."));


    })();

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


    (function() {
        var numericRules = ['laravelNumeric', 'laravelInteger'];

        function hasNumericRules(element)
        {
            var found = false;
            var validator = $.data( element.form, "validator" );
            var objRules =validator.settings.rules[element.name];
            for (var i=0; i< numericRules.length; i++) {
                found = found || numericRules[i] in objRules;
            }

            return found;
        }

        function strlen(string) {
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
        }

        function getSize(obj, element, value ) {

            if (hasNumericRules(element) && $.validator.methods.number.call(obj,value,element)) {
                return value;
            } else if ($.isArray(value)) {
                return value.length;
            } else if (element.type == 'file') {
                //check whether browser fully supports all File API
                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    return element.files[0].size;
                }else{
                    return true;
                }
            }

            return strlen(value);
        }

        /**
         * Validate the size of an attribute.
         */
        $.validator.addMethod("laravelSize", function(value, element, params) {
            return this.optional(element) ||
                getSize(this, element,value) == params[0];
        }, $.validator.format("The field must be {0}"));

        /**
         * Validate the size of an attribute is between a set of values.
         */
        $.validator.addMethod("laravelBetween", function(value, element, params) {
            console.log(getSize(this, element,value) );
            return this.optional(element) ||
                ( getSize(this, element,value) >= params[0] && getSize(this,element,value) <= params[1]);
        }, $.validator.format("The field must be between {0} and {1}"));

        /**
         * Validate the size of an attribute is greater than a minimum value.
         */
        $.validator.addMethod("laravelMin", function(value, element, params) {
            return this.optional(element) ||
                getSize(this, element,value) >= params[0];
        }, $.validator.format("The field must be at least {0}"));

        /**
         * Validate the size of an attribute is less than a maximum value.
         */
        $.validator.addMethod("laravelMax", function(value, element, params) {
            return this.optional(element) ||
                getSize(this, element,value) <= params[0];
        }, $.validator.format("The field may not be greater than {0}"));

    })();

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
            $.validator.methods.ipv4.call(this, value, element, true) ||
            $.validator.methods.ipv6.call(this, value, element, true)
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
    $.validator.addMethod("laravelMimes", function(value, element, params) {
        return this.optional(element) ||
            (!window.File || !window.FileReader || !window.FileList || !window.Blob) ||
            params.indexOf(fileinfo(element).extension)!=-1;
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
        var regex = new RegExp("^(?:"+params[0]+")$",'i');
        return  this.optional(element) || regex.test(value);

    }, $.validator.format("The :attribute format is invalid."));



}));
