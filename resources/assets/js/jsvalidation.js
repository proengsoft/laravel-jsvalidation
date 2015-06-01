/*!
 * Laravel Javascript Validation
 *
 * https://github.com/proengsoft/laravel-jsvalidation
 *
 * Copyright (c) 2014 Proengsoft
 * Released under the MIT license
 */

var laravelValidation  = {

    /**
     * Initialize laravel validations
     */
    init: function() {
        // Override check method
        this.overrideCheck();
        // Register validations methods
        this.methods();

    },


    /**
     * Overrides chek funtion from jQueryValidation
     */
    overrideCheck: function() {


        $.extend( $.validator.prototype, {

            remote: function () {
                clearTimeout(timer);

                var args = arguments;
                timer = setTimeout(function() {
                    $.validator.methods._remote.apply(this, args);
                }.bind(this), 500);

                return true;
            },


            check: function( element ) {
                element = this.validationTargetFor( this.clean( element ) );

                var rules = $( element ).rules(),
                    rulesCount = $.map( rules, function( n, i ) {
                        return i;
                    }).length,
                    dependencyMismatch = false,
                    val = this.elementValue( element ),
                    result, method, rule;

                for ( method in rules ) {
                    rule = { method: method, parameters: rules[ method ] };
                    try {
                        var methodToCall=this.normalizeMethod(method);
                        result = $.validator.methods[ methodToCall ].call( this, val, element, rule.parameters );

                        // if a method indicates that the field is optional and therefore valid,
                        // don't mark it as valid when there are no other rules
                        if ( result === "dependency-mismatch" && rulesCount === 1 ) {
                            dependencyMismatch = true;
                            continue;
                        }
                        dependencyMismatch = false;

                        if ( result === "pending" ) {
                            this.toHide = this.toHide.not( this.errorsFor( element ) );
                            return;
                        }

                        if ( !result ) {
                            this.formatAndAdd( element, rule );
                            return false;
                        }
                    } catch ( e ) {
                        if ( this.settings.debug && window.console ) {
                            console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
                        }
                        throw e;
                    }
                }
                if ( dependencyMismatch ) {
                    return;
                }
                if ( this.objectLength( rules ) ) {
                    this.successList.push( element );
                }
                return true;
            },

            normalizeMethod: function (method) {
                return method.replace(/_\d+$/, '');
            }
        });
    }

};

$(function() {
    laravelValidation.init();
});