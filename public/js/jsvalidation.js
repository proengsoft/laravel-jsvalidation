/*!
 * jQuery Validation Plugin v1.19.5
 *
 * https://jqueryvalidation.org/
 *
 * Copyright (c) 2022 Jörn Zaefferer
 * Released under the MIT license
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( ["jquery"], factory );
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory( require( "jquery" ) );
	} else {
		factory( jQuery );
	}
}(function( $ ) {

$.extend( $.fn, {

	// https://jqueryvalidation.org/validate/
	validate: function( options ) {

		// If nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// Check if a validator for this form was already created
		var validator = $.data( this[ 0 ], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[ 0 ] );
		$.data( this[ 0 ], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.on( "click.validate", ":submit", function( event ) {

				// Track the used submit button to properly handle scripted
				// submits later.
				validator.submitButton = event.currentTarget;

				// Allow suppressing validation by adding a cancel class to the submit button
				if ( $( this ).hasClass( "cancel" ) ) {
					validator.cancelSubmit = true;
				}

				// Allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $( this ).attr( "formnovalidate" ) !== undefined ) {
					validator.cancelSubmit = true;
				}
			} );

			// Validate the form on submit
			this.on( "submit.validate", function( event ) {
				if ( validator.settings.debug ) {

					// Prevent form submit to be able to see console output
					event.preventDefault();
				}

				function handle() {
					var hidden, result;

					// Insert a hidden input as a replacement for the missing submit button
					// The hidden input is inserted in two cases:
					//   - A user defined a `submitHandler`
					//   - There was a pending request due to `remote` method and `stopRequest()`
					//     was called to submit the form in case it's valid
					if ( validator.submitButton && ( validator.settings.submitHandler || validator.formSubmitted ) ) {
						hidden = $( "<input type='hidden'/>" )
							.attr( "name", validator.submitButton.name )
							.val( $( validator.submitButton ).val() )
							.appendTo( validator.currentForm );
					}

					if ( validator.settings.submitHandler && !validator.settings.debug ) {
						result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( hidden ) {

							// And clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						if ( result !== undefined ) {
							return result;
						}
						return false;
					}
					return true;
				}

				// Prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			} );
		}

		return validator;
	},

	// https://jqueryvalidation.org/valid/
	valid: function() {
		var valid, validator, errorList;

		if ( $( this[ 0 ] ).is( "form" ) ) {
			valid = this.validate().form();
		} else {
			errorList = [];
			valid = true;
			validator = $( this[ 0 ].form ).validate();
			this.each( function() {
				valid = validator.element( this ) && valid;
				if ( !valid ) {
					errorList = errorList.concat( validator.errorList );
				}
			} );
			validator.errorList = errorList;
		}
		return valid;
	},

	// https://jqueryvalidation.org/rules/
	rules: function( command, argument ) {
		var element = this[ 0 ],
			isContentEditable = typeof this.attr( "contenteditable" ) !== "undefined" && this.attr( "contenteditable" ) !== "false",
			settings, staticRules, existingRules, data, param, filtered;

		// If nothing is selected, return empty object; can't chain anyway
		if ( element == null ) {
			return;
		}

		if ( !element.form && isContentEditable ) {
			element.form = this.closest( "form" )[ 0 ];
			element.name = this.attr( "name" );
		}

		if ( element.form == null ) {
			return;
		}

		if ( command ) {
			settings = $.data( element.form, "validator" ).settings;
			staticRules = settings.rules;
			existingRules = $.validator.staticRules( element );
			switch ( command ) {
			case "add":
				$.extend( existingRules, $.validator.normalizeRule( argument ) );

				// Remove messages from rules, but allow them to be set separately
				delete existingRules.messages;
				staticRules[ element.name ] = existingRules;
				if ( argument.messages ) {
					settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[ element.name ];
					return existingRules;
				}
				filtered = {};
				$.each( argument.split( /\s/ ), function( index, method ) {
					filtered[ method ] = existingRules[ method ];
					delete existingRules[ method ];
				} );
				return filtered;
			}
		}

		data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules( element ),
			$.validator.attributeRules( element ),
			$.validator.dataRules( element ),
			$.validator.staticRules( element )
		), element );

		// Make sure required is at front
		if ( data.required ) {
			param = data.required;
			delete data.required;
			data = $.extend( { required: param }, data );
		}

		// Make sure remote is at back
		if ( data.remote ) {
			param = data.remote;
			delete data.remote;
			data = $.extend( data, { remote: param } );
		}

		return data;
	}
} );

// JQuery trim is deprecated, provide a trim method based on String.prototype.trim
var trim = function( str ) {

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim#Polyfill
	return str.replace( /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "" );
};

// Custom selectors
$.extend( $.expr.pseudos || $.expr[ ":" ], {		// '|| $.expr[ ":" ]' here enables backwards compatibility to jQuery 1.7. Can be removed when dropping jQ 1.7.x support

	// https://jqueryvalidation.org/blank-selector/
	blank: function( a ) {
		return !trim( "" + $( a ).val() );
	},

	// https://jqueryvalidation.org/filled-selector/
	filled: function( a ) {
		var val = $( a ).val();
		return val !== null && !!trim( "" + val );
	},

	// https://jqueryvalidation.org/unchecked-selector/
	unchecked: function( a ) {
		return !$( a ).prop( "checked" );
	}
} );

// Constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

// https://jqueryvalidation.org/jQuery.validator.format/
$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray( arguments );
			args.unshift( source );
			return $.validator.format.apply( this, args );
		};
	}
	if ( params === undefined ) {
		return source;
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray( arguments ).slice( 1 );
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each( params, function( i, n ) {
		source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
			return n;
		} );
	} );
	return source;
};

$.extend( $.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		pendingClass: "pending",
		validClass: "valid",
		errorElement: "label",
		focusCleanup: false,
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: ":hidden",
		ignoreTitle: false,
		onfocusin: function( element ) {
			this.lastActive = element;

			// Hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.hideThese( this.errorsFor( element ) );
			}
		},
		onfocusout: function( element ) {
			if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
				this.element( element );
			}
		},
		onkeyup: function( element, event ) {

			// Avoid revalidate the field when pressing one of the following keys
			// Shift       => 16
			// Ctrl        => 17
			// Alt         => 18
			// Caps lock   => 20
			// End         => 35
			// Home        => 36
			// Left arrow  => 37
			// Up arrow    => 38
			// Right arrow => 39
			// Down arrow  => 40
			// Insert      => 45
			// Num lock    => 144
			// AltGr key   => 225
			var excludedKeys = [
				16, 17, 18, 20, 35, 36, 37,
				38, 39, 40, 45, 144, 225
			];

			if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
				return;
			} else if ( element.name in this.submitted || element.name in this.invalid ) {
				this.element( element );
			}
		},
		onclick: function( element ) {

			// Click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element( element );

			// Or option elements, check parent select in that case
			} else if ( element.parentNode.name in this.submitted ) {
				this.element( element.parentNode );
			}
		},
		highlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
			} else {
				$( element ).addClass( errorClass ).removeClass( validClass );
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
			} else {
				$( element ).removeClass( errorClass ).addClass( validClass );
			}
		}
	},

	// https://jqueryvalidation.org/jQuery.validator.setDefaults/
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		equalTo: "Please enter the same value again.",
		maxlength: $.validator.format( "Please enter no more than {0} characters." ),
		minlength: $.validator.format( "Please enter at least {0} characters." ),
		rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),
		range: $.validator.format( "Please enter a value between {0} and {1}." ),
		max: $.validator.format( "Please enter a value less than or equal to {0}." ),
		min: $.validator.format( "Please enter a value greater than or equal to {0}." ),
		step: $.validator.format( "Please enter a multiple of {0}." )
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $( this.settings.errorLabelContainer );
			this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
			this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var currentForm = this.currentForm,
				groups = ( this.groups = {} ),
				rules;
			$.each( this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split( /\s/ );
				}
				$.each( value, function( index, name ) {
					groups[ name ] = key;
				} );
			} );
			rules = this.settings.rules;
			$.each( rules, function( key, value ) {
				rules[ key ] = $.validator.normalizeRule( value );
			} );

			function delegate( event ) {
				var isContentEditable = typeof $( this ).attr( "contenteditable" ) !== "undefined" && $( this ).attr( "contenteditable" ) !== "false";

				// Set form expando on contenteditable
				if ( !this.form && isContentEditable ) {
					this.form = $( this ).closest( "form" )[ 0 ];
					this.name = $( this ).attr( "name" );
				}

				// Ignore the element if it belongs to another form. This will happen mainly
				// when setting the `form` attribute of an input to the id of another form.
				if ( currentForm !== this.form ) {
					return;
				}

				var validator = $.data( this.form, "validator" ),
					eventType = "on" + event.type.replace( /^validate/, "" ),
					settings = validator.settings;
				if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {
					settings[ eventType ].call( validator, this, event );
				}
			}

			$( this.currentForm )
				.on( "focusin.validate focusout.validate keyup.validate",
					":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
					"[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
					"[type='radio'], [type='checkbox'], [contenteditable], [type='button']", delegate )

				// Support: Chrome, oldIE
				// "select" is provided as event.target when clicking a option
				.on( "click.validate", "select, option, [type='radio'], [type='checkbox']", delegate );

			if ( this.settings.invalidHandler ) {
				$( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );
			}
		},

		// https://jqueryvalidation.org/Validator.form/
		form: function() {
			this.checkForm();
			$.extend( this.submitted, this.errorMap );
			this.invalid = $.extend( {}, this.errorMap );
			if ( !this.valid() ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
				this.check( elements[ i ] );
			}
			return this.valid();
		},

		// https://jqueryvalidation.org/Validator.element/
		element: function( element ) {
			var cleanElement = this.clean( element ),
				checkElement = this.validationTargetFor( cleanElement ),
				v = this,
				result = true,
				rs, group;

			if ( checkElement === undefined ) {
				delete this.invalid[ cleanElement.name ];
			} else {
				this.prepareElement( checkElement );
				this.currentElements = $( checkElement );

				// If this element is grouped, then validate all group elements already
				// containing a value
				group = this.groups[ checkElement.name ];
				if ( group ) {
					$.each( this.groups, function( name, testgroup ) {
						if ( testgroup === group && name !== checkElement.name ) {
							cleanElement = v.validationTargetFor( v.clean( v.findByName( name ) ) );
							if ( cleanElement && cleanElement.name in v.invalid ) {
								v.currentElements.push( cleanElement );
								result = v.check( cleanElement ) && result;
							}
						}
					} );
				}

				rs = this.check( checkElement ) !== false;
				result = result && rs;
				if ( rs ) {
					this.invalid[ checkElement.name ] = false;
				} else {
					this.invalid[ checkElement.name ] = true;
				}

				if ( !this.numberOfInvalids() ) {

					// Hide error containers on last error
					this.toHide = this.toHide.add( this.containers );
				}
				this.showErrors();

				// Add aria-invalid status for screen readers
				$( element ).attr( "aria-invalid", !rs );
			}

			return result;
		},

		// https://jqueryvalidation.org/Validator.showErrors/
		showErrors: function( errors ) {
			if ( errors ) {
				var validator = this;

				// Add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = $.map( this.errorMap, function( message, name ) {
					return {
						message: message,
						element: validator.findByName( name )[ 0 ]
					};
				} );

				// Remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !( element.name in errors );
				} );
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// https://jqueryvalidation.org/Validator.resetForm/
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$( this.currentForm ).resetForm();
			}
			this.invalid = {};
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			var elements = this.elements()
				.removeData( "previousValue" )
				.removeAttr( "aria-invalid" );

			this.resetElements( elements );
		},

		resetElements: function( elements ) {
			var i;

			if ( this.settings.unhighlight ) {
				for ( i = 0; elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ],
						this.settings.errorClass, "" );
					this.findByName( elements[ i ].name ).removeClass( this.settings.validClass );
				}
			} else {
				elements
					.removeClass( this.settings.errorClass )
					.removeClass( this.settings.validClass );
			}
		},

		numberOfInvalids: function() {
			return this.objectLength( this.invalid );
		},

		objectLength: function( obj ) {
			/* jshint unused: false */
			var count = 0,
				i;
			for ( i in obj ) {

				// This check allows counting elements with empty error
				// message as invalid elements
				if ( obj[ i ] !== undefined && obj[ i ] !== null && obj[ i ] !== false ) {
					count++;
				}
			}
			return count;
		},

		hideErrors: function() {
			this.hideThese( this.toHide );
		},

		hideThese: function( errors ) {
			errors.not( this.containers ).text( "" );
			this.addWrapper( errors ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [] )
					.filter( ":visible" )
					.trigger( "focus" )

					// Manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger( "focusin" );
				} catch ( e ) {

					// Ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep( this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			} ).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// Select all valid inputs inside the form (no submit or reset buttons)
			return $( this.currentForm )
			.find( "input, select, textarea, [contenteditable]" )
			.not( ":submit, :reset, :image, :disabled" )
			.not( this.settings.ignore )
			.filter( function() {
				var name = this.name || $( this ).attr( "name" ); // For contenteditable
				var isContentEditable = typeof $( this ).attr( "contenteditable" ) !== "undefined" && $( this ).attr( "contenteditable" ) !== "false";

				if ( !name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this );
				}

				// Set form expando on contenteditable
				if ( isContentEditable ) {
					this.form = $( this ).closest( "form" )[ 0 ];
					this.name = name;
				}

				// Ignore elements that belong to other/nested forms
				if ( this.form !== validator.currentForm ) {
					return false;
				}

				// Select only the first element for each name, and only those with rules specified
				if ( name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
					return false;
				}

				rulesCache[ name ] = true;
				return true;
			} );
		},

		clean: function( selector ) {
			return $( selector )[ 0 ];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.split( " " ).join( "." );
			return $( this.settings.errorElement + "." + errorClass, this.errorContext );
		},

		resetInternals: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $( [] );
			this.toHide = $( [] );
		},

		reset: function() {
			this.resetInternals();
			this.currentElements = $( [] );
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor( element );
		},

		elementValue: function( element ) {
			var $element = $( element ),
				type = element.type,
				isContentEditable = typeof $element.attr( "contenteditable" ) !== "undefined" && $element.attr( "contenteditable" ) !== "false",
				val, idx;

			if ( type === "radio" || type === "checkbox" ) {
				return this.findByName( element.name ).filter( ":checked" ).val();
			} else if ( type === "number" && typeof element.validity !== "undefined" ) {
				return element.validity.badInput ? "NaN" : $element.val();
			}

			if ( isContentEditable ) {
				val = $element.text();
			} else {
				val = $element.val();
			}

			if ( type === "file" ) {

				// Modern browser (chrome & safari)
				if ( val.substr( 0, 12 ) === "C:\\fakepath\\" ) {
					return val.substr( 12 );
				}

				// Legacy browsers
				// Unix-based path
				idx = val.lastIndexOf( "/" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Windows-based path
				idx = val.lastIndexOf( "\\" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Just the file name
				return val;
			}

			if ( typeof val === "string" ) {
				return val.replace( /\r/g, "" );
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $( element ).rules(),
				rulesCount = $.map( rules, function( n, i ) {
					return i;
				} ).length,
				dependencyMismatch = false,
				val = this.elementValue( element ),
				result, method, rule, normalizer;

			// Prioritize the local normalizer defined for this element over the global one
			// if the former exists, otherwise user the global one in case it exists.
			if ( typeof rules.normalizer === "function" ) {
				normalizer = rules.normalizer;
			} else if (	typeof this.settings.normalizer === "function" ) {
				normalizer = this.settings.normalizer;
			}

			// If normalizer is defined, then call it to retreive the changed value instead
			// of using the real one.
			// Note that `this` in the normalizer is `element`.
			if ( normalizer ) {
				val = normalizer.call( element, val );

				// Delete the normalizer from rules to avoid treating it as a pre-defined method.
				delete rules.normalizer;
			}

			for ( method in rules ) {
				rule = { method: method, parameters: rules[ method ] };
				try {
					result = $.validator.methods[ method ].call( this, val, element, rule.parameters );

					// If a method indicates that the field is optional and therefore valid,
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
					if ( e instanceof TypeError ) {
						e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
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

		// Return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		// return the generic message if present and no method specific message is present
		customDataMessage: function( element, method ) {
			return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
				method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
		},

		// Return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[ name ];
			return m && ( m.constructor === String ? m : m[ method ] );
		},

		// Return the first defined argument, allowing empty strings
		findDefined: function() {
			for ( var i = 0; i < arguments.length; i++ ) {
				if ( arguments[ i ] !== undefined ) {
					return arguments[ i ];
				}
			}
			return undefined;
		},

		// The second parameter 'rule' used to be a string, and extended to an object literal
		// of the following form:
		// rule = {
		//     method: "method name",
		//     parameters: "the given method parameters"
		// }
		//
		// The old behavior still supported, kept to maintain backward compatibility with
		// old code, and will be removed in the next major release.
		defaultMessage: function( element, rule ) {
			if ( typeof rule === "string" ) {
				rule = { method: rule };
			}

			var message = this.findDefined(
					this.customMessage( element.name, rule.method ),
					this.customDataMessage( element, rule.method ),

					// 'title' is never undefined, so handle empty string as undefined
					!this.settings.ignoreTitle && element.title || undefined,
					$.validator.messages[ rule.method ],
					"<strong>Warning: No message defined for " + element.name + "</strong>"
				),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call( this, rule.parameters, element );
			} else if ( theregex.test( message ) ) {
				message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
			}

			return message;
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule );

			this.errorList.push( {
				message: message,
				element: element,
				method: rule.method
			} );

			this.errorMap[ element.name ] = message;
			this.submitted[ element.name ] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements, error;
			for ( i = 0; this.errorList[ i ]; i++ ) {
				error = this.errorList[ i ];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[ i ]; i++ ) {
					this.showLabel( this.successList[ i ] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not( this.invalidElements() );
		},

		invalidElements: function() {
			return $( this.errorList ).map( function() {
				return this.element;
			} );
		},

		showLabel: function( element, message ) {
			var place, group, errorID, v,
				error = this.errorsFor( element ),
				elementID = this.idOrName( element ),
				describedBy = $( element ).attr( "aria-describedby" );

			if ( error.length ) {

				// Refresh error/success class
				error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );

				// Replace message on existing label
				error.html( message );
			} else {

				// Create error element
				error = $( "<" + this.settings.errorElement + ">" )
					.attr( "id", elementID + "-error" )
					.addClass( this.settings.errorClass )
					.html( message || "" );

				// Maintain reference to the element to be placed into the DOM
				place = error;
				if ( this.settings.wrapper ) {

					// Make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
				}
				if ( this.labelContainer.length ) {
					this.labelContainer.append( place );
				} else if ( this.settings.errorPlacement ) {
					this.settings.errorPlacement.call( this, place, $( element ) );
				} else {
					place.insertAfter( element );
				}

				// Link error back to the element
				if ( error.is( "label" ) ) {

					// If the error is a label, then associate using 'for'
					error.attr( "for", elementID );

					// If the element is not a child of an associated label, then it's necessary
					// to explicitly apply aria-describedby
				} else if ( error.parents( "label[for='" + this.escapeCssMeta( elementID ) + "']" ).length === 0 ) {
					errorID = error.attr( "id" );

					// Respect existing non-error aria-describedby
					if ( !describedBy ) {
						describedBy = errorID;
					} else if ( !describedBy.match( new RegExp( "\\b" + this.escapeCssMeta( errorID ) + "\\b" ) ) ) {

						// Add to end of list if not already present
						describedBy += " " + errorID;
					}
					$( element ).attr( "aria-describedby", describedBy );

					// If this element is grouped, then assign to all elements in the same group
					group = this.groups[ element.name ];
					if ( group ) {
						v = this;
						$.each( v.groups, function( name, testgroup ) {
							if ( testgroup === group ) {
								$( "[name='" + v.escapeCssMeta( name ) + "']", v.currentForm )
									.attr( "aria-describedby", error.attr( "id" ) );
							}
						} );
					}
				}
			}
			if ( !message && this.settings.success ) {
				error.text( "" );
				if ( typeof this.settings.success === "string" ) {
					error.addClass( this.settings.success );
				} else {
					this.settings.success( error, element );
				}
			}
			this.toShow = this.toShow.add( error );
		},

		errorsFor: function( element ) {
			var name = this.escapeCssMeta( this.idOrName( element ) ),
				describer = $( element ).attr( "aria-describedby" ),
				selector = "label[for='" + name + "'], label[for='" + name + "'] *";

			// 'aria-describedby' should directly reference the error element
			if ( describer ) {
				selector = selector + ", #" + this.escapeCssMeta( describer )
					.replace( /\s+/g, ", #" );
			}

			return this
				.errors()
				.filter( selector );
		},

		// See https://api.jquery.com/category/selectors/, for CSS
		// meta-characters that should be escaped in order to be used with JQuery
		// as a literal part of a name/id or any selector.
		escapeCssMeta: function( string ) {
			if ( string === undefined ) {
				return "";
			}

			return string.replace( /([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1" );
		},

		idOrName: function( element ) {
			return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
		},

		validationTargetFor: function( element ) {

			// If radio/checkbox, validate first element in group instead
			if ( this.checkable( element ) ) {
				element = this.findByName( element.name );
			}

			// Always apply ignore filter
			return $( element ).not( this.settings.ignore )[ 0 ];
		},

		checkable: function( element ) {
			return ( /radio|checkbox/i ).test( element.type );
		},

		findByName: function( name ) {
			return $( this.currentForm ).find( "[name='" + this.escapeCssMeta( name ) + "']" );
		},

		getLength: function( value, element ) {
			switch ( element.nodeName.toLowerCase() ) {
			case "select":
				return $( "option:selected", element ).length;
			case "input":
				if ( this.checkable( element ) ) {
					return this.findByName( element.name ).filter( ":checked" ).length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[ typeof param ] ? this.dependTypes[ typeof param ]( param, element ) : true;
		},

		dependTypes: {
			"boolean": function( param ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$( param, element.form ).length;
			},
			"function": function( param, element ) {
				return param( element );
			}
		},

		optional: function( element ) {
			var val = this.elementValue( element );
			return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[ element.name ] ) {
				this.pendingRequest++;
				$( element ).addClass( this.settings.pendingClass );
				this.pending[ element.name ] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;

			// Sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[ element.name ];
			$( element ).removeClass( this.settings.pendingClass );
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() && this.pendingRequest === 0 ) {
				$( this.currentForm ).trigger( "submit" );

				// Remove the hidden input that was used as a replacement for the
				// missing submit button. The hidden input is added by `handle()`
				// to ensure that the value of the used submit button is passed on
				// for scripted submits triggered by this method
				if ( this.submitButton ) {
					$( "input:hidden[name='" + this.submitButton.name + "']", this.currentForm ).remove();
				}

				this.formSubmitted = false;
			} else if ( !valid && this.pendingRequest === 0 && this.formSubmitted ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
				this.formSubmitted = false;
			}
		},

		previousValue: function( element, method ) {
			method = typeof method === "string" && method || "remote";

			return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, { method: method } )
			} );
		},

		// Cleans up all forms and elements, removes validator-specific events
		destroy: function() {
			this.resetForm();

			$( this.currentForm )
				.off( ".validate" )
				.removeData( "validator" )
				.find( ".validate-equalTo-blur" )
					.off( ".validate-equalTo" )
					.removeClass( "validate-equalTo-blur" )
				.find( ".validate-lessThan-blur" )
					.off( ".validate-lessThan" )
					.removeClass( "validate-lessThan-blur" )
				.find( ".validate-lessThanEqual-blur" )
					.off( ".validate-lessThanEqual" )
					.removeClass( "validate-lessThanEqual-blur" )
				.find( ".validate-greaterThanEqual-blur" )
					.off( ".validate-greaterThanEqual" )
					.removeClass( "validate-greaterThanEqual-blur" )
				.find( ".validate-greaterThan-blur" )
					.off( ".validate-greaterThan" )
					.removeClass( "validate-greaterThan-blur" );
		}

	},

	classRuleSettings: {
		required: { required: true },
		email: { email: true },
		url: { url: true },
		date: { date: true },
		dateISO: { dateISO: true },
		number: { number: true },
		digits: { digits: true },
		creditcard: { creditcard: true }
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[ className ] = rules;
		} else {
			$.extend( this.classRuleSettings, className );
		}
	},

	classRules: function( element ) {
		var rules = {},
			classes = $( element ).attr( "class" );

		if ( classes ) {
			$.each( classes.split( " " ), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend( rules, $.validator.classRuleSettings[ this ] );
				}
			} );
		}
		return rules;
	},

	normalizeAttributeRule: function( rules, type, method, value ) {

		// Convert the value to a number for number inputs, and for text for backwards compability
		// allows type="date" and others to be compared as strings
		if ( /min|max|step/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
			value = Number( value );

			// Support Opera Mini, which returns NaN for undefined minlength
			if ( isNaN( value ) ) {
				value = undefined;
			}
		}

		if ( value || value === 0 ) {
			rules[ method ] = value;
		} else if ( type === method && type !== "range" ) {

			// Exception: the jquery validate 'range' method
			// does not test for the html5 'range' type
			rules[ type === "date" ? "dateISO" : method ] = true;
		}
	},

	attributeRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {

			// Support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = element.getAttribute( method );

				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}

				// Force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr( method );
			}

			this.normalizeAttributeRule( rules, type, method, value );
		}

		// 'maxlength' may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {
			value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );

			// Cast empty attributes like `data-rule-required` to `true`
			if ( value === "" ) {
				value = true;
			}

			this.normalizeAttributeRule( rules, type, method, value );
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {},
			validator = $.data( element.form, "validator" );

		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {

		// Handle dependency check
		$.each( rules, function( prop, val ) {

			// Ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[ prop ];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch ( typeof val.depends ) {
				case "string":
					keepRule = !!$( val.depends, element.form ).length;
					break;
				case "function":
					keepRule = val.depends.call( element, element );
					break;
				}
				if ( keepRule ) {
					rules[ prop ] = val.param !== undefined ? val.param : true;
				} else {
					$.data( element.form, "validator" ).resetElements( $( element ) );
					delete rules[ prop ];
				}
			}
		} );

		// Evaluate parameters
		$.each( rules, function( rule, parameter ) {
			rules[ rule ] = typeof parameter === "function" && rule !== "normalizer" ? parameter( element ) : parameter;
		} );

		// Clean number parameters
		$.each( [ "minlength", "maxlength" ], function() {
			if ( rules[ this ] ) {
				rules[ this ] = Number( rules[ this ] );
			}
		} );
		$.each( [ "rangelength", "range" ], function() {
			var parts;
			if ( rules[ this ] ) {
				if ( Array.isArray( rules[ this ] ) ) {
					rules[ this ] = [ Number( rules[ this ][ 0 ] ), Number( rules[ this ][ 1 ] ) ];
				} else if ( typeof rules[ this ] === "string" ) {
					parts = rules[ this ].replace( /[\[\]]/g, "" ).split( /[\s,]+/ );
					rules[ this ] = [ Number( parts[ 0 ] ), Number( parts[ 1 ] ) ];
				}
			}
		} );

		if ( $.validator.autoCreateRanges ) {

			// Auto-create ranges
			if ( rules.min != null && rules.max != null ) {
				rules.range = [ rules.min, rules.max ];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength != null && rules.maxlength != null ) {
				rules.rangelength = [ rules.minlength, rules.maxlength ];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each( data.split( /\s/ ), function() {
				transformed[ this ] = true;
			} );
			data = transformed;
		}
		return data;
	},

	// https://jqueryvalidation.org/jQuery.validator.addMethod/
	addMethod: function( name, method, message ) {
		$.validator.methods[ name ] = method;
		$.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
		if ( method.length < 3 ) {
			$.validator.addClassRules( name, $.validator.normalizeRule( name ) );
		}
	},

	// https://jqueryvalidation.org/jQuery.validator.methods/
	methods: {

		// https://jqueryvalidation.org/required-method/
		required: function( value, element, param ) {

			// Check if dependency is met
			if ( !this.depend( param, element ) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {

				// Could be an array for select-multiple or a string, both are fine this way
				var val = $( element ).val();
				return val && val.length > 0;
			}
			if ( this.checkable( element ) ) {
				return this.getLength( value, element ) > 0;
			}
			return value !== undefined && value !== null && value.length > 0;
		},

		// https://jqueryvalidation.org/email-method/
		email: function( value, element ) {

			// From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
			// Retrieved 2014-01-14
			// If you have a problem with this implementation, report a bug against the above spec
			// Or use custom methods to implement your own email validation
			return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
		},

		// https://jqueryvalidation.org/url-method/
		url: function( value, element ) {

			// Copyright (c) 2010-2013 Diego Perini, MIT licensed
			// https://gist.github.com/dperini/729294
			// see also https://mathiasbynens.be/demo/url-regex
			// modified to allow protocol-relative URLs
			return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})+(?::(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
		},

		// https://jqueryvalidation.org/date-method/
		date: ( function() {
			var called = false;

			return function( value, element ) {
				if ( !called ) {
					called = true;
					if ( this.settings.debug && window.console ) {
						console.warn(
							"The `date` method is deprecated and will be removed in version '2.0.0'.\n" +
							"Please don't use it, since it relies on the Date constructor, which\n" +
							"behaves very differently across browsers and locales. Use `dateISO`\n" +
							"instead or one of the locale specific methods in `localizations/`\n" +
							"and `additional-methods.js`."
						);
					}
				}

				return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
			};
		}() ),

		// https://jqueryvalidation.org/dateISO-method/
		dateISO: function( value, element ) {
			return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
		},

		// https://jqueryvalidation.org/number-method/
		number: function( value, element ) {
			return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
		},

		// https://jqueryvalidation.org/digits-method/
		digits: function( value, element ) {
			return this.optional( element ) || /^\d+$/.test( value );
		},

		// https://jqueryvalidation.org/minlength-method/
		minlength: function( value, element, param ) {
			var length = Array.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length >= param;
		},

		// https://jqueryvalidation.org/maxlength-method/
		maxlength: function( value, element, param ) {
			var length = Array.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length <= param;
		},

		// https://jqueryvalidation.org/rangelength-method/
		rangelength: function( value, element, param ) {
			var length = Array.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
		},

		// https://jqueryvalidation.org/min-method/
		min: function( value, element, param ) {
			return this.optional( element ) || value >= param;
		},

		// https://jqueryvalidation.org/max-method/
		max: function( value, element, param ) {
			return this.optional( element ) || value <= param;
		},

		// https://jqueryvalidation.org/range-method/
		range: function( value, element, param ) {
			return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
		},

		// https://jqueryvalidation.org/step-method/
		step: function( value, element, param ) {
			var type = $( element ).attr( "type" ),
				errorMessage = "Step attribute on input type " + type + " is not supported.",
				supportedTypes = [ "text", "number", "range" ],
				re = new RegExp( "\\b" + type + "\\b" ),
				notSupported = type && !re.test( supportedTypes.join() ),
				decimalPlaces = function( num ) {
					var match = ( "" + num ).match( /(?:\.(\d+))?$/ );
					if ( !match ) {
						return 0;
					}

					// Number of digits right of decimal point.
					return match[ 1 ] ? match[ 1 ].length : 0;
				},
				toInt = function( num ) {
					return Math.round( num * Math.pow( 10, decimals ) );
				},
				valid = true,
				decimals;

			// Works only for text, number and range input types
			// TODO find a way to support input types date, datetime, datetime-local, month, time and week
			if ( notSupported ) {
				throw new Error( errorMessage );
			}

			decimals = decimalPlaces( param );

			// Value can't have too many decimals
			if ( decimalPlaces( value ) > decimals || toInt( value ) % toInt( param ) !== 0 ) {
				valid = false;
			}

			return this.optional( element ) || valid;
		},

		// https://jqueryvalidation.org/equalTo-method/
		equalTo: function( value, element, param ) {

			// Bind to the blur event of the target in order to revalidate whenever the target field is updated
			var target = $( param );
			if ( this.settings.onfocusout && target.not( ".validate-equalTo-blur" ).length ) {
				target.addClass( "validate-equalTo-blur" ).on( "blur.validate-equalTo", function() {
					$( element ).valid();
				} );
			}
			return value === target.val();
		},

		// https://jqueryvalidation.org/remote-method/
		remote: function( value, element, param, method ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}

			method = typeof method === "string" && method || "remote";

			var previous = this.previousValue( element, method ),
				validator, data, optionDataString;

			if ( !this.settings.messages[ element.name ] ) {
				this.settings.messages[ element.name ] = {};
			}
			previous.originalMessage = previous.originalMessage || this.settings.messages[ element.name ][ method ];
			this.settings.messages[ element.name ][ method ] = previous.message;

			param = typeof param === "string" && { url: param } || param;
			optionDataString = $.param( $.extend( { data: value }, param.data ) );
			if ( previous.old === optionDataString ) {
				return previous.valid;
			}

			previous.old = optionDataString;
			validator = this;
			this.startRequest( element );
			data = {};
			data[ element.name ] = value;
			$.ajax( $.extend( true, {
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				context: validator.currentForm,
				success: function( response ) {
					var valid = response === true || response === "true",
						errors, message, submitted;

					validator.settings.messages[ element.name ][ method ] = previous.originalMessage;
					if ( valid ) {
						submitted = validator.formSubmitted;
						validator.resetInternals();
						validator.toHide = validator.errorsFor( element );
						validator.formSubmitted = submitted;
						validator.successList.push( element );
						validator.invalid[ element.name ] = false;
						validator.showErrors();
					} else {
						errors = {};
						message = response || validator.defaultMessage( element, { method: method, parameters: value } );
						errors[ element.name ] = previous.message = message;
						validator.invalid[ element.name ] = true;
						validator.showErrors( errors );
					}
					previous.valid = valid;
					validator.stopRequest( element, valid );
				}
			}, param ) );
			return "pending";
		}
	}

} );

// Ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

var pendingRequests = {},
	ajax;

// Use a prefilter if available (1.5+)
if ( $.ajaxPrefilter ) {
	$.ajaxPrefilter( function( settings, _, xhr ) {
		var port = settings.port;
		if ( settings.mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = xhr;
		}
	} );
} else {

	// Proxy ajax
	ajax = $.ajax;
	$.ajax = function( settings ) {
		var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
			port = ( "port" in settings ? settings : $.ajaxSettings ).port;
		if ( mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = ajax.apply( this, arguments );
			return pendingRequests[ port ];
		}
		return ajax.apply( this, arguments );
	};
}
return $;
}));
/*!
 * @copyright Copyright &copy; Kartik Visweswaran, Krajee.com, 2014 - 2020
 * @version 1.3.6
 *
 * Date formatter utility library that allows formatting date/time variables or Date objects using PHP DateTime format.
 * This library is a standalone javascript library and does not depend on other libraries or plugins like jQuery. The
 * library also adds support for Universal Module Definition (UMD).
 * 
 * @see http://php.net/manual/en/function.date.php
 *
 * For more JQuery plugins visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */
(function (root, factory) {
    // noinspection JSUnresolvedVariable
    if (typeof define === 'function' && define.amd) { // AMD
        // noinspection JSUnresolvedFunction
        define([], factory);
    } else {
        // noinspection JSUnresolvedVariable
        if (typeof module === 'object' && module.exports) { // Node
            // noinspection JSUnresolvedVariable
            module.exports = factory();
        } else { // Browser globals
            root.DateFormatter = factory();
        }
    }
}(typeof self !== 'undefined' ? self : this, function () {
    var DateFormatter, $h;
    /**
     * Global helper object
     */
    $h = {
        DAY: 1000 * 60 * 60 * 24,
        HOUR: 3600,
        defaults: {
            dateSettings: {
                days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                months: [
                    'January', 'February', 'March', 'April', 'May', 'June', 'July',
                    'August', 'September', 'October', 'November', 'December'
                ],
                monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                meridiem: ['AM', 'PM'],
                ordinal: function (number) {
                    var n = number % 10, suffixes = {1: 'st', 2: 'nd', 3: 'rd'};
                    return Math.floor(number % 100 / 10) === 1 || !suffixes[n] ? 'th' : suffixes[n];
                }
            },
            separators: /[ \-+\/.:@]/g,
            validParts: /[dDjlNSwzWFmMntLoYyaABgGhHisueTIOPZcrU]/g,
            intParts: /[djwNzmnyYhHgGis]/g,
            tzParts: /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            tzClip: /[^-+\dA-Z]/g
        },
        getInt: function (str, radix) {
            return parseInt(str, (radix ? radix : 10));
        },
        compare: function (str1, str2) {
            return typeof (str1) === 'string' && typeof (str2) === 'string' && str1.toLowerCase() === str2.toLowerCase();
        },
        lpad: function (value, length, chr) {
            var val = value.toString();
            chr = chr || '0';
            return val.length < length ? $h.lpad(chr + val, length) : val;
        },
        merge: function (out) {
            var i, obj;
            out = out || {};
            for (i = 1; i < arguments.length; i++) {
                obj = arguments[i];
                if (!obj) {
                    continue;
                }
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (typeof obj[key] === 'object') {
                            $h.merge(out[key], obj[key]);
                        } else {
                            out[key] = obj[key];
                        }
                    }
                }
            }
            return out;
        },
        getIndex: function (val, arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].toLowerCase() === val.toLowerCase()) {
                    return i;
                }
            }
            return -1;
        }
    };

    /**
     * Date Formatter Library Constructor
     * @param options
     * @constructor
     */
    DateFormatter = function (options) {
        var self = this, config = $h.merge($h.defaults, options);
        self.dateSettings = config.dateSettings;
        self.separators = config.separators;
        self.validParts = config.validParts;
        self.intParts = config.intParts;
        self.tzParts = config.tzParts;
        self.tzClip = config.tzClip;
    };

    /**
     * DateFormatter Library Prototype
     */
    DateFormatter.prototype = {
        constructor: DateFormatter,
        getMonth: function (val) {
            var self = this, i;
            i = $h.getIndex(val, self.dateSettings.monthsShort) + 1;
            if (i === 0) {
                i = $h.getIndex(val, self.dateSettings.months) + 1;
            }
            return i;
        },
        parseDate: function (vDate, vFormat) {
            var self = this, vFormatParts, vDateParts, i, vDateFlag = false, vTimeFlag = false, vDatePart, iDatePart,
                vSettings = self.dateSettings, vMonth, vMeriIndex, vMeriOffset, len, mer,
                out = {date: null, year: null, month: null, day: null, hour: 0, min: 0, sec: 0};
            if (!vDate) {
                return null;
            }
            if (vDate instanceof Date) {
                return vDate;
            }
            if (vFormat === 'U') {
                i = $h.getInt(vDate);
                return i ? new Date(i * 1000) : vDate;
            }
            switch (typeof vDate) {
                case 'number':
                    return new Date(vDate);
                case 'string':
                    break;
                default:
                    return null;
            }
            vFormatParts = vFormat.match(self.validParts);
            if (!vFormatParts || vFormatParts.length === 0) {
                throw new Error('Invalid date format definition.');
            }
            for (i = vFormatParts.length - 1; i >= 0; i--) {
                if (vFormatParts[i] === 'S') {
                    vFormatParts.splice(i, 1);
                }
            }
            vDateParts = vDate.replace(self.separators, '\0').split('\0');
            for (i = 0; i < vDateParts.length; i++) {
                vDatePart = vDateParts[i];
                iDatePart = $h.getInt(vDatePart);
                switch (vFormatParts[i]) {
                    case 'y':
                    case 'Y':
                        if (iDatePart) {
                            len = vDatePart.length;
                            out.year = len === 2 ? $h.getInt((iDatePart < 70 ? '20' : '19') + vDatePart) : iDatePart;
                        } else {
                            return null;
                        }
                        vDateFlag = true;
                        break;
                    case 'm':
                    case 'n':
                    case 'M':
                    case 'F':
                        if (isNaN(iDatePart)) {
                            vMonth = self.getMonth(vDatePart);
                            if (vMonth > 0) {
                                out.month = vMonth;
                            } else {
                                return null;
                            }
                        } else {
                            if (iDatePart >= 1 && iDatePart <= 12) {
                                out.month = iDatePart;
                            } else {
                                return null;
                            }
                        }
                        vDateFlag = true;
                        break;
                    case 'd':
                    case 'j':
                        if (iDatePart >= 1 && iDatePart <= 31) {
                            out.day = iDatePart;
                        } else {
                            return null;
                        }
                        vDateFlag = true;
                        break;
                    case 'g':
                    case 'h':
                        vMeriIndex = (vFormatParts.indexOf('a') > -1) ? vFormatParts.indexOf('a') :
                            ((vFormatParts.indexOf('A') > -1) ? vFormatParts.indexOf('A') : -1);
                        mer = vDateParts[vMeriIndex];
                        if (vMeriIndex !== -1) {
                            vMeriOffset = $h.compare(mer, vSettings.meridiem[0]) ? 0 :
                                ($h.compare(mer, vSettings.meridiem[1]) ? 12 : -1);
                            if (iDatePart >= 1 && iDatePart <= 12 && vMeriOffset !== -1) {
                                out.hour = iDatePart % 12 === 0 ? vMeriOffset : iDatePart + vMeriOffset;
                            } else {
                                if (iDatePart >= 0 && iDatePart <= 23) {
                                    out.hour = iDatePart;
                                }
                            }
                        } else {
                            if (iDatePart >= 0 && iDatePart <= 23) {
                                out.hour = iDatePart;
                            } else {
                                return null;
                            }
                        }
                        vTimeFlag = true;
                        break;
                    case 'G':
                    case 'H':
                        if (iDatePart >= 0 && iDatePart <= 23) {
                            out.hour = iDatePart;
                        } else {
                            return null;
                        }
                        vTimeFlag = true;
                        break;
                    case 'i':
                        if (iDatePart >= 0 && iDatePart <= 59) {
                            out.min = iDatePart;
                        } else {
                            return null;
                        }
                        vTimeFlag = true;
                        break;
                    case 's':
                        if (iDatePart >= 0 && iDatePart <= 59) {
                            out.sec = iDatePart;
                        } else {
                            return null;
                        }
                        vTimeFlag = true;
                        break;
                }
            }
            if (vDateFlag === true) {
                var varY = out.year || 0, varM = out.month ? out.month - 1 : 0, varD = out.day || 1;
                out.date = new Date(varY, varM, varD, out.hour, out.min, out.sec, 0);
            } else {
                if (vTimeFlag !== true) {
                    return null;
                }
                out.date = new Date(0, 0, 0, out.hour, out.min, out.sec, 0);
            }
            return out.date;
        },
        guessDate: function (vDateStr, vFormat) {
            if (typeof vDateStr !== 'string') {
                return vDateStr;
            }
            var self = this, vParts = vDateStr.replace(self.separators, '\0').split('\0'), vPattern = /^[djmn]/g, len,
                vFormatParts = vFormat.match(self.validParts), vDate = new Date(), vDigit = 0, vYear, i, n, iPart, iSec;

            if (!vPattern.test(vFormatParts[0])) {
                return vDateStr;
            }

            for (i = 0; i < vParts.length; i++) {
                vDigit = 2;
                iPart = vParts[i];
                iSec = $h.getInt(iPart.substr(0, 2));
                if (isNaN(iSec)) {
                    return null;
                }
                switch (i) {
                    case 0:
                        if (vFormatParts[0] === 'm' || vFormatParts[0] === 'n') {
                            vDate.setMonth(iSec - 1);
                        } else {
                            vDate.setDate(iSec);
                        }
                        break;
                    case 1:
                        if (vFormatParts[0] === 'm' || vFormatParts[0] === 'n') {
                            vDate.setDate(iSec);
                        } else {
                            vDate.setMonth(iSec - 1);
                        }
                        break;
                    case 2:
                        vYear = vDate.getFullYear();
                        len = iPart.length;
                        vDigit = len < 4 ? len : 4;
                        vYear = $h.getInt(len < 4 ? vYear.toString().substr(0, 4 - len) + iPart : iPart.substr(0, 4));
                        if (!vYear) {
                            return null;
                        }
                        vDate.setFullYear(vYear);
                        break;
                    case 3:
                        vDate.setHours(iSec);
                        break;
                    case 4:
                        vDate.setMinutes(iSec);
                        break;
                    case 5:
                        vDate.setSeconds(iSec);
                        break;
                }
                n = iPart.substr(vDigit);
                if (n.length > 0) {
                    vParts.splice(i + 1, 0, n);
                }
            }
            return vDate;
        },
        parseFormat: function (vChar, vDate) {
            var self = this, vSettings = self.dateSettings, fmt, backslash = /\\?(.?)/gi, doFormat = function (t, s) {
                return fmt[t] ? fmt[t]() : s;
            };
            fmt = {
                /////////
                // DAY //
                /////////
                /**
                 * Day of month with leading 0: `01..31`
                 * @return {string}
                 */
                d: function () {
                    return $h.lpad(fmt.j(), 2);
                },
                /**
                 * Shorthand day name: `Mon...Sun`
                 * @return {string}
                 */
                D: function () {
                    return vSettings.daysShort[fmt.w()];
                },
                /**
                 * Day of month: `1..31`
                 * @return {number}
                 */
                j: function () {
                    return vDate.getDate();
                },
                /**
                 * Full day name: `Monday...Sunday`
                 * @return {string}
                 */
                l: function () {
                    return vSettings.days[fmt.w()];
                },
                /**
                 * ISO-8601 day of week: `1[Mon]..7[Sun]`
                 * @return {number}
                 */
                N: function () {
                    return fmt.w() || 7;
                },
                /**
                 * Day of week: `0[Sun]..6[Sat]`
                 * @return {number}
                 */
                w: function () {
                    return vDate.getDay();
                },
                /**
                 * Day of year: `0..365`
                 * @return {number}
                 */
                z: function () {
                    var a = new Date(fmt.Y(), fmt.n() - 1, fmt.j()), b = new Date(fmt.Y(), 0, 1);
                    return Math.round((a - b) / $h.DAY);
                },

                //////////
                // WEEK //
                //////////
                /**
                 * ISO-8601 week number
                 * @return {number}
                 */
                W: function () {
                    var a = new Date(fmt.Y(), fmt.n() - 1, fmt.j() - fmt.N() + 3), b = new Date(a.getFullYear(), 0, 4);
                    return $h.lpad(1 + Math.round((a - b) / $h.DAY / 7), 2);
                },

                ///////////
                // MONTH //
                ///////////
                /**
                 * Full month name: `January...December`
                 * @return {string}
                 */
                F: function () {
                    return vSettings.months[vDate.getMonth()];
                },
                /**
                 * Month w/leading 0: `01..12`
                 * @return {string}
                 */
                m: function () {
                    return $h.lpad(fmt.n(), 2);
                },
                /**
                 * Shorthand month name; `Jan...Dec`
                 * @return {string}
                 */
                M: function () {
                    return vSettings.monthsShort[vDate.getMonth()];
                },
                /**
                 * Month: `1...12`
                 * @return {number}
                 */
                n: function () {
                    return vDate.getMonth() + 1;
                },
                /**
                 * Days in month: `28...31`
                 * @return {number}
                 */
                t: function () {
                    return (new Date(fmt.Y(), fmt.n(), 0)).getDate();
                },

                //////////
                // YEAR //
                //////////
                /**
                 * Is leap year? `0 or 1`
                 * @return {number}
                 */
                L: function () {
                    var Y = fmt.Y();
                    return (Y % 4 === 0 && Y % 100 !== 0 || Y % 400 === 0) ? 1 : 0;
                },
                /**
                 * ISO-8601 year
                 * @return {number}
                 */
                o: function () {
                    var n = fmt.n(), W = fmt.W(), Y = fmt.Y();
                    return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
                },
                /**
                 * Full year: `e.g. 1980...2010`
                 * @return {number}
                 */
                Y: function () {
                    return vDate.getFullYear();
                },
                /**
                 * Last two digits of year: `00...99`
                 * @return {string}
                 */
                y: function () {
                    return fmt.Y().toString().slice(-2);
                },

                //////////
                // TIME //
                //////////
                /**
                 * Meridian lower: `am or pm`
                 * @return {string}
                 */
                a: function () {
                    return fmt.A().toLowerCase();
                },
                /**
                 * Meridian upper: `AM or PM`
                 * @return {string}
                 */
                A: function () {
                    var n = fmt.G() < 12 ? 0 : 1;
                    return vSettings.meridiem[n];
                },
                /**
                 * Swatch Internet time: `000..999`
                 * @return {string}
                 */
                B: function () {
                    var H = vDate.getUTCHours() * $h.HOUR, i = vDate.getUTCMinutes() * 60, s = vDate.getUTCSeconds();
                    return $h.lpad(Math.floor((H + i + s + $h.HOUR) / 86.4) % 1000, 3);
                },
                /**
                 * 12-Hours: `1..12`
                 * @return {number}
                 */
                g: function () {
                    return fmt.G() % 12 || 12;
                },
                /**
                 * 24-Hours: `0..23`
                 * @return {number}
                 */
                G: function () {
                    return vDate.getHours();
                },
                /**
                 * 12-Hours with leading 0: `01..12`
                 * @return {string}
                 */
                h: function () {
                    return $h.lpad(fmt.g(), 2);
                },
                /**
                 * 24-Hours w/leading 0: `00..23`
                 * @return {string}
                 */
                H: function () {
                    return $h.lpad(fmt.G(), 2);
                },
                /**
                 * Minutes w/leading 0: `00..59`
                 * @return {string}
                 */
                i: function () {
                    return $h.lpad(vDate.getMinutes(), 2);
                },
                /**
                 * Seconds w/leading 0: `00..59`
                 * @return {string}
                 */
                s: function () {
                    return $h.lpad(vDate.getSeconds(), 2);
                },
                /**
                 * Microseconds: `000000-999000`
                 * @return {string}
                 */
                u: function () {
                    return $h.lpad(vDate.getMilliseconds() * 1000, 6);
                },

                //////////////
                // TIMEZONE //
                //////////////
                /**
                 * Timezone identifier: `e.g. Atlantic/Azores, ...`
                 * @return {string}
                 */
                e: function () {
                    var str = /\((.*)\)/.exec(String(vDate))[1];
                    return str || 'Coordinated Universal Time';
                },
                /**
                 * DST observed? `0 or 1`
                 * @return {number}
                 */
                I: function () {
                    var a = new Date(fmt.Y(), 0), c = Date.UTC(fmt.Y(), 0),
                        b = new Date(fmt.Y(), 6), d = Date.UTC(fmt.Y(), 6);
                    return ((a - c) !== (b - d)) ? 1 : 0;
                },
                /**
                 * Difference to GMT in hour format: `e.g. +0200`
                 * @return {string}
                 */
                O: function () {
                    var tzo = vDate.getTimezoneOffset(), a = Math.abs(tzo);
                    return (tzo > 0 ? '-' : '+') + $h.lpad(Math.floor(a / 60) * 100 + a % 60, 4);
                },
                /**
                 * Difference to GMT with colon: `e.g. +02:00`
                 * @return {string}
                 */
                P: function () {
                    var O = fmt.O();
                    return (O.substr(0, 3) + ':' + O.substr(3, 2));
                },
                /**
                 * Timezone abbreviation: `e.g. EST, MDT, ...`
                 * @return {string}
                 */
                T: function () {
                    var str = (String(vDate).match(self.tzParts) || ['']).pop().replace(self.tzClip, '');
                    return str || 'UTC';
                },
                /**
                 * Timezone offset in seconds: `-43200...50400`
                 * @return {number}
                 */
                Z: function () {
                    return -vDate.getTimezoneOffset() * 60;
                },

                ////////////////////
                // FULL DATE TIME //
                ////////////////////
                /**
                 * ISO-8601 date
                 * @return {string}
                 */
                c: function () {
                    return 'Y-m-d\\TH:i:sP'.replace(backslash, doFormat);
                },
                /**
                 * RFC 2822 date
                 * @return {string}
                 */
                r: function () {
                    return 'D, d M Y H:i:s O'.replace(backslash, doFormat);
                },
                /**
                 * Seconds since UNIX epoch
                 * @return {number}
                 */
                U: function () {
                    return vDate.getTime() / 1000 || 0;
                }
            };
            return doFormat(vChar, vChar);
        },
        formatDate: function (vDate, vFormat) {
            var self = this, i, n, len, str, vChar, vDateStr = '', BACKSLASH = '\\';
            if (typeof vDate === 'string') {
                vDate = self.parseDate(vDate, vFormat);
                if (!vDate) {
                    return null;
                }
            }
            if (vDate instanceof Date) {
                len = vFormat.length;
                for (i = 0; i < len; i++) {
                    vChar = vFormat.charAt(i);
                    if (vChar === 'S' || vChar === BACKSLASH) {
                        continue;
                    }
                    if (i > 0 && vFormat.charAt(i - 1) === BACKSLASH) {
                        vDateStr += vChar;
                        continue;
                    }
                    str = self.parseFormat(vChar, vDate);
                    if (i !== (len - 1) && self.intParts.test(vChar) && vFormat.charAt(i + 1) === 'S') {
                        n = $h.getInt(str) || 0;
                        str += self.dateSettings.ordinal(n);
                    }
                    vDateStr += str;
                }
                return vDateStr;
            }
            return '';
        }
    };
    return DateFormatter;
}));
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

/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/locutus/php/array/array_diff.js":
/*!******************************************************!*\
  !*** ./node_modules/locutus/php/array/array_diff.js ***!
  \******************************************************/
/***/ (function(module) {



module.exports = function array_diff(arr1) {
  // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/array_diff/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Sanjoy Roy
  //  revised by: Brett Zamir (https://brett-zamir.me)
  //   example 1: array_diff(['Kevin', 'van', 'Zonneveld'], ['van', 'Zonneveld'])
  //   returns 1: {0:'Kevin'}

  var retArr = {};
  var argl = arguments.length;
  var k1 = '';
  var i = 1;
  var k = '';
  var arr = {};

  arr1keys: for (k1 in arr1) {
    // eslint-disable-line no-labels
    for (i = 1; i < argl; i++) {
      arr = arguments[i];
      for (k in arr) {
        if (arr[k] === arr1[k1]) {
          // If it reaches here, it was found in at least one array, so try next value
          continue arr1keys; // eslint-disable-line no-labels
        }
      }
      retArr[k1] = arr1[k1];
    }
  }

  return retArr;
};
//# sourceMappingURL=array_diff.js.map

/***/ }),

/***/ "./node_modules/locutus/php/datetime/strtotime.js":
/*!********************************************************!*\
  !*** ./node_modules/locutus/php/datetime/strtotime.js ***!
  \********************************************************/
/***/ (function(module) {



var reSpace = '[ \\t]+';
var reSpaceOpt = '[ \\t]*';
var reMeridian = '(?:([ap])\\.?m\\.?([\\t ]|$))';
var reHour24 = '(2[0-4]|[01]?[0-9])';
var reHour24lz = '([01][0-9]|2[0-4])';
var reHour12 = '(0?[1-9]|1[0-2])';
var reMinute = '([0-5]?[0-9])';
var reMinutelz = '([0-5][0-9])';
var reSecond = '(60|[0-5]?[0-9])';
var reSecondlz = '(60|[0-5][0-9])';
var reFrac = '(?:\\.([0-9]+))';

var reDayfull = 'sunday|monday|tuesday|wednesday|thursday|friday|saturday';
var reDayabbr = 'sun|mon|tue|wed|thu|fri|sat';
var reDaytext = reDayfull + '|' + reDayabbr + '|weekdays?';

var reReltextnumber = 'first|second|third|fourth|fifth|sixth|seventh|eighth?|ninth|tenth|eleventh|twelfth';
var reReltexttext = 'next|last|previous|this';
var reReltextunit = '(?:second|sec|minute|min|hour|day|fortnight|forthnight|month|year)s?|weeks|' + reDaytext;

var reYear = '([0-9]{1,4})';
var reYear2 = '([0-9]{2})';
var reYear4 = '([0-9]{4})';
var reYear4withSign = '([+-]?[0-9]{4})';
var reMonth = '(1[0-2]|0?[0-9])';
var reMonthlz = '(0[0-9]|1[0-2])';
var reDay = '(?:(3[01]|[0-2]?[0-9])(?:st|nd|rd|th)?)';
var reDaylz = '(0[0-9]|[1-2][0-9]|3[01])';

var reMonthFull = 'january|february|march|april|may|june|july|august|september|october|november|december';
var reMonthAbbr = 'jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec';
var reMonthroman = 'i[vx]|vi{0,3}|xi{0,2}|i{1,3}';
var reMonthText = '(' + reMonthFull + '|' + reMonthAbbr + '|' + reMonthroman + ')';

var reTzCorrection = '((?:GMT)?([+-])' + reHour24 + ':?' + reMinute + '?)';
var reTzAbbr = '\\(?([a-zA-Z]{1,6})\\)?';
var reDayOfYear = '(00[1-9]|0[1-9][0-9]|[12][0-9][0-9]|3[0-5][0-9]|36[0-6])';
var reWeekOfYear = '(0[1-9]|[1-4][0-9]|5[0-3])';

var reDateNoYear = reMonthText + '[ .\\t-]*' + reDay + '[,.stndrh\\t ]*';

function processMeridian(hour, meridian) {
  meridian = meridian && meridian.toLowerCase();

  switch (meridian) {
    case 'a':
      hour += hour === 12 ? -12 : 0;
      break;
    case 'p':
      hour += hour !== 12 ? 12 : 0;
      break;
  }

  return hour;
}

function processYear(yearStr) {
  var year = +yearStr;

  if (yearStr.length < 4 && year < 100) {
    year += year < 70 ? 2000 : 1900;
  }

  return year;
}

function lookupMonth(monthStr) {
  return {
    jan: 0,
    january: 0,
    i: 0,
    feb: 1,
    february: 1,
    ii: 1,
    mar: 2,
    march: 2,
    iii: 2,
    apr: 3,
    april: 3,
    iv: 3,
    may: 4,
    v: 4,
    jun: 5,
    june: 5,
    vi: 5,
    jul: 6,
    july: 6,
    vii: 6,
    aug: 7,
    august: 7,
    viii: 7,
    sep: 8,
    sept: 8,
    september: 8,
    ix: 8,
    oct: 9,
    october: 9,
    x: 9,
    nov: 10,
    november: 10,
    xi: 10,
    dec: 11,
    december: 11,
    xii: 11
  }[monthStr.toLowerCase()];
}

function lookupWeekday(dayStr) {
  var desiredSundayNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  var dayNumbers = {
    mon: 1,
    monday: 1,
    tue: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
    sun: 0,
    sunday: 0
  };

  return dayNumbers[dayStr.toLowerCase()] || desiredSundayNumber;
}

function lookupRelative(relText) {
  var relativeNumbers = {
    last: -1,
    previous: -1,
    this: 0,
    first: 1,
    next: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eight: 8,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12
  };

  var relativeBehavior = {
    this: 1
  };

  var relTextLower = relText.toLowerCase();

  return {
    amount: relativeNumbers[relTextLower],
    behavior: relativeBehavior[relTextLower] || 0
  };
}

function processTzCorrection(tzOffset, oldValue) {
  var reTzCorrectionLoose = /(?:GMT)?([+-])(\d+)(:?)(\d{0,2})/i;
  tzOffset = tzOffset && tzOffset.match(reTzCorrectionLoose);

  if (!tzOffset) {
    return oldValue;
  }

  var sign = tzOffset[1] === '-' ? -1 : 1;
  var hours = +tzOffset[2];
  var minutes = +tzOffset[4];

  if (!tzOffset[4] && !tzOffset[3]) {
    minutes = Math.floor(hours % 100);
    hours = Math.floor(hours / 100);
  }

  // timezone offset in seconds
  return sign * (hours * 60 + minutes) * 60;
}

// tz abbrevation : tz offset in seconds
var tzAbbrOffsets = {
  acdt: 37800,
  acst: 34200,
  addt: -7200,
  adt: -10800,
  aedt: 39600,
  aest: 36000,
  ahdt: -32400,
  ahst: -36000,
  akdt: -28800,
  akst: -32400,
  amt: -13840,
  apt: -10800,
  ast: -14400,
  awdt: 32400,
  awst: 28800,
  awt: -10800,
  bdst: 7200,
  bdt: -36000,
  bmt: -14309,
  bst: 3600,
  cast: 34200,
  cat: 7200,
  cddt: -14400,
  cdt: -18000,
  cemt: 10800,
  cest: 7200,
  cet: 3600,
  cmt: -15408,
  cpt: -18000,
  cst: -21600,
  cwt: -18000,
  chst: 36000,
  dmt: -1521,
  eat: 10800,
  eddt: -10800,
  edt: -14400,
  eest: 10800,
  eet: 7200,
  emt: -26248,
  ept: -14400,
  est: -18000,
  ewt: -14400,
  ffmt: -14660,
  fmt: -4056,
  gdt: 39600,
  gmt: 0,
  gst: 36000,
  hdt: -34200,
  hkst: 32400,
  hkt: 28800,
  hmt: -19776,
  hpt: -34200,
  hst: -36000,
  hwt: -34200,
  iddt: 14400,
  idt: 10800,
  imt: 25025,
  ist: 7200,
  jdt: 36000,
  jmt: 8440,
  jst: 32400,
  kdt: 36000,
  kmt: 5736,
  kst: 30600,
  lst: 9394,
  mddt: -18000,
  mdst: 16279,
  mdt: -21600,
  mest: 7200,
  met: 3600,
  mmt: 9017,
  mpt: -21600,
  msd: 14400,
  msk: 10800,
  mst: -25200,
  mwt: -21600,
  nddt: -5400,
  ndt: -9052,
  npt: -9000,
  nst: -12600,
  nwt: -9000,
  nzdt: 46800,
  nzmt: 41400,
  nzst: 43200,
  pddt: -21600,
  pdt: -25200,
  pkst: 21600,
  pkt: 18000,
  plmt: 25590,
  pmt: -13236,
  ppmt: -17340,
  ppt: -25200,
  pst: -28800,
  pwt: -25200,
  qmt: -18840,
  rmt: 5794,
  sast: 7200,
  sdmt: -16800,
  sjmt: -20173,
  smt: -13884,
  sst: -39600,
  tbmt: 10751,
  tmt: 12344,
  uct: 0,
  utc: 0,
  wast: 7200,
  wat: 3600,
  wemt: 7200,
  west: 3600,
  wet: 0,
  wib: 25200,
  wita: 28800,
  wit: 32400,
  wmt: 5040,
  yddt: -25200,
  ydt: -28800,
  ypt: -28800,
  yst: -32400,
  ywt: -28800,
  a: 3600,
  b: 7200,
  c: 10800,
  d: 14400,
  e: 18000,
  f: 21600,
  g: 25200,
  h: 28800,
  i: 32400,
  k: 36000,
  l: 39600,
  m: 43200,
  n: -3600,
  o: -7200,
  p: -10800,
  q: -14400,
  r: -18000,
  s: -21600,
  t: -25200,
  u: -28800,
  v: -32400,
  w: -36000,
  x: -39600,
  y: -43200,
  z: 0
};

var formats = {
  yesterday: {
    regex: /^yesterday/i,
    name: 'yesterday',
    callback: function callback() {
      this.rd -= 1;
      return this.resetTime();
    }
  },

  now: {
    regex: /^now/i,
    name: 'now'
    // do nothing
  },

  noon: {
    regex: /^noon/i,
    name: 'noon',
    callback: function callback() {
      return this.resetTime() && this.time(12, 0, 0, 0);
    }
  },

  midnightOrToday: {
    regex: /^(midnight|today)/i,
    name: 'midnight | today',
    callback: function callback() {
      return this.resetTime();
    }
  },

  tomorrow: {
    regex: /^tomorrow/i,
    name: 'tomorrow',
    callback: function callback() {
      this.rd += 1;
      return this.resetTime();
    }
  },

  timestamp: {
    regex: /^@(-?\d+)/i,
    name: 'timestamp',
    callback: function callback(match, timestamp) {
      this.rs += +timestamp;
      this.y = 1970;
      this.m = 0;
      this.d = 1;
      this.dates = 0;

      return this.resetTime() && this.zone(0);
    }
  },

  firstOrLastDay: {
    regex: /^(first|last) day of/i,
    name: 'firstdayof | lastdayof',
    callback: function callback(match, day) {
      if (day.toLowerCase() === 'first') {
        this.firstOrLastDayOfMonth = 1;
      } else {
        this.firstOrLastDayOfMonth = -1;
      }
    }
  },

  backOrFrontOf: {
    regex: RegExp('^(back|front) of ' + reHour24 + reSpaceOpt + reMeridian + '?', 'i'),
    name: 'backof | frontof',
    callback: function callback(match, side, hours, meridian) {
      var back = side.toLowerCase() === 'back';
      var hour = +hours;
      var minute = 15;

      if (!back) {
        hour -= 1;
        minute = 45;
      }

      hour = processMeridian(hour, meridian);

      return this.resetTime() && this.time(hour, minute, 0, 0);
    }
  },

  weekdayOf: {
    regex: RegExp('^(' + reReltextnumber + '|' + reReltexttext + ')' + reSpace + '(' + reDayfull + '|' + reDayabbr + ')' + reSpace + 'of', 'i'),
    name: 'weekdayof'
    // todo
  },

  mssqltime: {
    regex: RegExp('^' + reHour12 + ':' + reMinutelz + ':' + reSecondlz + '[:.]([0-9]+)' + reMeridian, 'i'),
    name: 'mssqltime',
    callback: function callback(match, hour, minute, second, frac, meridian) {
      return this.time(processMeridian(+hour, meridian), +minute, +second, +frac.substr(0, 3));
    }
  },

  timeLong12: {
    regex: RegExp('^' + reHour12 + '[:.]' + reMinute + '[:.]' + reSecondlz + reSpaceOpt + reMeridian, 'i'),
    name: 'timelong12',
    callback: function callback(match, hour, minute, second, meridian) {
      return this.time(processMeridian(+hour, meridian), +minute, +second, 0);
    }
  },

  timeShort12: {
    regex: RegExp('^' + reHour12 + '[:.]' + reMinutelz + reSpaceOpt + reMeridian, 'i'),
    name: 'timeshort12',
    callback: function callback(match, hour, minute, meridian) {
      return this.time(processMeridian(+hour, meridian), +minute, 0, 0);
    }
  },

  timeTiny12: {
    regex: RegExp('^' + reHour12 + reSpaceOpt + reMeridian, 'i'),
    name: 'timetiny12',
    callback: function callback(match, hour, meridian) {
      return this.time(processMeridian(+hour, meridian), 0, 0, 0);
    }
  },

  soap: {
    regex: RegExp('^' + reYear4 + '-' + reMonthlz + '-' + reDaylz + 'T' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz + reFrac + reTzCorrection + '?', 'i'),
    name: 'soap',
    callback: function callback(match, year, month, day, hour, minute, second, frac, tzCorrection) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, +frac.substr(0, 3)) && this.zone(processTzCorrection(tzCorrection));
    }
  },

  wddx: {
    regex: RegExp('^' + reYear4 + '-' + reMonth + '-' + reDay + 'T' + reHour24 + ':' + reMinute + ':' + reSecond),
    name: 'wddx',
    callback: function callback(match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
    }
  },

  exif: {
    regex: RegExp('^' + reYear4 + ':' + reMonthlz + ':' + reDaylz + ' ' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz, 'i'),
    name: 'exif',
    callback: function callback(match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
    }
  },

  xmlRpc: {
    regex: RegExp('^' + reYear4 + reMonthlz + reDaylz + 'T' + reHour24 + ':' + reMinutelz + ':' + reSecondlz),
    name: 'xmlrpc',
    callback: function callback(match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
    }
  },

  xmlRpcNoColon: {
    regex: RegExp('^' + reYear4 + reMonthlz + reDaylz + '[Tt]' + reHour24 + reMinutelz + reSecondlz),
    name: 'xmlrpcnocolon',
    callback: function callback(match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0);
    }
  },

  clf: {
    regex: RegExp('^' + reDay + '/(' + reMonthAbbr + ')/' + reYear4 + ':' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz + reSpace + reTzCorrection, 'i'),
    name: 'clf',
    callback: function callback(match, day, month, year, hour, minute, second, tzCorrection) {
      return this.ymd(+year, lookupMonth(month), +day) && this.time(+hour, +minute, +second, 0) && this.zone(processTzCorrection(tzCorrection));
    }
  },

  iso8601long: {
    regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond + reFrac, 'i'),
    name: 'iso8601long',
    callback: function callback(match, hour, minute, second, frac) {
      return this.time(+hour, +minute, +second, +frac.substr(0, 3));
    }
  },

  dateTextual: {
    regex: RegExp('^' + reMonthText + '[ .\\t-]*' + reDay + '[,.stndrh\\t ]+' + reYear, 'i'),
    name: 'datetextual',
    callback: function callback(match, month, day, year) {
      return this.ymd(processYear(year), lookupMonth(month), +day);
    }
  },

  pointedDate4: {
    regex: RegExp('^' + reDay + '[.\\t-]' + reMonth + '[.-]' + reYear4),
    name: 'pointeddate4',
    callback: function callback(match, day, month, year) {
      return this.ymd(+year, month - 1, +day);
    }
  },

  pointedDate2: {
    regex: RegExp('^' + reDay + '[.\\t]' + reMonth + '\\.' + reYear2),
    name: 'pointeddate2',
    callback: function callback(match, day, month, year) {
      return this.ymd(processYear(year), month - 1, +day);
    }
  },

  timeLong24: {
    regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond),
    name: 'timelong24',
    callback: function callback(match, hour, minute, second) {
      return this.time(+hour, +minute, +second, 0);
    }
  },

  dateNoColon: {
    regex: RegExp('^' + reYear4 + reMonthlz + reDaylz),
    name: 'datenocolon',
    callback: function callback(match, year, month, day) {
      return this.ymd(+year, month - 1, +day);
    }
  },

  pgydotd: {
    regex: RegExp('^' + reYear4 + '\\.?' + reDayOfYear),
    name: 'pgydotd',
    callback: function callback(match, year, day) {
      return this.ymd(+year, 0, +day);
    }
  },

  timeShort24: {
    regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute, 'i'),
    name: 'timeshort24',
    callback: function callback(match, hour, minute) {
      return this.time(+hour, +minute, 0, 0);
    }
  },

  iso8601noColon: {
    regex: RegExp('^t?' + reHour24lz + reMinutelz + reSecondlz, 'i'),
    name: 'iso8601nocolon',
    callback: function callback(match, hour, minute, second) {
      return this.time(+hour, +minute, +second, 0);
    }
  },

  iso8601dateSlash: {
    // eventhough the trailing slash is optional in PHP
    // here it's mandatory and inputs without the slash
    // are handled by dateslash
    regex: RegExp('^' + reYear4 + '/' + reMonthlz + '/' + reDaylz + '/'),
    name: 'iso8601dateslash',
    callback: function callback(match, year, month, day) {
      return this.ymd(+year, month - 1, +day);
    }
  },

  dateSlash: {
    regex: RegExp('^' + reYear4 + '/' + reMonth + '/' + reDay),
    name: 'dateslash',
    callback: function callback(match, year, month, day) {
      return this.ymd(+year, month - 1, +day);
    }
  },

  american: {
    regex: RegExp('^' + reMonth + '/' + reDay + '/' + reYear),
    name: 'american',
    callback: function callback(match, month, day, year) {
      return this.ymd(processYear(year), month - 1, +day);
    }
  },

  americanShort: {
    regex: RegExp('^' + reMonth + '/' + reDay),
    name: 'americanshort',
    callback: function callback(match, month, day) {
      return this.ymd(this.y, month - 1, +day);
    }
  },

  gnuDateShortOrIso8601date2: {
    // iso8601date2 is complete subset of gnudateshort
    regex: RegExp('^' + reYear + '-' + reMonth + '-' + reDay),
    name: 'gnudateshort | iso8601date2',
    callback: function callback(match, year, month, day) {
      return this.ymd(processYear(year), month - 1, +day);
    }
  },

  iso8601date4: {
    regex: RegExp('^' + reYear4withSign + '-' + reMonthlz + '-' + reDaylz),
    name: 'iso8601date4',
    callback: function callback(match, year, month, day) {
      return this.ymd(+year, month - 1, +day);
    }
  },

  gnuNoColon: {
    regex: RegExp('^t?' + reHour24lz + reMinutelz, 'i'),
    name: 'gnunocolon',
    callback: function callback(match, hour, minute) {
      // this rule is a special case
      // if time was already set once by any preceding rule, it sets the captured value as year
      switch (this.times) {
        case 0:
          return this.time(+hour, +minute, 0, this.f);
        case 1:
          this.y = hour * 100 + +minute;
          this.times++;

          return true;
        default:
          return false;
      }
    }
  },

  gnuDateShorter: {
    regex: RegExp('^' + reYear4 + '-' + reMonth),
    name: 'gnudateshorter',
    callback: function callback(match, year, month) {
      return this.ymd(+year, month - 1, 1);
    }
  },

  pgTextReverse: {
    // note: allowed years are from 32-9999
    // years below 32 should be treated as days in datefull
    regex: RegExp('^' + '(\\d{3,4}|[4-9]\\d|3[2-9])-(' + reMonthAbbr + ')-' + reDaylz, 'i'),
    name: 'pgtextreverse',
    callback: function callback(match, year, month, day) {
      return this.ymd(processYear(year), lookupMonth(month), +day);
    }
  },

  dateFull: {
    regex: RegExp('^' + reDay + '[ \\t.-]*' + reMonthText + '[ \\t.-]*' + reYear, 'i'),
    name: 'datefull',
    callback: function callback(match, day, month, year) {
      return this.ymd(processYear(year), lookupMonth(month), +day);
    }
  },

  dateNoDay: {
    regex: RegExp('^' + reMonthText + '[ .\\t-]*' + reYear4, 'i'),
    name: 'datenoday',
    callback: function callback(match, month, year) {
      return this.ymd(+year, lookupMonth(month), 1);
    }
  },

  dateNoDayRev: {
    regex: RegExp('^' + reYear4 + '[ .\\t-]*' + reMonthText, 'i'),
    name: 'datenodayrev',
    callback: function callback(match, year, month) {
      return this.ymd(+year, lookupMonth(month), 1);
    }
  },

  pgTextShort: {
    regex: RegExp('^(' + reMonthAbbr + ')-' + reDaylz + '-' + reYear, 'i'),
    name: 'pgtextshort',
    callback: function callback(match, month, day, year) {
      return this.ymd(processYear(year), lookupMonth(month), +day);
    }
  },

  dateNoYear: {
    regex: RegExp('^' + reDateNoYear, 'i'),
    name: 'datenoyear',
    callback: function callback(match, month, day) {
      return this.ymd(this.y, lookupMonth(month), +day);
    }
  },

  dateNoYearRev: {
    regex: RegExp('^' + reDay + '[ .\\t-]*' + reMonthText, 'i'),
    name: 'datenoyearrev',
    callback: function callback(match, day, month) {
      return this.ymd(this.y, lookupMonth(month), +day);
    }
  },

  isoWeekDay: {
    regex: RegExp('^' + reYear4 + '-?W' + reWeekOfYear + '(?:-?([0-7]))?'),
    name: 'isoweekday | isoweek',
    callback: function callback(match, year, week, day) {
      day = day ? +day : 1;

      if (!this.ymd(+year, 0, 1)) {
        return false;
      }

      // get day of week for Jan 1st
      var dayOfWeek = new Date(this.y, this.m, this.d).getDay();

      // and use the day to figure out the offset for day 1 of week 1
      dayOfWeek = 0 - (dayOfWeek > 4 ? dayOfWeek - 7 : dayOfWeek);

      this.rd += dayOfWeek + (week - 1) * 7 + day;
    }
  },

  relativeText: {
    regex: RegExp('^(' + reReltextnumber + '|' + reReltexttext + ')' + reSpace + '(' + reReltextunit + ')', 'i'),
    name: 'relativetext',
    callback: function callback(match, relValue, relUnit) {
      // todo: implement handling of 'this time-unit'
      // eslint-disable-next-line no-unused-vars
      var _lookupRelative = lookupRelative(relValue),
          amount = _lookupRelative.amount,
          behavior = _lookupRelative.behavior;

      switch (relUnit.toLowerCase()) {
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
          this.rs += amount;
          break;
        case 'min':
        case 'mins':
        case 'minute':
        case 'minutes':
          this.ri += amount;
          break;
        case 'hour':
        case 'hours':
          this.rh += amount;
          break;
        case 'day':
        case 'days':
          this.rd += amount;
          break;
        case 'fortnight':
        case 'fortnights':
        case 'forthnight':
        case 'forthnights':
          this.rd += amount * 14;
          break;
        case 'week':
        case 'weeks':
          this.rd += amount * 7;
          break;
        case 'month':
        case 'months':
          this.rm += amount;
          break;
        case 'year':
        case 'years':
          this.ry += amount;
          break;
        case 'mon':case 'monday':
        case 'tue':case 'tuesday':
        case 'wed':case 'wednesday':
        case 'thu':case 'thursday':
        case 'fri':case 'friday':
        case 'sat':case 'saturday':
        case 'sun':case 'sunday':
          this.resetTime();
          this.weekday = lookupWeekday(relUnit, 7);
          this.weekdayBehavior = 1;
          this.rd += (amount > 0 ? amount - 1 : amount) * 7;
          break;
        case 'weekday':
        case 'weekdays':
          // todo
          break;
      }
    }
  },

  relative: {
    regex: RegExp('^([+-]*)[ \\t]*(\\d+)' + reSpaceOpt + '(' + reReltextunit + '|week)', 'i'),
    name: 'relative',
    callback: function callback(match, signs, relValue, relUnit) {
      var minuses = signs.replace(/[^-]/g, '').length;

      var amount = +relValue * Math.pow(-1, minuses);

      switch (relUnit.toLowerCase()) {
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
          this.rs += amount;
          break;
        case 'min':
        case 'mins':
        case 'minute':
        case 'minutes':
          this.ri += amount;
          break;
        case 'hour':
        case 'hours':
          this.rh += amount;
          break;
        case 'day':
        case 'days':
          this.rd += amount;
          break;
        case 'fortnight':
        case 'fortnights':
        case 'forthnight':
        case 'forthnights':
          this.rd += amount * 14;
          break;
        case 'week':
        case 'weeks':
          this.rd += amount * 7;
          break;
        case 'month':
        case 'months':
          this.rm += amount;
          break;
        case 'year':
        case 'years':
          this.ry += amount;
          break;
        case 'mon':case 'monday':
        case 'tue':case 'tuesday':
        case 'wed':case 'wednesday':
        case 'thu':case 'thursday':
        case 'fri':case 'friday':
        case 'sat':case 'saturday':
        case 'sun':case 'sunday':
          this.resetTime();
          this.weekday = lookupWeekday(relUnit, 7);
          this.weekdayBehavior = 1;
          this.rd += (amount > 0 ? amount - 1 : amount) * 7;
          break;
        case 'weekday':
        case 'weekdays':
          // todo
          break;
      }
    }
  },

  dayText: {
    regex: RegExp('^(' + reDaytext + ')', 'i'),
    name: 'daytext',
    callback: function callback(match, dayText) {
      this.resetTime();
      this.weekday = lookupWeekday(dayText, 0);

      if (this.weekdayBehavior !== 2) {
        this.weekdayBehavior = 1;
      }
    }
  },

  relativeTextWeek: {
    regex: RegExp('^(' + reReltexttext + ')' + reSpace + 'week', 'i'),
    name: 'relativetextweek',
    callback: function callback(match, relText) {
      this.weekdayBehavior = 2;

      switch (relText.toLowerCase()) {
        case 'this':
          this.rd += 0;
          break;
        case 'next':
          this.rd += 7;
          break;
        case 'last':
        case 'previous':
          this.rd -= 7;
          break;
      }

      if (isNaN(this.weekday)) {
        this.weekday = 1;
      }
    }
  },

  monthFullOrMonthAbbr: {
    regex: RegExp('^(' + reMonthFull + '|' + reMonthAbbr + ')', 'i'),
    name: 'monthfull | monthabbr',
    callback: function callback(match, month) {
      return this.ymd(this.y, lookupMonth(month), this.d);
    }
  },

  tzCorrection: {
    regex: RegExp('^' + reTzCorrection, 'i'),
    name: 'tzcorrection',
    callback: function callback(tzCorrection) {
      return this.zone(processTzCorrection(tzCorrection));
    }
  },

  tzAbbr: {
    regex: RegExp('^' + reTzAbbr),
    name: 'tzabbr',
    callback: function callback(match, abbr) {
      var offset = tzAbbrOffsets[abbr.toLowerCase()];

      if (isNaN(offset)) {
        return false;
      }

      return this.zone(offset);
    }
  },

  ago: {
    regex: /^ago/i,
    name: 'ago',
    callback: function callback() {
      this.ry = -this.ry;
      this.rm = -this.rm;
      this.rd = -this.rd;
      this.rh = -this.rh;
      this.ri = -this.ri;
      this.rs = -this.rs;
      this.rf = -this.rf;
    }
  },

  year4: {
    regex: RegExp('^' + reYear4),
    name: 'year4',
    callback: function callback(match, year) {
      this.y = +year;
      return true;
    }
  },

  whitespace: {
    regex: /^[ .,\t]+/,
    name: 'whitespace'
    // do nothing
  },

  dateShortWithTimeLong: {
    regex: RegExp('^' + reDateNoYear + 't?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond, 'i'),
    name: 'dateshortwithtimelong',
    callback: function callback(match, month, day, hour, minute, second) {
      return this.ymd(this.y, lookupMonth(month), +day) && this.time(+hour, +minute, +second, 0);
    }
  },

  dateShortWithTimeLong12: {
    regex: RegExp('^' + reDateNoYear + reHour12 + '[:.]' + reMinute + '[:.]' + reSecondlz + reSpaceOpt + reMeridian, 'i'),
    name: 'dateshortwithtimelong12',
    callback: function callback(match, month, day, hour, minute, second, meridian) {
      return this.ymd(this.y, lookupMonth(month), +day) && this.time(processMeridian(+hour, meridian), +minute, +second, 0);
    }
  },

  dateShortWithTimeShort: {
    regex: RegExp('^' + reDateNoYear + 't?' + reHour24 + '[:.]' + reMinute, 'i'),
    name: 'dateshortwithtimeshort',
    callback: function callback(match, month, day, hour, minute) {
      return this.ymd(this.y, lookupMonth(month), +day) && this.time(+hour, +minute, 0, 0);
    }
  },

  dateShortWithTimeShort12: {
    regex: RegExp('^' + reDateNoYear + reHour12 + '[:.]' + reMinutelz + reSpaceOpt + reMeridian, 'i'),
    name: 'dateshortwithtimeshort12',
    callback: function callback(match, month, day, hour, minute, meridian) {
      return this.ymd(this.y, lookupMonth(month), +day) && this.time(processMeridian(+hour, meridian), +minute, 0, 0);
    }
  }
};

var resultProto = {
  // date
  y: NaN,
  m: NaN,
  d: NaN,
  // time
  h: NaN,
  i: NaN,
  s: NaN,
  f: NaN,

  // relative shifts
  ry: 0,
  rm: 0,
  rd: 0,
  rh: 0,
  ri: 0,
  rs: 0,
  rf: 0,

  // weekday related shifts
  weekday: NaN,
  weekdayBehavior: 0,

  // first or last day of month
  // 0 none, 1 first, -1 last
  firstOrLastDayOfMonth: 0,

  // timezone correction in minutes
  z: NaN,

  // counters
  dates: 0,
  times: 0,
  zones: 0,

  // helper functions
  ymd: function ymd(y, m, d) {
    if (this.dates > 0) {
      return false;
    }

    this.dates++;
    this.y = y;
    this.m = m;
    this.d = d;
    return true;
  },
  time: function time(h, i, s, f) {
    if (this.times > 0) {
      return false;
    }

    this.times++;
    this.h = h;
    this.i = i;
    this.s = s;
    this.f = f;

    return true;
  },
  resetTime: function resetTime() {
    this.h = 0;
    this.i = 0;
    this.s = 0;
    this.f = 0;
    this.times = 0;

    return true;
  },
  zone: function zone(minutes) {
    if (this.zones <= 1) {
      this.zones++;
      this.z = minutes;
      return true;
    }

    return false;
  },
  toDate: function toDate(relativeTo) {
    if (this.dates && !this.times) {
      this.h = this.i = this.s = this.f = 0;
    }

    // fill holes
    if (isNaN(this.y)) {
      this.y = relativeTo.getFullYear();
    }

    if (isNaN(this.m)) {
      this.m = relativeTo.getMonth();
    }

    if (isNaN(this.d)) {
      this.d = relativeTo.getDate();
    }

    if (isNaN(this.h)) {
      this.h = relativeTo.getHours();
    }

    if (isNaN(this.i)) {
      this.i = relativeTo.getMinutes();
    }

    if (isNaN(this.s)) {
      this.s = relativeTo.getSeconds();
    }

    if (isNaN(this.f)) {
      this.f = relativeTo.getMilliseconds();
    }

    // adjust special early
    switch (this.firstOrLastDayOfMonth) {
      case 1:
        this.d = 1;
        break;
      case -1:
        this.d = 0;
        this.m += 1;
        break;
    }

    if (!isNaN(this.weekday)) {
      var date = new Date(relativeTo.getTime());
      date.setFullYear(this.y, this.m, this.d);
      date.setHours(this.h, this.i, this.s, this.f);

      var dow = date.getDay();

      if (this.weekdayBehavior === 2) {
        // To make "this week" work, where the current day of week is a "sunday"
        if (dow === 0 && this.weekday !== 0) {
          this.weekday = -6;
        }

        // To make "sunday this week" work, where the current day of week is not a "sunday"
        if (this.weekday === 0 && dow !== 0) {
          this.weekday = 7;
        }

        this.d -= dow;
        this.d += this.weekday;
      } else {
        var diff = this.weekday - dow;

        // some PHP magic
        if (this.rd < 0 && diff < 0 || this.rd >= 0 && diff <= -this.weekdayBehavior) {
          diff += 7;
        }

        if (this.weekday >= 0) {
          this.d += diff;
        } else {
          this.d -= 7 - (Math.abs(this.weekday) - dow);
        }

        this.weekday = NaN;
      }
    }

    // adjust relative
    this.y += this.ry;
    this.m += this.rm;
    this.d += this.rd;

    this.h += this.rh;
    this.i += this.ri;
    this.s += this.rs;
    this.f += this.rf;

    this.ry = this.rm = this.rd = 0;
    this.rh = this.ri = this.rs = this.rf = 0;

    var result = new Date(relativeTo.getTime());
    // since Date constructor treats years <= 99 as 1900+
    // it can't be used, thus this weird way
    result.setFullYear(this.y, this.m, this.d);
    result.setHours(this.h, this.i, this.s, this.f);

    // note: this is done twice in PHP
    // early when processing special relatives
    // and late
    // todo: check if the logic can be reduced
    // to just one time action
    switch (this.firstOrLastDayOfMonth) {
      case 1:
        result.setDate(1);
        break;
      case -1:
        result.setMonth(result.getMonth() + 1, 0);
        break;
    }

    // adjust timezone
    if (!isNaN(this.z) && result.getTimezoneOffset() !== this.z) {
      result.setUTCFullYear(result.getFullYear(), result.getMonth(), result.getDate());

      result.setUTCHours(result.getHours(), result.getMinutes(), result.getSeconds() - this.z, result.getMilliseconds());
    }

    return result;
  }
};

module.exports = function strtotime(str, now) {
  //       discuss at: https://locutus.io/php/strtotime/
  //      original by: Caio Ariede (https://caioariede.com)
  //      improved by: Kevin van Zonneveld (https://kvz.io)
  //      improved by: Caio Ariede (https://caioariede.com)
  //      improved by: A. Matías Quezada (https://amatiasq.com)
  //      improved by: preuter
  //      improved by: Brett Zamir (https://brett-zamir.me)
  //      improved by: Mirko Faber
  //         input by: David
  //      bugfixed by: Wagner B. Soares
  //      bugfixed by: Artur Tchernychev
  //      bugfixed by: Stephan Bösch-Plepelits (https://github.com/plepe)
  // reimplemented by: Rafał Kukawski
  //           note 1: Examples all have a fixed timestamp to prevent
  //           note 1: tests to fail because of variable time(zones)
  //        example 1: strtotime('+1 day', 1129633200)
  //        returns 1: 1129719600
  //        example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200)
  //        returns 2: 1130425202
  //        example 3: strtotime('last month', 1129633200)
  //        returns 3: 1127041200
  //        example 4: strtotime('2009-05-04 08:30:00+00')
  //        returns 4: 1241425800
  //        example 5: strtotime('2009-05-04 08:30:00+02:00')
  //        returns 5: 1241418600
  //        example 6: strtotime('2009-05-04 08:30:00 YWT')
  //        returns 6: 1241454600

  if (now == null) {
    now = Math.floor(Date.now() / 1000);
  }

  // the rule order is important
  // if multiple rules match, the longest match wins
  // if multiple rules match the same string, the first match wins
  var rules = [formats.yesterday, formats.now, formats.noon, formats.midnightOrToday, formats.tomorrow, formats.timestamp, formats.firstOrLastDay, formats.backOrFrontOf,
  // formats.weekdayOf, // not yet implemented
  formats.timeTiny12, formats.timeShort12, formats.timeLong12, formats.mssqltime, formats.timeShort24, formats.timeLong24, formats.iso8601long, formats.gnuNoColon, formats.iso8601noColon, formats.americanShort, formats.american, formats.iso8601date4, formats.iso8601dateSlash, formats.dateSlash, formats.gnuDateShortOrIso8601date2, formats.gnuDateShorter, formats.dateFull, formats.pointedDate4, formats.pointedDate2, formats.dateNoDay, formats.dateNoDayRev, formats.dateTextual, formats.dateNoYear, formats.dateNoYearRev, formats.dateNoColon, formats.xmlRpc, formats.xmlRpcNoColon, formats.soap, formats.wddx, formats.exif, formats.pgydotd, formats.isoWeekDay, formats.pgTextShort, formats.pgTextReverse, formats.clf, formats.year4, formats.ago, formats.dayText, formats.relativeTextWeek, formats.relativeText, formats.monthFullOrMonthAbbr, formats.tzCorrection, formats.tzAbbr, formats.dateShortWithTimeShort12, formats.dateShortWithTimeLong12, formats.dateShortWithTimeShort, formats.dateShortWithTimeLong, formats.relative, formats.whitespace];

  var result = Object.create(resultProto);

  while (str.length) {
    var longestMatch = null;
    var finalRule = null;

    for (var i = 0, l = rules.length; i < l; i++) {
      var format = rules[i];

      var match = str.match(format.regex);

      if (match) {
        if (!longestMatch || match[0].length > longestMatch[0].length) {
          longestMatch = match;
          finalRule = format;
        }
      }
    }

    if (!finalRule || finalRule.callback && finalRule.callback.apply(result, longestMatch) === false) {
      return false;
    }

    str = str.substr(longestMatch[0].length);
    finalRule = null;
    longestMatch = null;
  }

  return Math.floor(result.toDate(new Date(now * 1000)) / 1000);
};
//# sourceMappingURL=strtotime.js.map

/***/ }),

/***/ "./node_modules/locutus/php/info/ini_get.js":
/*!**************************************************!*\
  !*** ./node_modules/locutus/php/info/ini_get.js ***!
  \**************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {



module.exports = function ini_get(varname) {
  // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/ini_get/
  // original by: Brett Zamir (https://brett-zamir.me)
  //      note 1: The ini values must be set by ini_set or manually within an ini file
  //   example 1: ini_set('date.timezone', 'Asia/Hong_Kong')
  //   example 1: ini_get('date.timezone')
  //   returns 1: 'Asia/Hong_Kong'

  var $global = typeof window !== 'undefined' ? window : __webpack_require__.g;
  $global.$locutus = $global.$locutus || {};
  var $locutus = $global.$locutus;
  $locutus.php = $locutus.php || {};
  $locutus.php.ini = $locutus.php.ini || {};

  if ($locutus.php.ini[varname] && $locutus.php.ini[varname].local_value !== undefined) {
    if ($locutus.php.ini[varname].local_value === null) {
      return '';
    }
    return $locutus.php.ini[varname].local_value;
  }

  return '';
};
//# sourceMappingURL=ini_get.js.map

/***/ }),

/***/ "./node_modules/locutus/php/strings/strlen.js":
/*!****************************************************!*\
  !*** ./node_modules/locutus/php/strings/strlen.js ***!
  \****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {



module.exports = function strlen(string) {
  //  discuss at: https://locutus.io/php/strlen/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Sakimori
  // improved by: Kevin van Zonneveld (https://kvz.io)
  //    input by: Kirk Strobeck
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  //  revised by: Brett Zamir (https://brett-zamir.me)
  //      note 1: May look like overkill, but in order to be truly faithful to handling all Unicode
  //      note 1: characters and to this function in PHP which does not count the number of bytes
  //      note 1: but counts the number of characters, something like this is really necessary.
  //   example 1: strlen('Kevin van Zonneveld')
  //   returns 1: 19
  //   example 2: ini_set('unicode.semantics', 'on')
  //   example 2: strlen('A\ud87e\udc04Z')
  //   returns 2: 3

  var str = string + '';

  var iniVal = ( true ? __webpack_require__(/*! ../info/ini_get */ "./node_modules/locutus/php/info/ini_get.js")('unicode.semantics') : 0) || 'off';
  if (iniVal === 'off') {
    return str.length;
  }

  var i = 0;
  var lgth = 0;

  var getWholeChar = function getWholeChar(str, i) {
    var code = str.charCodeAt(i);
    var next = '';
    var prev = '';
    if (code >= 0xD800 && code <= 0xDBFF) {
      // High surrogate (could change last hex to 0xDB7F to
      // treat high private surrogates as single characters)
      if (str.length <= i + 1) {
        throw new Error('High surrogate without following low surrogate');
      }
      next = str.charCodeAt(i + 1);
      if (next < 0xDC00 || next > 0xDFFF) {
        throw new Error('High surrogate without following low surrogate');
      }
      return str.charAt(i) + str.charAt(i + 1);
    } else if (code >= 0xDC00 && code <= 0xDFFF) {
      // Low surrogate
      if (i === 0) {
        throw new Error('Low surrogate without preceding high surrogate');
      }
      prev = str.charCodeAt(i - 1);
      if (prev < 0xD800 || prev > 0xDBFF) {
        // (could change last hex to 0xDB7F to treat high private surrogates
        // as single characters)
        throw new Error('Low surrogate without preceding high surrogate');
      }
      // We can pass over low surrogates now as the second
      // component in a pair which we have already processed
      return false;
    }
    return str.charAt(i);
  };

  for (i = 0, lgth = 0; i < str.length; i++) {
    if (getWholeChar(str, i) === false) {
      continue;
    }
    // Adapt this line at the top of any loop, passing in the whole string and
    // the current iteration and returning a variable to represent the individual character;
    // purpose is to treat the first part of a surrogate pair as the whole character and then
    // ignore the second part
    lgth++;
  }

  return lgth;
};
//# sourceMappingURL=strlen.js.map

/***/ }),

/***/ "./node_modules/locutus/php/var/is_numeric.js":
/*!****************************************************!*\
  !*** ./node_modules/locutus/php/var/is_numeric.js ***!
  \****************************************************/
/***/ (function(module) {



module.exports = function is_numeric(mixedVar) {
  // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/is_numeric/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // improved by: David
  // improved by: taith
  // bugfixed by: Tim de Koning
  // bugfixed by: WebDevHobo (https://webdevhobo.blogspot.com/)
  // bugfixed by: Brett Zamir (https://brett-zamir.me)
  // bugfixed by: Denis Chenu (https://shnoulle.net)
  //   example 1: is_numeric(186.31)
  //   returns 1: true
  //   example 2: is_numeric('Kevin van Zonneveld')
  //   returns 2: false
  //   example 3: is_numeric(' +186.31e2')
  //   returns 3: true
  //   example 4: is_numeric('')
  //   returns 4: false
  //   example 5: is_numeric([])
  //   returns 5: false
  //   example 6: is_numeric('1 ')
  //   returns 6: false

  var whitespace = [' ', '\n', '\r', '\t', '\f', '\x0b', '\xa0', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u200B', '\u2028', '\u2029', '\u3000'].join('');

  // @todo: Break this up using many single conditions with early returns
  return (typeof mixedVar === 'number' || typeof mixedVar === 'string' && whitespace.indexOf(mixedVar.slice(-1)) === -1) && mixedVar !== '' && !isNaN(mixedVar);
};
//# sourceMappingURL=is_numeric.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
/*!****************************************!*\
  !*** ./resources/assets/js/helpers.js ***!
  \****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var locutus_php_strings_strlen__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! locutus/php/strings/strlen */ "./node_modules/locutus/php/strings/strlen.js");
/* harmony import */ var locutus_php_strings_strlen__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(locutus_php_strings_strlen__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var locutus_php_array_array_diff__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! locutus/php/array/array_diff */ "./node_modules/locutus/php/array/array_diff.js");
/* harmony import */ var locutus_php_array_array_diff__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(locutus_php_array_array_diff__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var locutus_php_datetime_strtotime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! locutus/php/datetime/strtotime */ "./node_modules/locutus/php/datetime/strtotime.js");
/* harmony import */ var locutus_php_datetime_strtotime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(locutus_php_datetime_strtotime__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var locutus_php_var_is_numeric__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! locutus/php/var/is_numeric */ "./node_modules/locutus/php/var/is_numeric.js");
/* harmony import */ var locutus_php_var_is_numeric__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(locutus_php_var_is_numeric__WEBPACK_IMPORTED_MODULE_3__);
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

      if (fieldObj.files !== null) {
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

      if (!this.isArray(names)) {
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

      $.each(listRules, function (index, objRules) {
        if ('laravelValidation' in objRules) {
          var _rules = objRules.laravelValidation;

          for (var i = 0; i < _rules.length; i++) {
            if ($.inArray(_rules[i][0], rules) !== -1) {
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
      return locutus_php_strings_strlen__WEBPACK_IMPORTED_MODULE_0___default()(string);
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
    getLaravelValidation: function (rule, element) {
      var found = undefined;
      $.each($.validator.staticRules(element), function (key, rules) {
        if (key === "laravelValidation") {
          $.each(rules, function (i, value) {
            if (value[0] === rule) {
              found = value;
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
          timeValue = Math.round(timeValue.getTime() / 1000);
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
      return fmt.guessDate(value, format);
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
      return locutus_php_datetime_strtotime__WEBPACK_IMPORTED_MODULE_2___default()(text, now);
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
      return locutus_php_var_is_numeric__WEBPACK_IMPORTED_MODULE_3___default()(mixed_var);
    },

    /**
     * Check whether the argument is of type Array.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Polyfill
     *
     * @param arg
     * @returns {boolean}
     */
    isArray: function (arg) {
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
      return locutus_php_array_array_diff__WEBPACK_IMPORTED_MODULE_1___default()(arr1, arr2);
    },

    /**
     * Check whether two arrays are equal to one another.
     *
     * @param arr1
     * @param arr2
     * @returns {*}
     */
    arrayEquals: function (arr1, arr2) {
      if (!this.isArray(arr1) || !this.isArray(arr2)) {
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
    dependentElement: function (validator, element, name) {
      var el = validator.findByName(name);

      if (el[0] !== undefined && validator.settings.onfocusout) {
        var event = 'blur';

        if (el[0].tagName === 'SELECT' || el[0].tagName === 'OPTION' || el[0].type === 'checkbox' || el[0].type === 'radio') {
          event = 'click';
        }

        var ruleName = '.validate-laravelValidation';
        el.off(ruleName).off(event + ruleName + '-' + element.name).on(event + ruleName + '-' + element.name, function () {
          $(element).valid();
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
      return new RegExp('^' + nameParts.map(function (x) {
        return laravelValidation.helpers.escapeRegExp(x);
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
          lookups = [// Convert dot to square brackets. e.g. foo.bar.0 becomes foo[bar][0]
      sqName, // Append [] to the name e.g. foo becomes foo[] or foo.bar.0 becomes foo[bar][0][]
      sqName + '[]', // Remove key from last array e.g. foo[bar][0] becomes foo[bar][]
      sqName.replace(/(.*)\[(.*)\]$/g, '$1[]')];

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
      } // Find name in data, using dot notation.


      var delim = '.',
          parts = name.split(delim);

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
}();
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7O0FBRW5CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQWdCLFVBQVU7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNsQ2E7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHFCQUFxQixJQUFJO0FBQ3pCLHNCQUFzQixFQUFFO0FBQ3hCLHNCQUFzQixFQUFFO0FBQ3hCLG1DQUFtQyxFQUFFO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw2QkFBNkIsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJO0FBQ2hEOztBQUVBO0FBQ0EsOEJBQThCLElBQUk7QUFDbEM7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3REFBd0QsSUFBSTtBQUM1RDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLElBQUk7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsUUFBUTtBQUNSOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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SixPQUFyQixFQUE4QjtNQUM1QyxJQUFJQSxPQUFPLENBQUNVLElBQVIsQ0FBYTJGLE9BQWIsQ0FBcUIsSUFBckIsTUFBK0IsQ0FBQyxDQUFwQyxFQUF1QztRQUNuQyxPQUFPakcsU0FBUyxDQUFDMEQsVUFBVixDQUFxQjlELE9BQU8sQ0FBQ1UsSUFBN0IsRUFBbUN5RSxHQUFuQyxDQUF1QyxVQUFVeEYsQ0FBVixFQUFhMkcsQ0FBYixFQUFnQjtVQUMxRCxPQUFPbEcsU0FBUyxDQUFDeUMsWUFBVixDQUF1QnlELENBQXZCLENBQVA7UUFDSCxDQUZNLEVBRUpDLEdBRkksRUFBUDtNQUdIOztNQUVELE9BQU9uRyxTQUFTLENBQUN5QyxZQUFWLENBQXVCN0MsT0FBdkIsQ0FBUDtJQUNIO0VBbGdCSTtBQUZxQixDQUFsQyxFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvY3V0dXMvcGhwL2FycmF5L2FycmF5X2RpZmYuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvY3V0dXMvcGhwL2RhdGV0aW1lL3N0cnRvdGltZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbG9jdXR1cy9waHAvaW5mby9pbmlfZ2V0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9sb2N1dHVzL3BocC9zdHJpbmdzL3N0cmxlbi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbG9jdXR1cy9waHAvdmFyL2lzX251bWVyaWMuanMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvaGVscGVycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXJyYXlfZGlmZihhcnIxKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gIC8vICBkaXNjdXNzIGF0OiBodHRwczovL2xvY3V0dXMuaW8vcGhwL2FycmF5X2RpZmYvXG4gIC8vIG9yaWdpbmFsIGJ5OiBLZXZpbiB2YW4gWm9ubmV2ZWxkIChodHRwczovL2t2ei5pbylcbiAgLy8gaW1wcm92ZWQgYnk6IFNhbmpveSBSb3lcbiAgLy8gIHJldmlzZWQgYnk6IEJyZXR0IFphbWlyIChodHRwczovL2JyZXR0LXphbWlyLm1lKVxuICAvLyAgIGV4YW1wbGUgMTogYXJyYXlfZGlmZihbJ0tldmluJywgJ3ZhbicsICdab25uZXZlbGQnXSwgWyd2YW4nLCAnWm9ubmV2ZWxkJ10pXG4gIC8vICAgcmV0dXJucyAxOiB7MDonS2V2aW4nfVxuXG4gIHZhciByZXRBcnIgPSB7fTtcbiAgdmFyIGFyZ2wgPSBhcmd1bWVudHMubGVuZ3RoO1xuICB2YXIgazEgPSAnJztcbiAgdmFyIGkgPSAxO1xuICB2YXIgayA9ICcnO1xuICB2YXIgYXJyID0ge307XG5cbiAgYXJyMWtleXM6IGZvciAoazEgaW4gYXJyMSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbGFiZWxzXG4gICAgZm9yIChpID0gMTsgaSA8IGFyZ2w7IGkrKykge1xuICAgICAgYXJyID0gYXJndW1lbnRzW2ldO1xuICAgICAgZm9yIChrIGluIGFycikge1xuICAgICAgICBpZiAoYXJyW2tdID09PSBhcnIxW2sxXSkge1xuICAgICAgICAgIC8vIElmIGl0IHJlYWNoZXMgaGVyZSwgaXQgd2FzIGZvdW5kIGluIGF0IGxlYXN0IG9uZSBhcnJheSwgc28gdHJ5IG5leHQgdmFsdWVcbiAgICAgICAgICBjb250aW51ZSBhcnIxa2V5czsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1sYWJlbHNcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0QXJyW2sxXSA9IGFycjFbazFdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXRBcnI7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXJyYXlfZGlmZi5qcy5tYXAiLCIndXNlIHN0cmljdCc7XG5cbnZhciByZVNwYWNlID0gJ1sgXFxcXHRdKyc7XG52YXIgcmVTcGFjZU9wdCA9ICdbIFxcXFx0XSonO1xudmFyIHJlTWVyaWRpYW4gPSAnKD86KFthcF0pXFxcXC4/bVxcXFwuPyhbXFxcXHQgXXwkKSknO1xudmFyIHJlSG91cjI0ID0gJygyWzAtNF18WzAxXT9bMC05XSknO1xudmFyIHJlSG91cjI0bHogPSAnKFswMV1bMC05XXwyWzAtNF0pJztcbnZhciByZUhvdXIxMiA9ICcoMD9bMS05XXwxWzAtMl0pJztcbnZhciByZU1pbnV0ZSA9ICcoWzAtNV0/WzAtOV0pJztcbnZhciByZU1pbnV0ZWx6ID0gJyhbMC01XVswLTldKSc7XG52YXIgcmVTZWNvbmQgPSAnKDYwfFswLTVdP1swLTldKSc7XG52YXIgcmVTZWNvbmRseiA9ICcoNjB8WzAtNV1bMC05XSknO1xudmFyIHJlRnJhYyA9ICcoPzpcXFxcLihbMC05XSspKSc7XG5cbnZhciByZURheWZ1bGwgPSAnc3VuZGF5fG1vbmRheXx0dWVzZGF5fHdlZG5lc2RheXx0aHVyc2RheXxmcmlkYXl8c2F0dXJkYXknO1xudmFyIHJlRGF5YWJiciA9ICdzdW58bW9ufHR1ZXx3ZWR8dGh1fGZyaXxzYXQnO1xudmFyIHJlRGF5dGV4dCA9IHJlRGF5ZnVsbCArICd8JyArIHJlRGF5YWJiciArICd8d2Vla2RheXM/JztcblxudmFyIHJlUmVsdGV4dG51bWJlciA9ICdmaXJzdHxzZWNvbmR8dGhpcmR8Zm91cnRofGZpZnRofHNpeHRofHNldmVudGh8ZWlnaHRoP3xuaW50aHx0ZW50aHxlbGV2ZW50aHx0d2VsZnRoJztcbnZhciByZVJlbHRleHR0ZXh0ID0gJ25leHR8bGFzdHxwcmV2aW91c3x0aGlzJztcbnZhciByZVJlbHRleHR1bml0ID0gJyg/OnNlY29uZHxzZWN8bWludXRlfG1pbnxob3VyfGRheXxmb3J0bmlnaHR8Zm9ydGhuaWdodHxtb250aHx5ZWFyKXM/fHdlZWtzfCcgKyByZURheXRleHQ7XG5cbnZhciByZVllYXIgPSAnKFswLTldezEsNH0pJztcbnZhciByZVllYXIyID0gJyhbMC05XXsyfSknO1xudmFyIHJlWWVhcjQgPSAnKFswLTldezR9KSc7XG52YXIgcmVZZWFyNHdpdGhTaWduID0gJyhbKy1dP1swLTldezR9KSc7XG52YXIgcmVNb250aCA9ICcoMVswLTJdfDA/WzAtOV0pJztcbnZhciByZU1vbnRobHogPSAnKDBbMC05XXwxWzAtMl0pJztcbnZhciByZURheSA9ICcoPzooM1swMV18WzAtMl0/WzAtOV0pKD86c3R8bmR8cmR8dGgpPyknO1xudmFyIHJlRGF5bHogPSAnKDBbMC05XXxbMS0yXVswLTldfDNbMDFdKSc7XG5cbnZhciByZU1vbnRoRnVsbCA9ICdqYW51YXJ5fGZlYnJ1YXJ5fG1hcmNofGFwcmlsfG1heXxqdW5lfGp1bHl8YXVndXN0fHNlcHRlbWJlcnxvY3RvYmVyfG5vdmVtYmVyfGRlY2VtYmVyJztcbnZhciByZU1vbnRoQWJiciA9ICdqYW58ZmVifG1hcnxhcHJ8bWF5fGp1bnxqdWx8YXVnfHNlcHQ/fG9jdHxub3Z8ZGVjJztcbnZhciByZU1vbnRocm9tYW4gPSAnaVt2eF18dml7MCwzfXx4aXswLDJ9fGl7MSwzfSc7XG52YXIgcmVNb250aFRleHQgPSAnKCcgKyByZU1vbnRoRnVsbCArICd8JyArIHJlTW9udGhBYmJyICsgJ3wnICsgcmVNb250aHJvbWFuICsgJyknO1xuXG52YXIgcmVUekNvcnJlY3Rpb24gPSAnKCg/OkdNVCk/KFsrLV0pJyArIHJlSG91cjI0ICsgJzo/JyArIHJlTWludXRlICsgJz8pJztcbnZhciByZVR6QWJiciA9ICdcXFxcKD8oW2EtekEtWl17MSw2fSlcXFxcKT8nO1xudmFyIHJlRGF5T2ZZZWFyID0gJygwMFsxLTldfDBbMS05XVswLTldfFsxMl1bMC05XVswLTldfDNbMC01XVswLTldfDM2WzAtNl0pJztcbnZhciByZVdlZWtPZlllYXIgPSAnKDBbMS05XXxbMS00XVswLTldfDVbMC0zXSknO1xuXG52YXIgcmVEYXRlTm9ZZWFyID0gcmVNb250aFRleHQgKyAnWyAuXFxcXHQtXSonICsgcmVEYXkgKyAnWywuc3RuZHJoXFxcXHQgXSonO1xuXG5mdW5jdGlvbiBwcm9jZXNzTWVyaWRpYW4oaG91ciwgbWVyaWRpYW4pIHtcbiAgbWVyaWRpYW4gPSBtZXJpZGlhbiAmJiBtZXJpZGlhbi50b0xvd2VyQ2FzZSgpO1xuXG4gIHN3aXRjaCAobWVyaWRpYW4pIHtcbiAgICBjYXNlICdhJzpcbiAgICAgIGhvdXIgKz0gaG91ciA9PT0gMTIgPyAtMTIgOiAwO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncCc6XG4gICAgICBob3VyICs9IGhvdXIgIT09IDEyID8gMTIgOiAwO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gaG91cjtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1llYXIoeWVhclN0cikge1xuICB2YXIgeWVhciA9ICt5ZWFyU3RyO1xuXG4gIGlmICh5ZWFyU3RyLmxlbmd0aCA8IDQgJiYgeWVhciA8IDEwMCkge1xuICAgIHllYXIgKz0geWVhciA8IDcwID8gMjAwMCA6IDE5MDA7XG4gIH1cblxuICByZXR1cm4geWVhcjtcbn1cblxuZnVuY3Rpb24gbG9va3VwTW9udGgobW9udGhTdHIpIHtcbiAgcmV0dXJuIHtcbiAgICBqYW46IDAsXG4gICAgamFudWFyeTogMCxcbiAgICBpOiAwLFxuICAgIGZlYjogMSxcbiAgICBmZWJydWFyeTogMSxcbiAgICBpaTogMSxcbiAgICBtYXI6IDIsXG4gICAgbWFyY2g6IDIsXG4gICAgaWlpOiAyLFxuICAgIGFwcjogMyxcbiAgICBhcHJpbDogMyxcbiAgICBpdjogMyxcbiAgICBtYXk6IDQsXG4gICAgdjogNCxcbiAgICBqdW46IDUsXG4gICAganVuZTogNSxcbiAgICB2aTogNSxcbiAgICBqdWw6IDYsXG4gICAganVseTogNixcbiAgICB2aWk6IDYsXG4gICAgYXVnOiA3LFxuICAgIGF1Z3VzdDogNyxcbiAgICB2aWlpOiA3LFxuICAgIHNlcDogOCxcbiAgICBzZXB0OiA4LFxuICAgIHNlcHRlbWJlcjogOCxcbiAgICBpeDogOCxcbiAgICBvY3Q6IDksXG4gICAgb2N0b2JlcjogOSxcbiAgICB4OiA5LFxuICAgIG5vdjogMTAsXG4gICAgbm92ZW1iZXI6IDEwLFxuICAgIHhpOiAxMCxcbiAgICBkZWM6IDExLFxuICAgIGRlY2VtYmVyOiAxMSxcbiAgICB4aWk6IDExXG4gIH1bbW9udGhTdHIudG9Mb3dlckNhc2UoKV07XG59XG5cbmZ1bmN0aW9uIGxvb2t1cFdlZWtkYXkoZGF5U3RyKSB7XG4gIHZhciBkZXNpcmVkU3VuZGF5TnVtYmVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuXG4gIHZhciBkYXlOdW1iZXJzID0ge1xuICAgIG1vbjogMSxcbiAgICBtb25kYXk6IDEsXG4gICAgdHVlOiAyLFxuICAgIHR1ZXNkYXk6IDIsXG4gICAgd2VkOiAzLFxuICAgIHdlZG5lc2RheTogMyxcbiAgICB0aHU6IDQsXG4gICAgdGh1cnNkYXk6IDQsXG4gICAgZnJpOiA1LFxuICAgIGZyaWRheTogNSxcbiAgICBzYXQ6IDYsXG4gICAgc2F0dXJkYXk6IDYsXG4gICAgc3VuOiAwLFxuICAgIHN1bmRheTogMFxuICB9O1xuXG4gIHJldHVybiBkYXlOdW1iZXJzW2RheVN0ci50b0xvd2VyQ2FzZSgpXSB8fCBkZXNpcmVkU3VuZGF5TnVtYmVyO1xufVxuXG5mdW5jdGlvbiBsb29rdXBSZWxhdGl2ZShyZWxUZXh0KSB7XG4gIHZhciByZWxhdGl2ZU51bWJlcnMgPSB7XG4gICAgbGFzdDogLTEsXG4gICAgcHJldmlvdXM6IC0xLFxuICAgIHRoaXM6IDAsXG4gICAgZmlyc3Q6IDEsXG4gICAgbmV4dDogMSxcbiAgICBzZWNvbmQ6IDIsXG4gICAgdGhpcmQ6IDMsXG4gICAgZm91cnRoOiA0LFxuICAgIGZpZnRoOiA1LFxuICAgIHNpeHRoOiA2LFxuICAgIHNldmVudGg6IDcsXG4gICAgZWlnaHQ6IDgsXG4gICAgZWlnaHRoOiA4LFxuICAgIG5pbnRoOiA5LFxuICAgIHRlbnRoOiAxMCxcbiAgICBlbGV2ZW50aDogMTEsXG4gICAgdHdlbGZ0aDogMTJcbiAgfTtcblxuICB2YXIgcmVsYXRpdmVCZWhhdmlvciA9IHtcbiAgICB0aGlzOiAxXG4gIH07XG5cbiAgdmFyIHJlbFRleHRMb3dlciA9IHJlbFRleHQudG9Mb3dlckNhc2UoKTtcblxuICByZXR1cm4ge1xuICAgIGFtb3VudDogcmVsYXRpdmVOdW1iZXJzW3JlbFRleHRMb3dlcl0sXG4gICAgYmVoYXZpb3I6IHJlbGF0aXZlQmVoYXZpb3JbcmVsVGV4dExvd2VyXSB8fCAwXG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NUekNvcnJlY3Rpb24odHpPZmZzZXQsIG9sZFZhbHVlKSB7XG4gIHZhciByZVR6Q29ycmVjdGlvbkxvb3NlID0gLyg/OkdNVCk/KFsrLV0pKFxcZCspKDo/KShcXGR7MCwyfSkvaTtcbiAgdHpPZmZzZXQgPSB0ek9mZnNldCAmJiB0ek9mZnNldC5tYXRjaChyZVR6Q29ycmVjdGlvbkxvb3NlKTtcblxuICBpZiAoIXR6T2Zmc2V0KSB7XG4gICAgcmV0dXJuIG9sZFZhbHVlO1xuICB9XG5cbiAgdmFyIHNpZ24gPSB0ek9mZnNldFsxXSA9PT0gJy0nID8gLTEgOiAxO1xuICB2YXIgaG91cnMgPSArdHpPZmZzZXRbMl07XG4gIHZhciBtaW51dGVzID0gK3R6T2Zmc2V0WzRdO1xuXG4gIGlmICghdHpPZmZzZXRbNF0gJiYgIXR6T2Zmc2V0WzNdKSB7XG4gICAgbWludXRlcyA9IE1hdGguZmxvb3IoaG91cnMgJSAxMDApO1xuICAgIGhvdXJzID0gTWF0aC5mbG9vcihob3VycyAvIDEwMCk7XG4gIH1cblxuICAvLyB0aW1lem9uZSBvZmZzZXQgaW4gc2Vjb25kc1xuICByZXR1cm4gc2lnbiAqIChob3VycyAqIDYwICsgbWludXRlcykgKiA2MDtcbn1cblxuLy8gdHogYWJicmV2YXRpb24gOiB0eiBvZmZzZXQgaW4gc2Vjb25kc1xudmFyIHR6QWJick9mZnNldHMgPSB7XG4gIGFjZHQ6IDM3ODAwLFxuICBhY3N0OiAzNDIwMCxcbiAgYWRkdDogLTcyMDAsXG4gIGFkdDogLTEwODAwLFxuICBhZWR0OiAzOTYwMCxcbiAgYWVzdDogMzYwMDAsXG4gIGFoZHQ6IC0zMjQwMCxcbiAgYWhzdDogLTM2MDAwLFxuICBha2R0OiAtMjg4MDAsXG4gIGFrc3Q6IC0zMjQwMCxcbiAgYW10OiAtMTM4NDAsXG4gIGFwdDogLTEwODAwLFxuICBhc3Q6IC0xNDQwMCxcbiAgYXdkdDogMzI0MDAsXG4gIGF3c3Q6IDI4ODAwLFxuICBhd3Q6IC0xMDgwMCxcbiAgYmRzdDogNzIwMCxcbiAgYmR0OiAtMzYwMDAsXG4gIGJtdDogLTE0MzA5LFxuICBic3Q6IDM2MDAsXG4gIGNhc3Q6IDM0MjAwLFxuICBjYXQ6IDcyMDAsXG4gIGNkZHQ6IC0xNDQwMCxcbiAgY2R0OiAtMTgwMDAsXG4gIGNlbXQ6IDEwODAwLFxuICBjZXN0OiA3MjAwLFxuICBjZXQ6IDM2MDAsXG4gIGNtdDogLTE1NDA4LFxuICBjcHQ6IC0xODAwMCxcbiAgY3N0OiAtMjE2MDAsXG4gIGN3dDogLTE4MDAwLFxuICBjaHN0OiAzNjAwMCxcbiAgZG10OiAtMTUyMSxcbiAgZWF0OiAxMDgwMCxcbiAgZWRkdDogLTEwODAwLFxuICBlZHQ6IC0xNDQwMCxcbiAgZWVzdDogMTA4MDAsXG4gIGVldDogNzIwMCxcbiAgZW10OiAtMjYyNDgsXG4gIGVwdDogLTE0NDAwLFxuICBlc3Q6IC0xODAwMCxcbiAgZXd0OiAtMTQ0MDAsXG4gIGZmbXQ6IC0xNDY2MCxcbiAgZm10OiAtNDA1NixcbiAgZ2R0OiAzOTYwMCxcbiAgZ210OiAwLFxuICBnc3Q6IDM2MDAwLFxuICBoZHQ6IC0zNDIwMCxcbiAgaGtzdDogMzI0MDAsXG4gIGhrdDogMjg4MDAsXG4gIGhtdDogLTE5Nzc2LFxuICBocHQ6IC0zNDIwMCxcbiAgaHN0OiAtMzYwMDAsXG4gIGh3dDogLTM0MjAwLFxuICBpZGR0OiAxNDQwMCxcbiAgaWR0OiAxMDgwMCxcbiAgaW10OiAyNTAyNSxcbiAgaXN0OiA3MjAwLFxuICBqZHQ6IDM2MDAwLFxuICBqbXQ6IDg0NDAsXG4gIGpzdDogMzI0MDAsXG4gIGtkdDogMzYwMDAsXG4gIGttdDogNTczNixcbiAga3N0OiAzMDYwMCxcbiAgbHN0OiA5Mzk0LFxuICBtZGR0OiAtMTgwMDAsXG4gIG1kc3Q6IDE2Mjc5LFxuICBtZHQ6IC0yMTYwMCxcbiAgbWVzdDogNzIwMCxcbiAgbWV0OiAzNjAwLFxuICBtbXQ6IDkwMTcsXG4gIG1wdDogLTIxNjAwLFxuICBtc2Q6IDE0NDAwLFxuICBtc2s6IDEwODAwLFxuICBtc3Q6IC0yNTIwMCxcbiAgbXd0OiAtMjE2MDAsXG4gIG5kZHQ6IC01NDAwLFxuICBuZHQ6IC05MDUyLFxuICBucHQ6IC05MDAwLFxuICBuc3Q6IC0xMjYwMCxcbiAgbnd0OiAtOTAwMCxcbiAgbnpkdDogNDY4MDAsXG4gIG56bXQ6IDQxNDAwLFxuICBuenN0OiA0MzIwMCxcbiAgcGRkdDogLTIxNjAwLFxuICBwZHQ6IC0yNTIwMCxcbiAgcGtzdDogMjE2MDAsXG4gIHBrdDogMTgwMDAsXG4gIHBsbXQ6IDI1NTkwLFxuICBwbXQ6IC0xMzIzNixcbiAgcHBtdDogLTE3MzQwLFxuICBwcHQ6IC0yNTIwMCxcbiAgcHN0OiAtMjg4MDAsXG4gIHB3dDogLTI1MjAwLFxuICBxbXQ6IC0xODg0MCxcbiAgcm10OiA1Nzk0LFxuICBzYXN0OiA3MjAwLFxuICBzZG10OiAtMTY4MDAsXG4gIHNqbXQ6IC0yMDE3MyxcbiAgc210OiAtMTM4ODQsXG4gIHNzdDogLTM5NjAwLFxuICB0Ym10OiAxMDc1MSxcbiAgdG10OiAxMjM0NCxcbiAgdWN0OiAwLFxuICB1dGM6IDAsXG4gIHdhc3Q6IDcyMDAsXG4gIHdhdDogMzYwMCxcbiAgd2VtdDogNzIwMCxcbiAgd2VzdDogMzYwMCxcbiAgd2V0OiAwLFxuICB3aWI6IDI1MjAwLFxuICB3aXRhOiAyODgwMCxcbiAgd2l0OiAzMjQwMCxcbiAgd210OiA1MDQwLFxuICB5ZGR0OiAtMjUyMDAsXG4gIHlkdDogLTI4ODAwLFxuICB5cHQ6IC0yODgwMCxcbiAgeXN0OiAtMzI0MDAsXG4gIHl3dDogLTI4ODAwLFxuICBhOiAzNjAwLFxuICBiOiA3MjAwLFxuICBjOiAxMDgwMCxcbiAgZDogMTQ0MDAsXG4gIGU6IDE4MDAwLFxuICBmOiAyMTYwMCxcbiAgZzogMjUyMDAsXG4gIGg6IDI4ODAwLFxuICBpOiAzMjQwMCxcbiAgazogMzYwMDAsXG4gIGw6IDM5NjAwLFxuICBtOiA0MzIwMCxcbiAgbjogLTM2MDAsXG4gIG86IC03MjAwLFxuICBwOiAtMTA4MDAsXG4gIHE6IC0xNDQwMCxcbiAgcjogLTE4MDAwLFxuICBzOiAtMjE2MDAsXG4gIHQ6IC0yNTIwMCxcbiAgdTogLTI4ODAwLFxuICB2OiAtMzI0MDAsXG4gIHc6IC0zNjAwMCxcbiAgeDogLTM5NjAwLFxuICB5OiAtNDMyMDAsXG4gIHo6IDBcbn07XG5cbnZhciBmb3JtYXRzID0ge1xuICB5ZXN0ZXJkYXk6IHtcbiAgICByZWdleDogL155ZXN0ZXJkYXkvaSxcbiAgICBuYW1lOiAneWVzdGVyZGF5JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2soKSB7XG4gICAgICB0aGlzLnJkIC09IDE7XG4gICAgICByZXR1cm4gdGhpcy5yZXNldFRpbWUoKTtcbiAgICB9XG4gIH0sXG5cbiAgbm93OiB7XG4gICAgcmVnZXg6IC9ebm93L2ksXG4gICAgbmFtZTogJ25vdydcbiAgICAvLyBkbyBub3RoaW5nXG4gIH0sXG5cbiAgbm9vbjoge1xuICAgIHJlZ2V4OiAvXm5vb24vaSxcbiAgICBuYW1lOiAnbm9vbicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVzZXRUaW1lKCkgJiYgdGhpcy50aW1lKDEyLCAwLCAwLCAwKTtcbiAgICB9XG4gIH0sXG5cbiAgbWlkbmlnaHRPclRvZGF5OiB7XG4gICAgcmVnZXg6IC9eKG1pZG5pZ2h0fHRvZGF5KS9pLFxuICAgIG5hbWU6ICdtaWRuaWdodCB8IHRvZGF5JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2soKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXNldFRpbWUoKTtcbiAgICB9XG4gIH0sXG5cbiAgdG9tb3Jyb3c6IHtcbiAgICByZWdleDogL150b21vcnJvdy9pLFxuICAgIG5hbWU6ICd0b21vcnJvdycsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKCkge1xuICAgICAgdGhpcy5yZCArPSAxO1xuICAgICAgcmV0dXJuIHRoaXMucmVzZXRUaW1lKCk7XG4gICAgfVxuICB9LFxuXG4gIHRpbWVzdGFtcDoge1xuICAgIHJlZ2V4OiAvXkAoLT9cXGQrKS9pLFxuICAgIG5hbWU6ICd0aW1lc3RhbXAnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgdGltZXN0YW1wKSB7XG4gICAgICB0aGlzLnJzICs9ICt0aW1lc3RhbXA7XG4gICAgICB0aGlzLnkgPSAxOTcwO1xuICAgICAgdGhpcy5tID0gMDtcbiAgICAgIHRoaXMuZCA9IDE7XG4gICAgICB0aGlzLmRhdGVzID0gMDtcblxuICAgICAgcmV0dXJuIHRoaXMucmVzZXRUaW1lKCkgJiYgdGhpcy56b25lKDApO1xuICAgIH1cbiAgfSxcblxuICBmaXJzdE9yTGFzdERheToge1xuICAgIHJlZ2V4OiAvXihmaXJzdHxsYXN0KSBkYXkgb2YvaSxcbiAgICBuYW1lOiAnZmlyc3RkYXlvZiB8IGxhc3RkYXlvZicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBkYXkpIHtcbiAgICAgIGlmIChkYXkudG9Mb3dlckNhc2UoKSA9PT0gJ2ZpcnN0Jykge1xuICAgICAgICB0aGlzLmZpcnN0T3JMYXN0RGF5T2ZNb250aCA9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZpcnN0T3JMYXN0RGF5T2ZNb250aCA9IC0xO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBiYWNrT3JGcm9udE9mOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXihiYWNrfGZyb250KSBvZiAnICsgcmVIb3VyMjQgKyByZVNwYWNlT3B0ICsgcmVNZXJpZGlhbiArICc/JywgJ2knKSxcbiAgICBuYW1lOiAnYmFja29mIHwgZnJvbnRvZicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBzaWRlLCBob3VycywgbWVyaWRpYW4pIHtcbiAgICAgIHZhciBiYWNrID0gc2lkZS50b0xvd2VyQ2FzZSgpID09PSAnYmFjayc7XG4gICAgICB2YXIgaG91ciA9ICtob3VycztcbiAgICAgIHZhciBtaW51dGUgPSAxNTtcblxuICAgICAgaWYgKCFiYWNrKSB7XG4gICAgICAgIGhvdXIgLT0gMTtcbiAgICAgICAgbWludXRlID0gNDU7XG4gICAgICB9XG5cbiAgICAgIGhvdXIgPSBwcm9jZXNzTWVyaWRpYW4oaG91ciwgbWVyaWRpYW4pO1xuXG4gICAgICByZXR1cm4gdGhpcy5yZXNldFRpbWUoKSAmJiB0aGlzLnRpbWUoaG91ciwgbWludXRlLCAwLCAwKTtcbiAgICB9XG4gIH0sXG5cbiAgd2Vla2RheU9mOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXignICsgcmVSZWx0ZXh0bnVtYmVyICsgJ3wnICsgcmVSZWx0ZXh0dGV4dCArICcpJyArIHJlU3BhY2UgKyAnKCcgKyByZURheWZ1bGwgKyAnfCcgKyByZURheWFiYnIgKyAnKScgKyByZVNwYWNlICsgJ29mJywgJ2knKSxcbiAgICBuYW1lOiAnd2Vla2RheW9mJ1xuICAgIC8vIHRvZG9cbiAgfSxcblxuICBtc3NxbHRpbWU6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlSG91cjEyICsgJzonICsgcmVNaW51dGVseiArICc6JyArIHJlU2Vjb25kbHogKyAnWzouXShbMC05XSspJyArIHJlTWVyaWRpYW4sICdpJyksXG4gICAgbmFtZTogJ21zc3FsdGltZScsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBob3VyLCBtaW51dGUsIHNlY29uZCwgZnJhYywgbWVyaWRpYW4pIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbWUocHJvY2Vzc01lcmlkaWFuKCtob3VyLCBtZXJpZGlhbiksICttaW51dGUsICtzZWNvbmQsICtmcmFjLnN1YnN0cigwLCAzKSk7XG4gICAgfVxuICB9LFxuXG4gIHRpbWVMb25nMTI6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlSG91cjEyICsgJ1s6Ll0nICsgcmVNaW51dGUgKyAnWzouXScgKyByZVNlY29uZGx6ICsgcmVTcGFjZU9wdCArIHJlTWVyaWRpYW4sICdpJyksXG4gICAgbmFtZTogJ3RpbWVsb25nMTInLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1lcmlkaWFuKSB7XG4gICAgICByZXR1cm4gdGhpcy50aW1lKHByb2Nlc3NNZXJpZGlhbigraG91ciwgbWVyaWRpYW4pLCArbWludXRlLCArc2Vjb25kLCAwKTtcbiAgICB9XG4gIH0sXG5cbiAgdGltZVNob3J0MTI6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlSG91cjEyICsgJ1s6Ll0nICsgcmVNaW51dGVseiArIHJlU3BhY2VPcHQgKyByZU1lcmlkaWFuLCAnaScpLFxuICAgIG5hbWU6ICd0aW1lc2hvcnQxMicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBob3VyLCBtaW51dGUsIG1lcmlkaWFuKSB7XG4gICAgICByZXR1cm4gdGhpcy50aW1lKHByb2Nlc3NNZXJpZGlhbigraG91ciwgbWVyaWRpYW4pLCArbWludXRlLCAwLCAwKTtcbiAgICB9XG4gIH0sXG5cbiAgdGltZVRpbnkxMjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVIb3VyMTIgKyByZVNwYWNlT3B0ICsgcmVNZXJpZGlhbiwgJ2knKSxcbiAgICBuYW1lOiAndGltZXRpbnkxMicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBob3VyLCBtZXJpZGlhbikge1xuICAgICAgcmV0dXJuIHRoaXMudGltZShwcm9jZXNzTWVyaWRpYW4oK2hvdXIsIG1lcmlkaWFuKSwgMCwgMCwgMCk7XG4gICAgfVxuICB9LFxuXG4gIHNvYXA6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlWWVhcjQgKyAnLScgKyByZU1vbnRobHogKyAnLScgKyByZURheWx6ICsgJ1QnICsgcmVIb3VyMjRseiArICc6JyArIHJlTWludXRlbHogKyAnOicgKyByZVNlY29uZGx6ICsgcmVGcmFjICsgcmVUekNvcnJlY3Rpb24gKyAnPycsICdpJyksXG4gICAgbmFtZTogJ3NvYXAnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIGZyYWMsIHR6Q29ycmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKCt5ZWFyLCBtb250aCAtIDEsICtkYXkpICYmIHRoaXMudGltZSgraG91ciwgK21pbnV0ZSwgK3NlY29uZCwgK2ZyYWMuc3Vic3RyKDAsIDMpKSAmJiB0aGlzLnpvbmUocHJvY2Vzc1R6Q29ycmVjdGlvbih0ekNvcnJlY3Rpb24pKTtcbiAgICB9XG4gIH0sXG5cbiAgd2RkeDoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVZZWFyNCArICctJyArIHJlTW9udGggKyAnLScgKyByZURheSArICdUJyArIHJlSG91cjI0ICsgJzonICsgcmVNaW51dGUgKyAnOicgKyByZVNlY29uZCksXG4gICAgbmFtZTogJ3dkZHgnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCgreWVhciwgbW9udGggLSAxLCArZGF5KSAmJiB0aGlzLnRpbWUoK2hvdXIsICttaW51dGUsICtzZWNvbmQsIDApO1xuICAgIH1cbiAgfSxcblxuICBleGlmOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVllYXI0ICsgJzonICsgcmVNb250aGx6ICsgJzonICsgcmVEYXlseiArICcgJyArIHJlSG91cjI0bHogKyAnOicgKyByZU1pbnV0ZWx6ICsgJzonICsgcmVTZWNvbmRseiwgJ2knKSxcbiAgICBuYW1lOiAnZXhpZicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCkge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKCt5ZWFyLCBtb250aCAtIDEsICtkYXkpICYmIHRoaXMudGltZSgraG91ciwgK21pbnV0ZSwgK3NlY29uZCwgMCk7XG4gICAgfVxuICB9LFxuXG4gIHhtbFJwYzoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVZZWFyNCArIHJlTW9udGhseiArIHJlRGF5bHogKyAnVCcgKyByZUhvdXIyNCArICc6JyArIHJlTWludXRlbHogKyAnOicgKyByZVNlY29uZGx6KSxcbiAgICBuYW1lOiAneG1scnBjJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQoK3llYXIsIG1vbnRoIC0gMSwgK2RheSkgJiYgdGhpcy50aW1lKCtob3VyLCArbWludXRlLCArc2Vjb25kLCAwKTtcbiAgICB9XG4gIH0sXG5cbiAgeG1sUnBjTm9Db2xvbjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVZZWFyNCArIHJlTW9udGhseiArIHJlRGF5bHogKyAnW1R0XScgKyByZUhvdXIyNCArIHJlTWludXRlbHogKyByZVNlY29uZGx6KSxcbiAgICBuYW1lOiAneG1scnBjbm9jb2xvbicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCkge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKCt5ZWFyLCBtb250aCAtIDEsICtkYXkpICYmIHRoaXMudGltZSgraG91ciwgK21pbnV0ZSwgK3NlY29uZCwgMCk7XG4gICAgfVxuICB9LFxuXG4gIGNsZjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVEYXkgKyAnLygnICsgcmVNb250aEFiYnIgKyAnKS8nICsgcmVZZWFyNCArICc6JyArIHJlSG91cjI0bHogKyAnOicgKyByZU1pbnV0ZWx6ICsgJzonICsgcmVTZWNvbmRseiArIHJlU3BhY2UgKyByZVR6Q29ycmVjdGlvbiwgJ2knKSxcbiAgICBuYW1lOiAnY2xmJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGRheSwgbW9udGgsIHllYXIsIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCB0ekNvcnJlY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCgreWVhciwgbG9va3VwTW9udGgobW9udGgpLCArZGF5KSAmJiB0aGlzLnRpbWUoK2hvdXIsICttaW51dGUsICtzZWNvbmQsIDApICYmIHRoaXMuem9uZShwcm9jZXNzVHpDb3JyZWN0aW9uKHR6Q29ycmVjdGlvbikpO1xuICAgIH1cbiAgfSxcblxuICBpc284NjAxbG9uZzoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ150PycgKyByZUhvdXIyNCArICdbOi5dJyArIHJlTWludXRlICsgJ1s6Ll0nICsgcmVTZWNvbmQgKyByZUZyYWMsICdpJyksXG4gICAgbmFtZTogJ2lzbzg2MDFsb25nJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmcmFjKSB7XG4gICAgICByZXR1cm4gdGhpcy50aW1lKCtob3VyLCArbWludXRlLCArc2Vjb25kLCArZnJhYy5zdWJzdHIoMCwgMykpO1xuICAgIH1cbiAgfSxcblxuICBkYXRlVGV4dHVhbDoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVNb250aFRleHQgKyAnWyAuXFxcXHQtXSonICsgcmVEYXkgKyAnWywuc3RuZHJoXFxcXHQgXSsnICsgcmVZZWFyLCAnaScpLFxuICAgIG5hbWU6ICdkYXRldGV4dHVhbCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBtb250aCwgZGF5LCB5ZWFyKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQocHJvY2Vzc1llYXIoeWVhciksIGxvb2t1cE1vbnRoKG1vbnRoKSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIHBvaW50ZWREYXRlNDoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVEYXkgKyAnWy5cXFxcdC1dJyArIHJlTW9udGggKyAnWy4tXScgKyByZVllYXI0KSxcbiAgICBuYW1lOiAncG9pbnRlZGRhdGU0JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGRheSwgbW9udGgsIHllYXIpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCgreWVhciwgbW9udGggLSAxLCArZGF5KTtcbiAgICB9XG4gIH0sXG5cbiAgcG9pbnRlZERhdGUyOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZURheSArICdbLlxcXFx0XScgKyByZU1vbnRoICsgJ1xcXFwuJyArIHJlWWVhcjIpLFxuICAgIG5hbWU6ICdwb2ludGVkZGF0ZTInLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgZGF5LCBtb250aCwgeWVhcikge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKHByb2Nlc3NZZWFyKHllYXIpLCBtb250aCAtIDEsICtkYXkpO1xuICAgIH1cbiAgfSxcblxuICB0aW1lTG9uZzI0OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXnQ/JyArIHJlSG91cjI0ICsgJ1s6Ll0nICsgcmVNaW51dGUgKyAnWzouXScgKyByZVNlY29uZCksXG4gICAgbmFtZTogJ3RpbWVsb25nMjQnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgaG91ciwgbWludXRlLCBzZWNvbmQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbWUoK2hvdXIsICttaW51dGUsICtzZWNvbmQsIDApO1xuICAgIH1cbiAgfSxcblxuICBkYXRlTm9Db2xvbjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVZZWFyNCArIHJlTW9udGhseiArIHJlRGF5bHopLFxuICAgIG5hbWU6ICdkYXRlbm9jb2xvbicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBtb250aCwgZGF5KSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQoK3llYXIsIG1vbnRoIC0gMSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIHBneWRvdGQ6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlWWVhcjQgKyAnXFxcXC4/JyArIHJlRGF5T2ZZZWFyKSxcbiAgICBuYW1lOiAncGd5ZG90ZCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBkYXkpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCgreWVhciwgMCwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIHRpbWVTaG9ydDI0OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXnQ/JyArIHJlSG91cjI0ICsgJ1s6Ll0nICsgcmVNaW51dGUsICdpJyksXG4gICAgbmFtZTogJ3RpbWVzaG9ydDI0JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGhvdXIsIG1pbnV0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMudGltZSgraG91ciwgK21pbnV0ZSwgMCwgMCk7XG4gICAgfVxuICB9LFxuXG4gIGlzbzg2MDFub0NvbG9uOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXnQ/JyArIHJlSG91cjI0bHogKyByZU1pbnV0ZWx6ICsgcmVTZWNvbmRseiwgJ2knKSxcbiAgICBuYW1lOiAnaXNvODYwMW5vY29sb24nLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgaG91ciwgbWludXRlLCBzZWNvbmQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbWUoK2hvdXIsICttaW51dGUsICtzZWNvbmQsIDApO1xuICAgIH1cbiAgfSxcblxuICBpc284NjAxZGF0ZVNsYXNoOiB7XG4gICAgLy8gZXZlbnRob3VnaCB0aGUgdHJhaWxpbmcgc2xhc2ggaXMgb3B0aW9uYWwgaW4gUEhQXG4gICAgLy8gaGVyZSBpdCdzIG1hbmRhdG9yeSBhbmQgaW5wdXRzIHdpdGhvdXQgdGhlIHNsYXNoXG4gICAgLy8gYXJlIGhhbmRsZWQgYnkgZGF0ZXNsYXNoXG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVllYXI0ICsgJy8nICsgcmVNb250aGx6ICsgJy8nICsgcmVEYXlseiArICcvJyksXG4gICAgbmFtZTogJ2lzbzg2MDFkYXRlc2xhc2gnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgeWVhciwgbW9udGgsIGRheSkge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKCt5ZWFyLCBtb250aCAtIDEsICtkYXkpO1xuICAgIH1cbiAgfSxcblxuICBkYXRlU2xhc2g6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlWWVhcjQgKyAnLycgKyByZU1vbnRoICsgJy8nICsgcmVEYXkpLFxuICAgIG5hbWU6ICdkYXRlc2xhc2gnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgeWVhciwgbW9udGgsIGRheSkge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKCt5ZWFyLCBtb250aCAtIDEsICtkYXkpO1xuICAgIH1cbiAgfSxcblxuICBhbWVyaWNhbjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVNb250aCArICcvJyArIHJlRGF5ICsgJy8nICsgcmVZZWFyKSxcbiAgICBuYW1lOiAnYW1lcmljYW4nLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgbW9udGgsIGRheSwgeWVhcikge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKHByb2Nlc3NZZWFyKHllYXIpLCBtb250aCAtIDEsICtkYXkpO1xuICAgIH1cbiAgfSxcblxuICBhbWVyaWNhblNob3J0OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZU1vbnRoICsgJy8nICsgcmVEYXkpLFxuICAgIG5hbWU6ICdhbWVyaWNhbnNob3J0JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIG1vbnRoLCBkYXkpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCh0aGlzLnksIG1vbnRoIC0gMSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIGdudURhdGVTaG9ydE9ySXNvODYwMWRhdGUyOiB7XG4gICAgLy8gaXNvODYwMWRhdGUyIGlzIGNvbXBsZXRlIHN1YnNldCBvZiBnbnVkYXRlc2hvcnRcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlWWVhciArICctJyArIHJlTW9udGggKyAnLScgKyByZURheSksXG4gICAgbmFtZTogJ2dudWRhdGVzaG9ydCB8IGlzbzg2MDFkYXRlMicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBtb250aCwgZGF5KSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQocHJvY2Vzc1llYXIoeWVhciksIG1vbnRoIC0gMSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIGlzbzg2MDFkYXRlNDoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVZZWFyNHdpdGhTaWduICsgJy0nICsgcmVNb250aGx6ICsgJy0nICsgcmVEYXlseiksXG4gICAgbmFtZTogJ2lzbzg2MDFkYXRlNCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBtb250aCwgZGF5KSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQoK3llYXIsIG1vbnRoIC0gMSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIGdudU5vQ29sb246IHtcbiAgICByZWdleDogUmVnRXhwKCdedD8nICsgcmVIb3VyMjRseiArIHJlTWludXRlbHosICdpJyksXG4gICAgbmFtZTogJ2dudW5vY29sb24nLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgaG91ciwgbWludXRlKSB7XG4gICAgICAvLyB0aGlzIHJ1bGUgaXMgYSBzcGVjaWFsIGNhc2VcbiAgICAgIC8vIGlmIHRpbWUgd2FzIGFscmVhZHkgc2V0IG9uY2UgYnkgYW55IHByZWNlZGluZyBydWxlLCBpdCBzZXRzIHRoZSBjYXB0dXJlZCB2YWx1ZSBhcyB5ZWFyXG4gICAgICBzd2l0Y2ggKHRoaXMudGltZXMpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIHJldHVybiB0aGlzLnRpbWUoK2hvdXIsICttaW51dGUsIDAsIHRoaXMuZik7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICB0aGlzLnkgPSBob3VyICogMTAwICsgK21pbnV0ZTtcbiAgICAgICAgICB0aGlzLnRpbWVzKys7XG5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGdudURhdGVTaG9ydGVyOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVllYXI0ICsgJy0nICsgcmVNb250aCksXG4gICAgbmFtZTogJ2dudWRhdGVzaG9ydGVyJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHllYXIsIG1vbnRoKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQoK3llYXIsIG1vbnRoIC0gMSwgMSk7XG4gICAgfVxuICB9LFxuXG4gIHBnVGV4dFJldmVyc2U6IHtcbiAgICAvLyBub3RlOiBhbGxvd2VkIHllYXJzIGFyZSBmcm9tIDMyLTk5OTlcbiAgICAvLyB5ZWFycyBiZWxvdyAzMiBzaG91bGQgYmUgdHJlYXRlZCBhcyBkYXlzIGluIGRhdGVmdWxsXG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyAnKFxcXFxkezMsNH18WzQtOV1cXFxcZHwzWzItOV0pLSgnICsgcmVNb250aEFiYnIgKyAnKS0nICsgcmVEYXlseiwgJ2knKSxcbiAgICBuYW1lOiAncGd0ZXh0cmV2ZXJzZScsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBtb250aCwgZGF5KSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQocHJvY2Vzc1llYXIoeWVhciksIGxvb2t1cE1vbnRoKG1vbnRoKSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIGRhdGVGdWxsOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZURheSArICdbIFxcXFx0Li1dKicgKyByZU1vbnRoVGV4dCArICdbIFxcXFx0Li1dKicgKyByZVllYXIsICdpJyksXG4gICAgbmFtZTogJ2RhdGVmdWxsJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGRheSwgbW9udGgsIHllYXIpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZChwcm9jZXNzWWVhcih5ZWFyKSwgbG9va3VwTW9udGgobW9udGgpLCArZGF5KTtcbiAgICB9XG4gIH0sXG5cbiAgZGF0ZU5vRGF5OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZU1vbnRoVGV4dCArICdbIC5cXFxcdC1dKicgKyByZVllYXI0LCAnaScpLFxuICAgIG5hbWU6ICdkYXRlbm9kYXknLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgbW9udGgsIHllYXIpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCgreWVhciwgbG9va3VwTW9udGgobW9udGgpLCAxKTtcbiAgICB9XG4gIH0sXG5cbiAgZGF0ZU5vRGF5UmV2OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVllYXI0ICsgJ1sgLlxcXFx0LV0qJyArIHJlTW9udGhUZXh0LCAnaScpLFxuICAgIG5hbWU6ICdkYXRlbm9kYXlyZXYnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgeWVhciwgbW9udGgpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCgreWVhciwgbG9va3VwTW9udGgobW9udGgpLCAxKTtcbiAgICB9XG4gIH0sXG5cbiAgcGdUZXh0U2hvcnQ6IHtcbiAgICByZWdleDogUmVnRXhwKCdeKCcgKyByZU1vbnRoQWJiciArICcpLScgKyByZURheWx6ICsgJy0nICsgcmVZZWFyLCAnaScpLFxuICAgIG5hbWU6ICdwZ3RleHRzaG9ydCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBtb250aCwgZGF5LCB5ZWFyKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQocHJvY2Vzc1llYXIoeWVhciksIGxvb2t1cE1vbnRoKG1vbnRoKSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIGRhdGVOb1llYXI6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlRGF0ZU5vWWVhciwgJ2knKSxcbiAgICBuYW1lOiAnZGF0ZW5veWVhcicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBtb250aCwgZGF5KSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQodGhpcy55LCBsb29rdXBNb250aChtb250aCksICtkYXkpO1xuICAgIH1cbiAgfSxcblxuICBkYXRlTm9ZZWFyUmV2OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZURheSArICdbIC5cXFxcdC1dKicgKyByZU1vbnRoVGV4dCwgJ2knKSxcbiAgICBuYW1lOiAnZGF0ZW5veWVhcnJldicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBkYXksIG1vbnRoKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQodGhpcy55LCBsb29rdXBNb250aChtb250aCksICtkYXkpO1xuICAgIH1cbiAgfSxcblxuICBpc29XZWVrRGF5OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVllYXI0ICsgJy0/VycgKyByZVdlZWtPZlllYXIgKyAnKD86LT8oWzAtN10pKT8nKSxcbiAgICBuYW1lOiAnaXNvd2Vla2RheSB8IGlzb3dlZWsnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgeWVhciwgd2VlaywgZGF5KSB7XG4gICAgICBkYXkgPSBkYXkgPyArZGF5IDogMTtcblxuICAgICAgaWYgKCF0aGlzLnltZCgreWVhciwgMCwgMSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBnZXQgZGF5IG9mIHdlZWsgZm9yIEphbiAxc3RcbiAgICAgIHZhciBkYXlPZldlZWsgPSBuZXcgRGF0ZSh0aGlzLnksIHRoaXMubSwgdGhpcy5kKS5nZXREYXkoKTtcblxuICAgICAgLy8gYW5kIHVzZSB0aGUgZGF5IHRvIGZpZ3VyZSBvdXQgdGhlIG9mZnNldCBmb3IgZGF5IDEgb2Ygd2VlayAxXG4gICAgICBkYXlPZldlZWsgPSAwIC0gKGRheU9mV2VlayA+IDQgPyBkYXlPZldlZWsgLSA3IDogZGF5T2ZXZWVrKTtcblxuICAgICAgdGhpcy5yZCArPSBkYXlPZldlZWsgKyAod2VlayAtIDEpICogNyArIGRheTtcbiAgICB9XG4gIH0sXG5cbiAgcmVsYXRpdmVUZXh0OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXignICsgcmVSZWx0ZXh0bnVtYmVyICsgJ3wnICsgcmVSZWx0ZXh0dGV4dCArICcpJyArIHJlU3BhY2UgKyAnKCcgKyByZVJlbHRleHR1bml0ICsgJyknLCAnaScpLFxuICAgIG5hbWU6ICdyZWxhdGl2ZXRleHQnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgcmVsVmFsdWUsIHJlbFVuaXQpIHtcbiAgICAgIC8vIHRvZG86IGltcGxlbWVudCBoYW5kbGluZyBvZiAndGhpcyB0aW1lLXVuaXQnXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICAgIHZhciBfbG9va3VwUmVsYXRpdmUgPSBsb29rdXBSZWxhdGl2ZShyZWxWYWx1ZSksXG4gICAgICAgICAgYW1vdW50ID0gX2xvb2t1cFJlbGF0aXZlLmFtb3VudCxcbiAgICAgICAgICBiZWhhdmlvciA9IF9sb29rdXBSZWxhdGl2ZS5iZWhhdmlvcjtcblxuICAgICAgc3dpdGNoIChyZWxVbml0LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnc2VjJzpcbiAgICAgICAgY2FzZSAnc2Vjcyc6XG4gICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgICAgICAgIHRoaXMucnMgKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtaW4nOlxuICAgICAgICBjYXNlICdtaW5zJzpcbiAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgY2FzZSAnbWludXRlcyc6XG4gICAgICAgICAgdGhpcy5yaSArPSBhbW91bnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2hvdXInOlxuICAgICAgICBjYXNlICdob3Vycyc6XG4gICAgICAgICAgdGhpcy5yaCArPSBhbW91bnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICAgIHRoaXMucmQgKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmb3J0bmlnaHQnOlxuICAgICAgICBjYXNlICdmb3J0bmlnaHRzJzpcbiAgICAgICAgY2FzZSAnZm9ydGhuaWdodCc6XG4gICAgICAgIGNhc2UgJ2ZvcnRobmlnaHRzJzpcbiAgICAgICAgICB0aGlzLnJkICs9IGFtb3VudCAqIDE0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgY2FzZSAnd2Vla3MnOlxuICAgICAgICAgIHRoaXMucmQgKz0gYW1vdW50ICogNztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbW9udGgnOlxuICAgICAgICBjYXNlICdtb250aHMnOlxuICAgICAgICAgIHRoaXMucm0gKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICAgIHRoaXMucnkgKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb24nOmNhc2UgJ21vbmRheSc6XG4gICAgICAgIGNhc2UgJ3R1ZSc6Y2FzZSAndHVlc2RheSc6XG4gICAgICAgIGNhc2UgJ3dlZCc6Y2FzZSAnd2VkbmVzZGF5JzpcbiAgICAgICAgY2FzZSAndGh1JzpjYXNlICd0aHVyc2RheSc6XG4gICAgICAgIGNhc2UgJ2ZyaSc6Y2FzZSAnZnJpZGF5JzpcbiAgICAgICAgY2FzZSAnc2F0JzpjYXNlICdzYXR1cmRheSc6XG4gICAgICAgIGNhc2UgJ3N1bic6Y2FzZSAnc3VuZGF5JzpcbiAgICAgICAgICB0aGlzLnJlc2V0VGltZSgpO1xuICAgICAgICAgIHRoaXMud2Vla2RheSA9IGxvb2t1cFdlZWtkYXkocmVsVW5pdCwgNyk7XG4gICAgICAgICAgdGhpcy53ZWVrZGF5QmVoYXZpb3IgPSAxO1xuICAgICAgICAgIHRoaXMucmQgKz0gKGFtb3VudCA+IDAgPyBhbW91bnQgLSAxIDogYW1vdW50KSAqIDc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3dlZWtkYXknOlxuICAgICAgICBjYXNlICd3ZWVrZGF5cyc6XG4gICAgICAgICAgLy8gdG9kb1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICByZWxhdGl2ZToge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14oWystXSopWyBcXFxcdF0qKFxcXFxkKyknICsgcmVTcGFjZU9wdCArICcoJyArIHJlUmVsdGV4dHVuaXQgKyAnfHdlZWspJywgJ2knKSxcbiAgICBuYW1lOiAncmVsYXRpdmUnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgc2lnbnMsIHJlbFZhbHVlLCByZWxVbml0KSB7XG4gICAgICB2YXIgbWludXNlcyA9IHNpZ25zLnJlcGxhY2UoL1teLV0vZywgJycpLmxlbmd0aDtcblxuICAgICAgdmFyIGFtb3VudCA9ICtyZWxWYWx1ZSAqIE1hdGgucG93KC0xLCBtaW51c2VzKTtcblxuICAgICAgc3dpdGNoIChyZWxVbml0LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnc2VjJzpcbiAgICAgICAgY2FzZSAnc2Vjcyc6XG4gICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgICAgICAgIHRoaXMucnMgKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtaW4nOlxuICAgICAgICBjYXNlICdtaW5zJzpcbiAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgY2FzZSAnbWludXRlcyc6XG4gICAgICAgICAgdGhpcy5yaSArPSBhbW91bnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2hvdXInOlxuICAgICAgICBjYXNlICdob3Vycyc6XG4gICAgICAgICAgdGhpcy5yaCArPSBhbW91bnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICAgIHRoaXMucmQgKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmb3J0bmlnaHQnOlxuICAgICAgICBjYXNlICdmb3J0bmlnaHRzJzpcbiAgICAgICAgY2FzZSAnZm9ydGhuaWdodCc6XG4gICAgICAgIGNhc2UgJ2ZvcnRobmlnaHRzJzpcbiAgICAgICAgICB0aGlzLnJkICs9IGFtb3VudCAqIDE0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgY2FzZSAnd2Vla3MnOlxuICAgICAgICAgIHRoaXMucmQgKz0gYW1vdW50ICogNztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbW9udGgnOlxuICAgICAgICBjYXNlICdtb250aHMnOlxuICAgICAgICAgIHRoaXMucm0gKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICAgIHRoaXMucnkgKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb24nOmNhc2UgJ21vbmRheSc6XG4gICAgICAgIGNhc2UgJ3R1ZSc6Y2FzZSAndHVlc2RheSc6XG4gICAgICAgIGNhc2UgJ3dlZCc6Y2FzZSAnd2VkbmVzZGF5JzpcbiAgICAgICAgY2FzZSAndGh1JzpjYXNlICd0aHVyc2RheSc6XG4gICAgICAgIGNhc2UgJ2ZyaSc6Y2FzZSAnZnJpZGF5JzpcbiAgICAgICAgY2FzZSAnc2F0JzpjYXNlICdzYXR1cmRheSc6XG4gICAgICAgIGNhc2UgJ3N1bic6Y2FzZSAnc3VuZGF5JzpcbiAgICAgICAgICB0aGlzLnJlc2V0VGltZSgpO1xuICAgICAgICAgIHRoaXMud2Vla2RheSA9IGxvb2t1cFdlZWtkYXkocmVsVW5pdCwgNyk7XG4gICAgICAgICAgdGhpcy53ZWVrZGF5QmVoYXZpb3IgPSAxO1xuICAgICAgICAgIHRoaXMucmQgKz0gKGFtb3VudCA+IDAgPyBhbW91bnQgLSAxIDogYW1vdW50KSAqIDc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3dlZWtkYXknOlxuICAgICAgICBjYXNlICd3ZWVrZGF5cyc6XG4gICAgICAgICAgLy8gdG9kb1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBkYXlUZXh0OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXignICsgcmVEYXl0ZXh0ICsgJyknLCAnaScpLFxuICAgIG5hbWU6ICdkYXl0ZXh0JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGRheVRleHQpIHtcbiAgICAgIHRoaXMucmVzZXRUaW1lKCk7XG4gICAgICB0aGlzLndlZWtkYXkgPSBsb29rdXBXZWVrZGF5KGRheVRleHQsIDApO1xuXG4gICAgICBpZiAodGhpcy53ZWVrZGF5QmVoYXZpb3IgIT09IDIpIHtcbiAgICAgICAgdGhpcy53ZWVrZGF5QmVoYXZpb3IgPSAxO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICByZWxhdGl2ZVRleHRXZWVrOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXignICsgcmVSZWx0ZXh0dGV4dCArICcpJyArIHJlU3BhY2UgKyAnd2VlaycsICdpJyksXG4gICAgbmFtZTogJ3JlbGF0aXZldGV4dHdlZWsnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgcmVsVGV4dCkge1xuICAgICAgdGhpcy53ZWVrZGF5QmVoYXZpb3IgPSAyO1xuXG4gICAgICBzd2l0Y2ggKHJlbFRleHQudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICBjYXNlICd0aGlzJzpcbiAgICAgICAgICB0aGlzLnJkICs9IDA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ25leHQnOlxuICAgICAgICAgIHRoaXMucmQgKz0gNztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbGFzdCc6XG4gICAgICAgIGNhc2UgJ3ByZXZpb3VzJzpcbiAgICAgICAgICB0aGlzLnJkIC09IDc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc05hTih0aGlzLndlZWtkYXkpKSB7XG4gICAgICAgIHRoaXMud2Vla2RheSA9IDE7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIG1vbnRoRnVsbE9yTW9udGhBYmJyOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXignICsgcmVNb250aEZ1bGwgKyAnfCcgKyByZU1vbnRoQWJiciArICcpJywgJ2knKSxcbiAgICBuYW1lOiAnbW9udGhmdWxsIHwgbW9udGhhYmJyJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIG1vbnRoKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQodGhpcy55LCBsb29rdXBNb250aChtb250aCksIHRoaXMuZCk7XG4gICAgfVxuICB9LFxuXG4gIHR6Q29ycmVjdGlvbjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVUekNvcnJlY3Rpb24sICdpJyksXG4gICAgbmFtZTogJ3R6Y29ycmVjdGlvbicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKHR6Q29ycmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuem9uZShwcm9jZXNzVHpDb3JyZWN0aW9uKHR6Q29ycmVjdGlvbikpO1xuICAgIH1cbiAgfSxcblxuICB0ekFiYnI6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlVHpBYmJyKSxcbiAgICBuYW1lOiAndHphYmJyJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGFiYnIpIHtcbiAgICAgIHZhciBvZmZzZXQgPSB0ekFiYnJPZmZzZXRzW2FiYnIudG9Mb3dlckNhc2UoKV07XG5cbiAgICAgIGlmIChpc05hTihvZmZzZXQpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuem9uZShvZmZzZXQpO1xuICAgIH1cbiAgfSxcblxuICBhZ286IHtcbiAgICByZWdleDogL15hZ28vaSxcbiAgICBuYW1lOiAnYWdvJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2soKSB7XG4gICAgICB0aGlzLnJ5ID0gLXRoaXMucnk7XG4gICAgICB0aGlzLnJtID0gLXRoaXMucm07XG4gICAgICB0aGlzLnJkID0gLXRoaXMucmQ7XG4gICAgICB0aGlzLnJoID0gLXRoaXMucmg7XG4gICAgICB0aGlzLnJpID0gLXRoaXMucmk7XG4gICAgICB0aGlzLnJzID0gLXRoaXMucnM7XG4gICAgICB0aGlzLnJmID0gLXRoaXMucmY7XG4gICAgfVxuICB9LFxuXG4gIHllYXI0OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVllYXI0KSxcbiAgICBuYW1lOiAneWVhcjQnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgeWVhcikge1xuICAgICAgdGhpcy55ID0gK3llYXI7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cbiAgd2hpdGVzcGFjZToge1xuICAgIHJlZ2V4OiAvXlsgLixcXHRdKy8sXG4gICAgbmFtZTogJ3doaXRlc3BhY2UnXG4gICAgLy8gZG8gbm90aGluZ1xuICB9LFxuXG4gIGRhdGVTaG9ydFdpdGhUaW1lTG9uZzoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVEYXRlTm9ZZWFyICsgJ3Q/JyArIHJlSG91cjI0ICsgJ1s6Ll0nICsgcmVNaW51dGUgKyAnWzouXScgKyByZVNlY29uZCwgJ2knKSxcbiAgICBuYW1lOiAnZGF0ZXNob3J0d2l0aHRpbWVsb25nJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQodGhpcy55LCBsb29rdXBNb250aChtb250aCksICtkYXkpICYmIHRoaXMudGltZSgraG91ciwgK21pbnV0ZSwgK3NlY29uZCwgMCk7XG4gICAgfVxuICB9LFxuXG4gIGRhdGVTaG9ydFdpdGhUaW1lTG9uZzEyOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZURhdGVOb1llYXIgKyByZUhvdXIxMiArICdbOi5dJyArIHJlTWludXRlICsgJ1s6Ll0nICsgcmVTZWNvbmRseiArIHJlU3BhY2VPcHQgKyByZU1lcmlkaWFuLCAnaScpLFxuICAgIG5hbWU6ICdkYXRlc2hvcnR3aXRodGltZWxvbmcxMicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWVyaWRpYW4pIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCh0aGlzLnksIGxvb2t1cE1vbnRoKG1vbnRoKSwgK2RheSkgJiYgdGhpcy50aW1lKHByb2Nlc3NNZXJpZGlhbigraG91ciwgbWVyaWRpYW4pLCArbWludXRlLCArc2Vjb25kLCAwKTtcbiAgICB9XG4gIH0sXG5cbiAgZGF0ZVNob3J0V2l0aFRpbWVTaG9ydDoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVEYXRlTm9ZZWFyICsgJ3Q/JyArIHJlSG91cjI0ICsgJ1s6Ll0nICsgcmVNaW51dGUsICdpJyksXG4gICAgbmFtZTogJ2RhdGVzaG9ydHdpdGh0aW1lc2hvcnQnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgbW9udGgsIGRheSwgaG91ciwgbWludXRlKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQodGhpcy55LCBsb29rdXBNb250aChtb250aCksICtkYXkpICYmIHRoaXMudGltZSgraG91ciwgK21pbnV0ZSwgMCwgMCk7XG4gICAgfVxuICB9LFxuXG4gIGRhdGVTaG9ydFdpdGhUaW1lU2hvcnQxMjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVEYXRlTm9ZZWFyICsgcmVIb3VyMTIgKyAnWzouXScgKyByZU1pbnV0ZWx6ICsgcmVTcGFjZU9wdCArIHJlTWVyaWRpYW4sICdpJyksXG4gICAgbmFtZTogJ2RhdGVzaG9ydHdpdGh0aW1lc2hvcnQxMicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIG1lcmlkaWFuKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQodGhpcy55LCBsb29rdXBNb250aChtb250aCksICtkYXkpICYmIHRoaXMudGltZShwcm9jZXNzTWVyaWRpYW4oK2hvdXIsIG1lcmlkaWFuKSwgK21pbnV0ZSwgMCwgMCk7XG4gICAgfVxuICB9XG59O1xuXG52YXIgcmVzdWx0UHJvdG8gPSB7XG4gIC8vIGRhdGVcbiAgeTogTmFOLFxuICBtOiBOYU4sXG4gIGQ6IE5hTixcbiAgLy8gdGltZVxuICBoOiBOYU4sXG4gIGk6IE5hTixcbiAgczogTmFOLFxuICBmOiBOYU4sXG5cbiAgLy8gcmVsYXRpdmUgc2hpZnRzXG4gIHJ5OiAwLFxuICBybTogMCxcbiAgcmQ6IDAsXG4gIHJoOiAwLFxuICByaTogMCxcbiAgcnM6IDAsXG4gIHJmOiAwLFxuXG4gIC8vIHdlZWtkYXkgcmVsYXRlZCBzaGlmdHNcbiAgd2Vla2RheTogTmFOLFxuICB3ZWVrZGF5QmVoYXZpb3I6IDAsXG5cbiAgLy8gZmlyc3Qgb3IgbGFzdCBkYXkgb2YgbW9udGhcbiAgLy8gMCBub25lLCAxIGZpcnN0LCAtMSBsYXN0XG4gIGZpcnN0T3JMYXN0RGF5T2ZNb250aDogMCxcblxuICAvLyB0aW1lem9uZSBjb3JyZWN0aW9uIGluIG1pbnV0ZXNcbiAgejogTmFOLFxuXG4gIC8vIGNvdW50ZXJzXG4gIGRhdGVzOiAwLFxuICB0aW1lczogMCxcbiAgem9uZXM6IDAsXG5cbiAgLy8gaGVscGVyIGZ1bmN0aW9uc1xuICB5bWQ6IGZ1bmN0aW9uIHltZCh5LCBtLCBkKSB7XG4gICAgaWYgKHRoaXMuZGF0ZXMgPiAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5kYXRlcysrO1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy5tID0gbTtcbiAgICB0aGlzLmQgPSBkO1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICB0aW1lOiBmdW5jdGlvbiB0aW1lKGgsIGksIHMsIGYpIHtcbiAgICBpZiAodGhpcy50aW1lcyA+IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnRpbWVzKys7XG4gICAgdGhpcy5oID0gaDtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMucyA9IHM7XG4gICAgdGhpcy5mID0gZjtcblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICByZXNldFRpbWU6IGZ1bmN0aW9uIHJlc2V0VGltZSgpIHtcbiAgICB0aGlzLmggPSAwO1xuICAgIHRoaXMuaSA9IDA7XG4gICAgdGhpcy5zID0gMDtcbiAgICB0aGlzLmYgPSAwO1xuICAgIHRoaXMudGltZXMgPSAwO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIHpvbmU6IGZ1bmN0aW9uIHpvbmUobWludXRlcykge1xuICAgIGlmICh0aGlzLnpvbmVzIDw9IDEpIHtcbiAgICAgIHRoaXMuem9uZXMrKztcbiAgICAgIHRoaXMueiA9IG1pbnV0ZXM7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIHRvRGF0ZTogZnVuY3Rpb24gdG9EYXRlKHJlbGF0aXZlVG8pIHtcbiAgICBpZiAodGhpcy5kYXRlcyAmJiAhdGhpcy50aW1lcykge1xuICAgICAgdGhpcy5oID0gdGhpcy5pID0gdGhpcy5zID0gdGhpcy5mID0gMDtcbiAgICB9XG5cbiAgICAvLyBmaWxsIGhvbGVzXG4gICAgaWYgKGlzTmFOKHRoaXMueSkpIHtcbiAgICAgIHRoaXMueSA9IHJlbGF0aXZlVG8uZ2V0RnVsbFllYXIoKTtcbiAgICB9XG5cbiAgICBpZiAoaXNOYU4odGhpcy5tKSkge1xuICAgICAgdGhpcy5tID0gcmVsYXRpdmVUby5nZXRNb250aCgpO1xuICAgIH1cblxuICAgIGlmIChpc05hTih0aGlzLmQpKSB7XG4gICAgICB0aGlzLmQgPSByZWxhdGl2ZVRvLmdldERhdGUoKTtcbiAgICB9XG5cbiAgICBpZiAoaXNOYU4odGhpcy5oKSkge1xuICAgICAgdGhpcy5oID0gcmVsYXRpdmVUby5nZXRIb3VycygpO1xuICAgIH1cblxuICAgIGlmIChpc05hTih0aGlzLmkpKSB7XG4gICAgICB0aGlzLmkgPSByZWxhdGl2ZVRvLmdldE1pbnV0ZXMoKTtcbiAgICB9XG5cbiAgICBpZiAoaXNOYU4odGhpcy5zKSkge1xuICAgICAgdGhpcy5zID0gcmVsYXRpdmVUby5nZXRTZWNvbmRzKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzTmFOKHRoaXMuZikpIHtcbiAgICAgIHRoaXMuZiA9IHJlbGF0aXZlVG8uZ2V0TWlsbGlzZWNvbmRzKCk7XG4gICAgfVxuXG4gICAgLy8gYWRqdXN0IHNwZWNpYWwgZWFybHlcbiAgICBzd2l0Y2ggKHRoaXMuZmlyc3RPckxhc3REYXlPZk1vbnRoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHRoaXMuZCA9IDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAtMTpcbiAgICAgICAgdGhpcy5kID0gMDtcbiAgICAgICAgdGhpcy5tICs9IDE7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICghaXNOYU4odGhpcy53ZWVrZGF5KSkge1xuICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShyZWxhdGl2ZVRvLmdldFRpbWUoKSk7XG4gICAgICBkYXRlLnNldEZ1bGxZZWFyKHRoaXMueSwgdGhpcy5tLCB0aGlzLmQpO1xuICAgICAgZGF0ZS5zZXRIb3Vycyh0aGlzLmgsIHRoaXMuaSwgdGhpcy5zLCB0aGlzLmYpO1xuXG4gICAgICB2YXIgZG93ID0gZGF0ZS5nZXREYXkoKTtcblxuICAgICAgaWYgKHRoaXMud2Vla2RheUJlaGF2aW9yID09PSAyKSB7XG4gICAgICAgIC8vIFRvIG1ha2UgXCJ0aGlzIHdlZWtcIiB3b3JrLCB3aGVyZSB0aGUgY3VycmVudCBkYXkgb2Ygd2VlayBpcyBhIFwic3VuZGF5XCJcbiAgICAgICAgaWYgKGRvdyA9PT0gMCAmJiB0aGlzLndlZWtkYXkgIT09IDApIHtcbiAgICAgICAgICB0aGlzLndlZWtkYXkgPSAtNjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRvIG1ha2UgXCJzdW5kYXkgdGhpcyB3ZWVrXCIgd29yaywgd2hlcmUgdGhlIGN1cnJlbnQgZGF5IG9mIHdlZWsgaXMgbm90IGEgXCJzdW5kYXlcIlxuICAgICAgICBpZiAodGhpcy53ZWVrZGF5ID09PSAwICYmIGRvdyAhPT0gMCkge1xuICAgICAgICAgIHRoaXMud2Vla2RheSA9IDc7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmQgLT0gZG93O1xuICAgICAgICB0aGlzLmQgKz0gdGhpcy53ZWVrZGF5O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGRpZmYgPSB0aGlzLndlZWtkYXkgLSBkb3c7XG5cbiAgICAgICAgLy8gc29tZSBQSFAgbWFnaWNcbiAgICAgICAgaWYgKHRoaXMucmQgPCAwICYmIGRpZmYgPCAwIHx8IHRoaXMucmQgPj0gMCAmJiBkaWZmIDw9IC10aGlzLndlZWtkYXlCZWhhdmlvcikge1xuICAgICAgICAgIGRpZmYgKz0gNztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLndlZWtkYXkgPj0gMCkge1xuICAgICAgICAgIHRoaXMuZCArPSBkaWZmO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZCAtPSA3IC0gKE1hdGguYWJzKHRoaXMud2Vla2RheSkgLSBkb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53ZWVrZGF5ID0gTmFOO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGFkanVzdCByZWxhdGl2ZVxuICAgIHRoaXMueSArPSB0aGlzLnJ5O1xuICAgIHRoaXMubSArPSB0aGlzLnJtO1xuICAgIHRoaXMuZCArPSB0aGlzLnJkO1xuXG4gICAgdGhpcy5oICs9IHRoaXMucmg7XG4gICAgdGhpcy5pICs9IHRoaXMucmk7XG4gICAgdGhpcy5zICs9IHRoaXMucnM7XG4gICAgdGhpcy5mICs9IHRoaXMucmY7XG5cbiAgICB0aGlzLnJ5ID0gdGhpcy5ybSA9IHRoaXMucmQgPSAwO1xuICAgIHRoaXMucmggPSB0aGlzLnJpID0gdGhpcy5ycyA9IHRoaXMucmYgPSAwO1xuXG4gICAgdmFyIHJlc3VsdCA9IG5ldyBEYXRlKHJlbGF0aXZlVG8uZ2V0VGltZSgpKTtcbiAgICAvLyBzaW5jZSBEYXRlIGNvbnN0cnVjdG9yIHRyZWF0cyB5ZWFycyA8PSA5OSBhcyAxOTAwK1xuICAgIC8vIGl0IGNhbid0IGJlIHVzZWQsIHRodXMgdGhpcyB3ZWlyZCB3YXlcbiAgICByZXN1bHQuc2V0RnVsbFllYXIodGhpcy55LCB0aGlzLm0sIHRoaXMuZCk7XG4gICAgcmVzdWx0LnNldEhvdXJzKHRoaXMuaCwgdGhpcy5pLCB0aGlzLnMsIHRoaXMuZik7XG5cbiAgICAvLyBub3RlOiB0aGlzIGlzIGRvbmUgdHdpY2UgaW4gUEhQXG4gICAgLy8gZWFybHkgd2hlbiBwcm9jZXNzaW5nIHNwZWNpYWwgcmVsYXRpdmVzXG4gICAgLy8gYW5kIGxhdGVcbiAgICAvLyB0b2RvOiBjaGVjayBpZiB0aGUgbG9naWMgY2FuIGJlIHJlZHVjZWRcbiAgICAvLyB0byBqdXN0IG9uZSB0aW1lIGFjdGlvblxuICAgIHN3aXRjaCAodGhpcy5maXJzdE9yTGFzdERheU9mTW9udGgpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmVzdWx0LnNldERhdGUoMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAtMTpcbiAgICAgICAgcmVzdWx0LnNldE1vbnRoKHJlc3VsdC5nZXRNb250aCgpICsgMSwgMCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIGFkanVzdCB0aW1lem9uZVxuICAgIGlmICghaXNOYU4odGhpcy56KSAmJiByZXN1bHQuZ2V0VGltZXpvbmVPZmZzZXQoKSAhPT0gdGhpcy56KSB7XG4gICAgICByZXN1bHQuc2V0VVRDRnVsbFllYXIocmVzdWx0LmdldEZ1bGxZZWFyKCksIHJlc3VsdC5nZXRNb250aCgpLCByZXN1bHQuZ2V0RGF0ZSgpKTtcblxuICAgICAgcmVzdWx0LnNldFVUQ0hvdXJzKHJlc3VsdC5nZXRIb3VycygpLCByZXN1bHQuZ2V0TWludXRlcygpLCByZXN1bHQuZ2V0U2Vjb25kcygpIC0gdGhpcy56LCByZXN1bHQuZ2V0TWlsbGlzZWNvbmRzKCkpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3RydG90aW1lKHN0ciwgbm93KSB7XG4gIC8vICAgICAgIGRpc2N1c3MgYXQ6IGh0dHBzOi8vbG9jdXR1cy5pby9waHAvc3RydG90aW1lL1xuICAvLyAgICAgIG9yaWdpbmFsIGJ5OiBDYWlvIEFyaWVkZSAoaHR0cHM6Ly9jYWlvYXJpZWRlLmNvbSlcbiAgLy8gICAgICBpbXByb3ZlZCBieTogS2V2aW4gdmFuIFpvbm5ldmVsZCAoaHR0cHM6Ly9rdnouaW8pXG4gIC8vICAgICAgaW1wcm92ZWQgYnk6IENhaW8gQXJpZWRlIChodHRwczovL2NhaW9hcmllZGUuY29tKVxuICAvLyAgICAgIGltcHJvdmVkIGJ5OiBBLiBNYXTDrWFzIFF1ZXphZGEgKGh0dHBzOi8vYW1hdGlhc3EuY29tKVxuICAvLyAgICAgIGltcHJvdmVkIGJ5OiBwcmV1dGVyXG4gIC8vICAgICAgaW1wcm92ZWQgYnk6IEJyZXR0IFphbWlyIChodHRwczovL2JyZXR0LXphbWlyLm1lKVxuICAvLyAgICAgIGltcHJvdmVkIGJ5OiBNaXJrbyBGYWJlclxuICAvLyAgICAgICAgIGlucHV0IGJ5OiBEYXZpZFxuICAvLyAgICAgIGJ1Z2ZpeGVkIGJ5OiBXYWduZXIgQi4gU29hcmVzXG4gIC8vICAgICAgYnVnZml4ZWQgYnk6IEFydHVyIFRjaGVybnljaGV2XG4gIC8vICAgICAgYnVnZml4ZWQgYnk6IFN0ZXBoYW4gQsO2c2NoLVBsZXBlbGl0cyAoaHR0cHM6Ly9naXRodWIuY29tL3BsZXBlKVxuICAvLyByZWltcGxlbWVudGVkIGJ5OiBSYWZhxYIgS3VrYXdza2lcbiAgLy8gICAgICAgICAgIG5vdGUgMTogRXhhbXBsZXMgYWxsIGhhdmUgYSBmaXhlZCB0aW1lc3RhbXAgdG8gcHJldmVudFxuICAvLyAgICAgICAgICAgbm90ZSAxOiB0ZXN0cyB0byBmYWlsIGJlY2F1c2Ugb2YgdmFyaWFibGUgdGltZSh6b25lcylcbiAgLy8gICAgICAgIGV4YW1wbGUgMTogc3RydG90aW1lKCcrMSBkYXknLCAxMTI5NjMzMjAwKVxuICAvLyAgICAgICAgcmV0dXJucyAxOiAxMTI5NzE5NjAwXG4gIC8vICAgICAgICBleGFtcGxlIDI6IHN0cnRvdGltZSgnKzEgd2VlayAyIGRheXMgNCBob3VycyAyIHNlY29uZHMnLCAxMTI5NjMzMjAwKVxuICAvLyAgICAgICAgcmV0dXJucyAyOiAxMTMwNDI1MjAyXG4gIC8vICAgICAgICBleGFtcGxlIDM6IHN0cnRvdGltZSgnbGFzdCBtb250aCcsIDExMjk2MzMyMDApXG4gIC8vICAgICAgICByZXR1cm5zIDM6IDExMjcwNDEyMDBcbiAgLy8gICAgICAgIGV4YW1wbGUgNDogc3RydG90aW1lKCcyMDA5LTA1LTA0IDA4OjMwOjAwKzAwJylcbiAgLy8gICAgICAgIHJldHVybnMgNDogMTI0MTQyNTgwMFxuICAvLyAgICAgICAgZXhhbXBsZSA1OiBzdHJ0b3RpbWUoJzIwMDktMDUtMDQgMDg6MzA6MDArMDI6MDAnKVxuICAvLyAgICAgICAgcmV0dXJucyA1OiAxMjQxNDE4NjAwXG4gIC8vICAgICAgICBleGFtcGxlIDY6IHN0cnRvdGltZSgnMjAwOS0wNS0wNCAwODozMDowMCBZV1QnKVxuICAvLyAgICAgICAgcmV0dXJucyA2OiAxMjQxNDU0NjAwXG5cbiAgaWYgKG5vdyA9PSBudWxsKSB7XG4gICAgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gIH1cblxuICAvLyB0aGUgcnVsZSBvcmRlciBpcyBpbXBvcnRhbnRcbiAgLy8gaWYgbXVsdGlwbGUgcnVsZXMgbWF0Y2gsIHRoZSBsb25nZXN0IG1hdGNoIHdpbnNcbiAgLy8gaWYgbXVsdGlwbGUgcnVsZXMgbWF0Y2ggdGhlIHNhbWUgc3RyaW5nLCB0aGUgZmlyc3QgbWF0Y2ggd2luc1xuICB2YXIgcnVsZXMgPSBbZm9ybWF0cy55ZXN0ZXJkYXksIGZvcm1hdHMubm93LCBmb3JtYXRzLm5vb24sIGZvcm1hdHMubWlkbmlnaHRPclRvZGF5LCBmb3JtYXRzLnRvbW9ycm93LCBmb3JtYXRzLnRpbWVzdGFtcCwgZm9ybWF0cy5maXJzdE9yTGFzdERheSwgZm9ybWF0cy5iYWNrT3JGcm9udE9mLFxuICAvLyBmb3JtYXRzLndlZWtkYXlPZiwgLy8gbm90IHlldCBpbXBsZW1lbnRlZFxuICBmb3JtYXRzLnRpbWVUaW55MTIsIGZvcm1hdHMudGltZVNob3J0MTIsIGZvcm1hdHMudGltZUxvbmcxMiwgZm9ybWF0cy5tc3NxbHRpbWUsIGZvcm1hdHMudGltZVNob3J0MjQsIGZvcm1hdHMudGltZUxvbmcyNCwgZm9ybWF0cy5pc284NjAxbG9uZywgZm9ybWF0cy5nbnVOb0NvbG9uLCBmb3JtYXRzLmlzbzg2MDFub0NvbG9uLCBmb3JtYXRzLmFtZXJpY2FuU2hvcnQsIGZvcm1hdHMuYW1lcmljYW4sIGZvcm1hdHMuaXNvODYwMWRhdGU0LCBmb3JtYXRzLmlzbzg2MDFkYXRlU2xhc2gsIGZvcm1hdHMuZGF0ZVNsYXNoLCBmb3JtYXRzLmdudURhdGVTaG9ydE9ySXNvODYwMWRhdGUyLCBmb3JtYXRzLmdudURhdGVTaG9ydGVyLCBmb3JtYXRzLmRhdGVGdWxsLCBmb3JtYXRzLnBvaW50ZWREYXRlNCwgZm9ybWF0cy5wb2ludGVkRGF0ZTIsIGZvcm1hdHMuZGF0ZU5vRGF5LCBmb3JtYXRzLmRhdGVOb0RheVJldiwgZm9ybWF0cy5kYXRlVGV4dHVhbCwgZm9ybWF0cy5kYXRlTm9ZZWFyLCBmb3JtYXRzLmRhdGVOb1llYXJSZXYsIGZvcm1hdHMuZGF0ZU5vQ29sb24sIGZvcm1hdHMueG1sUnBjLCBmb3JtYXRzLnhtbFJwY05vQ29sb24sIGZvcm1hdHMuc29hcCwgZm9ybWF0cy53ZGR4LCBmb3JtYXRzLmV4aWYsIGZvcm1hdHMucGd5ZG90ZCwgZm9ybWF0cy5pc29XZWVrRGF5LCBmb3JtYXRzLnBnVGV4dFNob3J0LCBmb3JtYXRzLnBnVGV4dFJldmVyc2UsIGZvcm1hdHMuY2xmLCBmb3JtYXRzLnllYXI0LCBmb3JtYXRzLmFnbywgZm9ybWF0cy5kYXlUZXh0LCBmb3JtYXRzLnJlbGF0aXZlVGV4dFdlZWssIGZvcm1hdHMucmVsYXRpdmVUZXh0LCBmb3JtYXRzLm1vbnRoRnVsbE9yTW9udGhBYmJyLCBmb3JtYXRzLnR6Q29ycmVjdGlvbiwgZm9ybWF0cy50ekFiYnIsIGZvcm1hdHMuZGF0ZVNob3J0V2l0aFRpbWVTaG9ydDEyLCBmb3JtYXRzLmRhdGVTaG9ydFdpdGhUaW1lTG9uZzEyLCBmb3JtYXRzLmRhdGVTaG9ydFdpdGhUaW1lU2hvcnQsIGZvcm1hdHMuZGF0ZVNob3J0V2l0aFRpbWVMb25nLCBmb3JtYXRzLnJlbGF0aXZlLCBmb3JtYXRzLndoaXRlc3BhY2VdO1xuXG4gIHZhciByZXN1bHQgPSBPYmplY3QuY3JlYXRlKHJlc3VsdFByb3RvKTtcblxuICB3aGlsZSAoc3RyLmxlbmd0aCkge1xuICAgIHZhciBsb25nZXN0TWF0Y2ggPSBudWxsO1xuICAgIHZhciBmaW5hbFJ1bGUgPSBudWxsO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBydWxlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBmb3JtYXQgPSBydWxlc1tpXTtcblxuICAgICAgdmFyIG1hdGNoID0gc3RyLm1hdGNoKGZvcm1hdC5yZWdleCk7XG5cbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBpZiAoIWxvbmdlc3RNYXRjaCB8fCBtYXRjaFswXS5sZW5ndGggPiBsb25nZXN0TWF0Y2hbMF0ubGVuZ3RoKSB7XG4gICAgICAgICAgbG9uZ2VzdE1hdGNoID0gbWF0Y2g7XG4gICAgICAgICAgZmluYWxSdWxlID0gZm9ybWF0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFmaW5hbFJ1bGUgfHwgZmluYWxSdWxlLmNhbGxiYWNrICYmIGZpbmFsUnVsZS5jYWxsYmFjay5hcHBseShyZXN1bHQsIGxvbmdlc3RNYXRjaCkgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3RyID0gc3RyLnN1YnN0cihsb25nZXN0TWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICBmaW5hbFJ1bGUgPSBudWxsO1xuICAgIGxvbmdlc3RNYXRjaCA9IG51bGw7XG4gIH1cblxuICByZXR1cm4gTWF0aC5mbG9vcihyZXN1bHQudG9EYXRlKG5ldyBEYXRlKG5vdyAqIDEwMDApKSAvIDEwMDApO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0cnRvdGltZS5qcy5tYXAiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5pX2dldCh2YXJuYW1lKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gIC8vICBkaXNjdXNzIGF0OiBodHRwczovL2xvY3V0dXMuaW8vcGhwL2luaV9nZXQvXG4gIC8vIG9yaWdpbmFsIGJ5OiBCcmV0dCBaYW1pciAoaHR0cHM6Ly9icmV0dC16YW1pci5tZSlcbiAgLy8gICAgICBub3RlIDE6IFRoZSBpbmkgdmFsdWVzIG11c3QgYmUgc2V0IGJ5IGluaV9zZXQgb3IgbWFudWFsbHkgd2l0aGluIGFuIGluaSBmaWxlXG4gIC8vICAgZXhhbXBsZSAxOiBpbmlfc2V0KCdkYXRlLnRpbWV6b25lJywgJ0FzaWEvSG9uZ19Lb25nJylcbiAgLy8gICBleGFtcGxlIDE6IGluaV9nZXQoJ2RhdGUudGltZXpvbmUnKVxuICAvLyAgIHJldHVybnMgMTogJ0FzaWEvSG9uZ19Lb25nJ1xuXG4gIHZhciAkZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWw7XG4gICRnbG9iYWwuJGxvY3V0dXMgPSAkZ2xvYmFsLiRsb2N1dHVzIHx8IHt9O1xuICB2YXIgJGxvY3V0dXMgPSAkZ2xvYmFsLiRsb2N1dHVzO1xuICAkbG9jdXR1cy5waHAgPSAkbG9jdXR1cy5waHAgfHwge307XG4gICRsb2N1dHVzLnBocC5pbmkgPSAkbG9jdXR1cy5waHAuaW5pIHx8IHt9O1xuXG4gIGlmICgkbG9jdXR1cy5waHAuaW5pW3Zhcm5hbWVdICYmICRsb2N1dHVzLnBocC5pbmlbdmFybmFtZV0ubG9jYWxfdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICgkbG9jdXR1cy5waHAuaW5pW3Zhcm5hbWVdLmxvY2FsX3ZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiAkbG9jdXR1cy5waHAuaW5pW3Zhcm5hbWVdLmxvY2FsX3ZhbHVlO1xuICB9XG5cbiAgcmV0dXJuICcnO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluaV9nZXQuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN0cmxlbihzdHJpbmcpIHtcbiAgLy8gIGRpc2N1c3MgYXQ6IGh0dHBzOi8vbG9jdXR1cy5pby9waHAvc3RybGVuL1xuICAvLyBvcmlnaW5hbCBieTogS2V2aW4gdmFuIFpvbm5ldmVsZCAoaHR0cHM6Ly9rdnouaW8pXG4gIC8vIGltcHJvdmVkIGJ5OiBTYWtpbW9yaVxuICAvLyBpbXByb3ZlZCBieTogS2V2aW4gdmFuIFpvbm5ldmVsZCAoaHR0cHM6Ly9rdnouaW8pXG4gIC8vICAgIGlucHV0IGJ5OiBLaXJrIFN0cm9iZWNrXG4gIC8vIGJ1Z2ZpeGVkIGJ5OiBPbm5vIE1hcnNtYW4gKGh0dHBzOi8vdHdpdHRlci5jb20vb25ub21hcnNtYW4pXG4gIC8vICByZXZpc2VkIGJ5OiBCcmV0dCBaYW1pciAoaHR0cHM6Ly9icmV0dC16YW1pci5tZSlcbiAgLy8gICAgICBub3RlIDE6IE1heSBsb29rIGxpa2Ugb3ZlcmtpbGwsIGJ1dCBpbiBvcmRlciB0byBiZSB0cnVseSBmYWl0aGZ1bCB0byBoYW5kbGluZyBhbGwgVW5pY29kZVxuICAvLyAgICAgIG5vdGUgMTogY2hhcmFjdGVycyBhbmQgdG8gdGhpcyBmdW5jdGlvbiBpbiBQSFAgd2hpY2ggZG9lcyBub3QgY291bnQgdGhlIG51bWJlciBvZiBieXRlc1xuICAvLyAgICAgIG5vdGUgMTogYnV0IGNvdW50cyB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMsIHNvbWV0aGluZyBsaWtlIHRoaXMgaXMgcmVhbGx5IG5lY2Vzc2FyeS5cbiAgLy8gICBleGFtcGxlIDE6IHN0cmxlbignS2V2aW4gdmFuIFpvbm5ldmVsZCcpXG4gIC8vICAgcmV0dXJucyAxOiAxOVxuICAvLyAgIGV4YW1wbGUgMjogaW5pX3NldCgndW5pY29kZS5zZW1hbnRpY3MnLCAnb24nKVxuICAvLyAgIGV4YW1wbGUgMjogc3RybGVuKCdBXFx1ZDg3ZVxcdWRjMDRaJylcbiAgLy8gICByZXR1cm5zIDI6IDNcblxuICB2YXIgc3RyID0gc3RyaW5nICsgJyc7XG5cbiAgdmFyIGluaVZhbCA9ICh0eXBlb2YgcmVxdWlyZSAhPT0gJ3VuZGVmaW5lZCcgPyByZXF1aXJlKCcuLi9pbmZvL2luaV9nZXQnKSgndW5pY29kZS5zZW1hbnRpY3MnKSA6IHVuZGVmaW5lZCkgfHwgJ29mZic7XG4gIGlmIChpbmlWYWwgPT09ICdvZmYnKSB7XG4gICAgcmV0dXJuIHN0ci5sZW5ndGg7XG4gIH1cblxuICB2YXIgaSA9IDA7XG4gIHZhciBsZ3RoID0gMDtcblxuICB2YXIgZ2V0V2hvbGVDaGFyID0gZnVuY3Rpb24gZ2V0V2hvbGVDaGFyKHN0ciwgaSkge1xuICAgIHZhciBjb2RlID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgdmFyIG5leHQgPSAnJztcbiAgICB2YXIgcHJldiA9ICcnO1xuICAgIGlmIChjb2RlID49IDB4RDgwMCAmJiBjb2RlIDw9IDB4REJGRikge1xuICAgICAgLy8gSGlnaCBzdXJyb2dhdGUgKGNvdWxkIGNoYW5nZSBsYXN0IGhleCB0byAweERCN0YgdG9cbiAgICAgIC8vIHRyZWF0IGhpZ2ggcHJpdmF0ZSBzdXJyb2dhdGVzIGFzIHNpbmdsZSBjaGFyYWN0ZXJzKVxuICAgICAgaWYgKHN0ci5sZW5ndGggPD0gaSArIDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIaWdoIHN1cnJvZ2F0ZSB3aXRob3V0IGZvbGxvd2luZyBsb3cgc3Vycm9nYXRlJyk7XG4gICAgICB9XG4gICAgICBuZXh0ID0gc3RyLmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgaWYgKG5leHQgPCAweERDMDAgfHwgbmV4dCA+IDB4REZGRikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hpZ2ggc3Vycm9nYXRlIHdpdGhvdXQgZm9sbG93aW5nIGxvdyBzdXJyb2dhdGUnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHIuY2hhckF0KGkpICsgc3RyLmNoYXJBdChpICsgMSk7XG4gICAgfSBlbHNlIGlmIChjb2RlID49IDB4REMwMCAmJiBjb2RlIDw9IDB4REZGRikge1xuICAgICAgLy8gTG93IHN1cnJvZ2F0ZVxuICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMb3cgc3Vycm9nYXRlIHdpdGhvdXQgcHJlY2VkaW5nIGhpZ2ggc3Vycm9nYXRlJyk7XG4gICAgICB9XG4gICAgICBwcmV2ID0gc3RyLmNoYXJDb2RlQXQoaSAtIDEpO1xuICAgICAgaWYgKHByZXYgPCAweEQ4MDAgfHwgcHJldiA+IDB4REJGRikge1xuICAgICAgICAvLyAoY291bGQgY2hhbmdlIGxhc3QgaGV4IHRvIDB4REI3RiB0byB0cmVhdCBoaWdoIHByaXZhdGUgc3Vycm9nYXRlc1xuICAgICAgICAvLyBhcyBzaW5nbGUgY2hhcmFjdGVycylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMb3cgc3Vycm9nYXRlIHdpdGhvdXQgcHJlY2VkaW5nIGhpZ2ggc3Vycm9nYXRlJyk7XG4gICAgICB9XG4gICAgICAvLyBXZSBjYW4gcGFzcyBvdmVyIGxvdyBzdXJyb2dhdGVzIG5vdyBhcyB0aGUgc2Vjb25kXG4gICAgICAvLyBjb21wb25lbnQgaW4gYSBwYWlyIHdoaWNoIHdlIGhhdmUgYWxyZWFkeSBwcm9jZXNzZWRcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHN0ci5jaGFyQXQoaSk7XG4gIH07XG5cbiAgZm9yIChpID0gMCwgbGd0aCA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZ2V0V2hvbGVDaGFyKHN0ciwgaSkgPT09IGZhbHNlKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gQWRhcHQgdGhpcyBsaW5lIGF0IHRoZSB0b3Agb2YgYW55IGxvb3AsIHBhc3NpbmcgaW4gdGhlIHdob2xlIHN0cmluZyBhbmRcbiAgICAvLyB0aGUgY3VycmVudCBpdGVyYXRpb24gYW5kIHJldHVybmluZyBhIHZhcmlhYmxlIHRvIHJlcHJlc2VudCB0aGUgaW5kaXZpZHVhbCBjaGFyYWN0ZXI7XG4gICAgLy8gcHVycG9zZSBpcyB0byB0cmVhdCB0aGUgZmlyc3QgcGFydCBvZiBhIHN1cnJvZ2F0ZSBwYWlyIGFzIHRoZSB3aG9sZSBjaGFyYWN0ZXIgYW5kIHRoZW5cbiAgICAvLyBpZ25vcmUgdGhlIHNlY29uZCBwYXJ0XG4gICAgbGd0aCsrO1xuICB9XG5cbiAgcmV0dXJuIGxndGg7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RybGVuLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc19udW1lcmljKG1peGVkVmFyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gIC8vICBkaXNjdXNzIGF0OiBodHRwczovL2xvY3V0dXMuaW8vcGhwL2lzX251bWVyaWMvXG4gIC8vIG9yaWdpbmFsIGJ5OiBLZXZpbiB2YW4gWm9ubmV2ZWxkIChodHRwczovL2t2ei5pbylcbiAgLy8gaW1wcm92ZWQgYnk6IERhdmlkXG4gIC8vIGltcHJvdmVkIGJ5OiB0YWl0aFxuICAvLyBidWdmaXhlZCBieTogVGltIGRlIEtvbmluZ1xuICAvLyBidWdmaXhlZCBieTogV2ViRGV2SG9ibyAoaHR0cHM6Ly93ZWJkZXZob2JvLmJsb2dzcG90LmNvbS8pXG4gIC8vIGJ1Z2ZpeGVkIGJ5OiBCcmV0dCBaYW1pciAoaHR0cHM6Ly9icmV0dC16YW1pci5tZSlcbiAgLy8gYnVnZml4ZWQgYnk6IERlbmlzIENoZW51IChodHRwczovL3Nobm91bGxlLm5ldClcbiAgLy8gICBleGFtcGxlIDE6IGlzX251bWVyaWMoMTg2LjMxKVxuICAvLyAgIHJldHVybnMgMTogdHJ1ZVxuICAvLyAgIGV4YW1wbGUgMjogaXNfbnVtZXJpYygnS2V2aW4gdmFuIFpvbm5ldmVsZCcpXG4gIC8vICAgcmV0dXJucyAyOiBmYWxzZVxuICAvLyAgIGV4YW1wbGUgMzogaXNfbnVtZXJpYygnICsxODYuMzFlMicpXG4gIC8vICAgcmV0dXJucyAzOiB0cnVlXG4gIC8vICAgZXhhbXBsZSA0OiBpc19udW1lcmljKCcnKVxuICAvLyAgIHJldHVybnMgNDogZmFsc2VcbiAgLy8gICBleGFtcGxlIDU6IGlzX251bWVyaWMoW10pXG4gIC8vICAgcmV0dXJucyA1OiBmYWxzZVxuICAvLyAgIGV4YW1wbGUgNjogaXNfbnVtZXJpYygnMSAnKVxuICAvLyAgIHJldHVybnMgNjogZmFsc2VcblxuICB2YXIgd2hpdGVzcGFjZSA9IFsnICcsICdcXG4nLCAnXFxyJywgJ1xcdCcsICdcXGYnLCAnXFx4MGInLCAnXFx4YTAnLCAnXFx1MjAwMCcsICdcXHUyMDAxJywgJ1xcdTIwMDInLCAnXFx1MjAwMycsICdcXHUyMDA0JywgJ1xcdTIwMDUnLCAnXFx1MjAwNicsICdcXHUyMDA3JywgJ1xcdTIwMDgnLCAnXFx1MjAwOScsICdcXHUyMDBBJywgJ1xcdTIwMEInLCAnXFx1MjAyOCcsICdcXHUyMDI5JywgJ1xcdTMwMDAnXS5qb2luKCcnKTtcblxuICAvLyBAdG9kbzogQnJlYWsgdGhpcyB1cCB1c2luZyBtYW55IHNpbmdsZSBjb25kaXRpb25zIHdpdGggZWFybHkgcmV0dXJuc1xuICByZXR1cm4gKHR5cGVvZiBtaXhlZFZhciA9PT0gJ251bWJlcicgfHwgdHlwZW9mIG1peGVkVmFyID09PSAnc3RyaW5nJyAmJiB3aGl0ZXNwYWNlLmluZGV4T2YobWl4ZWRWYXIuc2xpY2UoLTEpKSA9PT0gLTEpICYmIG1peGVkVmFyICE9PSAnJyAmJiAhaXNOYU4obWl4ZWRWYXIpO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzX251bWVyaWMuanMubWFwIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGU7IH07XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBkZWZpbml0aW9uKSB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTsgfSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLyohXG4gKiBMYXJhdmVsIEphdmFzY3JpcHQgVmFsaWRhdGlvblxuICpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9lbmdzb2Z0L2xhcmF2ZWwtanN2YWxpZGF0aW9uXG4gKlxuICogSGVscGVyIGZ1bmN0aW9ucyB1c2VkIGJ5IHZhbGlkYXRvcnNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgUHJvZW5nc29mdFxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cblxuaW1wb3J0IHN0cmxlbiBmcm9tICdsb2N1dHVzL3BocC9zdHJpbmdzL3N0cmxlbic7XG5pbXBvcnQgYXJyYXlfZGlmZiBmcm9tICdsb2N1dHVzL3BocC9hcnJheS9hcnJheV9kaWZmJztcbmltcG9ydCBzdHJ0b3RpbWUgZnJvbSAnbG9jdXR1cy9waHAvZGF0ZXRpbWUvc3RydG90aW1lJztcbmltcG9ydCBpc19udW1lcmljIGZyb20gJ2xvY3V0dXMvcGhwL3Zhci9pc19udW1lcmljJztcblxuJC5leHRlbmQodHJ1ZSwgbGFyYXZlbFZhbGlkYXRpb24sIHtcblxuICAgIGhlbHBlcnM6IHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTnVtZXJpYyBydWxlc1xuICAgICAgICAgKi9cbiAgICAgICAgbnVtZXJpY1J1bGVzOiBbJ0ludGVnZXInLCAnTnVtZXJpYyddLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXRzIHRoZSBmaWxlIGluZm9ybWF0aW9uIGZyb20gZmlsZSBpbnB1dC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGZpZWxkT2JqXG4gICAgICAgICAqIEBwYXJhbSBpbmRleFxuICAgICAgICAgKiBAcmV0dXJucyB7e2ZpbGU6ICosIGV4dGVuc2lvbjogc3RyaW5nLCBzaXplOiBudW1iZXJ9fVxuICAgICAgICAgKi9cbiAgICAgICAgZmlsZWluZm86IGZ1bmN0aW9uIChmaWVsZE9iaiwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBGaWxlTmFtZSA9IGZpZWxkT2JqLnZhbHVlO1xuICAgICAgICAgICAgaW5kZXggPSB0eXBlb2YgaW5kZXggIT09ICd1bmRlZmluZWQnID8gaW5kZXggOiAwO1xuICAgICAgICAgICAgaWYgKCBmaWVsZE9iai5maWxlcyAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZpZWxkT2JqLmZpbGVzW2luZGV4XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IEZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uOiBGaWxlTmFtZS5zdWJzdHIoRmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKSArIDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogZmllbGRPYmouZmlsZXNbaW5kZXhdLnNpemUgLyAxMDI0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogZmllbGRPYmouZmlsZXNbaW5kZXhdLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0cyB0aGUgc2VsZWN0b3JzIGZvciB0aCBzcGVjaWZpZWQgZmllbGQgbmFtZXMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBuYW1lc1xuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgc2VsZWN0b3I6IGZ1bmN0aW9uIChuYW1lcykge1xuICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gW107XG4gICAgICAgICAgICBpZiAoISB0aGlzLmlzQXJyYXkobmFtZXMpKSAge1xuICAgICAgICAgICAgICAgIG5hbWVzID0gW25hbWVzXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rvci5wdXNoKFwiW25hbWU9J1wiICsgbmFtZXNbaV0gKyBcIiddXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLmpvaW4oKTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVjayBpZiBlbGVtZW50IGhhcyBudW1lcmljIHJ1bGVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIGhhc051bWVyaWNSdWxlczogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhc1J1bGVzKGVsZW1lbnQsIHRoaXMubnVtZXJpY1J1bGVzKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgZWxlbWVudCBoYXMgcGFzc2VkIHJ1bGVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAgICAgKiBAcGFyYW0gcnVsZXNcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICBoYXNSdWxlczogZnVuY3Rpb24gKGVsZW1lbnQsIHJ1bGVzKSB7XG5cbiAgICAgICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBydWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBydWxlcyA9IFtydWxlc107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2YWxpZGF0b3IgPSAkLmRhdGEoZWxlbWVudC5mb3JtLCBcInZhbGlkYXRvclwiKTtcbiAgICAgICAgICAgIHZhciBsaXN0UnVsZXMgPSBbXTtcbiAgICAgICAgICAgIHZhciBjYWNoZSA9IHZhbGlkYXRvci5hcnJheVJ1bGVzQ2FjaGU7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5uYW1lIGluIGNhY2hlKSB7XG4gICAgICAgICAgICAgICAgJC5lYWNoKGNhY2hlW2VsZW1lbnQubmFtZV0sIGZ1bmN0aW9uIChpbmRleCwgYXJyYXlSdWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RSdWxlcy5wdXNoKGFycmF5UnVsZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5uYW1lIGluIHZhbGlkYXRvci5zZXR0aW5ncy5ydWxlcykge1xuICAgICAgICAgICAgICAgIGxpc3RSdWxlcy5wdXNoKHZhbGlkYXRvci5zZXR0aW5ncy5ydWxlc1tlbGVtZW50Lm5hbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQuZWFjaChsaXN0UnVsZXMsIGZ1bmN0aW9uKGluZGV4LG9ialJ1bGVzKXtcbiAgICAgICAgICAgICAgICBpZiAoJ2xhcmF2ZWxWYWxpZGF0aW9uJyBpbiBvYmpSdWxlcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3J1bGVzPW9ialJ1bGVzLmxhcmF2ZWxWYWxpZGF0aW9uO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9ydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCQuaW5BcnJheShfcnVsZXNbaV1bMF0scnVsZXMpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm4gdGhlIHN0cmluZyBsZW5ndGggdXNpbmcgUEhQIGZ1bmN0aW9uLlxuICAgICAgICAgKiBodHRwOi8vcGhwLm5ldC9tYW51YWwvZW4vZnVuY3Rpb24uc3RybGVuLnBocFxuICAgICAgICAgKiBodHRwOi8vcGhwanMub3JnL2Z1bmN0aW9ucy9zdHJsZW4vXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBzdHJpbmdcbiAgICAgICAgICovXG4gICAgICAgIHN0cmxlbjogZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmxlbihzdHJpbmcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgdGhlIHNpemUgb2YgdGhlIG9iamVjdCBkZXBlbmRpbmcgb2YgaGlzIHR5cGUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBvYmpcbiAgICAgICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIHZhbHVlXG4gICAgICAgICAqIEByZXR1cm5zIGludFxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0U2l6ZTogZnVuY3Rpb24gZ2V0U2l6ZShvYmosIGVsZW1lbnQsIHZhbHVlKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmhhc051bWVyaWNSdWxlcyhlbGVtZW50KSAmJiB0aGlzLmlzX251bWVyaWModmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudC50eXBlID09PSAnZmlsZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChNYXRoLmZsb29yKHRoaXMuZmlsZWluZm8oZWxlbWVudCkuc2l6ZSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnN0cmxlbih2YWx1ZSkpO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybiBzcGVjaWZpZWQgcnVsZSBmcm9tIGVsZW1lbnQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBydWxlXG4gICAgICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICAgICAqIEByZXR1cm5zIG9iamVjdFxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0TGFyYXZlbFZhbGlkYXRpb246IGZ1bmN0aW9uKHJ1bGUsIGVsZW1lbnQpIHtcblxuICAgICAgICAgICAgdmFyIGZvdW5kID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgJC5lYWNoKCQudmFsaWRhdG9yLnN0YXRpY1J1bGVzKGVsZW1lbnQpLCBmdW5jdGlvbihrZXksIHJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleT09PVwibGFyYXZlbFZhbGlkYXRpb25cIikge1xuICAgICAgICAgICAgICAgICAgICAkLmVhY2gocnVsZXMsIGZ1bmN0aW9uIChpLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlWzBdPT09cnVsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kPXZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm4gaGUgdGltZXN0YW1wIG9mIHZhbHVlIHBhc3NlZCB1c2luZyBmb3JtYXQgb3IgZGVmYXVsdCBmb3JtYXQgaW4gZWxlbWVudC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHZhbHVlXG4gICAgICAgICAqIEBwYXJhbSBmb3JtYXRcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW58aW50fVxuICAgICAgICAgKi9cbiAgICAgICAgcGFyc2VUaW1lOiBmdW5jdGlvbiAodmFsdWUsIGZvcm1hdCkge1xuXG4gICAgICAgICAgICB2YXIgdGltZVZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgZm10ID0gbmV3IERhdGVGb3JtYXR0ZXIoKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGZvcm1hdCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgZm9ybWF0ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHZhciBkYXRlUnVsZSA9IHRoaXMuZ2V0TGFyYXZlbFZhbGlkYXRpb24oJ0RhdGVGb3JtYXQnLCBmb3JtYXQpO1xuICAgICAgICAgICAgICAgIGlmIChkYXRlUnVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdCA9IGRhdGVSdWxlWzFdWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZm9ybWF0ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aW1lVmFsdWUgPSB0aGlzLnN0cnRvdGltZSh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpbWVWYWx1ZSA9IGZtdC5wYXJzZURhdGUodmFsdWUsIGZvcm1hdCk7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVWYWx1ZSBpbnN0YW5jZW9mIERhdGUgJiYgZm10LmZvcm1hdERhdGUodGltZVZhbHVlLCBmb3JtYXQpID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aW1lVmFsdWUgPSBNYXRoLnJvdW5kKCh0aW1lVmFsdWUuZ2V0VGltZSgpIC8gMTAwMCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRpbWVWYWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29tcGFyZSBhIGdpdmVuIGRhdGUgYWdhaW5zdCBhbm90aGVyIHVzaW5nIGFuIG9wZXJhdG9yLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gdmFsaWRhdG9yXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICAgICAqIEBwYXJhbSBvcGVyYXRvclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgY29tcGFyZURhdGVzOiBmdW5jdGlvbiAodmFsaWRhdG9yLCB2YWx1ZSwgZWxlbWVudCwgcGFyYW1zLCBvcGVyYXRvcikge1xuXG4gICAgICAgICAgICB2YXIgdGltZUNvbXBhcmUgPSB0aGlzLnBhcnNlVGltZShwYXJhbXMpO1xuXG4gICAgICAgICAgICBpZiAoIXRpbWVDb21wYXJlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9IHRoaXMuZGVwZW5kZW50RWxlbWVudCh2YWxpZGF0b3IsIGVsZW1lbnQsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGltZUNvbXBhcmUgPSB0aGlzLnBhcnNlVGltZSh2YWxpZGF0b3IuZWxlbWVudFZhbHVlKHRhcmdldCksIHRhcmdldCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0aW1lVmFsdWUgPSB0aGlzLnBhcnNlVGltZSh2YWx1ZSwgZWxlbWVudCk7XG4gICAgICAgICAgICBpZiAodGltZVZhbHVlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChvcGVyYXRvcikge1xuICAgICAgICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZVZhbHVlIDwgdGltZUNvbXBhcmU7XG5cbiAgICAgICAgICAgICAgICBjYXNlICc8PSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lVmFsdWUgPD0gdGltZUNvbXBhcmU7XG5cbiAgICAgICAgICAgICAgICBjYXNlICc9PSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVWYWx1ZSA9PT0gdGltZUNvbXBhcmU7XG5cbiAgICAgICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVWYWx1ZSA+IHRpbWVDb21wYXJlO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZVZhbHVlID49IHRpbWVDb21wYXJlO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBvcGVyYXRvci4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBtZXRob2QgYWxsb3dzIHlvdSB0byBpbnRlbGxpZ2VudGx5IGd1ZXNzIHRoZSBkYXRlIGJ5IGNsb3NlbHkgbWF0Y2hpbmcgdGhlIHNwZWNpZmljIGZvcm1hdC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHZhbHVlXG4gICAgICAgICAqIEBwYXJhbSBmb3JtYXRcbiAgICAgICAgICogQHJldHVybnMge0RhdGV9XG4gICAgICAgICAqL1xuICAgICAgICBndWVzc0RhdGU6IGZ1bmN0aW9uICh2YWx1ZSwgZm9ybWF0KSB7XG4gICAgICAgICAgICB2YXIgZm10ID0gbmV3IERhdGVGb3JtYXR0ZXIoKTtcbiAgICAgICAgICAgIHJldHVybiBmbXQuZ3Vlc3NEYXRlKHZhbHVlLCBmb3JtYXQpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgVW5peCB0aW1lc3RhbXAgYmFzZWQgb24gUEhQIGZ1bmN0aW9uIHN0cm90b3RpbWUuXG4gICAgICAgICAqIGh0dHA6Ly9waHAubmV0L21hbnVhbC9lcy9mdW5jdGlvbi5zdHJ0b3RpbWUucGhwXG4gICAgICAgICAqIGh0dHA6Ly9waHBqcy5vcmcvZnVuY3Rpb25zL3N0cnRvdGltZS9cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHRleHRcbiAgICAgICAgICogQHBhcmFtIG5vd1xuICAgICAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgICAgICovXG4gICAgICAgIHN0cnRvdGltZTogZnVuY3Rpb24gKHRleHQsIG5vdykge1xuICAgICAgICAgICAgcmV0dXJuIHN0cnRvdGltZSh0ZXh0LCBub3cpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgaWYgdmFsdWUgaXMgbnVtZXJpYy5cbiAgICAgICAgICogaHR0cDovL3BocC5uZXQvbWFudWFsL2VzL3Zhci5pc19udW1lcmljLnBocFxuICAgICAgICAgKiBodHRwOi8vcGhwanMub3JnL2Z1bmN0aW9ucy9pc19udW1lcmljL1xuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gbWl4ZWRfdmFyXG4gICAgICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAgICAgKi9cbiAgICAgICAgaXNfbnVtZXJpYzogZnVuY3Rpb24gKG1peGVkX3Zhcikge1xuICAgICAgICAgICAgcmV0dXJuIGlzX251bWVyaWMobWl4ZWRfdmFyKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVjayB3aGV0aGVyIHRoZSBhcmd1bWVudCBpcyBvZiB0eXBlIEFycmF5LlxuICAgICAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9pc0FycmF5I1BvbHlmaWxsXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBhcmdcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICBpc0FycmF5OiBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBBcnJheSBkaWZmIGJhc2VkIG9uIFBIUCBmdW5jdGlvbiBhcnJheV9kaWZmLlxuICAgICAgICAgKiBodHRwOi8vcGhwLm5ldC9tYW51YWwvZXMvZnVuY3Rpb24uYXJyYXlfZGlmZi5waHBcbiAgICAgICAgICogaHR0cDovL3BocGpzLm9yZy9mdW5jdGlvbnMvYXJyYXlfZGlmZi9cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGFycjFcbiAgICAgICAgICogQHBhcmFtIGFycjJcbiAgICAgICAgICogQHJldHVybnMgeyp9XG4gICAgICAgICAqL1xuICAgICAgICBhcnJheURpZmY6IGZ1bmN0aW9uIChhcnIxLCBhcnIyKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJyYXlfZGlmZihhcnIxLCBhcnIyKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgd2hldGhlciB0d28gYXJyYXlzIGFyZSBlcXVhbCB0byBvbmUgYW5vdGhlci5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGFycjFcbiAgICAgICAgICogQHBhcmFtIGFycjJcbiAgICAgICAgICogQHJldHVybnMgeyp9XG4gICAgICAgICAqL1xuICAgICAgICBhcnJheUVxdWFsczogZnVuY3Rpb24gKGFycjEsIGFycjIpIHtcbiAgICAgICAgICAgIGlmICghIHRoaXMuaXNBcnJheShhcnIxKSB8fCAhIHRoaXMuaXNBcnJheShhcnIyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGFycjEubGVuZ3RoICE9PSBhcnIyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuICQuaXNFbXB0eU9iamVjdCh0aGlzLmFycmF5RGlmZihhcnIxLCBhcnIyKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1ha2VzIGVsZW1lbnQgZGVwZW5kYW50IGZyb20gb3RoZXIuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB2YWxpZGF0b3JcbiAgICAgICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIG5hbWVcbiAgICAgICAgICogQHJldHVybnMgeyp9XG4gICAgICAgICAqL1xuICAgICAgICBkZXBlbmRlbnRFbGVtZW50OiBmdW5jdGlvbih2YWxpZGF0b3IsIGVsZW1lbnQsIG5hbWUpIHtcblxuICAgICAgICAgICAgdmFyIGVsPXZhbGlkYXRvci5maW5kQnlOYW1lKG5hbWUpO1xuXG4gICAgICAgICAgICBpZiAoIGVsWzBdIT09dW5kZWZpbmVkICAmJiB2YWxpZGF0b3Iuc2V0dGluZ3Mub25mb2N1c291dCApIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnQgPSAnYmx1cic7XG4gICAgICAgICAgICAgICAgaWYgKGVsWzBdLnRhZ05hbWUgPT09ICdTRUxFQ1QnIHx8XG4gICAgICAgICAgICAgICAgICAgIGVsWzBdLnRhZ05hbWUgPT09ICdPUFRJT04nIHx8XG4gICAgICAgICAgICAgICAgICAgIGVsWzBdLnR5cGUgPT09ICdjaGVja2JveCcgfHxcbiAgICAgICAgICAgICAgICAgICAgZWxbMF0udHlwZSA9PT0gJ3JhZGlvJ1xuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBldmVudCA9ICdjbGljayc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJ1bGVOYW1lID0gJy52YWxpZGF0ZS1sYXJhdmVsVmFsaWRhdGlvbic7XG4gICAgICAgICAgICAgICAgZWwub2ZmKCBydWxlTmFtZSApXG4gICAgICAgICAgICAgICAgICAgIC5vZmYoZXZlbnQgKyBydWxlTmFtZSArICctJyArIGVsZW1lbnQubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgLm9uKCBldmVudCArIHJ1bGVOYW1lICsgJy0nICsgZWxlbWVudC5uYW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoIGVsZW1lbnQgKS52YWxpZCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGVsWzBdO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYXJzZXMgZXJyb3IgQWpheCByZXNwb25zZSBhbmQgZ2V0cyB0aGUgbWVzc2FnZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHJlc3BvbnNlXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAgICAgICAgICovXG4gICAgICAgIHBhcnNlRXJyb3JSZXNwb25zZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgbmV3UmVzcG9uc2UgPSBbJ1dob29wcywgbG9va3MgbGlrZSBzb21ldGhpbmcgd2VudCB3cm9uZy4nXTtcbiAgICAgICAgICAgIGlmICgncmVzcG9uc2VUZXh0JyBpbiByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHZhciBlcnJvck1zZyA9IHJlc3BvbnNlLnJlc3BvbnNlVGV4dC5tYXRjaCgvPGgxXFxzKj4oLiopPFxcL2gxXFxzKj4vaSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNBcnJheShlcnJvck1zZykpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3UmVzcG9uc2UgPSBbZXJyb3JNc2dbMV1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXdSZXNwb25zZTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRXNjYXBlIHN0cmluZyB0byB1c2UgYXMgUmVndWxhciBFeHByZXNzaW9uLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gc3RyXG4gICAgICAgICAqIEByZXR1cm5zIHN0cmluZ1xuICAgICAgICAgKi9cbiAgICAgICAgZXNjYXBlUmVnRXhwOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogR2VuZXJhdGUgUmVnRXhwIGZyb20gd2lsZGNhcmQgYXR0cmlidXRlcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG5hbWVcbiAgICAgICAgICogQHJldHVybnMge1JlZ0V4cH1cbiAgICAgICAgICovXG4gICAgICAgIHJlZ2V4RnJvbVdpbGRjYXJkOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgdmFyIG5hbWVQYXJ0cyA9IG5hbWUuc3BsaXQoJ1sqXScpO1xuICAgICAgICAgICAgaWYgKG5hbWVQYXJ0cy5sZW5ndGggPT09IDEpIG5hbWVQYXJ0cy5wdXNoKCcnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoJ14nICsgbmFtZVBhcnRzLm1hcChmdW5jdGlvbih4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhcmF2ZWxWYWxpZGF0aW9uLmhlbHBlcnMuZXNjYXBlUmVnRXhwKHgpXG4gICAgICAgICAgICB9KS5qb2luKCdcXFxcW1teXFxcXF1dKlxcXFxdJykgKyAnJCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNZXJnZSBhZGRpdGlvbmFsIGxhcmF2ZWwgdmFsaWRhdGlvbiBydWxlcyBpbnRvIHRoZSBjdXJyZW50IHJ1bGUgc2V0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcnVsZXNcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IG5ld1J1bGVzXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBtZXJnZVJ1bGVzOiBmdW5jdGlvbiAocnVsZXMsIG5ld1J1bGVzKSB7XG4gICAgICAgICAgICB2YXIgcnVsZXNMaXN0ID0ge1xuICAgICAgICAgICAgICAgICdsYXJhdmVsVmFsaWRhdGlvbic6IG5ld1J1bGVzLmxhcmF2ZWxWYWxpZGF0aW9uIHx8IFtdLFxuICAgICAgICAgICAgICAgICdsYXJhdmVsVmFsaWRhdGlvblJlbW90ZSc6IG5ld1J1bGVzLmxhcmF2ZWxWYWxpZGF0aW9uUmVtb3RlIHx8IFtdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gcnVsZXNMaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVzTGlzdFtrZXldLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJ1bGVzW2tleV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVsZXNba2V5XSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJ1bGVzW2tleV0gPSBydWxlc1trZXldLmNvbmNhdChydWxlc0xpc3Rba2V5XSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBydWxlcztcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSFRNTCBlbnRpdHkgZW5jb2RlIGEgc3RyaW5nLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gc3RyaW5nXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICBlbmNvZGU6IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiAkKCc8ZGl2Lz4nKS50ZXh0KHN0cmluZykuaHRtbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMb29rdXAgbmFtZSBpbiBhbiBhcnJheS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHZhbGlkYXRvclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBOYW1lIGluIGRvdCBub3RhdGlvbiBmb3JtYXQuXG4gICAgICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAgICAgKi9cbiAgICAgICAgZmluZEJ5QXJyYXlOYW1lOiBmdW5jdGlvbiAodmFsaWRhdG9yLCBuYW1lKSB7XG4gICAgICAgICAgICB2YXIgc3FOYW1lID0gbmFtZS5yZXBsYWNlKC9cXC4oW15cXC5dKykvZywgJ1skMV0nKSxcbiAgICAgICAgICAgICAgICBsb29rdXBzID0gW1xuICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IGRvdCB0byBzcXVhcmUgYnJhY2tldHMuIGUuZy4gZm9vLmJhci4wIGJlY29tZXMgZm9vW2Jhcl1bMF1cbiAgICAgICAgICAgICAgICAgICAgc3FOYW1lLFxuICAgICAgICAgICAgICAgICAgICAvLyBBcHBlbmQgW10gdG8gdGhlIG5hbWUgZS5nLiBmb28gYmVjb21lcyBmb29bXSBvciBmb28uYmFyLjAgYmVjb21lcyBmb29bYmFyXVswXVtdXG4gICAgICAgICAgICAgICAgICAgIHNxTmFtZSArICdbXScsXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBrZXkgZnJvbSBsYXN0IGFycmF5IGUuZy4gZm9vW2Jhcl1bMF0gYmVjb21lcyBmb29bYmFyXVtdXG4gICAgICAgICAgICAgICAgICAgIHNxTmFtZS5yZXBsYWNlKC8oLiopXFxbKC4qKVxcXSQvZywgJyQxW10nKVxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9va3Vwcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtID0gdmFsaWRhdG9yLmZpbmRCeU5hbWUobG9va3Vwc1tpXSk7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAkKG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBdHRlbXB0IHRvIGZpbmQgYW4gZWxlbWVudCBpbiB0aGUgRE9NIG1hdGNoaW5nIHRoZSBnaXZlbiBuYW1lLlxuICAgICAgICAgKiBFeGFtcGxlIG5hbWVzIGluY2x1ZGU6XG4gICAgICAgICAqICAgIC0gZG9tYWluLjAgd2hpY2ggbWF0Y2hlcyBkb21haW5bXVxuICAgICAgICAgKiAgICAtIGN1c3RvbWZpZWxkLjMgd2hpY2ggbWF0Y2hlcyBjdXN0b21maWVsZFszXVxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gdmFsaWRhdG9yXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAgICAgKi9cbiAgICAgICAgZmluZEJ5TmFtZTogZnVuY3Rpb24gKHZhbGlkYXRvciwgbmFtZSkge1xuICAgICAgICAgICAgLy8gRXhhY3QgbWF0Y2guXG4gICAgICAgICAgICB2YXIgZWxlbSA9IHZhbGlkYXRvci5maW5kQnlOYW1lKG5hbWUpO1xuICAgICAgICAgICAgaWYgKGVsZW0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGaW5kIG5hbWUgaW4gZGF0YSwgdXNpbmcgZG90IG5vdGF0aW9uLlxuICAgICAgICAgICAgdmFyIGRlbGltID0gJy4nLFxuICAgICAgICAgICAgICAgIHBhcnRzICA9IG5hbWUuc3BsaXQoZGVsaW0pO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aDsgaSA+IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIHZhciByZWNvbnN0cnVjdGVkID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCBpOyBjKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjb25zdHJ1Y3RlZC5wdXNoKHBhcnRzW2NdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlbGVtID0gdGhpcy5maW5kQnlBcnJheU5hbWUodmFsaWRhdG9yLCByZWNvbnN0cnVjdGVkLmpvaW4oZGVsaW0pKTtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuICQobnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIGl0J3MgYW4gYXJyYXkgZWxlbWVudCwgZ2V0IGFsbCB2YWx1ZXMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB2YWxpZGF0b3JcbiAgICAgICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgICAgICogQHJldHVybnMgeyp8c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgYWxsRWxlbWVudFZhbHVlczogZnVuY3Rpb24gKHZhbGlkYXRvciwgZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQubmFtZS5pbmRleE9mKCdbXScpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWxpZGF0b3IuZmluZEJ5TmFtZShlbGVtZW50Lm5hbWUpLm1hcChmdW5jdGlvbiAoaSwgZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmVsZW1lbnRWYWx1ZShlKTtcbiAgICAgICAgICAgICAgICB9KS5nZXQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRvci5lbGVtZW50VmFsdWUoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcbiJdLCJuYW1lcyI6WyJzdHJsZW4iLCJhcnJheV9kaWZmIiwic3RydG90aW1lIiwiaXNfbnVtZXJpYyIsIiQiLCJleHRlbmQiLCJsYXJhdmVsVmFsaWRhdGlvbiIsImhlbHBlcnMiLCJudW1lcmljUnVsZXMiLCJmaWxlaW5mbyIsImZpZWxkT2JqIiwiaW5kZXgiLCJGaWxlTmFtZSIsInZhbHVlIiwiZmlsZXMiLCJmaWxlIiwiZXh0ZW5zaW9uIiwic3Vic3RyIiwibGFzdEluZGV4T2YiLCJzaXplIiwidHlwZSIsInNlbGVjdG9yIiwibmFtZXMiLCJpc0FycmF5IiwiaSIsImxlbmd0aCIsInB1c2giLCJqb2luIiwiaGFzTnVtZXJpY1J1bGVzIiwiZWxlbWVudCIsImhhc1J1bGVzIiwicnVsZXMiLCJmb3VuZCIsInZhbGlkYXRvciIsImRhdGEiLCJmb3JtIiwibGlzdFJ1bGVzIiwiY2FjaGUiLCJhcnJheVJ1bGVzQ2FjaGUiLCJuYW1lIiwiZWFjaCIsImFycmF5UnVsZSIsInNldHRpbmdzIiwib2JqUnVsZXMiLCJfcnVsZXMiLCJpbkFycmF5Iiwic3RyaW5nIiwiZ2V0U2l6ZSIsIm9iaiIsInBhcnNlRmxvYXQiLCJNYXRoIiwiZmxvb3IiLCJnZXRMYXJhdmVsVmFsaWRhdGlvbiIsInJ1bGUiLCJ1bmRlZmluZWQiLCJzdGF0aWNSdWxlcyIsImtleSIsInBhcnNlVGltZSIsImZvcm1hdCIsInRpbWVWYWx1ZSIsImZtdCIsIkRhdGVGb3JtYXR0ZXIiLCJkYXRlUnVsZSIsInBhcnNlRGF0ZSIsIkRhdGUiLCJmb3JtYXREYXRlIiwicm91bmQiLCJnZXRUaW1lIiwiY29tcGFyZURhdGVzIiwicGFyYW1zIiwib3BlcmF0b3IiLCJ0aW1lQ29tcGFyZSIsInRhcmdldCIsImRlcGVuZGVudEVsZW1lbnQiLCJlbGVtZW50VmFsdWUiLCJFcnJvciIsImd1ZXNzRGF0ZSIsInRleHQiLCJub3ciLCJtaXhlZF92YXIiLCJhcmciLCJPYmplY3QiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImNhbGwiLCJhcnJheURpZmYiLCJhcnIxIiwiYXJyMiIsImFycmF5RXF1YWxzIiwiaXNFbXB0eU9iamVjdCIsImVsIiwiZmluZEJ5TmFtZSIsIm9uZm9jdXNvdXQiLCJldmVudCIsInRhZ05hbWUiLCJydWxlTmFtZSIsIm9mZiIsIm9uIiwidmFsaWQiLCJwYXJzZUVycm9yUmVzcG9uc2UiLCJyZXNwb25zZSIsIm5ld1Jlc3BvbnNlIiwiZXJyb3JNc2ciLCJyZXNwb25zZVRleHQiLCJtYXRjaCIsImVzY2FwZVJlZ0V4cCIsInN0ciIsInJlcGxhY2UiLCJyZWdleEZyb21XaWxkY2FyZCIsIm5hbWVQYXJ0cyIsInNwbGl0IiwiUmVnRXhwIiwibWFwIiwieCIsIm1lcmdlUnVsZXMiLCJuZXdSdWxlcyIsInJ1bGVzTGlzdCIsImxhcmF2ZWxWYWxpZGF0aW9uUmVtb3RlIiwiY29uY2F0IiwiZW5jb2RlIiwiaHRtbCIsImZpbmRCeUFycmF5TmFtZSIsInNxTmFtZSIsImxvb2t1cHMiLCJlbGVtIiwiZGVsaW0iLCJwYXJ0cyIsInJlY29uc3RydWN0ZWQiLCJjIiwiYWxsRWxlbWVudFZhbHVlcyIsImluZGV4T2YiLCJlIiwiZ2V0Il0sInNvdXJjZVJvb3QiOiIifQ==
/*!
 * Laravel Javascript Validation
 *
 * https://github.com/proengsoft/laravel-jsvalidation
 *
 * Timezone Helper functions used by validators
 *
 * Copyright (c) 2017 Proengsoft
 * Released under the MIT license
 */

$.extend(true, laravelValidation, {

    helpers: {

        /**
         * Check if the specified timezone is valid.
         *
         * @param value
         * @returns {boolean}
         */
        isTimezone: function (value) {

            var timezones={
                "africa": [
                    "abidjan",
                    "accra",
                    "addis_ababa",
                    "algiers",
                    "asmara",
                    "bamako",
                    "bangui",
                    "banjul",
                    "bissau",
                    "blantyre",
                    "brazzaville",
                    "bujumbura",
                    "cairo",
                    "casablanca",
                    "ceuta",
                    "conakry",
                    "dakar",
                    "dar_es_salaam",
                    "djibouti",
                    "douala",
                    "el_aaiun",
                    "freetown",
                    "gaborone",
                    "harare",
                    "johannesburg",
                    "juba",
                    "kampala",
                    "khartoum",
                    "kigali",
                    "kinshasa",
                    "lagos",
                    "libreville",
                    "lome",
                    "luanda",
                    "lubumbashi",
                    "lusaka",
                    "malabo",
                    "maputo",
                    "maseru",
                    "mbabane",
                    "mogadishu",
                    "monrovia",
                    "nairobi",
                    "ndjamena",
                    "niamey",
                    "nouakchott",
                    "ouagadougou",
                    "porto-novo",
                    "sao_tome",
                    "tripoli",
                    "tunis",
                    "windhoek"
                ],
                "america": [
                    "adak",
                    "anchorage",
                    "anguilla",
                    "antigua",
                    "araguaina",
                    "argentina\/buenos_aires",
                    "argentina\/catamarca",
                    "argentina\/cordoba",
                    "argentina\/jujuy",
                    "argentina\/la_rioja",
                    "argentina\/mendoza",
                    "argentina\/rio_gallegos",
                    "argentina\/salta",
                    "argentina\/san_juan",
                    "argentina\/san_luis",
                    "argentina\/tucuman",
                    "argentina\/ushuaia",
                    "aruba",
                    "asuncion",
                    "atikokan",
                    "bahia",
                    "bahia_banderas",
                    "barbados",
                    "belem",
                    "belize",
                    "blanc-sablon",
                    "boa_vista",
                    "bogota",
                    "boise",
                    "cambridge_bay",
                    "campo_grande",
                    "cancun",
                    "caracas",
                    "cayenne",
                    "cayman",
                    "chicago",
                    "chihuahua",
                    "costa_rica",
                    "creston",
                    "cuiaba",
                    "curacao",
                    "danmarkshavn",
                    "dawson",
                    "dawson_creek",
                    "denver",
                    "detroit",
                    "dominica",
                    "edmonton",
                    "eirunepe",
                    "el_salvador",
                    "fortaleza",
                    "glace_bay",
                    "godthab",
                    "goose_bay",
                    "grand_turk",
                    "grenada",
                    "guadeloupe",
                    "guatemala",
                    "guayaquil",
                    "guyana",
                    "halifax",
                    "havana",
                    "hermosillo",
                    "indiana\/indianapolis",
                    "indiana\/knox",
                    "indiana\/marengo",
                    "indiana\/petersburg",
                    "indiana\/tell_city",
                    "indiana\/vevay",
                    "indiana\/vincennes",
                    "indiana\/winamac",
                    "inuvik",
                    "iqaluit",
                    "jamaica",
                    "juneau",
                    "kentucky\/louisville",
                    "kentucky\/monticello",
                    "kralendijk",
                    "la_paz",
                    "lima",
                    "los_angeles",
                    "lower_princes",
                    "maceio",
                    "managua",
                    "manaus",
                    "marigot",
                    "martinique",
                    "matamoros",
                    "mazatlan",
                    "menominee",
                    "merida",
                    "metlakatla",
                    "mexico_city",
                    "miquelon",
                    "moncton",
                    "monterrey",
                    "montevideo",
                    "montreal",
                    "montserrat",
                    "nassau",
                    "new_york",
                    "nipigon",
                    "nome",
                    "noronha",
                    "north_dakota\/beulah",
                    "north_dakota\/center",
                    "north_dakota\/new_salem",
                    "ojinaga",
                    "panama",
                    "pangnirtung",
                    "paramaribo",
                    "phoenix",
                    "port-au-prince",
                    "port_of_spain",
                    "porto_velho",
                    "puerto_rico",
                    "rainy_river",
                    "rankin_inlet",
                    "recife",
                    "regina",
                    "resolute",
                    "rio_branco",
                    "santa_isabel",
                    "santarem",
                    "santiago",
                    "santo_domingo",
                    "sao_paulo",
                    "scoresbysund",
                    "shiprock",
                    "sitka",
                    "st_barthelemy",
                    "st_johns",
                    "st_kitts",
                    "st_lucia",
                    "st_thomas",
                    "st_vincent",
                    "swift_current",
                    "tegucigalpa",
                    "thule",
                    "thunder_bay",
                    "tijuana",
                    "toronto",
                    "tortola",
                    "vancouver",
                    "whitehorse",
                    "winnipeg",
                    "yakutat",
                    "yellowknife"
                ],
                "antarctica": [
                    "casey",
                    "davis",
                    "dumontdurville",
                    "macquarie",
                    "mawson",
                    "mcmurdo",
                    "palmer",
                    "rothera",
                    "south_pole",
                    "syowa",
                    "vostok"
                ],
                "arctic": [
                    "longyearbyen"
                ],
                "asia": [
                    "aden",
                    "almaty",
                    "amman",
                    "anadyr",
                    "aqtau",
                    "aqtobe",
                    "ashgabat",
                    "baghdad",
                    "bahrain",
                    "baku",
                    "bangkok",
                    "beirut",
                    "bishkek",
                    "brunei",
                    "choibalsan",
                    "chongqing",
                    "colombo",
                    "damascus",
                    "dhaka",
                    "dili",
                    "dubai",
                    "dushanbe",
                    "gaza",
                    "harbin",
                    "hebron",
                    "ho_chi_minh",
                    "hong_kong",
                    "hovd",
                    "irkutsk",
                    "jakarta",
                    "jayapura",
                    "jerusalem",
                    "kabul",
                    "kamchatka",
                    "karachi",
                    "kashgar",
                    "kathmandu",
                    "khandyga",
                    "kolkata",
                    "krasnoyarsk",
                    "kuala_lumpur",
                    "kuching",
                    "kuwait",
                    "macau",
                    "magadan",
                    "makassar",
                    "manila",
                    "muscat",
                    "nicosia",
                    "novokuznetsk",
                    "novosibirsk",
                    "omsk",
                    "oral",
                    "phnom_penh",
                    "pontianak",
                    "pyongyang",
                    "qatar",
                    "qyzylorda",
                    "rangoon",
                    "riyadh",
                    "sakhalin",
                    "samarkand",
                    "seoul",
                    "shanghai",
                    "singapore",
                    "taipei",
                    "tashkent",
                    "tbilisi",
                    "tehran",
                    "thimphu",
                    "tokyo",
                    "ulaanbaatar",
                    "urumqi",
                    "ust-nera",
                    "vientiane",
                    "vladivostok",
                    "yakutsk",
                    "yekaterinburg",
                    "yerevan"
                ],
                "atlantic": [
                    "azores",
                    "bermuda",
                    "canary",
                    "cape_verde",
                    "faroe",
                    "madeira",
                    "reykjavik",
                    "south_georgia",
                    "st_helena",
                    "stanley"
                ],
                "australia": [
                    "adelaide",
                    "brisbane",
                    "broken_hill",
                    "currie",
                    "darwin",
                    "eucla",
                    "hobart",
                    "lindeman",
                    "lord_howe",
                    "melbourne",
                    "perth",
                    "sydney"
                ],
                "europe": [
                    "amsterdam",
                    "andorra",
                    "athens",
                    "belgrade",
                    "berlin",
                    "bratislava",
                    "brussels",
                    "bucharest",
                    "budapest",
                    "busingen",
                    "chisinau",
                    "copenhagen",
                    "dublin",
                    "gibraltar",
                    "guernsey",
                    "helsinki",
                    "isle_of_man",
                    "istanbul",
                    "jersey",
                    "kaliningrad",
                    "kiev",
                    "lisbon",
                    "ljubljana",
                    "london",
                    "luxembourg",
                    "madrid",
                    "malta",
                    "mariehamn",
                    "minsk",
                    "monaco",
                    "moscow",
                    "oslo",
                    "paris",
                    "podgorica",
                    "prague",
                    "riga",
                    "rome",
                    "samara",
                    "san_marino",
                    "sarajevo",
                    "simferopol",
                    "skopje",
                    "sofia",
                    "stockholm",
                    "tallinn",
                    "tirane",
                    "uzhgorod",
                    "vaduz",
                    "vatican",
                    "vienna",
                    "vilnius",
                    "volgograd",
                    "warsaw",
                    "zagreb",
                    "zaporozhye",
                    "zurich"
                ],
                "indian": [
                    "antananarivo",
                    "chagos",
                    "christmas",
                    "cocos",
                    "comoro",
                    "kerguelen",
                    "mahe",
                    "maldives",
                    "mauritius",
                    "mayotte",
                    "reunion"
                ],
                "pacific": [
                    "apia",
                    "auckland",
                    "chatham",
                    "chuuk",
                    "easter",
                    "efate",
                    "enderbury",
                    "fakaofo",
                    "fiji",
                    "funafuti",
                    "galapagos",
                    "gambier",
                    "guadalcanal",
                    "guam",
                    "honolulu",
                    "johnston",
                    "kiritimati",
                    "kosrae",
                    "kwajalein",
                    "majuro",
                    "marquesas",
                    "midway",
                    "nauru",
                    "niue",
                    "norfolk",
                    "noumea",
                    "pago_pago",
                    "palau",
                    "pitcairn",
                    "pohnpei",
                    "port_moresby",
                    "rarotonga",
                    "saipan",
                    "tahiti",
                    "tarawa",
                    "tongatapu",
                    "wake",
                    "wallis"
                ],
                "utc": [
                    ""
                ]
            };

            var tzparts= value.split('/',2);
            var continent=tzparts[0].toLowerCase();
            var city='';
            if (tzparts[1]) {
                city=tzparts[1].toLowerCase();
            }

            return (continent in timezones && ( timezones[continent].length===0 || timezones[continent].indexOf(city)!==-1))
        }
    }
});

/*!
 * Laravel Javascript Validation
 *
 * https://github.com/proengsoft/laravel-jsvalidation
 *
 * Methods that implement Laravel Validations
 *
 * Copyright (c) 2017 Proengsoft
 * Released under the MIT license
 */

$.extend(true, laravelValidation, {

    methods:{

        helpers: laravelValidation.helpers,

        jsRemoteTimer:0,

        /**
         * "Validate" optional attributes.
         * Always returns true, just lets us put sometimes in rules.
         *
         * @return {boolean}
         */
        Sometimes: function() {
            return true;
        },

        /**
         * Bail This is the default behaivour os JSValidation.
         * Always returns true, just lets us put sometimes in rules.
         *
         * @return {boolean}
         */
        Bail: function() {
            return true;
        },

        /**
         * "Indicate" validation should pass if value is null.
         * Always returns true, just lets us put "nullable" in rules.
         *
         * @return {boolean}
         */
        Nullable: function() {
            return true;
        },

        /**
         * Validate the given attribute is filled if it is present.
         */
        Filled: function(value, element) {
            return $.validator.methods.required.call(this, value, element, true);
        },


        /**
         * Validate that a required attribute exists.
         */
        Required: function(value, element) {
            return  $.validator.methods.required.call(this, value, element);
        },

        /**
         * Validate that an attribute exists when any other attribute exists.
         *
         * @return {boolean}
         */
        RequiredWith: function(value, element, params) {
            var validator=this,
                required=false;
            var currentObject=this;

            $.each(params,function(i,param) {
                var target=laravelValidation.helpers.dependentElement(
                    currentObject, element, param
                );
                required=required || (
                    target!==undefined &&
                    $.validator.methods.required.call(
                        validator,
                        currentObject.elementValue(target),
                        target,true
                    ));
            });

            if (required) {
                return  $.validator.methods.required.call(this, value, element, true);
            }
            return true;
        },

        /**
         * Validate that an attribute exists when all other attribute exists.
         *
         * @return {boolean}
         */
        RequiredWithAll: function(value, element, params) {
            var validator=this,
                required=true;
            var currentObject=this;

            $.each(params,function(i,param) {
                var target=laravelValidation.helpers.dependentElement(
                    currentObject, element, param
                );
                required = required && (
                      target!==undefined &&
                      $.validator.methods.required.call(
                          validator,
                          currentObject.elementValue(target),
                          target,true
                      ));
            });

            if (required) {
                return  $.validator.methods.required.call(this, value, element, true);
            }
            return true;
        },

        /**
         * Validate that an attribute exists when any other attribute does not exists.
         *
         * @return {boolean}
         */
        RequiredWithout: function(value, element, params) {
            var validator=this,
                required=false;
            var currentObject=this;

            $.each(params,function(i,param) {
                var target=laravelValidation.helpers.dependentElement(
                    currentObject, element, param
                );
                required = required ||
                    target===undefined||
                    !$.validator.methods.required.call(
                        validator,
                        currentObject.elementValue(target),
                        target,true
                    );
            });

            if (required) {
                return  $.validator.methods.required.call(this, value, element, true);
            }
            return true;
        },

        /**
         * Validate that an attribute exists when all other attribute does not exists.
         *
         * @return {boolean}
         */
        RequiredWithoutAll: function(value, element, params) {
            var validator=this,
                required=true,
                currentObject=this;

            $.each(params,function(i, param) {
                var target=laravelValidation.helpers.dependentElement(
                    currentObject, element, param
                );
                required = required && (
                    target===undefined ||
                    !$.validator.methods.required.call(
                        validator,
                        currentObject.elementValue(target),
                        target,true
                    ));
            });

            if (required) {
                return  $.validator.methods.required.call(this, value, element, true);
            }
            return true;
        },

        /**
         * Validate that an attribute exists when another attribute has a given value.
         *
         * @return {boolean}
         */
        RequiredIf: function(value, element, params) {

            var target=laravelValidation.helpers.dependentElement(
                this, element, params[0]
            );

            if (target!==undefined) {
                var val=String(this.elementValue(target));
                if (typeof val !== 'undefined') {
                    var data = params.slice(1);
                    if ($.inArray(val, data) !== -1) {
                        return $.validator.methods.required.call(
                            this, value, element, true
                        );
                    }
                }
            }

            return true;
        },

        /**
         * Validate that an attribute exists when another
         * attribute does not have a given value.
         *
         * @return {boolean}
         */
        RequiredUnless: function(value, element, params) {

            var target=laravelValidation.helpers.dependentElement(
                this, element, params[0]
            );

            if (target!==undefined) {
                var val=String(this.elementValue(target));
                if (typeof val !== 'undefined') {
                    var data = params.slice(1);
                    if ($.inArray(val, data) !== -1) {
                        return true;
                    }
                }
            }

            return $.validator.methods.required.call(
                this, value, element, true
            );

        },

        /**
         * Validate that an attribute has a matching confirmation.
         *
         * @return {boolean}
         */
        Confirmed: function(value, element, params) {
            return laravelValidation.methods.Same.call(this,value, element, params);
        },

        /**
         * Validate that two attributes match.
         *
         * @return {boolean}
         */
        Same: function(value, element, params) {

            var target=laravelValidation.helpers.dependentElement(
                this, element, params[0]
            );

            if (target!==undefined) {
                return String(value) === String(this.elementValue(target));
            }
            return false;
        },

        /**
         * Validate that the values of an attribute is in another attribute.
         *
         * @param value
         * @param element
         * @param params
         * @returns {boolean}
         * @constructor
         */
        InArray: function (value, element, params) {
            if (typeof params[0] === 'undefined') {
                return false;
            }
            var elements = this.elements();
            var found = false;
            var nameRegExp = laravelValidation.helpers.regexFromWildcard(params[0]);

            for ( var i = 0; i < elements.length ; i++ ) {
                var targetName = elements[i].name;
                if (targetName.match(nameRegExp)) {
                    var equals = laravelValidation.methods.Same.call(this,value, element, [targetName]);
                    found = found || equals;
                }
            }

            return found;
        },

        /**
         * Validate an attribute is unique among other values.
         *
         * @param value
         * @param element
         * @param params
         * @returns {boolean}
         */
        Distinct: function (value, element, params) {
            if (typeof params[0] === 'undefined') {
                return false;
            }

            var elements = this.elements();
            var found = false;
            var nameRegExp = laravelValidation.helpers.regexFromWildcard(params[0]);

            for ( var i = 0; i < elements.length ; i++ ) {
                var targetName = elements[i].name;
                if (targetName !== element.name && targetName.match(nameRegExp)) {
                    var equals = laravelValidation.methods.Same.call(this,value, element, [targetName]);
                    found = found || equals;
                }
            }

            return !found;
        },


        /**
         * Validate that an attribute is different from another attribute.
         *
         * @return {boolean}
         */
        Different: function(value, element, params) {
            return ! laravelValidation.methods.Same.call(this,value, element, params);
        },

        /**
         * Validate that an attribute was "accepted".
         * This validation rule implies the attribute is "required".
         *
         * @return {boolean}
         */
        Accepted: function(value) {
            var regex = new RegExp("^(?:(yes|on|1|true))$",'i');
            return regex.test(value);
        },

        /**
         * Validate that an attribute is an array.
         *
         * @param value
         * @param element
         */
        Array: function(value, element) {
            if (element.name.indexOf('[') !== -1 && element.name.indexOf(']') !== -1) {
                return true;
            }

            return laravelValidation.helpers.isArray(value);
        },

        /**
         * Validate that an attribute is a boolean.
         *
         * @return {boolean}
         */
        Boolean: function(value) {
            var regex= new RegExp("^(?:(true|false|1|0))$",'i');
            return  regex.test(value);
        },

        /**
         * Validate that an attribute is an integer.
         *
         * @return {boolean}
         */
        Integer: function(value) {
            var regex= new RegExp("^(?:-?\\d+)$",'i');
            return  regex.test(value);
        },

        /**
         * Validate that an attribute is numeric.
         */
        Numeric: function(value, element) {
            return $.validator.methods.number.call(this, value, element, true);
        },

        /**
         * Validate that an attribute is a string.
         *
         * @return {boolean}
         */
        String: function(value) {
            return typeof value === 'string';
        },

        /**
         * The field under validation must be numeric and must have an exact length of value.
         */
        Digits: function(value, element, params) {
            return (
                $.validator.methods.number.call(this, value, element, true) &&
                value.length === parseInt(params, 10)
            );
        },

        /**
         * The field under validation must have a length between the given min and max.
         */
        DigitsBetween: function(value, element, params) {
            return ($.validator.methods.number.call(this, value, element, true)
                && value.length>=parseFloat(params[0]) && value.length<=parseFloat(params[1]));
        },

        /**
         * Validate the size of an attribute.
         *
         * @return {boolean}
         */
        Size: function(value, element, params) {
            return laravelValidation.helpers.getSize(this, element,value) === parseFloat(params[0]);
        },

        /**
         * Validate the size of an attribute is between a set of values.
         *
         * @return {boolean}
         */
        Between: function(value, element, params) {
            return ( laravelValidation.helpers.getSize(this, element,value) >= parseFloat(params[0]) &&
                laravelValidation.helpers.getSize(this,element,value) <= parseFloat(params[1]));
        },

        /**
         * Validate the size of an attribute is greater than a minimum value.
         *
         * @return {boolean}
         */
        Min: function(value, element, params) {
            value = laravelValidation.helpers.allElementValues(this, element);

            return laravelValidation.helpers.getSize(this, element, value) >= parseFloat(params[0]);
        },

        /**
         * Validate the size of an attribute is less than a maximum value.
         *
         * @return {boolean}
         */
        Max: function(value, element, params) {
            value = laravelValidation.helpers.allElementValues(this, element);

            return laravelValidation.helpers.getSize(this, element, value) <= parseFloat(params[0]);
        },

        /**
         * Validate an attribute is contained within a list of values.
         *
         * @return {boolean}
         */
        In: function(value, element, params) {
            if (laravelValidation.helpers.isArray(value)
                && laravelValidation.helpers.hasRules(element, "Array")
            ) {
                var diff = laravelValidation.helpers.arrayDiff(value, params);

                return Object.keys(diff).length === 0;
            }

            return params.indexOf(value.toString()) !== -1;
        },

        /**
         * Validate an attribute is not contained within a list of values.
         *
         * @return {boolean}
         */
        NotIn: function(value, element, params) {
            return params.indexOf(value.toString()) === -1;
        },

        /**
         * Validate that an attribute is a valid IP.
         *
         * @return {boolean}
         */
        Ip: function(value) {
            return /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(value) ||
                /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(value);
        },

        /**
         * Validate that an attribute is a valid e-mail address.
         */
        Email: function(value, element) {
            return $.validator.methods.email.call(this, value, element, true);
        },

        /**
         * Validate that an attribute is a valid URL.
         */
        Url: function(value, element) {
            return $.validator.methods.url.call(this, value, element, true);
        },

        /**
         * The field under validation must be a successfully uploaded file.
         *
         * @return {boolean}
         */
        File: function(value, element) {
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                return true;
            }
            if ('files' in element ) {
                return (element.files.length > 0);
            }
            return false;
        },

        /**
         * Validate the MIME type of a file upload attribute is in a set of MIME types.
         *
         * @return {boolean}
         */
        Mimes: function(value, element, params) {
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                return true;
            }
            var lowerParams = $.map(params, function(item) {
                return item.toLowerCase();
            });

            var fileinfo = laravelValidation.helpers.fileinfo(element);
            return (fileinfo !== false && lowerParams.indexOf(fileinfo.extension.toLowerCase())!==-1);
        },

        /**
         * The file under validation must match one of the given MIME types.
         *
         * @return {boolean}
         */
        Mimetypes: function(value, element, params) {
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                return true;
            }
            var lowerParams = $.map(params, function(item) {
                return item.toLowerCase();
            });

            var fileinfo = laravelValidation.helpers.fileinfo(element);

            if (fileinfo === false) {
                return false;
            }
            return (lowerParams.indexOf(fileinfo.type.toLowerCase())!==-1);
        },

        /**
         * Validate the MIME type of a file upload attribute is in a set of MIME types.
         */
        Image: function(value, element) {
            return laravelValidation.methods.Mimes.call(this, value, element, [
                'jpg', 'png', 'gif', 'bmp', 'svg', 'jpeg'
            ]);
        },

        /**
         * Validate dimensions of Image.
         *
         * @return {boolean|string}
         */
        Dimensions: function(value, element, params, callback) {
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                return true;
            }
            if (element.files === null || typeof element.files[0] === 'undefined') {
                return false;
            }

            var fr = new FileReader;
            fr.onload = function () {
                var img = new Image();
                img.onload = function () {
                    var height = parseFloat(img.naturalHeight);
                    var width = parseFloat(img.naturalWidth);
                    var ratio = width / height;
                    var notValid = ((params['width']) && parseFloat(params['width'] !== width)) ||
                        ((params['min_width']) && parseFloat(params['min_width']) > width) ||
                        ((params['max_width']) && parseFloat(params['max_width']) < width) ||
                        ((params['height']) && parseFloat(params['height']) !== height) ||
                        ((params['min_height']) && parseFloat(params['min_height']) > height) ||
                        ((params['max_height']) && parseFloat(params['max_height']) < height) ||
                        ((params['ratio']) && ratio !== parseFloat(eval(params['ratio']))
                        );
                    callback(! notValid);
                };
                img.onerror = function() {
                    callback(false);
                };
                img.src = fr.result;
            };
            fr.readAsDataURL(element.files[0]);

            return 'pending';
        },

        /**
         * Validate that an attribute contains only alphabetic characters.
         *
         * @return {boolean}
         */
        Alpha: function(value) {
            if (typeof  value !== 'string') {
                return false;
            }

            var regex = new RegExp("^(?:^[a-z\u00E0-\u00FC]+$)$",'i');
            return  regex.test(value);

        },

        /**
         * Validate that an attribute contains only alpha-numeric characters.
         *
         * @return {boolean}
         */
        AlphaNum: function(value) {
            if (typeof  value !== 'string') {
                return false;
            }
            var regex = new RegExp("^(?:^[a-z0-9\u00E0-\u00FC]+$)$",'i');
            return regex.test(value);
        },

        /**
         * Validate that an attribute contains only alphabetic characters.
         *
         * @return {boolean}
         */
        AlphaDash: function(value) {
            if (typeof  value !== 'string') {
                return false;
            }
            var regex = new RegExp("^(?:^[a-z0-9\u00E0-\u00FC_-]+$)$",'i');
            return regex.test(value);
        },

        /**
         * Validate that an attribute passes a regular expression check.
         *
         * @return {boolean}
         */
        Regex: function(value, element, params) {
            var invalidModifiers=['x','s','u','X','U','A'];
            // Converting php regular expression
            var phpReg= new RegExp('^(?:\/)(.*\\\/?[^\/]*|[^\/]*)(?:\/)([gmixXsuUAJ]*)?$');
            var matches=params[0].match(phpReg);
            if (matches === null) {
                return false;
            }
            // checking modifiers
            var php_modifiers=[];
            if (matches[2]!==undefined) {
                php_modifiers=matches[2].split('');
                for (var i=0; i<php_modifiers.length<i ;i++) {
                    if (invalidModifiers.indexOf(php_modifiers[i])!==-1) {
                        return true;
                    }
                }
            }
            var regex = new RegExp("^(?:"+matches[1]+")$",php_modifiers.join());
            return   regex.test(value);
        },

        /**
         * Validate that an attribute is a valid date.
         *
         * @return {boolean}
         */
        Date: function(value) {
            return (laravelValidation.helpers.strtotime(value)!==false);
        },

        /**
         * Validate that an attribute matches a date format.
         *
         * @return {boolean}
         */
        DateFormat: function(value, element, params) {
            return laravelValidation.helpers.parseTime(value,params[0])!==false;
        },

        /**
         * Validate the date is before a given date.
         *
         * @return {boolean}
         */
        Before: function(value, element, params) {
            return laravelValidation.helpers.compareDates(this, value, element, params[0], '<');
        },

        /**
         * Validate the date is equal or before a given date.
         *
         * @return {boolean}
         */
        BeforeOrEqual: function(value, element, params) {
            return laravelValidation.helpers.compareDates(this, value, element, params[0], '<=');
        },

        /**
         * Validate the date is after a given date.
         *
         * @return {boolean}
         */
        After: function(value, element, params) {
            return laravelValidation.helpers.compareDates(this, value, element, params[0], '>');
        },

        /**
         * Validate the date is equal or after a given date.
         *
         * @return {boolean}
         */
        AfterOrEqual: function(value, element, params) {
            return laravelValidation.helpers.compareDates(this, value, element, params[0], '>=');
        },


        /**
         * Validate that an attribute is a valid date.
         */
        Timezone: function(value) {
            return  laravelValidation.helpers.isTimezone(value);
        },


        /**
         * Validate the attribute is a valid JSON string.
         *
         * @param  value
         * @return bool
         */
        Json: function(value) {
            var result = true;
            try {
                JSON.parse(value);
            } catch (e) {
                result = false;
            }
            return result;
        },

        /**
         * Noop (always returns true).
         *
         * @param value
         * @returns {boolean}
         */
        ProengsoftNoop: function (value) {
            return true;
        },
    }
});

//# sourceMappingURL=jsvalidation.js.map
