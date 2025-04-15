/*!
 * jQuery Validation Plugin v1.21.0
 *
 * https://jqueryvalidation.org/
 *
 * Copyright (c) 2024 Jörn Zaefferer
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
		customElements: [],
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
			var focusListeners = [ ":text", "[type='password']", "[type='file']", "select", "textarea", "[type='number']", "[type='search']",
								"[type='tel']", "[type='url']", "[type='email']", "[type='datetime']", "[type='date']", "[type='month']",
								"[type='week']", "[type='time']", "[type='datetime-local']", "[type='range']", "[type='color']",
								"[type='radio']", "[type='checkbox']", "[contenteditable]", "[type='button']" ];
			var clickListeners = [ "select", "option", "[type='radio']", "[type='checkbox']" ];
			$( this.currentForm )
				.on( "focusin.validate focusout.validate keyup.validate", focusListeners.concat( this.settings.customElements ).join( ", " ), delegate )

				// Support: Chrome, oldIE
				// "select" is provided as event.target when clicking a option
				.on( "click.validate", clickListeners.concat( this.settings.customElements ).join( ", " ), delegate );

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
				rulesCache = {},
				selectors = [ "input", "select", "textarea", "[contenteditable]" ];

			// Select all valid inputs inside the form (no submit or reset buttons)
			return $( this.currentForm )
			.find( selectors.concat( this.settings.customElements ).join( ", " ) )
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

			// Abort any pending Ajax request from a previous call to this method.
			this.abortRequest( element );

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
				if ( this.settings && this.settings.escapeHtml ) {
					error.text( message || "" );
				} else {
					error.html( message || "" );
				}
			} else {

				// Create error element
				error = $( "<" + this.settings.errorElement + ">" )
					.attr( "id", elementID + "-error" )
					.addClass( this.settings.errorClass );

				if ( this.settings && this.settings.escapeHtml ) {
					error.text( message || "" );
				} else {
					error.html( message || "" );
				}

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

		elementAjaxPort: function( element ) {
			return "validate" + element.name;
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

		abortRequest: function( element ) {
			var port;

			if ( this.pending[ element.name ] ) {
				port = this.elementAjaxPort( element );
				$.ajaxAbort( port );

				this.pendingRequest--;

				// Sometimes synchronization fails, make sure pendingRequest is never < 0
				if ( this.pendingRequest < 0 ) {
					this.pendingRequest = 0;
				}

				delete this.pending[ element.name ];
				$( element ).removeClass( this.settings.pendingClass );
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
			return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:-?\.\d+)?$/.test( value );
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
			if ( previous.valid !== null && previous.old === optionDataString ) {
				return previous.valid;
			}

			previous.old = optionDataString;
			previous.valid = null;
			validator = this;
			this.startRequest( element );
			data = {};
			data[ element.name ] = value;
			$.ajax( $.extend( true, {
				mode: "abort",
				port: this.elementAjaxPort( element ),
				dataType: "json",
				data: data,
				context: validator.currentForm,
				success: function( response ) {
					var valid = response === true || response === "true",
						errors, message, submitted;

					validator.settings.messages[ element.name ][ method ] = previous.originalMessage;
					if ( valid ) {
						submitted = validator.formSubmitted;
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
//        $.ajaxAbort( port );
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

var pendingRequests = {},
	ajax;

// Use a prefilter if available (1.5+)
if ( $.ajaxPrefilter ) {
	$.ajaxPrefilter( function( settings, _, xhr ) {
		var port = settings.port;
		if ( settings.mode === "abort" ) {
			$.ajaxAbort( port );
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
			$.ajaxAbort( port );
			pendingRequests[ port ] = ajax.apply( this, arguments );
			return pendingRequests[ port ];
		}
		return ajax.apply( this, arguments );
	};
}

// Abort the previous request without sending a new one
$.ajaxAbort = function( port ) {
	if ( pendingRequests[ port ] ) {
		pendingRequests[ port ].abort();
		delete pendingRequests[ port ];
	}
};
return $;
}));
/*!
 * @copyright Copyright &copy; Kartik Visweswaran, Krajee.com, 2014 - 2025
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
            tzParts: /\b(?:[PMCEA][SDP]T|(?:Australian|Pacific|Mountain|Central|Eastern|Atlantic) (?:Eastern) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
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
	Object.freeze(DateFormatter);
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

  oracledate: {
    regex: /^(\d{2})-([A-Z]{3})-(\d{2})$/i,
    name: 'd-M-y',
    callback: function callback(match, day, monthText, year) {
      var month = {
        JAN: 0,
        FEB: 1,
        MAR: 2,
        APR: 3,
        MAY: 4,
        JUN: 5,
        JUL: 6,
        AUG: 7,
        SEP: 8,
        OCT: 9,
        NOV: 10,
        DEC: 11
      }[monthText.toUpperCase()];
      return this.ymd(2000 + parseInt(year, 10), month, parseInt(day, 10));
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
        case 'mon':
        case 'monday':
        case 'tue':
        case 'tuesday':
        case 'wed':
        case 'wednesday':
        case 'thu':
        case 'thursday':
        case 'fri':
        case 'friday':
        case 'sat':
        case 'saturday':
        case 'sun':
        case 'sunday':
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
        case 'mon':
        case 'monday':
        case 'tue':
        case 'tuesday':
        case 'wed':
        case 'wednesday':
        case 'thu':
        case 'thursday':
        case 'fri':
        case 'friday':
        case 'sat':
        case 'saturday':
        case 'sun':
        case 'sunday':
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
  //        example 7: strtotime('10-JUL-17')
  //        returns 7: 1499644800

  if (now == null) {
    now = Math.floor(Date.now() / 1000);
  }

  // the rule order is important
  // if multiple rules match, the longest match wins
  // if multiple rules match the same string, the first match wins
  var rules = [formats.yesterday, formats.now, formats.noon, formats.midnightOrToday, formats.tomorrow, formats.timestamp, formats.firstOrLastDay, formats.backOrFrontOf,
  // formats.weekdayOf, // not yet implemented
  formats.timeTiny12, formats.timeShort12, formats.timeLong12, formats.mssqltime, formats.oracledate, formats.timeShort24, formats.timeLong24, formats.iso8601long, formats.gnuNoColon, formats.iso8601noColon, formats.americanShort, formats.american, formats.iso8601date4, formats.iso8601dateSlash, formats.dateSlash, formats.gnuDateShortOrIso8601date2, formats.gnuDateShorter, formats.dateFull, formats.pointedDate4, formats.pointedDate2, formats.dateNoDay, formats.dateNoDayRev, formats.dateTextual, formats.dateNoYear, formats.dateNoYearRev, formats.dateNoColon, formats.xmlRpc, formats.xmlRpcNoColon, formats.soap, formats.wddx, formats.exif, formats.pgydotd, formats.isoWeekDay, formats.pgTextShort, formats.pgTextReverse, formats.clf, formats.year4, formats.ago, formats.dayText, formats.relativeTextWeek, formats.relativeText, formats.monthFullOrMonthAbbr, formats.tzCorrection, formats.tzAbbr, formats.dateShortWithTimeShort12, formats.dateShortWithTimeLong12, formats.dateShortWithTimeShort, formats.dateShortWithTimeLong, formats.relative, formats.whitespace];

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
    if (code >= 0xd800 && code <= 0xdbff) {
      // High surrogate (could change last hex to 0xDB7F to
      // treat high private surrogates as single characters)
      if (str.length <= i + 1) {
        throw new Error('High surrogate without following low surrogate');
      }
      next = str.charCodeAt(i + 1);
      if (next < 0xdc00 || next > 0xdfff) {
        throw new Error('High surrogate without following low surrogate');
      }
      return str.charAt(i) + str.charAt(i + 1);
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      // Low surrogate
      if (i === 0) {
        throw new Error('Low surrogate without preceding high surrogate');
      }
      prev = str.charCodeAt(i - 1);
      if (prev < 0xd800 || prev > 0xdbff) {
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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
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
        lookups = [
        // Convert dot to square brackets. e.g. foo.bar.0 becomes foo[bar][0]
        sqName,
        // Append [] to the name e.g. foo becomes foo[] or foo.bar.0 becomes foo[bar][0][]
        sqName + '[]',
        // Remove key from last array e.g. foo[bar][0] becomes foo[bar][]
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
      }

      // Find name in data, using dot notation.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1COztBQUVuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxnQkFBZ0IsVUFBVTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ2hDYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEscUJBQXFCLElBQUk7QUFDekIsc0JBQXNCLEVBQUU7QUFDeEIsc0JBQXNCLEVBQUU7QUFDeEIsbUNBQW1DLEVBQUU7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDZCQUE2QixJQUFJLElBQUksSUFBSSxHQUFHLElBQUk7QUFDaEQ7O0FBRUE7QUFDQSw4QkFBOEIsSUFBSTtBQUNsQztBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHdEQUF3RCxJQUFJO0FBQzVEOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixJQUFJO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNB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Q0gsZUFBZSxDQUFDeEYsU0FBUyxFQUFFOEYsYUFBYSxDQUFDcEcsSUFBSSxDQUFDa0csS0FBSyxDQUFDLENBQUM7UUFDakUsSUFBSUQsSUFBSSxDQUFDbkcsTUFBTSxHQUFHLENBQUMsRUFBRTtVQUNqQixPQUFPbUcsSUFBSTtRQUNmO01BQ0o7TUFFQSxPQUFPeEgsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNsQixDQUFDO0lBRUQ7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDUTZILGdCQUFnQixFQUFFLFNBQUFBLENBQVVoRyxTQUFTLEVBQUVKLE9BQU8sRUFBRTtNQUM1QyxJQUFJQSxPQUFPLENBQUNVLElBQUksQ0FBQzJGLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNuQyxPQUFPakcsU0FBUyxDQUFDMEQsVUFBVSxDQUFDOUQsT0FBTyxDQUFDVSxJQUFJLENBQUMsQ0FBQ3lFLEdBQUcsQ0FBQyxVQUFVeEYsQ0FBQyxFQUFFMkcsQ0FBQyxFQUFFO1VBQzFELE9BQU9sRyxTQUFTLENBQUN5QyxZQUFZLENBQUN5RCxDQUFDLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUNDLEdBQUcsQ0FBQyxDQUFDO01BQ1o7TUFFQSxPQUFPbkcsU0FBUyxDQUFDeUMsWUFBWSxDQUFDN0MsT0FBTyxDQUFDO0lBQzFDO0VBQ0o7QUFDSixDQUFDLENBQUMsQyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9sb2N1dHVzL3BocC9hcnJheS9hcnJheV9kaWZmLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9sb2N1dHVzL3BocC9kYXRldGltZS9zdHJ0b3RpbWUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvY3V0dXMvcGhwL2luZm8vaW5pX2dldC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbG9jdXR1cy9waHAvc3RyaW5ncy9zdHJsZW4uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvY3V0dXMvcGhwL3Zhci9pc19udW1lcmljLmpzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2hlbHBlcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFycmF5X2RpZmYoYXJyMSkge1xuICAvLyAgZGlzY3VzcyBhdDogaHR0cHM6Ly9sb2N1dHVzLmlvL3BocC9hcnJheV9kaWZmL1xuICAvLyBvcmlnaW5hbCBieTogS2V2aW4gdmFuIFpvbm5ldmVsZCAoaHR0cHM6Ly9rdnouaW8pXG4gIC8vIGltcHJvdmVkIGJ5OiBTYW5qb3kgUm95XG4gIC8vICByZXZpc2VkIGJ5OiBCcmV0dCBaYW1pciAoaHR0cHM6Ly9icmV0dC16YW1pci5tZSlcbiAgLy8gICBleGFtcGxlIDE6IGFycmF5X2RpZmYoWydLZXZpbicsICd2YW4nLCAnWm9ubmV2ZWxkJ10sIFsndmFuJywgJ1pvbm5ldmVsZCddKVxuICAvLyAgIHJldHVybnMgMTogezA6J0tldmluJ31cblxuICB2YXIgcmV0QXJyID0ge307XG4gIHZhciBhcmdsID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgdmFyIGsxID0gJyc7XG4gIHZhciBpID0gMTtcbiAgdmFyIGsgPSAnJztcbiAgdmFyIGFyciA9IHt9O1xuXG4gIGFycjFrZXlzOiBmb3IgKGsxIGluIGFycjEpIHtcbiAgICBmb3IgKGkgPSAxOyBpIDwgYXJnbDsgaSsrKSB7XG4gICAgICBhcnIgPSBhcmd1bWVudHNbaV07XG4gICAgICBmb3IgKGsgaW4gYXJyKSB7XG4gICAgICAgIGlmIChhcnJba10gPT09IGFycjFbazFdKSB7XG4gICAgICAgICAgLy8gSWYgaXQgcmVhY2hlcyBoZXJlLCBpdCB3YXMgZm91bmQgaW4gYXQgbGVhc3Qgb25lIGFycmF5LCBzbyB0cnkgbmV4dCB2YWx1ZVxuICAgICAgICAgIGNvbnRpbnVlIGFycjFrZXlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxhYmVsc1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXRBcnJbazFdID0gYXJyMVtrMV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJldEFycjtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcnJheV9kaWZmLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJlU3BhY2UgPSAnWyBcXFxcdF0rJztcbnZhciByZVNwYWNlT3B0ID0gJ1sgXFxcXHRdKic7XG52YXIgcmVNZXJpZGlhbiA9ICcoPzooW2FwXSlcXFxcLj9tXFxcXC4/KFtcXFxcdCBdfCQpKSc7XG52YXIgcmVIb3VyMjQgPSAnKDJbMC00XXxbMDFdP1swLTldKSc7XG52YXIgcmVIb3VyMjRseiA9ICcoWzAxXVswLTldfDJbMC00XSknO1xudmFyIHJlSG91cjEyID0gJygwP1sxLTldfDFbMC0yXSknO1xudmFyIHJlTWludXRlID0gJyhbMC01XT9bMC05XSknO1xudmFyIHJlTWludXRlbHogPSAnKFswLTVdWzAtOV0pJztcbnZhciByZVNlY29uZCA9ICcoNjB8WzAtNV0/WzAtOV0pJztcbnZhciByZVNlY29uZGx6ID0gJyg2MHxbMC01XVswLTldKSc7XG52YXIgcmVGcmFjID0gJyg/OlxcXFwuKFswLTldKykpJztcblxudmFyIHJlRGF5ZnVsbCA9ICdzdW5kYXl8bW9uZGF5fHR1ZXNkYXl8d2VkbmVzZGF5fHRodXJzZGF5fGZyaWRheXxzYXR1cmRheSc7XG52YXIgcmVEYXlhYmJyID0gJ3N1bnxtb258dHVlfHdlZHx0aHV8ZnJpfHNhdCc7XG52YXIgcmVEYXl0ZXh0ID0gcmVEYXlmdWxsICsgJ3wnICsgcmVEYXlhYmJyICsgJ3x3ZWVrZGF5cz8nO1xuXG52YXIgcmVSZWx0ZXh0bnVtYmVyID0gJ2ZpcnN0fHNlY29uZHx0aGlyZHxmb3VydGh8ZmlmdGh8c2l4dGh8c2V2ZW50aHxlaWdodGg/fG5pbnRofHRlbnRofGVsZXZlbnRofHR3ZWxmdGgnO1xudmFyIHJlUmVsdGV4dHRleHQgPSAnbmV4dHxsYXN0fHByZXZpb3VzfHRoaXMnO1xudmFyIHJlUmVsdGV4dHVuaXQgPSAnKD86c2Vjb25kfHNlY3xtaW51dGV8bWlufGhvdXJ8ZGF5fGZvcnRuaWdodHxmb3J0aG5pZ2h0fG1vbnRofHllYXIpcz98d2Vla3N8JyArIHJlRGF5dGV4dDtcblxudmFyIHJlWWVhciA9ICcoWzAtOV17MSw0fSknO1xudmFyIHJlWWVhcjIgPSAnKFswLTldezJ9KSc7XG52YXIgcmVZZWFyNCA9ICcoWzAtOV17NH0pJztcbnZhciByZVllYXI0d2l0aFNpZ24gPSAnKFsrLV0/WzAtOV17NH0pJztcbnZhciByZU1vbnRoID0gJygxWzAtMl18MD9bMC05XSknO1xudmFyIHJlTW9udGhseiA9ICcoMFswLTldfDFbMC0yXSknO1xudmFyIHJlRGF5ID0gJyg/OigzWzAxXXxbMC0yXT9bMC05XSkoPzpzdHxuZHxyZHx0aCk/KSc7XG52YXIgcmVEYXlseiA9ICcoMFswLTldfFsxLTJdWzAtOV18M1swMV0pJztcblxudmFyIHJlTW9udGhGdWxsID0gJ2phbnVhcnl8ZmVicnVhcnl8bWFyY2h8YXByaWx8bWF5fGp1bmV8anVseXxhdWd1c3R8c2VwdGVtYmVyfG9jdG9iZXJ8bm92ZW1iZXJ8ZGVjZW1iZXInO1xudmFyIHJlTW9udGhBYmJyID0gJ2phbnxmZWJ8bWFyfGFwcnxtYXl8anVufGp1bHxhdWd8c2VwdD98b2N0fG5vdnxkZWMnO1xudmFyIHJlTW9udGhyb21hbiA9ICdpW3Z4XXx2aXswLDN9fHhpezAsMn18aXsxLDN9JztcbnZhciByZU1vbnRoVGV4dCA9ICcoJyArIHJlTW9udGhGdWxsICsgJ3wnICsgcmVNb250aEFiYnIgKyAnfCcgKyByZU1vbnRocm9tYW4gKyAnKSc7XG5cbnZhciByZVR6Q29ycmVjdGlvbiA9ICcoKD86R01UKT8oWystXSknICsgcmVIb3VyMjQgKyAnOj8nICsgcmVNaW51dGUgKyAnPyknO1xudmFyIHJlVHpBYmJyID0gJ1xcXFwoPyhbYS16QS1aXXsxLDZ9KVxcXFwpPyc7XG52YXIgcmVEYXlPZlllYXIgPSAnKDAwWzEtOV18MFsxLTldWzAtOV18WzEyXVswLTldWzAtOV18M1swLTVdWzAtOV18MzZbMC02XSknO1xudmFyIHJlV2Vla09mWWVhciA9ICcoMFsxLTldfFsxLTRdWzAtOV18NVswLTNdKSc7XG5cbnZhciByZURhdGVOb1llYXIgPSByZU1vbnRoVGV4dCArICdbIC5cXFxcdC1dKicgKyByZURheSArICdbLC5zdG5kcmhcXFxcdCBdKic7XG5cbmZ1bmN0aW9uIHByb2Nlc3NNZXJpZGlhbihob3VyLCBtZXJpZGlhbikge1xuICBtZXJpZGlhbiA9IG1lcmlkaWFuICYmIG1lcmlkaWFuLnRvTG93ZXJDYXNlKCk7XG5cbiAgc3dpdGNoIChtZXJpZGlhbikge1xuICAgIGNhc2UgJ2EnOlxuICAgICAgaG91ciArPSBob3VyID09PSAxMiA/IC0xMiA6IDA7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwJzpcbiAgICAgIGhvdXIgKz0gaG91ciAhPT0gMTIgPyAxMiA6IDA7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIHJldHVybiBob3VyO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzWWVhcih5ZWFyU3RyKSB7XG4gIHZhciB5ZWFyID0gK3llYXJTdHI7XG5cbiAgaWYgKHllYXJTdHIubGVuZ3RoIDwgNCAmJiB5ZWFyIDwgMTAwKSB7XG4gICAgeWVhciArPSB5ZWFyIDwgNzAgPyAyMDAwIDogMTkwMDtcbiAgfVxuXG4gIHJldHVybiB5ZWFyO1xufVxuXG5mdW5jdGlvbiBsb29rdXBNb250aChtb250aFN0cikge1xuICByZXR1cm4ge1xuICAgIGphbjogMCxcbiAgICBqYW51YXJ5OiAwLFxuICAgIGk6IDAsXG4gICAgZmViOiAxLFxuICAgIGZlYnJ1YXJ5OiAxLFxuICAgIGlpOiAxLFxuICAgIG1hcjogMixcbiAgICBtYXJjaDogMixcbiAgICBpaWk6IDIsXG4gICAgYXByOiAzLFxuICAgIGFwcmlsOiAzLFxuICAgIGl2OiAzLFxuICAgIG1heTogNCxcbiAgICB2OiA0LFxuICAgIGp1bjogNSxcbiAgICBqdW5lOiA1LFxuICAgIHZpOiA1LFxuICAgIGp1bDogNixcbiAgICBqdWx5OiA2LFxuICAgIHZpaTogNixcbiAgICBhdWc6IDcsXG4gICAgYXVndXN0OiA3LFxuICAgIHZpaWk6IDcsXG4gICAgc2VwOiA4LFxuICAgIHNlcHQ6IDgsXG4gICAgc2VwdGVtYmVyOiA4LFxuICAgIGl4OiA4LFxuICAgIG9jdDogOSxcbiAgICBvY3RvYmVyOiA5LFxuICAgIHg6IDksXG4gICAgbm92OiAxMCxcbiAgICBub3ZlbWJlcjogMTAsXG4gICAgeGk6IDEwLFxuICAgIGRlYzogMTEsXG4gICAgZGVjZW1iZXI6IDExLFxuICAgIHhpaTogMTFcbiAgfVttb250aFN0ci50b0xvd2VyQ2FzZSgpXTtcbn1cblxuZnVuY3Rpb24gbG9va3VwV2Vla2RheShkYXlTdHIpIHtcbiAgdmFyIGRlc2lyZWRTdW5kYXlOdW1iZXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDA7XG5cbiAgdmFyIGRheU51bWJlcnMgPSB7XG4gICAgbW9uOiAxLFxuICAgIG1vbmRheTogMSxcbiAgICB0dWU6IDIsXG4gICAgdHVlc2RheTogMixcbiAgICB3ZWQ6IDMsXG4gICAgd2VkbmVzZGF5OiAzLFxuICAgIHRodTogNCxcbiAgICB0aHVyc2RheTogNCxcbiAgICBmcmk6IDUsXG4gICAgZnJpZGF5OiA1LFxuICAgIHNhdDogNixcbiAgICBzYXR1cmRheTogNixcbiAgICBzdW46IDAsXG4gICAgc3VuZGF5OiAwXG4gIH07XG5cbiAgcmV0dXJuIGRheU51bWJlcnNbZGF5U3RyLnRvTG93ZXJDYXNlKCldIHx8IGRlc2lyZWRTdW5kYXlOdW1iZXI7XG59XG5cbmZ1bmN0aW9uIGxvb2t1cFJlbGF0aXZlKHJlbFRleHQpIHtcbiAgdmFyIHJlbGF0aXZlTnVtYmVycyA9IHtcbiAgICBsYXN0OiAtMSxcbiAgICBwcmV2aW91czogLTEsXG4gICAgdGhpczogMCxcbiAgICBmaXJzdDogMSxcbiAgICBuZXh0OiAxLFxuICAgIHNlY29uZDogMixcbiAgICB0aGlyZDogMyxcbiAgICBmb3VydGg6IDQsXG4gICAgZmlmdGg6IDUsXG4gICAgc2l4dGg6IDYsXG4gICAgc2V2ZW50aDogNyxcbiAgICBlaWdodDogOCxcbiAgICBlaWdodGg6IDgsXG4gICAgbmludGg6IDksXG4gICAgdGVudGg6IDEwLFxuICAgIGVsZXZlbnRoOiAxMSxcbiAgICB0d2VsZnRoOiAxMlxuICB9O1xuXG4gIHZhciByZWxhdGl2ZUJlaGF2aW9yID0ge1xuICAgIHRoaXM6IDFcbiAgfTtcblxuICB2YXIgcmVsVGV4dExvd2VyID0gcmVsVGV4dC50b0xvd2VyQ2FzZSgpO1xuXG4gIHJldHVybiB7XG4gICAgYW1vdW50OiByZWxhdGl2ZU51bWJlcnNbcmVsVGV4dExvd2VyXSxcbiAgICBiZWhhdmlvcjogcmVsYXRpdmVCZWhhdmlvcltyZWxUZXh0TG93ZXJdIHx8IDBcbiAgfTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1R6Q29ycmVjdGlvbih0ek9mZnNldCwgb2xkVmFsdWUpIHtcbiAgdmFyIHJlVHpDb3JyZWN0aW9uTG9vc2UgPSAvKD86R01UKT8oWystXSkoXFxkKykoOj8pKFxcZHswLDJ9KS9pO1xuICB0ek9mZnNldCA9IHR6T2Zmc2V0ICYmIHR6T2Zmc2V0Lm1hdGNoKHJlVHpDb3JyZWN0aW9uTG9vc2UpO1xuXG4gIGlmICghdHpPZmZzZXQpIHtcbiAgICByZXR1cm4gb2xkVmFsdWU7XG4gIH1cblxuICB2YXIgc2lnbiA9IHR6T2Zmc2V0WzFdID09PSAnLScgPyAtMSA6IDE7XG4gIHZhciBob3VycyA9ICt0ek9mZnNldFsyXTtcbiAgdmFyIG1pbnV0ZXMgPSArdHpPZmZzZXRbNF07XG5cbiAgaWYgKCF0ek9mZnNldFs0XSAmJiAhdHpPZmZzZXRbM10pIHtcbiAgICBtaW51dGVzID0gTWF0aC5mbG9vcihob3VycyAlIDEwMCk7XG4gICAgaG91cnMgPSBNYXRoLmZsb29yKGhvdXJzIC8gMTAwKTtcbiAgfVxuXG4gIC8vIHRpbWV6b25lIG9mZnNldCBpbiBzZWNvbmRzXG4gIHJldHVybiBzaWduICogKGhvdXJzICogNjAgKyBtaW51dGVzKSAqIDYwO1xufVxuXG4vLyB0eiBhYmJyZXZhdGlvbiA6IHR6IG9mZnNldCBpbiBzZWNvbmRzXG52YXIgdHpBYmJyT2Zmc2V0cyA9IHtcbiAgYWNkdDogMzc4MDAsXG4gIGFjc3Q6IDM0MjAwLFxuICBhZGR0OiAtNzIwMCxcbiAgYWR0OiAtMTA4MDAsXG4gIGFlZHQ6IDM5NjAwLFxuICBhZXN0OiAzNjAwMCxcbiAgYWhkdDogLTMyNDAwLFxuICBhaHN0OiAtMzYwMDAsXG4gIGFrZHQ6IC0yODgwMCxcbiAgYWtzdDogLTMyNDAwLFxuICBhbXQ6IC0xMzg0MCxcbiAgYXB0OiAtMTA4MDAsXG4gIGFzdDogLTE0NDAwLFxuICBhd2R0OiAzMjQwMCxcbiAgYXdzdDogMjg4MDAsXG4gIGF3dDogLTEwODAwLFxuICBiZHN0OiA3MjAwLFxuICBiZHQ6IC0zNjAwMCxcbiAgYm10OiAtMTQzMDksXG4gIGJzdDogMzYwMCxcbiAgY2FzdDogMzQyMDAsXG4gIGNhdDogNzIwMCxcbiAgY2RkdDogLTE0NDAwLFxuICBjZHQ6IC0xODAwMCxcbiAgY2VtdDogMTA4MDAsXG4gIGNlc3Q6IDcyMDAsXG4gIGNldDogMzYwMCxcbiAgY210OiAtMTU0MDgsXG4gIGNwdDogLTE4MDAwLFxuICBjc3Q6IC0yMTYwMCxcbiAgY3d0OiAtMTgwMDAsXG4gIGNoc3Q6IDM2MDAwLFxuICBkbXQ6IC0xNTIxLFxuICBlYXQ6IDEwODAwLFxuICBlZGR0OiAtMTA4MDAsXG4gIGVkdDogLTE0NDAwLFxuICBlZXN0OiAxMDgwMCxcbiAgZWV0OiA3MjAwLFxuICBlbXQ6IC0yNjI0OCxcbiAgZXB0OiAtMTQ0MDAsXG4gIGVzdDogLTE4MDAwLFxuICBld3Q6IC0xNDQwMCxcbiAgZmZtdDogLTE0NjYwLFxuICBmbXQ6IC00MDU2LFxuICBnZHQ6IDM5NjAwLFxuICBnbXQ6IDAsXG4gIGdzdDogMzYwMDAsXG4gIGhkdDogLTM0MjAwLFxuICBoa3N0OiAzMjQwMCxcbiAgaGt0OiAyODgwMCxcbiAgaG10OiAtMTk3NzYsXG4gIGhwdDogLTM0MjAwLFxuICBoc3Q6IC0zNjAwMCxcbiAgaHd0OiAtMzQyMDAsXG4gIGlkZHQ6IDE0NDAwLFxuICBpZHQ6IDEwODAwLFxuICBpbXQ6IDI1MDI1LFxuICBpc3Q6IDcyMDAsXG4gIGpkdDogMzYwMDAsXG4gIGptdDogODQ0MCxcbiAganN0OiAzMjQwMCxcbiAga2R0OiAzNjAwMCxcbiAga210OiA1NzM2LFxuICBrc3Q6IDMwNjAwLFxuICBsc3Q6IDkzOTQsXG4gIG1kZHQ6IC0xODAwMCxcbiAgbWRzdDogMTYyNzksXG4gIG1kdDogLTIxNjAwLFxuICBtZXN0OiA3MjAwLFxuICBtZXQ6IDM2MDAsXG4gIG1tdDogOTAxNyxcbiAgbXB0OiAtMjE2MDAsXG4gIG1zZDogMTQ0MDAsXG4gIG1zazogMTA4MDAsXG4gIG1zdDogLTI1MjAwLFxuICBtd3Q6IC0yMTYwMCxcbiAgbmRkdDogLTU0MDAsXG4gIG5kdDogLTkwNTIsXG4gIG5wdDogLTkwMDAsXG4gIG5zdDogLTEyNjAwLFxuICBud3Q6IC05MDAwLFxuICBuemR0OiA0NjgwMCxcbiAgbnptdDogNDE0MDAsXG4gIG56c3Q6IDQzMjAwLFxuICBwZGR0OiAtMjE2MDAsXG4gIHBkdDogLTI1MjAwLFxuICBwa3N0OiAyMTYwMCxcbiAgcGt0OiAxODAwMCxcbiAgcGxtdDogMjU1OTAsXG4gIHBtdDogLTEzMjM2LFxuICBwcG10OiAtMTczNDAsXG4gIHBwdDogLTI1MjAwLFxuICBwc3Q6IC0yODgwMCxcbiAgcHd0OiAtMjUyMDAsXG4gIHFtdDogLTE4ODQwLFxuICBybXQ6IDU3OTQsXG4gIHNhc3Q6IDcyMDAsXG4gIHNkbXQ6IC0xNjgwMCxcbiAgc2ptdDogLTIwMTczLFxuICBzbXQ6IC0xMzg4NCxcbiAgc3N0OiAtMzk2MDAsXG4gIHRibXQ6IDEwNzUxLFxuICB0bXQ6IDEyMzQ0LFxuICB1Y3Q6IDAsXG4gIHV0YzogMCxcbiAgd2FzdDogNzIwMCxcbiAgd2F0OiAzNjAwLFxuICB3ZW10OiA3MjAwLFxuICB3ZXN0OiAzNjAwLFxuICB3ZXQ6IDAsXG4gIHdpYjogMjUyMDAsXG4gIHdpdGE6IDI4ODAwLFxuICB3aXQ6IDMyNDAwLFxuICB3bXQ6IDUwNDAsXG4gIHlkZHQ6IC0yNTIwMCxcbiAgeWR0OiAtMjg4MDAsXG4gIHlwdDogLTI4ODAwLFxuICB5c3Q6IC0zMjQwMCxcbiAgeXd0OiAtMjg4MDAsXG4gIGE6IDM2MDAsXG4gIGI6IDcyMDAsXG4gIGM6IDEwODAwLFxuICBkOiAxNDQwMCxcbiAgZTogMTgwMDAsXG4gIGY6IDIxNjAwLFxuICBnOiAyNTIwMCxcbiAgaDogMjg4MDAsXG4gIGk6IDMyNDAwLFxuICBrOiAzNjAwMCxcbiAgbDogMzk2MDAsXG4gIG06IDQzMjAwLFxuICBuOiAtMzYwMCxcbiAgbzogLTcyMDAsXG4gIHA6IC0xMDgwMCxcbiAgcTogLTE0NDAwLFxuICByOiAtMTgwMDAsXG4gIHM6IC0yMTYwMCxcbiAgdDogLTI1MjAwLFxuICB1OiAtMjg4MDAsXG4gIHY6IC0zMjQwMCxcbiAgdzogLTM2MDAwLFxuICB4OiAtMzk2MDAsXG4gIHk6IC00MzIwMCxcbiAgejogMFxufTtcblxudmFyIGZvcm1hdHMgPSB7XG4gIHllc3RlcmRheToge1xuICAgIHJlZ2V4OiAvXnllc3RlcmRheS9pLFxuICAgIG5hbWU6ICd5ZXN0ZXJkYXknLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjaygpIHtcbiAgICAgIHRoaXMucmQgLT0gMTtcbiAgICAgIHJldHVybiB0aGlzLnJlc2V0VGltZSgpO1xuICAgIH1cbiAgfSxcblxuICBub3c6IHtcbiAgICByZWdleDogL15ub3cvaSxcbiAgICBuYW1lOiAnbm93J1xuICAgIC8vIGRvIG5vdGhpbmdcbiAgfSxcblxuICBub29uOiB7XG4gICAgcmVnZXg6IC9ebm9vbi9pLFxuICAgIG5hbWU6ICdub29uJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2soKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXNldFRpbWUoKSAmJiB0aGlzLnRpbWUoMTIsIDAsIDAsIDApO1xuICAgIH1cbiAgfSxcblxuICBtaWRuaWdodE9yVG9kYXk6IHtcbiAgICByZWdleDogL14obWlkbmlnaHR8dG9kYXkpL2ksXG4gICAgbmFtZTogJ21pZG5pZ2h0IHwgdG9kYXknLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjaygpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlc2V0VGltZSgpO1xuICAgIH1cbiAgfSxcblxuICB0b21vcnJvdzoge1xuICAgIHJlZ2V4OiAvXnRvbW9ycm93L2ksXG4gICAgbmFtZTogJ3RvbW9ycm93JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2soKSB7XG4gICAgICB0aGlzLnJkICs9IDE7XG4gICAgICByZXR1cm4gdGhpcy5yZXNldFRpbWUoKTtcbiAgICB9XG4gIH0sXG5cbiAgdGltZXN0YW1wOiB7XG4gICAgcmVnZXg6IC9eQCgtP1xcZCspL2ksXG4gICAgbmFtZTogJ3RpbWVzdGFtcCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB0aW1lc3RhbXApIHtcbiAgICAgIHRoaXMucnMgKz0gK3RpbWVzdGFtcDtcbiAgICAgIHRoaXMueSA9IDE5NzA7XG4gICAgICB0aGlzLm0gPSAwO1xuICAgICAgdGhpcy5kID0gMTtcbiAgICAgIHRoaXMuZGF0ZXMgPSAwO1xuXG4gICAgICByZXR1cm4gdGhpcy5yZXNldFRpbWUoKSAmJiB0aGlzLnpvbmUoMCk7XG4gICAgfVxuICB9LFxuXG4gIGZpcnN0T3JMYXN0RGF5OiB7XG4gICAgcmVnZXg6IC9eKGZpcnN0fGxhc3QpIGRheSBvZi9pLFxuICAgIG5hbWU6ICdmaXJzdGRheW9mIHwgbGFzdGRheW9mJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGRheSkge1xuICAgICAgaWYgKGRheS50b0xvd2VyQ2FzZSgpID09PSAnZmlyc3QnKSB7XG4gICAgICAgIHRoaXMuZmlyc3RPckxhc3REYXlPZk1vbnRoID0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZmlyc3RPckxhc3REYXlPZk1vbnRoID0gLTE7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGJhY2tPckZyb250T2Y6IHtcbiAgICByZWdleDogUmVnRXhwKCdeKGJhY2t8ZnJvbnQpIG9mICcgKyByZUhvdXIyNCArIHJlU3BhY2VPcHQgKyByZU1lcmlkaWFuICsgJz8nLCAnaScpLFxuICAgIG5hbWU6ICdiYWNrb2YgfCBmcm9udG9mJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHNpZGUsIGhvdXJzLCBtZXJpZGlhbikge1xuICAgICAgdmFyIGJhY2sgPSBzaWRlLnRvTG93ZXJDYXNlKCkgPT09ICdiYWNrJztcbiAgICAgIHZhciBob3VyID0gK2hvdXJzO1xuICAgICAgdmFyIG1pbnV0ZSA9IDE1O1xuXG4gICAgICBpZiAoIWJhY2spIHtcbiAgICAgICAgaG91ciAtPSAxO1xuICAgICAgICBtaW51dGUgPSA0NTtcbiAgICAgIH1cblxuICAgICAgaG91ciA9IHByb2Nlc3NNZXJpZGlhbihob3VyLCBtZXJpZGlhbik7XG5cbiAgICAgIHJldHVybiB0aGlzLnJlc2V0VGltZSgpICYmIHRoaXMudGltZShob3VyLCBtaW51dGUsIDAsIDApO1xuICAgIH1cbiAgfSxcblxuICB3ZWVrZGF5T2Y6IHtcbiAgICByZWdleDogUmVnRXhwKCdeKCcgKyByZVJlbHRleHRudW1iZXIgKyAnfCcgKyByZVJlbHRleHR0ZXh0ICsgJyknICsgcmVTcGFjZSArICcoJyArIHJlRGF5ZnVsbCArICd8JyArIHJlRGF5YWJiciArICcpJyArIHJlU3BhY2UgKyAnb2YnLCAnaScpLFxuICAgIG5hbWU6ICd3ZWVrZGF5b2YnXG4gICAgLy8gdG9kb1xuICB9LFxuXG4gIG1zc3FsdGltZToge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVIb3VyMTIgKyAnOicgKyByZU1pbnV0ZWx6ICsgJzonICsgcmVTZWNvbmRseiArICdbOi5dKFswLTldKyknICsgcmVNZXJpZGlhbiwgJ2knKSxcbiAgICBuYW1lOiAnbXNzcWx0aW1lJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmcmFjLCBtZXJpZGlhbikge1xuICAgICAgcmV0dXJuIHRoaXMudGltZShwcm9jZXNzTWVyaWRpYW4oK2hvdXIsIG1lcmlkaWFuKSwgK21pbnV0ZSwgK3NlY29uZCwgK2ZyYWMuc3Vic3RyKDAsIDMpKTtcbiAgICB9XG4gIH0sXG5cbiAgb3JhY2xlZGF0ZToge1xuICAgIHJlZ2V4OiAvXihcXGR7Mn0pLShbQS1aXXszfSktKFxcZHsyfSkkL2ksXG4gICAgbmFtZTogJ2QtTS15JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGRheSwgbW9udGhUZXh0LCB5ZWFyKSB7XG4gICAgICB2YXIgbW9udGggPSB7XG4gICAgICAgIEpBTjogMCxcbiAgICAgICAgRkVCOiAxLFxuICAgICAgICBNQVI6IDIsXG4gICAgICAgIEFQUjogMyxcbiAgICAgICAgTUFZOiA0LFxuICAgICAgICBKVU46IDUsXG4gICAgICAgIEpVTDogNixcbiAgICAgICAgQVVHOiA3LFxuICAgICAgICBTRVA6IDgsXG4gICAgICAgIE9DVDogOSxcbiAgICAgICAgTk9WOiAxMCxcbiAgICAgICAgREVDOiAxMVxuICAgICAgfVttb250aFRleHQudG9VcHBlckNhc2UoKV07XG4gICAgICByZXR1cm4gdGhpcy55bWQoMjAwMCArIHBhcnNlSW50KHllYXIsIDEwKSwgbW9udGgsIHBhcnNlSW50KGRheSwgMTApKTtcbiAgICB9XG4gIH0sXG5cbiAgdGltZUxvbmcxMjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVIb3VyMTIgKyAnWzouXScgKyByZU1pbnV0ZSArICdbOi5dJyArIHJlU2Vjb25kbHogKyByZVNwYWNlT3B0ICsgcmVNZXJpZGlhbiwgJ2knKSxcbiAgICBuYW1lOiAndGltZWxvbmcxMicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWVyaWRpYW4pIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbWUocHJvY2Vzc01lcmlkaWFuKCtob3VyLCBtZXJpZGlhbiksICttaW51dGUsICtzZWNvbmQsIDApO1xuICAgIH1cbiAgfSxcblxuICB0aW1lU2hvcnQxMjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVIb3VyMTIgKyAnWzouXScgKyByZU1pbnV0ZWx6ICsgcmVTcGFjZU9wdCArIHJlTWVyaWRpYW4sICdpJyksXG4gICAgbmFtZTogJ3RpbWVzaG9ydDEyJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGhvdXIsIG1pbnV0ZSwgbWVyaWRpYW4pIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbWUocHJvY2Vzc01lcmlkaWFuKCtob3VyLCBtZXJpZGlhbiksICttaW51dGUsIDAsIDApO1xuICAgIH1cbiAgfSxcblxuICB0aW1lVGlueTEyOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZUhvdXIxMiArIHJlU3BhY2VPcHQgKyByZU1lcmlkaWFuLCAnaScpLFxuICAgIG5hbWU6ICd0aW1ldGlueTEyJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGhvdXIsIG1lcmlkaWFuKSB7XG4gICAgICByZXR1cm4gdGhpcy50aW1lKHByb2Nlc3NNZXJpZGlhbigraG91ciwgbWVyaWRpYW4pLCAwLCAwLCAwKTtcbiAgICB9XG4gIH0sXG5cbiAgc29hcDoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVZZWFyNCArICctJyArIHJlTW9udGhseiArICctJyArIHJlRGF5bHogKyAnVCcgKyByZUhvdXIyNGx6ICsgJzonICsgcmVNaW51dGVseiArICc6JyArIHJlU2Vjb25kbHogKyByZUZyYWMgKyByZVR6Q29ycmVjdGlvbiArICc/JywgJ2knKSxcbiAgICBuYW1lOiAnc29hcCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZnJhYywgdHpDb3JyZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQoK3llYXIsIG1vbnRoIC0gMSwgK2RheSkgJiYgdGhpcy50aW1lKCtob3VyLCArbWludXRlLCArc2Vjb25kLCArZnJhYy5zdWJzdHIoMCwgMykpICYmIHRoaXMuem9uZShwcm9jZXNzVHpDb3JyZWN0aW9uKHR6Q29ycmVjdGlvbikpO1xuICAgIH1cbiAgfSxcblxuICB3ZGR4OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVllYXI0ICsgJy0nICsgcmVNb250aCArICctJyArIHJlRGF5ICsgJ1QnICsgcmVIb3VyMjQgKyAnOicgKyByZU1pbnV0ZSArICc6JyArIHJlU2Vjb25kKSxcbiAgICBuYW1lOiAnd2RkeCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCkge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKCt5ZWFyLCBtb250aCAtIDEsICtkYXkpICYmIHRoaXMudGltZSgraG91ciwgK21pbnV0ZSwgK3NlY29uZCwgMCk7XG4gICAgfVxuICB9LFxuXG4gIGV4aWY6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlWWVhcjQgKyAnOicgKyByZU1vbnRobHogKyAnOicgKyByZURheWx6ICsgJyAnICsgcmVIb3VyMjRseiArICc6JyArIHJlTWludXRlbHogKyAnOicgKyByZVNlY29uZGx6LCAnaScpLFxuICAgIG5hbWU6ICdleGlmJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQoK3llYXIsIG1vbnRoIC0gMSwgK2RheSkgJiYgdGhpcy50aW1lKCtob3VyLCArbWludXRlLCArc2Vjb25kLCAwKTtcbiAgICB9XG4gIH0sXG5cbiAgeG1sUnBjOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVllYXI0ICsgcmVNb250aGx6ICsgcmVEYXlseiArICdUJyArIHJlSG91cjI0ICsgJzonICsgcmVNaW51dGVseiArICc6JyArIHJlU2Vjb25kbHopLFxuICAgIG5hbWU6ICd4bWxycGMnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCgreWVhciwgbW9udGggLSAxLCArZGF5KSAmJiB0aGlzLnRpbWUoK2hvdXIsICttaW51dGUsICtzZWNvbmQsIDApO1xuICAgIH1cbiAgfSxcblxuICB4bWxScGNOb0NvbG9uOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVllYXI0ICsgcmVNb250aGx6ICsgcmVEYXlseiArICdbVHRdJyArIHJlSG91cjI0ICsgcmVNaW51dGVseiArIHJlU2Vjb25kbHopLFxuICAgIG5hbWU6ICd4bWxycGNub2NvbG9uJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQoK3llYXIsIG1vbnRoIC0gMSwgK2RheSkgJiYgdGhpcy50aW1lKCtob3VyLCArbWludXRlLCArc2Vjb25kLCAwKTtcbiAgICB9XG4gIH0sXG5cbiAgY2xmOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZURheSArICcvKCcgKyByZU1vbnRoQWJiciArICcpLycgKyByZVllYXI0ICsgJzonICsgcmVIb3VyMjRseiArICc6JyArIHJlTWludXRlbHogKyAnOicgKyByZVNlY29uZGx6ICsgcmVTcGFjZSArIHJlVHpDb3JyZWN0aW9uLCAnaScpLFxuICAgIG5hbWU6ICdjbGYnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgZGF5LCBtb250aCwgeWVhciwgaG91ciwgbWludXRlLCBzZWNvbmQsIHR6Q29ycmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKCt5ZWFyLCBsb29rdXBNb250aChtb250aCksICtkYXkpICYmIHRoaXMudGltZSgraG91ciwgK21pbnV0ZSwgK3NlY29uZCwgMCkgJiYgdGhpcy56b25lKHByb2Nlc3NUekNvcnJlY3Rpb24odHpDb3JyZWN0aW9uKSk7XG4gICAgfVxuICB9LFxuXG4gIGlzbzg2MDFsb25nOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXnQ/JyArIHJlSG91cjI0ICsgJ1s6Ll0nICsgcmVNaW51dGUgKyAnWzouXScgKyByZVNlY29uZCArIHJlRnJhYywgJ2knKSxcbiAgICBuYW1lOiAnaXNvODYwMWxvbmcnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgaG91ciwgbWludXRlLCBzZWNvbmQsIGZyYWMpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbWUoK2hvdXIsICttaW51dGUsICtzZWNvbmQsICtmcmFjLnN1YnN0cigwLCAzKSk7XG4gICAgfVxuICB9LFxuXG4gIGRhdGVUZXh0dWFsOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZU1vbnRoVGV4dCArICdbIC5cXFxcdC1dKicgKyByZURheSArICdbLC5zdG5kcmhcXFxcdCBdKycgKyByZVllYXIsICdpJyksXG4gICAgbmFtZTogJ2RhdGV0ZXh0dWFsJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIG1vbnRoLCBkYXksIHllYXIpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZChwcm9jZXNzWWVhcih5ZWFyKSwgbG9va3VwTW9udGgobW9udGgpLCArZGF5KTtcbiAgICB9XG4gIH0sXG5cbiAgcG9pbnRlZERhdGU0OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZURheSArICdbLlxcXFx0LV0nICsgcmVNb250aCArICdbLi1dJyArIHJlWWVhcjQpLFxuICAgIG5hbWU6ICdwb2ludGVkZGF0ZTQnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgZGF5LCBtb250aCwgeWVhcikge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKCt5ZWFyLCBtb250aCAtIDEsICtkYXkpO1xuICAgIH1cbiAgfSxcblxuICBwb2ludGVkRGF0ZTI6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlRGF5ICsgJ1suXFxcXHRdJyArIHJlTW9udGggKyAnXFxcXC4nICsgcmVZZWFyMiksXG4gICAgbmFtZTogJ3BvaW50ZWRkYXRlMicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBkYXksIG1vbnRoLCB5ZWFyKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQocHJvY2Vzc1llYXIoeWVhciksIG1vbnRoIC0gMSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIHRpbWVMb25nMjQ6IHtcbiAgICByZWdleDogUmVnRXhwKCdedD8nICsgcmVIb3VyMjQgKyAnWzouXScgKyByZU1pbnV0ZSArICdbOi5dJyArIHJlU2Vjb25kKSxcbiAgICBuYW1lOiAndGltZWxvbmcyNCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBob3VyLCBtaW51dGUsIHNlY29uZCkge1xuICAgICAgcmV0dXJuIHRoaXMudGltZSgraG91ciwgK21pbnV0ZSwgK3NlY29uZCwgMCk7XG4gICAgfVxuICB9LFxuXG4gIGRhdGVOb0NvbG9uOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVllYXI0ICsgcmVNb250aGx6ICsgcmVEYXlseiksXG4gICAgbmFtZTogJ2RhdGVub2NvbG9uJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHllYXIsIG1vbnRoLCBkYXkpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCgreWVhciwgbW9udGggLSAxLCArZGF5KTtcbiAgICB9XG4gIH0sXG5cbiAgcGd5ZG90ZDoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVZZWFyNCArICdcXFxcLj8nICsgcmVEYXlPZlllYXIpLFxuICAgIG5hbWU6ICdwZ3lkb3RkJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHllYXIsIGRheSkge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKCt5ZWFyLCAwLCArZGF5KTtcbiAgICB9XG4gIH0sXG5cbiAgdGltZVNob3J0MjQ6IHtcbiAgICByZWdleDogUmVnRXhwKCdedD8nICsgcmVIb3VyMjQgKyAnWzouXScgKyByZU1pbnV0ZSwgJ2knKSxcbiAgICBuYW1lOiAndGltZXNob3J0MjQnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgaG91ciwgbWludXRlKSB7XG4gICAgICByZXR1cm4gdGhpcy50aW1lKCtob3VyLCArbWludXRlLCAwLCAwKTtcbiAgICB9XG4gIH0sXG5cbiAgaXNvODYwMW5vQ29sb246IHtcbiAgICByZWdleDogUmVnRXhwKCdedD8nICsgcmVIb3VyMjRseiArIHJlTWludXRlbHogKyByZVNlY29uZGx6LCAnaScpLFxuICAgIG5hbWU6ICdpc284NjAxbm9jb2xvbicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBob3VyLCBtaW51dGUsIHNlY29uZCkge1xuICAgICAgcmV0dXJuIHRoaXMudGltZSgraG91ciwgK21pbnV0ZSwgK3NlY29uZCwgMCk7XG4gICAgfVxuICB9LFxuXG4gIGlzbzg2MDFkYXRlU2xhc2g6IHtcbiAgICAvLyBldmVudGhvdWdoIHRoZSB0cmFpbGluZyBzbGFzaCBpcyBvcHRpb25hbCBpbiBQSFBcbiAgICAvLyBoZXJlIGl0J3MgbWFuZGF0b3J5IGFuZCBpbnB1dHMgd2l0aG91dCB0aGUgc2xhc2hcbiAgICAvLyBhcmUgaGFuZGxlZCBieSBkYXRlc2xhc2hcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlWWVhcjQgKyAnLycgKyByZU1vbnRobHogKyAnLycgKyByZURheWx6ICsgJy8nKSxcbiAgICBuYW1lOiAnaXNvODYwMWRhdGVzbGFzaCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBtb250aCwgZGF5KSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQoK3llYXIsIG1vbnRoIC0gMSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIGRhdGVTbGFzaDoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVZZWFyNCArICcvJyArIHJlTW9udGggKyAnLycgKyByZURheSksXG4gICAgbmFtZTogJ2RhdGVzbGFzaCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBtb250aCwgZGF5KSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQoK3llYXIsIG1vbnRoIC0gMSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIGFtZXJpY2FuOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZU1vbnRoICsgJy8nICsgcmVEYXkgKyAnLycgKyByZVllYXIpLFxuICAgIG5hbWU6ICdhbWVyaWNhbicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBtb250aCwgZGF5LCB5ZWFyKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQocHJvY2Vzc1llYXIoeWVhciksIG1vbnRoIC0gMSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIGFtZXJpY2FuU2hvcnQ6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlTW9udGggKyAnLycgKyByZURheSksXG4gICAgbmFtZTogJ2FtZXJpY2Fuc2hvcnQnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgbW9udGgsIGRheSkge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKHRoaXMueSwgbW9udGggLSAxLCArZGF5KTtcbiAgICB9XG4gIH0sXG5cbiAgZ251RGF0ZVNob3J0T3JJc284NjAxZGF0ZTI6IHtcbiAgICAvLyBpc284NjAxZGF0ZTIgaXMgY29tcGxldGUgc3Vic2V0IG9mIGdudWRhdGVzaG9ydFxuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVZZWFyICsgJy0nICsgcmVNb250aCArICctJyArIHJlRGF5KSxcbiAgICBuYW1lOiAnZ251ZGF0ZXNob3J0IHwgaXNvODYwMWRhdGUyJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHllYXIsIG1vbnRoLCBkYXkpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZChwcm9jZXNzWWVhcih5ZWFyKSwgbW9udGggLSAxLCArZGF5KTtcbiAgICB9XG4gIH0sXG5cbiAgaXNvODYwMWRhdGU0OiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVllYXI0d2l0aFNpZ24gKyAnLScgKyByZU1vbnRobHogKyAnLScgKyByZURheWx6KSxcbiAgICBuYW1lOiAnaXNvODYwMWRhdGU0JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHllYXIsIG1vbnRoLCBkYXkpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCgreWVhciwgbW9udGggLSAxLCArZGF5KTtcbiAgICB9XG4gIH0sXG5cbiAgZ251Tm9Db2xvbjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ150PycgKyByZUhvdXIyNGx6ICsgcmVNaW51dGVseiwgJ2knKSxcbiAgICBuYW1lOiAnZ251bm9jb2xvbicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBob3VyLCBtaW51dGUpIHtcbiAgICAgIC8vIHRoaXMgcnVsZSBpcyBhIHNwZWNpYWwgY2FzZVxuICAgICAgLy8gaWYgdGltZSB3YXMgYWxyZWFkeSBzZXQgb25jZSBieSBhbnkgcHJlY2VkaW5nIHJ1bGUsIGl0IHNldHMgdGhlIGNhcHR1cmVkIHZhbHVlIGFzIHllYXJcbiAgICAgIHN3aXRjaCAodGhpcy50aW1lcykge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgcmV0dXJuIHRoaXMudGltZSgraG91ciwgK21pbnV0ZSwgMCwgdGhpcy5mKTtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIHRoaXMueSA9IGhvdXIgKiAxMDAgKyArbWludXRlO1xuICAgICAgICAgIHRoaXMudGltZXMrKztcblxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZ251RGF0ZVNob3J0ZXI6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlWWVhcjQgKyAnLScgKyByZU1vbnRoKSxcbiAgICBuYW1lOiAnZ251ZGF0ZXNob3J0ZXInLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgeWVhciwgbW9udGgpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCgreWVhciwgbW9udGggLSAxLCAxKTtcbiAgICB9XG4gIH0sXG5cbiAgcGdUZXh0UmV2ZXJzZToge1xuICAgIC8vIG5vdGU6IGFsbG93ZWQgeWVhcnMgYXJlIGZyb20gMzItOTk5OVxuICAgIC8vIHllYXJzIGJlbG93IDMyIHNob3VsZCBiZSB0cmVhdGVkIGFzIGRheXMgaW4gZGF0ZWZ1bGxcbiAgICByZWdleDogUmVnRXhwKCdeJyArICcoXFxcXGR7Myw0fXxbNC05XVxcXFxkfDNbMi05XSktKCcgKyByZU1vbnRoQWJiciArICcpLScgKyByZURheWx6LCAnaScpLFxuICAgIG5hbWU6ICdwZ3RleHRyZXZlcnNlJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHllYXIsIG1vbnRoLCBkYXkpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZChwcm9jZXNzWWVhcih5ZWFyKSwgbG9va3VwTW9udGgobW9udGgpLCArZGF5KTtcbiAgICB9XG4gIH0sXG5cbiAgZGF0ZUZ1bGw6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlRGF5ICsgJ1sgXFxcXHQuLV0qJyArIHJlTW9udGhUZXh0ICsgJ1sgXFxcXHQuLV0qJyArIHJlWWVhciwgJ2knKSxcbiAgICBuYW1lOiAnZGF0ZWZ1bGwnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgZGF5LCBtb250aCwgeWVhcikge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKHByb2Nlc3NZZWFyKHllYXIpLCBsb29rdXBNb250aChtb250aCksICtkYXkpO1xuICAgIH1cbiAgfSxcblxuICBkYXRlTm9EYXk6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlTW9udGhUZXh0ICsgJ1sgLlxcXFx0LV0qJyArIHJlWWVhcjQsICdpJyksXG4gICAgbmFtZTogJ2RhdGVub2RheScsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBtb250aCwgeWVhcikge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKCt5ZWFyLCBsb29rdXBNb250aChtb250aCksIDEpO1xuICAgIH1cbiAgfSxcblxuICBkYXRlTm9EYXlSZXY6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlWWVhcjQgKyAnWyAuXFxcXHQtXSonICsgcmVNb250aFRleHQsICdpJyksXG4gICAgbmFtZTogJ2RhdGVub2RheXJldicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCBtb250aCkge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKCt5ZWFyLCBsb29rdXBNb250aChtb250aCksIDEpO1xuICAgIH1cbiAgfSxcblxuICBwZ1RleHRTaG9ydDoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14oJyArIHJlTW9udGhBYmJyICsgJyktJyArIHJlRGF5bHogKyAnLScgKyByZVllYXIsICdpJyksXG4gICAgbmFtZTogJ3BndGV4dHNob3J0JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIG1vbnRoLCBkYXksIHllYXIpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZChwcm9jZXNzWWVhcih5ZWFyKSwgbG9va3VwTW9udGgobW9udGgpLCArZGF5KTtcbiAgICB9XG4gIH0sXG5cbiAgZGF0ZU5vWWVhcjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVEYXRlTm9ZZWFyLCAnaScpLFxuICAgIG5hbWU6ICdkYXRlbm95ZWFyJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIG1vbnRoLCBkYXkpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCh0aGlzLnksIGxvb2t1cE1vbnRoKG1vbnRoKSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIGRhdGVOb1llYXJSZXY6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlRGF5ICsgJ1sgLlxcXFx0LV0qJyArIHJlTW9udGhUZXh0LCAnaScpLFxuICAgIG5hbWU6ICdkYXRlbm95ZWFycmV2JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIGRheSwgbW9udGgpIHtcbiAgICAgIHJldHVybiB0aGlzLnltZCh0aGlzLnksIGxvb2t1cE1vbnRoKG1vbnRoKSwgK2RheSk7XG4gICAgfVxuICB9LFxuXG4gIGlzb1dlZWtEYXk6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlWWVhcjQgKyAnLT9XJyArIHJlV2Vla09mWWVhciArICcoPzotPyhbMC03XSkpPycpLFxuICAgIG5hbWU6ICdpc293ZWVrZGF5IHwgaXNvd2VlaycsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCB5ZWFyLCB3ZWVrLCBkYXkpIHtcbiAgICAgIGRheSA9IGRheSA/ICtkYXkgOiAxO1xuXG4gICAgICBpZiAoIXRoaXMueW1kKCt5ZWFyLCAwLCAxKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBkYXkgb2Ygd2VlayBmb3IgSmFuIDFzdFxuICAgICAgdmFyIGRheU9mV2VlayA9IG5ldyBEYXRlKHRoaXMueSwgdGhpcy5tLCB0aGlzLmQpLmdldERheSgpO1xuXG4gICAgICAvLyBhbmQgdXNlIHRoZSBkYXkgdG8gZmlndXJlIG91dCB0aGUgb2Zmc2V0IGZvciBkYXkgMSBvZiB3ZWVrIDFcbiAgICAgIGRheU9mV2VlayA9IDAgLSAoZGF5T2ZXZWVrID4gNCA/IGRheU9mV2VlayAtIDcgOiBkYXlPZldlZWspO1xuXG4gICAgICB0aGlzLnJkICs9IGRheU9mV2VlayArICh3ZWVrIC0gMSkgKiA3ICsgZGF5O1xuICAgIH1cbiAgfSxcblxuICByZWxhdGl2ZVRleHQ6IHtcbiAgICByZWdleDogUmVnRXhwKCdeKCcgKyByZVJlbHRleHRudW1iZXIgKyAnfCcgKyByZVJlbHRleHR0ZXh0ICsgJyknICsgcmVTcGFjZSArICcoJyArIHJlUmVsdGV4dHVuaXQgKyAnKScsICdpJyksXG4gICAgbmFtZTogJ3JlbGF0aXZldGV4dCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCByZWxWYWx1ZSwgcmVsVW5pdCkge1xuICAgICAgLy8gdG9kbzogaW1wbGVtZW50IGhhbmRsaW5nIG9mICd0aGlzIHRpbWUtdW5pdCdcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICAgdmFyIF9sb29rdXBSZWxhdGl2ZSA9IGxvb2t1cFJlbGF0aXZlKHJlbFZhbHVlKSxcbiAgICAgICAgICBhbW91bnQgPSBfbG9va3VwUmVsYXRpdmUuYW1vdW50LFxuICAgICAgICAgIGJlaGF2aW9yID0gX2xvb2t1cFJlbGF0aXZlLmJlaGF2aW9yO1xuXG4gICAgICBzd2l0Y2ggKHJlbFVuaXQudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICBjYXNlICdzZWMnOlxuICAgICAgICBjYXNlICdzZWNzJzpcbiAgICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgICAgICAgdGhpcy5ycyArPSBhbW91bnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21pbic6XG4gICAgICAgIGNhc2UgJ21pbnMnOlxuICAgICAgICBjYXNlICdtaW51dGUnOlxuICAgICAgICBjYXNlICdtaW51dGVzJzpcbiAgICAgICAgICB0aGlzLnJpICs9IGFtb3VudDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaG91cic6XG4gICAgICAgIGNhc2UgJ2hvdXJzJzpcbiAgICAgICAgICB0aGlzLnJoICs9IGFtb3VudDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgY2FzZSAnZGF5cyc6XG4gICAgICAgICAgdGhpcy5yZCArPSBhbW91bnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ZvcnRuaWdodCc6XG4gICAgICAgIGNhc2UgJ2ZvcnRuaWdodHMnOlxuICAgICAgICBjYXNlICdmb3J0aG5pZ2h0JzpcbiAgICAgICAgY2FzZSAnZm9ydGhuaWdodHMnOlxuICAgICAgICAgIHRoaXMucmQgKz0gYW1vdW50ICogMTQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3dlZWsnOlxuICAgICAgICBjYXNlICd3ZWVrcyc6XG4gICAgICAgICAgdGhpcy5yZCArPSBhbW91bnQgKiA3O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb250aCc6XG4gICAgICAgIGNhc2UgJ21vbnRocyc6XG4gICAgICAgICAgdGhpcy5ybSArPSBhbW91bnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3llYXInOlxuICAgICAgICBjYXNlICd5ZWFycyc6XG4gICAgICAgICAgdGhpcy5yeSArPSBhbW91bnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21vbic6XG4gICAgICAgIGNhc2UgJ21vbmRheSc6XG4gICAgICAgIGNhc2UgJ3R1ZSc6XG4gICAgICAgIGNhc2UgJ3R1ZXNkYXknOlxuICAgICAgICBjYXNlICd3ZWQnOlxuICAgICAgICBjYXNlICd3ZWRuZXNkYXknOlxuICAgICAgICBjYXNlICd0aHUnOlxuICAgICAgICBjYXNlICd0aHVyc2RheSc6XG4gICAgICAgIGNhc2UgJ2ZyaSc6XG4gICAgICAgIGNhc2UgJ2ZyaWRheSc6XG4gICAgICAgIGNhc2UgJ3NhdCc6XG4gICAgICAgIGNhc2UgJ3NhdHVyZGF5JzpcbiAgICAgICAgY2FzZSAnc3VuJzpcbiAgICAgICAgY2FzZSAnc3VuZGF5JzpcbiAgICAgICAgICB0aGlzLnJlc2V0VGltZSgpO1xuICAgICAgICAgIHRoaXMud2Vla2RheSA9IGxvb2t1cFdlZWtkYXkocmVsVW5pdCwgNyk7XG4gICAgICAgICAgdGhpcy53ZWVrZGF5QmVoYXZpb3IgPSAxO1xuICAgICAgICAgIHRoaXMucmQgKz0gKGFtb3VudCA+IDAgPyBhbW91bnQgLSAxIDogYW1vdW50KSAqIDc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3dlZWtkYXknOlxuICAgICAgICBjYXNlICd3ZWVrZGF5cyc6XG4gICAgICAgICAgLy8gdG9kb1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICByZWxhdGl2ZToge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14oWystXSopWyBcXFxcdF0qKFxcXFxkKyknICsgcmVTcGFjZU9wdCArICcoJyArIHJlUmVsdGV4dHVuaXQgKyAnfHdlZWspJywgJ2knKSxcbiAgICBuYW1lOiAncmVsYXRpdmUnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgc2lnbnMsIHJlbFZhbHVlLCByZWxVbml0KSB7XG4gICAgICB2YXIgbWludXNlcyA9IHNpZ25zLnJlcGxhY2UoL1teLV0vZywgJycpLmxlbmd0aDtcblxuICAgICAgdmFyIGFtb3VudCA9ICtyZWxWYWx1ZSAqIE1hdGgucG93KC0xLCBtaW51c2VzKTtcblxuICAgICAgc3dpdGNoIChyZWxVbml0LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnc2VjJzpcbiAgICAgICAgY2FzZSAnc2Vjcyc6XG4gICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgICAgICAgIHRoaXMucnMgKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtaW4nOlxuICAgICAgICBjYXNlICdtaW5zJzpcbiAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgY2FzZSAnbWludXRlcyc6XG4gICAgICAgICAgdGhpcy5yaSArPSBhbW91bnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2hvdXInOlxuICAgICAgICBjYXNlICdob3Vycyc6XG4gICAgICAgICAgdGhpcy5yaCArPSBhbW91bnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICAgIHRoaXMucmQgKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmb3J0bmlnaHQnOlxuICAgICAgICBjYXNlICdmb3J0bmlnaHRzJzpcbiAgICAgICAgY2FzZSAnZm9ydGhuaWdodCc6XG4gICAgICAgIGNhc2UgJ2ZvcnRobmlnaHRzJzpcbiAgICAgICAgICB0aGlzLnJkICs9IGFtb3VudCAqIDE0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgY2FzZSAnd2Vla3MnOlxuICAgICAgICAgIHRoaXMucmQgKz0gYW1vdW50ICogNztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbW9udGgnOlxuICAgICAgICBjYXNlICdtb250aHMnOlxuICAgICAgICAgIHRoaXMucm0gKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICAgIHRoaXMucnkgKz0gYW1vdW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb24nOlxuICAgICAgICBjYXNlICdtb25kYXknOlxuICAgICAgICBjYXNlICd0dWUnOlxuICAgICAgICBjYXNlICd0dWVzZGF5JzpcbiAgICAgICAgY2FzZSAnd2VkJzpcbiAgICAgICAgY2FzZSAnd2VkbmVzZGF5JzpcbiAgICAgICAgY2FzZSAndGh1JzpcbiAgICAgICAgY2FzZSAndGh1cnNkYXknOlxuICAgICAgICBjYXNlICdmcmknOlxuICAgICAgICBjYXNlICdmcmlkYXknOlxuICAgICAgICBjYXNlICdzYXQnOlxuICAgICAgICBjYXNlICdzYXR1cmRheSc6XG4gICAgICAgIGNhc2UgJ3N1bic6XG4gICAgICAgIGNhc2UgJ3N1bmRheSc6XG4gICAgICAgICAgdGhpcy5yZXNldFRpbWUoKTtcbiAgICAgICAgICB0aGlzLndlZWtkYXkgPSBsb29rdXBXZWVrZGF5KHJlbFVuaXQsIDcpO1xuICAgICAgICAgIHRoaXMud2Vla2RheUJlaGF2aW9yID0gMTtcbiAgICAgICAgICB0aGlzLnJkICs9IChhbW91bnQgPiAwID8gYW1vdW50IC0gMSA6IGFtb3VudCkgKiA3O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd3ZWVrZGF5JzpcbiAgICAgICAgY2FzZSAnd2Vla2RheXMnOlxuICAgICAgICAgIC8vIHRvZG9cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZGF5VGV4dDoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14oJyArIHJlRGF5dGV4dCArICcpJywgJ2knKSxcbiAgICBuYW1lOiAnZGF5dGV4dCcsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBkYXlUZXh0KSB7XG4gICAgICB0aGlzLnJlc2V0VGltZSgpO1xuICAgICAgdGhpcy53ZWVrZGF5ID0gbG9va3VwV2Vla2RheShkYXlUZXh0LCAwKTtcblxuICAgICAgaWYgKHRoaXMud2Vla2RheUJlaGF2aW9yICE9PSAyKSB7XG4gICAgICAgIHRoaXMud2Vla2RheUJlaGF2aW9yID0gMTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgcmVsYXRpdmVUZXh0V2Vlazoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14oJyArIHJlUmVsdGV4dHRleHQgKyAnKScgKyByZVNwYWNlICsgJ3dlZWsnLCAnaScpLFxuICAgIG5hbWU6ICdyZWxhdGl2ZXRleHR3ZWVrJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHJlbFRleHQpIHtcbiAgICAgIHRoaXMud2Vla2RheUJlaGF2aW9yID0gMjtcblxuICAgICAgc3dpdGNoIChyZWxUZXh0LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAndGhpcyc6XG4gICAgICAgICAgdGhpcy5yZCArPSAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICduZXh0JzpcbiAgICAgICAgICB0aGlzLnJkICs9IDc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2xhc3QnOlxuICAgICAgICBjYXNlICdwcmV2aW91cyc6XG4gICAgICAgICAgdGhpcy5yZCAtPSA3O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNOYU4odGhpcy53ZWVrZGF5KSkge1xuICAgICAgICB0aGlzLndlZWtkYXkgPSAxO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBtb250aEZ1bGxPck1vbnRoQWJicjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14oJyArIHJlTW9udGhGdWxsICsgJ3wnICsgcmVNb250aEFiYnIgKyAnKScsICdpJyksXG4gICAgbmFtZTogJ21vbnRoZnVsbCB8IG1vbnRoYWJicicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBtb250aCkge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKHRoaXMueSwgbG9va3VwTW9udGgobW9udGgpLCB0aGlzLmQpO1xuICAgIH1cbiAgfSxcblxuICB0ekNvcnJlY3Rpb246IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlVHpDb3JyZWN0aW9uLCAnaScpLFxuICAgIG5hbWU6ICd0emNvcnJlY3Rpb24nLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayh0ekNvcnJlY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnpvbmUocHJvY2Vzc1R6Q29ycmVjdGlvbih0ekNvcnJlY3Rpb24pKTtcbiAgICB9XG4gIH0sXG5cbiAgdHpBYmJyOiB7XG4gICAgcmVnZXg6IFJlZ0V4cCgnXicgKyByZVR6QWJiciksXG4gICAgbmFtZTogJ3R6YWJicicsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBhYmJyKSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gdHpBYmJyT2Zmc2V0c1thYmJyLnRvTG93ZXJDYXNlKCldO1xuXG4gICAgICBpZiAoaXNOYU4ob2Zmc2V0KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnpvbmUob2Zmc2V0KTtcbiAgICB9XG4gIH0sXG5cbiAgYWdvOiB7XG4gICAgcmVnZXg6IC9eYWdvL2ksXG4gICAgbmFtZTogJ2FnbycsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKCkge1xuICAgICAgdGhpcy5yeSA9IC10aGlzLnJ5O1xuICAgICAgdGhpcy5ybSA9IC10aGlzLnJtO1xuICAgICAgdGhpcy5yZCA9IC10aGlzLnJkO1xuICAgICAgdGhpcy5yaCA9IC10aGlzLnJoO1xuICAgICAgdGhpcy5yaSA9IC10aGlzLnJpO1xuICAgICAgdGhpcy5ycyA9IC10aGlzLnJzO1xuICAgICAgdGhpcy5yZiA9IC10aGlzLnJmO1xuICAgIH1cbiAgfSxcblxuICB5ZWFyNDoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVZZWFyNCksXG4gICAgbmFtZTogJ3llYXI0JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIHllYXIpIHtcbiAgICAgIHRoaXMueSA9ICt5ZWFyO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LFxuXG4gIHdoaXRlc3BhY2U6IHtcbiAgICByZWdleDogL15bIC4sXFx0XSsvLFxuICAgIG5hbWU6ICd3aGl0ZXNwYWNlJ1xuICAgIC8vIGRvIG5vdGhpbmdcbiAgfSxcblxuICBkYXRlU2hvcnRXaXRoVGltZUxvbmc6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlRGF0ZU5vWWVhciArICd0PycgKyByZUhvdXIyNCArICdbOi5dJyArIHJlTWludXRlICsgJ1s6Ll0nICsgcmVTZWNvbmQsICdpJyksXG4gICAgbmFtZTogJ2RhdGVzaG9ydHdpdGh0aW1lbG9uZycsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKG1hdGNoLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCkge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKHRoaXMueSwgbG9va3VwTW9udGgobW9udGgpLCArZGF5KSAmJiB0aGlzLnRpbWUoK2hvdXIsICttaW51dGUsICtzZWNvbmQsIDApO1xuICAgIH1cbiAgfSxcblxuICBkYXRlU2hvcnRXaXRoVGltZUxvbmcxMjoge1xuICAgIHJlZ2V4OiBSZWdFeHAoJ14nICsgcmVEYXRlTm9ZZWFyICsgcmVIb3VyMTIgKyAnWzouXScgKyByZU1pbnV0ZSArICdbOi5dJyArIHJlU2Vjb25kbHogKyByZVNwYWNlT3B0ICsgcmVNZXJpZGlhbiwgJ2knKSxcbiAgICBuYW1lOiAnZGF0ZXNob3J0d2l0aHRpbWVsb25nMTInLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1lcmlkaWFuKSB7XG4gICAgICByZXR1cm4gdGhpcy55bWQodGhpcy55LCBsb29rdXBNb250aChtb250aCksICtkYXkpICYmIHRoaXMudGltZShwcm9jZXNzTWVyaWRpYW4oK2hvdXIsIG1lcmlkaWFuKSwgK21pbnV0ZSwgK3NlY29uZCwgMCk7XG4gICAgfVxuICB9LFxuXG4gIGRhdGVTaG9ydFdpdGhUaW1lU2hvcnQ6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlRGF0ZU5vWWVhciArICd0PycgKyByZUhvdXIyNCArICdbOi5dJyArIHJlTWludXRlLCAnaScpLFxuICAgIG5hbWU6ICdkYXRlc2hvcnR3aXRodGltZXNob3J0JyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2sobWF0Y2gsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKHRoaXMueSwgbG9va3VwTW9udGgobW9udGgpLCArZGF5KSAmJiB0aGlzLnRpbWUoK2hvdXIsICttaW51dGUsIDAsIDApO1xuICAgIH1cbiAgfSxcblxuICBkYXRlU2hvcnRXaXRoVGltZVNob3J0MTI6IHtcbiAgICByZWdleDogUmVnRXhwKCdeJyArIHJlRGF0ZU5vWWVhciArIHJlSG91cjEyICsgJ1s6Ll0nICsgcmVNaW51dGVseiArIHJlU3BhY2VPcHQgKyByZU1lcmlkaWFuLCAnaScpLFxuICAgIG5hbWU6ICdkYXRlc2hvcnR3aXRodGltZXNob3J0MTInLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhtYXRjaCwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBtZXJpZGlhbikge1xuICAgICAgcmV0dXJuIHRoaXMueW1kKHRoaXMueSwgbG9va3VwTW9udGgobW9udGgpLCArZGF5KSAmJiB0aGlzLnRpbWUocHJvY2Vzc01lcmlkaWFuKCtob3VyLCBtZXJpZGlhbiksICttaW51dGUsIDAsIDApO1xuICAgIH1cbiAgfVxufTtcblxudmFyIHJlc3VsdFByb3RvID0ge1xuICAvLyBkYXRlXG4gIHk6IE5hTixcbiAgbTogTmFOLFxuICBkOiBOYU4sXG4gIC8vIHRpbWVcbiAgaDogTmFOLFxuICBpOiBOYU4sXG4gIHM6IE5hTixcbiAgZjogTmFOLFxuXG4gIC8vIHJlbGF0aXZlIHNoaWZ0c1xuICByeTogMCxcbiAgcm06IDAsXG4gIHJkOiAwLFxuICByaDogMCxcbiAgcmk6IDAsXG4gIHJzOiAwLFxuICByZjogMCxcblxuICAvLyB3ZWVrZGF5IHJlbGF0ZWQgc2hpZnRzXG4gIHdlZWtkYXk6IE5hTixcbiAgd2Vla2RheUJlaGF2aW9yOiAwLFxuXG4gIC8vIGZpcnN0IG9yIGxhc3QgZGF5IG9mIG1vbnRoXG4gIC8vIDAgbm9uZSwgMSBmaXJzdCwgLTEgbGFzdFxuICBmaXJzdE9yTGFzdERheU9mTW9udGg6IDAsXG5cbiAgLy8gdGltZXpvbmUgY29ycmVjdGlvbiBpbiBtaW51dGVzXG4gIHo6IE5hTixcblxuICAvLyBjb3VudGVyc1xuICBkYXRlczogMCxcbiAgdGltZXM6IDAsXG4gIHpvbmVzOiAwLFxuXG4gIC8vIGhlbHBlciBmdW5jdGlvbnNcbiAgeW1kOiBmdW5jdGlvbiB5bWQoeSwgbSwgZCkge1xuICAgIGlmICh0aGlzLmRhdGVzID4gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuZGF0ZXMrKztcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMubSA9IG07XG4gICAgdGhpcy5kID0gZDtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgdGltZTogZnVuY3Rpb24gdGltZShoLCBpLCBzLCBmKSB7XG4gICAgaWYgKHRoaXMudGltZXMgPiAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy50aW1lcysrO1xuICAgIHRoaXMuaCA9IGg7XG4gICAgdGhpcy5pID0gaTtcbiAgICB0aGlzLnMgPSBzO1xuICAgIHRoaXMuZiA9IGY7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgcmVzZXRUaW1lOiBmdW5jdGlvbiByZXNldFRpbWUoKSB7XG4gICAgdGhpcy5oID0gMDtcbiAgICB0aGlzLmkgPSAwO1xuICAgIHRoaXMucyA9IDA7XG4gICAgdGhpcy5mID0gMDtcbiAgICB0aGlzLnRpbWVzID0gMDtcblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICB6b25lOiBmdW5jdGlvbiB6b25lKG1pbnV0ZXMpIHtcbiAgICBpZiAodGhpcy56b25lcyA8PSAxKSB7XG4gICAgICB0aGlzLnpvbmVzKys7XG4gICAgICB0aGlzLnogPSBtaW51dGVzO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICB0b0RhdGU6IGZ1bmN0aW9uIHRvRGF0ZShyZWxhdGl2ZVRvKSB7XG4gICAgaWYgKHRoaXMuZGF0ZXMgJiYgIXRoaXMudGltZXMpIHtcbiAgICAgIHRoaXMuaCA9IHRoaXMuaSA9IHRoaXMucyA9IHRoaXMuZiA9IDA7XG4gICAgfVxuXG4gICAgLy8gZmlsbCBob2xlc1xuICAgIGlmIChpc05hTih0aGlzLnkpKSB7XG4gICAgICB0aGlzLnkgPSByZWxhdGl2ZVRvLmdldEZ1bGxZZWFyKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzTmFOKHRoaXMubSkpIHtcbiAgICAgIHRoaXMubSA9IHJlbGF0aXZlVG8uZ2V0TW9udGgoKTtcbiAgICB9XG5cbiAgICBpZiAoaXNOYU4odGhpcy5kKSkge1xuICAgICAgdGhpcy5kID0gcmVsYXRpdmVUby5nZXREYXRlKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzTmFOKHRoaXMuaCkpIHtcbiAgICAgIHRoaXMuaCA9IHJlbGF0aXZlVG8uZ2V0SG91cnMoKTtcbiAgICB9XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pKSkge1xuICAgICAgdGhpcy5pID0gcmVsYXRpdmVUby5nZXRNaW51dGVzKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzTmFOKHRoaXMucykpIHtcbiAgICAgIHRoaXMucyA9IHJlbGF0aXZlVG8uZ2V0U2Vjb25kcygpO1xuICAgIH1cblxuICAgIGlmIChpc05hTih0aGlzLmYpKSB7XG4gICAgICB0aGlzLmYgPSByZWxhdGl2ZVRvLmdldE1pbGxpc2Vjb25kcygpO1xuICAgIH1cblxuICAgIC8vIGFkanVzdCBzcGVjaWFsIGVhcmx5XG4gICAgc3dpdGNoICh0aGlzLmZpcnN0T3JMYXN0RGF5T2ZNb250aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICB0aGlzLmQgPSAxO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgLTE6XG4gICAgICAgIHRoaXMuZCA9IDA7XG4gICAgICAgIHRoaXMubSArPSAxO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIWlzTmFOKHRoaXMud2Vla2RheSkpIHtcbiAgICAgIHZhciBkYXRlID0gbmV3IERhdGUocmVsYXRpdmVUby5nZXRUaW1lKCkpO1xuICAgICAgZGF0ZS5zZXRGdWxsWWVhcih0aGlzLnksIHRoaXMubSwgdGhpcy5kKTtcbiAgICAgIGRhdGUuc2V0SG91cnModGhpcy5oLCB0aGlzLmksIHRoaXMucywgdGhpcy5mKTtcblxuICAgICAgdmFyIGRvdyA9IGRhdGUuZ2V0RGF5KCk7XG5cbiAgICAgIGlmICh0aGlzLndlZWtkYXlCZWhhdmlvciA9PT0gMikge1xuICAgICAgICAvLyBUbyBtYWtlIFwidGhpcyB3ZWVrXCIgd29yaywgd2hlcmUgdGhlIGN1cnJlbnQgZGF5IG9mIHdlZWsgaXMgYSBcInN1bmRheVwiXG4gICAgICAgIGlmIChkb3cgPT09IDAgJiYgdGhpcy53ZWVrZGF5ICE9PSAwKSB7XG4gICAgICAgICAgdGhpcy53ZWVrZGF5ID0gLTY7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUbyBtYWtlIFwic3VuZGF5IHRoaXMgd2Vla1wiIHdvcmssIHdoZXJlIHRoZSBjdXJyZW50IGRheSBvZiB3ZWVrIGlzIG5vdCBhIFwic3VuZGF5XCJcbiAgICAgICAgaWYgKHRoaXMud2Vla2RheSA9PT0gMCAmJiBkb3cgIT09IDApIHtcbiAgICAgICAgICB0aGlzLndlZWtkYXkgPSA3O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kIC09IGRvdztcbiAgICAgICAgdGhpcy5kICs9IHRoaXMud2Vla2RheTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBkaWZmID0gdGhpcy53ZWVrZGF5IC0gZG93O1xuXG4gICAgICAgIC8vIHNvbWUgUEhQIG1hZ2ljXG4gICAgICAgIGlmICh0aGlzLnJkIDwgMCAmJiBkaWZmIDwgMCB8fCB0aGlzLnJkID49IDAgJiYgZGlmZiA8PSAtdGhpcy53ZWVrZGF5QmVoYXZpb3IpIHtcbiAgICAgICAgICBkaWZmICs9IDc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy53ZWVrZGF5ID49IDApIHtcbiAgICAgICAgICB0aGlzLmQgKz0gZGlmZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmQgLT0gNyAtIChNYXRoLmFicyh0aGlzLndlZWtkYXkpIC0gZG93KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud2Vla2RheSA9IE5hTjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBhZGp1c3QgcmVsYXRpdmVcbiAgICB0aGlzLnkgKz0gdGhpcy5yeTtcbiAgICB0aGlzLm0gKz0gdGhpcy5ybTtcbiAgICB0aGlzLmQgKz0gdGhpcy5yZDtcblxuICAgIHRoaXMuaCArPSB0aGlzLnJoO1xuICAgIHRoaXMuaSArPSB0aGlzLnJpO1xuICAgIHRoaXMucyArPSB0aGlzLnJzO1xuICAgIHRoaXMuZiArPSB0aGlzLnJmO1xuXG4gICAgdGhpcy5yeSA9IHRoaXMucm0gPSB0aGlzLnJkID0gMDtcbiAgICB0aGlzLnJoID0gdGhpcy5yaSA9IHRoaXMucnMgPSB0aGlzLnJmID0gMDtcblxuICAgIHZhciByZXN1bHQgPSBuZXcgRGF0ZShyZWxhdGl2ZVRvLmdldFRpbWUoKSk7XG4gICAgLy8gc2luY2UgRGF0ZSBjb25zdHJ1Y3RvciB0cmVhdHMgeWVhcnMgPD0gOTkgYXMgMTkwMCtcbiAgICAvLyBpdCBjYW4ndCBiZSB1c2VkLCB0aHVzIHRoaXMgd2VpcmQgd2F5XG4gICAgcmVzdWx0LnNldEZ1bGxZZWFyKHRoaXMueSwgdGhpcy5tLCB0aGlzLmQpO1xuICAgIHJlc3VsdC5zZXRIb3Vycyh0aGlzLmgsIHRoaXMuaSwgdGhpcy5zLCB0aGlzLmYpO1xuXG4gICAgLy8gbm90ZTogdGhpcyBpcyBkb25lIHR3aWNlIGluIFBIUFxuICAgIC8vIGVhcmx5IHdoZW4gcHJvY2Vzc2luZyBzcGVjaWFsIHJlbGF0aXZlc1xuICAgIC8vIGFuZCBsYXRlXG4gICAgLy8gdG9kbzogY2hlY2sgaWYgdGhlIGxvZ2ljIGNhbiBiZSByZWR1Y2VkXG4gICAgLy8gdG8ganVzdCBvbmUgdGltZSBhY3Rpb25cbiAgICBzd2l0Y2ggKHRoaXMuZmlyc3RPckxhc3REYXlPZk1vbnRoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJlc3VsdC5zZXREYXRlKDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgLTE6XG4gICAgICAgIHJlc3VsdC5zZXRNb250aChyZXN1bHQuZ2V0TW9udGgoKSArIDEsIDApO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBhZGp1c3QgdGltZXpvbmVcbiAgICBpZiAoIWlzTmFOKHRoaXMueikgJiYgcmVzdWx0LmdldFRpbWV6b25lT2Zmc2V0KCkgIT09IHRoaXMueikge1xuICAgICAgcmVzdWx0LnNldFVUQ0Z1bGxZZWFyKHJlc3VsdC5nZXRGdWxsWWVhcigpLCByZXN1bHQuZ2V0TW9udGgoKSwgcmVzdWx0LmdldERhdGUoKSk7XG5cbiAgICAgIHJlc3VsdC5zZXRVVENIb3VycyhyZXN1bHQuZ2V0SG91cnMoKSwgcmVzdWx0LmdldE1pbnV0ZXMoKSwgcmVzdWx0LmdldFNlY29uZHMoKSAtIHRoaXMueiwgcmVzdWx0LmdldE1pbGxpc2Vjb25kcygpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN0cnRvdGltZShzdHIsIG5vdykge1xuICAvLyAgICAgICBkaXNjdXNzIGF0OiBodHRwczovL2xvY3V0dXMuaW8vcGhwL3N0cnRvdGltZS9cbiAgLy8gICAgICBvcmlnaW5hbCBieTogQ2FpbyBBcmllZGUgKGh0dHBzOi8vY2Fpb2FyaWVkZS5jb20pXG4gIC8vICAgICAgaW1wcm92ZWQgYnk6IEtldmluIHZhbiBab25uZXZlbGQgKGh0dHBzOi8va3Z6LmlvKVxuICAvLyAgICAgIGltcHJvdmVkIGJ5OiBDYWlvIEFyaWVkZSAoaHR0cHM6Ly9jYWlvYXJpZWRlLmNvbSlcbiAgLy8gICAgICBpbXByb3ZlZCBieTogQS4gTWF0w61hcyBRdWV6YWRhIChodHRwczovL2FtYXRpYXNxLmNvbSlcbiAgLy8gICAgICBpbXByb3ZlZCBieTogcHJldXRlclxuICAvLyAgICAgIGltcHJvdmVkIGJ5OiBCcmV0dCBaYW1pciAoaHR0cHM6Ly9icmV0dC16YW1pci5tZSlcbiAgLy8gICAgICBpbXByb3ZlZCBieTogTWlya28gRmFiZXJcbiAgLy8gICAgICAgICBpbnB1dCBieTogRGF2aWRcbiAgLy8gICAgICBidWdmaXhlZCBieTogV2FnbmVyIEIuIFNvYXJlc1xuICAvLyAgICAgIGJ1Z2ZpeGVkIGJ5OiBBcnR1ciBUY2hlcm55Y2hldlxuICAvLyAgICAgIGJ1Z2ZpeGVkIGJ5OiBTdGVwaGFuIELDtnNjaC1QbGVwZWxpdHMgKGh0dHBzOi8vZ2l0aHViLmNvbS9wbGVwZSlcbiAgLy8gcmVpbXBsZW1lbnRlZCBieTogUmFmYcWCIEt1a2F3c2tpXG4gIC8vICAgICAgICAgICBub3RlIDE6IEV4YW1wbGVzIGFsbCBoYXZlIGEgZml4ZWQgdGltZXN0YW1wIHRvIHByZXZlbnRcbiAgLy8gICAgICAgICAgIG5vdGUgMTogdGVzdHMgdG8gZmFpbCBiZWNhdXNlIG9mIHZhcmlhYmxlIHRpbWUoem9uZXMpXG4gIC8vICAgICAgICBleGFtcGxlIDE6IHN0cnRvdGltZSgnKzEgZGF5JywgMTEyOTYzMzIwMClcbiAgLy8gICAgICAgIHJldHVybnMgMTogMTEyOTcxOTYwMFxuICAvLyAgICAgICAgZXhhbXBsZSAyOiBzdHJ0b3RpbWUoJysxIHdlZWsgMiBkYXlzIDQgaG91cnMgMiBzZWNvbmRzJywgMTEyOTYzMzIwMClcbiAgLy8gICAgICAgIHJldHVybnMgMjogMTEzMDQyNTIwMlxuICAvLyAgICAgICAgZXhhbXBsZSAzOiBzdHJ0b3RpbWUoJ2xhc3QgbW9udGgnLCAxMTI5NjMzMjAwKVxuICAvLyAgICAgICAgcmV0dXJucyAzOiAxMTI3MDQxMjAwXG4gIC8vICAgICAgICBleGFtcGxlIDQ6IHN0cnRvdGltZSgnMjAwOS0wNS0wNCAwODozMDowMCswMCcpXG4gIC8vICAgICAgICByZXR1cm5zIDQ6IDEyNDE0MjU4MDBcbiAgLy8gICAgICAgIGV4YW1wbGUgNTogc3RydG90aW1lKCcyMDA5LTA1LTA0IDA4OjMwOjAwKzAyOjAwJylcbiAgLy8gICAgICAgIHJldHVybnMgNTogMTI0MTQxODYwMFxuICAvLyAgICAgICAgZXhhbXBsZSA2OiBzdHJ0b3RpbWUoJzIwMDktMDUtMDQgMDg6MzA6MDAgWVdUJylcbiAgLy8gICAgICAgIHJldHVybnMgNjogMTI0MTQ1NDYwMFxuICAvLyAgICAgICAgZXhhbXBsZSA3OiBzdHJ0b3RpbWUoJzEwLUpVTC0xNycpXG4gIC8vICAgICAgICByZXR1cm5zIDc6IDE0OTk2NDQ4MDBcblxuICBpZiAobm93ID09IG51bGwpIHtcbiAgICBub3cgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgfVxuXG4gIC8vIHRoZSBydWxlIG9yZGVyIGlzIGltcG9ydGFudFxuICAvLyBpZiBtdWx0aXBsZSBydWxlcyBtYXRjaCwgdGhlIGxvbmdlc3QgbWF0Y2ggd2luc1xuICAvLyBpZiBtdWx0aXBsZSBydWxlcyBtYXRjaCB0aGUgc2FtZSBzdHJpbmcsIHRoZSBmaXJzdCBtYXRjaCB3aW5zXG4gIHZhciBydWxlcyA9IFtmb3JtYXRzLnllc3RlcmRheSwgZm9ybWF0cy5ub3csIGZvcm1hdHMubm9vbiwgZm9ybWF0cy5taWRuaWdodE9yVG9kYXksIGZvcm1hdHMudG9tb3Jyb3csIGZvcm1hdHMudGltZXN0YW1wLCBmb3JtYXRzLmZpcnN0T3JMYXN0RGF5LCBmb3JtYXRzLmJhY2tPckZyb250T2YsXG4gIC8vIGZvcm1hdHMud2Vla2RheU9mLCAvLyBub3QgeWV0IGltcGxlbWVudGVkXG4gIGZvcm1hdHMudGltZVRpbnkxMiwgZm9ybWF0cy50aW1lU2hvcnQxMiwgZm9ybWF0cy50aW1lTG9uZzEyLCBmb3JtYXRzLm1zc3FsdGltZSwgZm9ybWF0cy5vcmFjbGVkYXRlLCBmb3JtYXRzLnRpbWVTaG9ydDI0LCBmb3JtYXRzLnRpbWVMb25nMjQsIGZvcm1hdHMuaXNvODYwMWxvbmcsIGZvcm1hdHMuZ251Tm9Db2xvbiwgZm9ybWF0cy5pc284NjAxbm9Db2xvbiwgZm9ybWF0cy5hbWVyaWNhblNob3J0LCBmb3JtYXRzLmFtZXJpY2FuLCBmb3JtYXRzLmlzbzg2MDFkYXRlNCwgZm9ybWF0cy5pc284NjAxZGF0ZVNsYXNoLCBmb3JtYXRzLmRhdGVTbGFzaCwgZm9ybWF0cy5nbnVEYXRlU2hvcnRPcklzbzg2MDFkYXRlMiwgZm9ybWF0cy5nbnVEYXRlU2hvcnRlciwgZm9ybWF0cy5kYXRlRnVsbCwgZm9ybWF0cy5wb2ludGVkRGF0ZTQsIGZvcm1hdHMucG9pbnRlZERhdGUyLCBmb3JtYXRzLmRhdGVOb0RheSwgZm9ybWF0cy5kYXRlTm9EYXlSZXYsIGZvcm1hdHMuZGF0ZVRleHR1YWwsIGZvcm1hdHMuZGF0ZU5vWWVhciwgZm9ybWF0cy5kYXRlTm9ZZWFyUmV2LCBmb3JtYXRzLmRhdGVOb0NvbG9uLCBmb3JtYXRzLnhtbFJwYywgZm9ybWF0cy54bWxScGNOb0NvbG9uLCBmb3JtYXRzLnNvYXAsIGZvcm1hdHMud2RkeCwgZm9ybWF0cy5leGlmLCBmb3JtYXRzLnBneWRvdGQsIGZvcm1hdHMuaXNvV2Vla0RheSwgZm9ybWF0cy5wZ1RleHRTaG9ydCwgZm9ybWF0cy5wZ1RleHRSZXZlcnNlLCBmb3JtYXRzLmNsZiwgZm9ybWF0cy55ZWFyNCwgZm9ybWF0cy5hZ28sIGZvcm1hdHMuZGF5VGV4dCwgZm9ybWF0cy5yZWxhdGl2ZVRleHRXZWVrLCBmb3JtYXRzLnJlbGF0aXZlVGV4dCwgZm9ybWF0cy5tb250aEZ1bGxPck1vbnRoQWJiciwgZm9ybWF0cy50ekNvcnJlY3Rpb24sIGZvcm1hdHMudHpBYmJyLCBmb3JtYXRzLmRhdGVTaG9ydFdpdGhUaW1lU2hvcnQxMiwgZm9ybWF0cy5kYXRlU2hvcnRXaXRoVGltZUxvbmcxMiwgZm9ybWF0cy5kYXRlU2hvcnRXaXRoVGltZVNob3J0LCBmb3JtYXRzLmRhdGVTaG9ydFdpdGhUaW1lTG9uZywgZm9ybWF0cy5yZWxhdGl2ZSwgZm9ybWF0cy53aGl0ZXNwYWNlXTtcblxuICB2YXIgcmVzdWx0ID0gT2JqZWN0LmNyZWF0ZShyZXN1bHRQcm90byk7XG5cbiAgd2hpbGUgKHN0ci5sZW5ndGgpIHtcbiAgICB2YXIgbG9uZ2VzdE1hdGNoID0gbnVsbDtcbiAgICB2YXIgZmluYWxSdWxlID0gbnVsbDtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcnVsZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgZm9ybWF0ID0gcnVsZXNbaV07XG5cbiAgICAgIHZhciBtYXRjaCA9IHN0ci5tYXRjaChmb3JtYXQucmVnZXgpO1xuXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgaWYgKCFsb25nZXN0TWF0Y2ggfHwgbWF0Y2hbMF0ubGVuZ3RoID4gbG9uZ2VzdE1hdGNoWzBdLmxlbmd0aCkge1xuICAgICAgICAgIGxvbmdlc3RNYXRjaCA9IG1hdGNoO1xuICAgICAgICAgIGZpbmFsUnVsZSA9IGZvcm1hdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZmluYWxSdWxlIHx8IGZpbmFsUnVsZS5jYWxsYmFjayAmJiBmaW5hbFJ1bGUuY2FsbGJhY2suYXBwbHkocmVzdWx0LCBsb25nZXN0TWF0Y2gpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN0ciA9IHN0ci5zdWJzdHIobG9uZ2VzdE1hdGNoWzBdLmxlbmd0aCk7XG4gICAgZmluYWxSdWxlID0gbnVsbDtcbiAgICBsb25nZXN0TWF0Y2ggPSBudWxsO1xuICB9XG5cbiAgcmV0dXJuIE1hdGguZmxvb3IocmVzdWx0LnRvRGF0ZShuZXcgRGF0ZShub3cgKiAxMDAwKSkgLyAxMDAwKTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdHJ0b3RpbWUuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaV9nZXQodmFybmFtZSkge1xuICAvLyAgZGlzY3VzcyBhdDogaHR0cHM6Ly9sb2N1dHVzLmlvL3BocC9pbmlfZ2V0L1xuICAvLyBvcmlnaW5hbCBieTogQnJldHQgWmFtaXIgKGh0dHBzOi8vYnJldHQtemFtaXIubWUpXG4gIC8vICAgICAgbm90ZSAxOiBUaGUgaW5pIHZhbHVlcyBtdXN0IGJlIHNldCBieSBpbmlfc2V0IG9yIG1hbnVhbGx5IHdpdGhpbiBhbiBpbmkgZmlsZVxuICAvLyAgIGV4YW1wbGUgMTogaW5pX3NldCgnZGF0ZS50aW1lem9uZScsICdBc2lhL0hvbmdfS29uZycpXG4gIC8vICAgZXhhbXBsZSAxOiBpbmlfZ2V0KCdkYXRlLnRpbWV6b25lJylcbiAgLy8gICByZXR1cm5zIDE6ICdBc2lhL0hvbmdfS29uZydcblxuICB2YXIgJGdsb2JhbCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsO1xuICAkZ2xvYmFsLiRsb2N1dHVzID0gJGdsb2JhbC4kbG9jdXR1cyB8fCB7fTtcbiAgdmFyICRsb2N1dHVzID0gJGdsb2JhbC4kbG9jdXR1cztcbiAgJGxvY3V0dXMucGhwID0gJGxvY3V0dXMucGhwIHx8IHt9O1xuICAkbG9jdXR1cy5waHAuaW5pID0gJGxvY3V0dXMucGhwLmluaSB8fCB7fTtcblxuICBpZiAoJGxvY3V0dXMucGhwLmluaVt2YXJuYW1lXSAmJiAkbG9jdXR1cy5waHAuaW5pW3Zhcm5hbWVdLmxvY2FsX3ZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoJGxvY3V0dXMucGhwLmluaVt2YXJuYW1lXS5sb2NhbF92YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gJGxvY3V0dXMucGhwLmluaVt2YXJuYW1lXS5sb2NhbF92YWx1ZTtcbiAgfVxuXG4gIHJldHVybiAnJztcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmlfZ2V0LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdHJsZW4oc3RyaW5nKSB7XG4gIC8vICBkaXNjdXNzIGF0OiBodHRwczovL2xvY3V0dXMuaW8vcGhwL3N0cmxlbi9cbiAgLy8gb3JpZ2luYWwgYnk6IEtldmluIHZhbiBab25uZXZlbGQgKGh0dHBzOi8va3Z6LmlvKVxuICAvLyBpbXByb3ZlZCBieTogU2FraW1vcmlcbiAgLy8gaW1wcm92ZWQgYnk6IEtldmluIHZhbiBab25uZXZlbGQgKGh0dHBzOi8va3Z6LmlvKVxuICAvLyAgICBpbnB1dCBieTogS2lyayBTdHJvYmVja1xuICAvLyBidWdmaXhlZCBieTogT25ubyBNYXJzbWFuIChodHRwczovL3R3aXR0ZXIuY29tL29ubm9tYXJzbWFuKVxuICAvLyAgcmV2aXNlZCBieTogQnJldHQgWmFtaXIgKGh0dHBzOi8vYnJldHQtemFtaXIubWUpXG4gIC8vICAgICAgbm90ZSAxOiBNYXkgbG9vayBsaWtlIG92ZXJraWxsLCBidXQgaW4gb3JkZXIgdG8gYmUgdHJ1bHkgZmFpdGhmdWwgdG8gaGFuZGxpbmcgYWxsIFVuaWNvZGVcbiAgLy8gICAgICBub3RlIDE6IGNoYXJhY3RlcnMgYW5kIHRvIHRoaXMgZnVuY3Rpb24gaW4gUEhQIHdoaWNoIGRvZXMgbm90IGNvdW50IHRoZSBudW1iZXIgb2YgYnl0ZXNcbiAgLy8gICAgICBub3RlIDE6IGJ1dCBjb3VudHMgdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzLCBzb21ldGhpbmcgbGlrZSB0aGlzIGlzIHJlYWxseSBuZWNlc3NhcnkuXG4gIC8vICAgZXhhbXBsZSAxOiBzdHJsZW4oJ0tldmluIHZhbiBab25uZXZlbGQnKVxuICAvLyAgIHJldHVybnMgMTogMTlcbiAgLy8gICBleGFtcGxlIDI6IGluaV9zZXQoJ3VuaWNvZGUuc2VtYW50aWNzJywgJ29uJylcbiAgLy8gICBleGFtcGxlIDI6IHN0cmxlbignQVxcdWQ4N2VcXHVkYzA0WicpXG4gIC8vICAgcmV0dXJucyAyOiAzXG5cbiAgdmFyIHN0ciA9IHN0cmluZyArICcnO1xuXG4gIHZhciBpbmlWYWwgPSAodHlwZW9mIHJlcXVpcmUgIT09ICd1bmRlZmluZWQnID8gcmVxdWlyZSgnLi4vaW5mby9pbmlfZ2V0JykoJ3VuaWNvZGUuc2VtYW50aWNzJykgOiB1bmRlZmluZWQpIHx8ICdvZmYnO1xuICBpZiAoaW5pVmFsID09PSAnb2ZmJykge1xuICAgIHJldHVybiBzdHIubGVuZ3RoO1xuICB9XG5cbiAgdmFyIGkgPSAwO1xuICB2YXIgbGd0aCA9IDA7XG5cbiAgdmFyIGdldFdob2xlQ2hhciA9IGZ1bmN0aW9uIGdldFdob2xlQ2hhcihzdHIsIGkpIHtcbiAgICB2YXIgY29kZSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgIHZhciBuZXh0ID0gJyc7XG4gICAgdmFyIHByZXYgPSAnJztcbiAgICBpZiAoY29kZSA+PSAweGQ4MDAgJiYgY29kZSA8PSAweGRiZmYpIHtcbiAgICAgIC8vIEhpZ2ggc3Vycm9nYXRlIChjb3VsZCBjaGFuZ2UgbGFzdCBoZXggdG8gMHhEQjdGIHRvXG4gICAgICAvLyB0cmVhdCBoaWdoIHByaXZhdGUgc3Vycm9nYXRlcyBhcyBzaW5nbGUgY2hhcmFjdGVycylcbiAgICAgIGlmIChzdHIubGVuZ3RoIDw9IGkgKyAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSGlnaCBzdXJyb2dhdGUgd2l0aG91dCBmb2xsb3dpbmcgbG93IHN1cnJvZ2F0ZScpO1xuICAgICAgfVxuICAgICAgbmV4dCA9IHN0ci5jaGFyQ29kZUF0KGkgKyAxKTtcbiAgICAgIGlmIChuZXh0IDwgMHhkYzAwIHx8IG5leHQgPiAweGRmZmYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIaWdoIHN1cnJvZ2F0ZSB3aXRob3V0IGZvbGxvd2luZyBsb3cgc3Vycm9nYXRlJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RyLmNoYXJBdChpKSArIHN0ci5jaGFyQXQoaSArIDEpO1xuICAgIH0gZWxzZSBpZiAoY29kZSA+PSAweGRjMDAgJiYgY29kZSA8PSAweGRmZmYpIHtcbiAgICAgIC8vIExvdyBzdXJyb2dhdGVcbiAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTG93IHN1cnJvZ2F0ZSB3aXRob3V0IHByZWNlZGluZyBoaWdoIHN1cnJvZ2F0ZScpO1xuICAgICAgfVxuICAgICAgcHJldiA9IHN0ci5jaGFyQ29kZUF0KGkgLSAxKTtcbiAgICAgIGlmIChwcmV2IDwgMHhkODAwIHx8IHByZXYgPiAweGRiZmYpIHtcbiAgICAgICAgLy8gKGNvdWxkIGNoYW5nZSBsYXN0IGhleCB0byAweERCN0YgdG8gdHJlYXQgaGlnaCBwcml2YXRlIHN1cnJvZ2F0ZXNcbiAgICAgICAgLy8gYXMgc2luZ2xlIGNoYXJhY3RlcnMpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTG93IHN1cnJvZ2F0ZSB3aXRob3V0IHByZWNlZGluZyBoaWdoIHN1cnJvZ2F0ZScpO1xuICAgICAgfVxuICAgICAgLy8gV2UgY2FuIHBhc3Mgb3ZlciBsb3cgc3Vycm9nYXRlcyBub3cgYXMgdGhlIHNlY29uZFxuICAgICAgLy8gY29tcG9uZW50IGluIGEgcGFpciB3aGljaCB3ZSBoYXZlIGFscmVhZHkgcHJvY2Vzc2VkXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBzdHIuY2hhckF0KGkpO1xuICB9O1xuXG4gIGZvciAoaSA9IDAsIGxndGggPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGdldFdob2xlQ2hhcihzdHIsIGkpID09PSBmYWxzZSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIC8vIEFkYXB0IHRoaXMgbGluZSBhdCB0aGUgdG9wIG9mIGFueSBsb29wLCBwYXNzaW5nIGluIHRoZSB3aG9sZSBzdHJpbmcgYW5kXG4gICAgLy8gdGhlIGN1cnJlbnQgaXRlcmF0aW9uIGFuZCByZXR1cm5pbmcgYSB2YXJpYWJsZSB0byByZXByZXNlbnQgdGhlIGluZGl2aWR1YWwgY2hhcmFjdGVyO1xuICAgIC8vIHB1cnBvc2UgaXMgdG8gdHJlYXQgdGhlIGZpcnN0IHBhcnQgb2YgYSBzdXJyb2dhdGUgcGFpciBhcyB0aGUgd2hvbGUgY2hhcmFjdGVyIGFuZCB0aGVuXG4gICAgLy8gaWdub3JlIHRoZSBzZWNvbmQgcGFydFxuICAgIGxndGgrKztcbiAgfVxuXG4gIHJldHVybiBsZ3RoO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0cmxlbi5qcy5tYXAiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNfbnVtZXJpYyhtaXhlZFZhcikge1xuICAvLyAgZGlzY3VzcyBhdDogaHR0cHM6Ly9sb2N1dHVzLmlvL3BocC9pc19udW1lcmljL1xuICAvLyBvcmlnaW5hbCBieTogS2V2aW4gdmFuIFpvbm5ldmVsZCAoaHR0cHM6Ly9rdnouaW8pXG4gIC8vIGltcHJvdmVkIGJ5OiBEYXZpZFxuICAvLyBpbXByb3ZlZCBieTogdGFpdGhcbiAgLy8gYnVnZml4ZWQgYnk6IFRpbSBkZSBLb25pbmdcbiAgLy8gYnVnZml4ZWQgYnk6IFdlYkRldkhvYm8gKGh0dHBzOi8vd2ViZGV2aG9iby5ibG9nc3BvdC5jb20vKVxuICAvLyBidWdmaXhlZCBieTogQnJldHQgWmFtaXIgKGh0dHBzOi8vYnJldHQtemFtaXIubWUpXG4gIC8vIGJ1Z2ZpeGVkIGJ5OiBEZW5pcyBDaGVudSAoaHR0cHM6Ly9zaG5vdWxsZS5uZXQpXG4gIC8vICAgZXhhbXBsZSAxOiBpc19udW1lcmljKDE4Ni4zMSlcbiAgLy8gICByZXR1cm5zIDE6IHRydWVcbiAgLy8gICBleGFtcGxlIDI6IGlzX251bWVyaWMoJ0tldmluIHZhbiBab25uZXZlbGQnKVxuICAvLyAgIHJldHVybnMgMjogZmFsc2VcbiAgLy8gICBleGFtcGxlIDM6IGlzX251bWVyaWMoJyArMTg2LjMxZTInKVxuICAvLyAgIHJldHVybnMgMzogdHJ1ZVxuICAvLyAgIGV4YW1wbGUgNDogaXNfbnVtZXJpYygnJylcbiAgLy8gICByZXR1cm5zIDQ6IGZhbHNlXG4gIC8vICAgZXhhbXBsZSA1OiBpc19udW1lcmljKFtdKVxuICAvLyAgIHJldHVybnMgNTogZmFsc2VcbiAgLy8gICBleGFtcGxlIDY6IGlzX251bWVyaWMoJzEgJylcbiAgLy8gICByZXR1cm5zIDY6IGZhbHNlXG5cbiAgdmFyIHdoaXRlc3BhY2UgPSBbJyAnLCAnXFxuJywgJ1xccicsICdcXHQnLCAnXFxmJywgJ1xceDBiJywgJ1xceGEwJywgJ1xcdTIwMDAnLCAnXFx1MjAwMScsICdcXHUyMDAyJywgJ1xcdTIwMDMnLCAnXFx1MjAwNCcsICdcXHUyMDA1JywgJ1xcdTIwMDYnLCAnXFx1MjAwNycsICdcXHUyMDA4JywgJ1xcdTIwMDknLCAnXFx1MjAwQScsICdcXHUyMDBCJywgJ1xcdTIwMjgnLCAnXFx1MjAyOScsICdcXHUzMDAwJ10uam9pbignJyk7XG5cbiAgLy8gQHRvZG86IEJyZWFrIHRoaXMgdXAgdXNpbmcgbWFueSBzaW5nbGUgY29uZGl0aW9ucyB3aXRoIGVhcmx5IHJldHVybnNcbiAgcmV0dXJuICh0eXBlb2YgbWl4ZWRWYXIgPT09ICdudW1iZXInIHx8IHR5cGVvZiBtaXhlZFZhciA9PT0gJ3N0cmluZycgJiYgd2hpdGVzcGFjZS5pbmRleE9mKG1peGVkVmFyLnNsaWNlKC0xKSkgPT09IC0xKSAmJiBtaXhlZFZhciAhPT0gJycgJiYgIWlzTmFOKG1peGVkVmFyKTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pc19udW1lcmljLmpzLm1hcCIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuXHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgZGVmaW5pdGlvbikge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7IH0iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qIVxuICogTGFyYXZlbCBKYXZhc2NyaXB0IFZhbGlkYXRpb25cbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcHJvZW5nc29mdC9sYXJhdmVsLWpzdmFsaWRhdGlvblxuICpcbiAqIEhlbHBlciBmdW5jdGlvbnMgdXNlZCBieSB2YWxpZGF0b3JzXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE3IFByb2VuZ3NvZnRcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG5cbmltcG9ydCBzdHJsZW4gZnJvbSAnbG9jdXR1cy9waHAvc3RyaW5ncy9zdHJsZW4nO1xuaW1wb3J0IGFycmF5X2RpZmYgZnJvbSAnbG9jdXR1cy9waHAvYXJyYXkvYXJyYXlfZGlmZic7XG5pbXBvcnQgc3RydG90aW1lIGZyb20gJ2xvY3V0dXMvcGhwL2RhdGV0aW1lL3N0cnRvdGltZSc7XG5pbXBvcnQgaXNfbnVtZXJpYyBmcm9tICdsb2N1dHVzL3BocC92YXIvaXNfbnVtZXJpYyc7XG5cbiQuZXh0ZW5kKHRydWUsIGxhcmF2ZWxWYWxpZGF0aW9uLCB7XG5cbiAgICBoZWxwZXJzOiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE51bWVyaWMgcnVsZXNcbiAgICAgICAgICovXG4gICAgICAgIG51bWVyaWNSdWxlczogWydJbnRlZ2VyJywgJ051bWVyaWMnXSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0cyB0aGUgZmlsZSBpbmZvcm1hdGlvbiBmcm9tIGZpbGUgaW5wdXQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBmaWVsZE9ialxuICAgICAgICAgKiBAcGFyYW0gaW5kZXhcbiAgICAgICAgICogQHJldHVybnMge3tmaWxlOiAqLCBleHRlbnNpb246IHN0cmluZywgc2l6ZTogbnVtYmVyfX1cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVpbmZvOiBmdW5jdGlvbiAoZmllbGRPYmosIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgRmlsZU5hbWUgPSBmaWVsZE9iai52YWx1ZTtcbiAgICAgICAgICAgIGluZGV4ID0gdHlwZW9mIGluZGV4ICE9PSAndW5kZWZpbmVkJyA/IGluZGV4IDogMDtcbiAgICAgICAgICAgIGlmICggZmllbGRPYmouZmlsZXMgIT09IG51bGwgKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWVsZE9iai5maWxlc1tpbmRleF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBGaWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbjogRmlsZU5hbWUuc3Vic3RyKEZpbGVOYW1lLmxhc3RJbmRleE9mKCcuJykgKyAxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IGZpZWxkT2JqLmZpbGVzW2luZGV4XS5zaXplIC8gMTAyNCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGZpZWxkT2JqLmZpbGVzW2luZGV4XS50eXBlXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldHMgdGhlIHNlbGVjdG9ycyBmb3IgdGggc3BlY2lmaWVkIGZpZWxkIG5hbWVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gbmFtZXNcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHNlbGVjdG9yOiBmdW5jdGlvbiAobmFtZXMpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3RvciA9IFtdO1xuICAgICAgICAgICAgaWYgKCEgdGhpcy5pc0FycmF5KG5hbWVzKSkgIHtcbiAgICAgICAgICAgICAgICBuYW1lcyA9IFtuYW1lc107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3IucHVzaChcIltuYW1lPSdcIiArIG5hbWVzW2ldICsgXCInXVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5qb2luKCk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgZWxlbWVudCBoYXMgbnVtZXJpYyBydWxlcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICBoYXNOdW1lcmljUnVsZXM6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYXNSdWxlcyhlbGVtZW50LCB0aGlzLm51bWVyaWNSdWxlcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIGlmIGVsZW1lbnQgaGFzIHBhc3NlZCBydWxlcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIHJ1bGVzXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgaGFzUnVsZXM6IGZ1bmN0aW9uIChlbGVtZW50LCBydWxlcykge1xuXG4gICAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcnVsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcnVsZXMgPSBbcnVsZXNdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmFsaWRhdG9yID0gJC5kYXRhKGVsZW1lbnQuZm9ybSwgXCJ2YWxpZGF0b3JcIik7XG4gICAgICAgICAgICB2YXIgbGlzdFJ1bGVzID0gW107XG4gICAgICAgICAgICB2YXIgY2FjaGUgPSB2YWxpZGF0b3IuYXJyYXlSdWxlc0NhY2hlO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQubmFtZSBpbiBjYWNoZSkge1xuICAgICAgICAgICAgICAgICQuZWFjaChjYWNoZVtlbGVtZW50Lm5hbWVdLCBmdW5jdGlvbiAoaW5kZXgsIGFycmF5UnVsZSkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0UnVsZXMucHVzaChhcnJheVJ1bGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVsZW1lbnQubmFtZSBpbiB2YWxpZGF0b3Iuc2V0dGluZ3MucnVsZXMpIHtcbiAgICAgICAgICAgICAgICBsaXN0UnVsZXMucHVzaCh2YWxpZGF0b3Iuc2V0dGluZ3MucnVsZXNbZWxlbWVudC5uYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkLmVhY2gobGlzdFJ1bGVzLCBmdW5jdGlvbihpbmRleCxvYmpSdWxlcyl7XG4gICAgICAgICAgICAgICAgaWYgKCdsYXJhdmVsVmFsaWRhdGlvbicgaW4gb2JqUnVsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9ydWxlcz1vYmpSdWxlcy5sYXJhdmVsVmFsaWRhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkLmluQXJyYXkoX3J1bGVzW2ldWzBdLHJ1bGVzKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJuIHRoZSBzdHJpbmcgbGVuZ3RoIHVzaW5nIFBIUCBmdW5jdGlvbi5cbiAgICAgICAgICogaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2Z1bmN0aW9uLnN0cmxlbi5waHBcbiAgICAgICAgICogaHR0cDovL3BocGpzLm9yZy9mdW5jdGlvbnMvc3RybGVuL1xuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gc3RyaW5nXG4gICAgICAgICAqL1xuICAgICAgICBzdHJsZW46IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJsZW4oc3RyaW5nKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IHRoZSBzaXplIG9mIHRoZSBvYmplY3QgZGVwZW5kaW5nIG9mIGhpcyB0eXBlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gb2JqXG4gICAgICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAgICAgKiBAcmV0dXJucyBpbnRcbiAgICAgICAgICovXG4gICAgICAgIGdldFNpemU6IGZ1bmN0aW9uIGdldFNpemUob2JqLCBlbGVtZW50LCB2YWx1ZSkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5oYXNOdW1lcmljUnVsZXMoZWxlbWVudCkgJiYgdGhpcy5pc19udW1lcmljKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnQudHlwZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoTWF0aC5mbG9vcih0aGlzLmZpbGVpbmZvKGVsZW1lbnQpLnNpemUpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zdHJsZW4odmFsdWUpKTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm4gc3BlY2lmaWVkIHJ1bGUgZnJvbSBlbGVtZW50LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gcnVsZVxuICAgICAgICAgKiBAcGFyYW0gZWxlbWVudFxuICAgICAgICAgKiBAcmV0dXJucyBvYmplY3RcbiAgICAgICAgICovXG4gICAgICAgIGdldExhcmF2ZWxWYWxpZGF0aW9uOiBmdW5jdGlvbihydWxlLCBlbGVtZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBmb3VuZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICQuZWFjaCgkLnZhbGlkYXRvci5zdGF0aWNSdWxlcyhlbGVtZW50KSwgZnVuY3Rpb24oa2V5LCBydWxlcykge1xuICAgICAgICAgICAgICAgIGlmIChrZXk9PT1cImxhcmF2ZWxWYWxpZGF0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHJ1bGVzLCBmdW5jdGlvbiAoaSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZVswXT09PXJ1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZD12YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJuIGhlIHRpbWVzdGFtcCBvZiB2YWx1ZSBwYXNzZWQgdXNpbmcgZm9ybWF0IG9yIGRlZmF1bHQgZm9ybWF0IGluIGVsZW1lbnQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAgICAgKiBAcGFyYW0gZm9ybWF0XG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufGludH1cbiAgICAgICAgICovXG4gICAgICAgIHBhcnNlVGltZTogZnVuY3Rpb24gKHZhbHVlLCBmb3JtYXQpIHtcblxuICAgICAgICAgICAgdmFyIHRpbWVWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIGZtdCA9IG5ldyBEYXRlRm9ybWF0dGVyKCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIHR5cGVvZiBmb3JtYXQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGZvcm1hdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZVJ1bGUgPSB0aGlzLmdldExhcmF2ZWxWYWxpZGF0aW9uKCdEYXRlRm9ybWF0JywgZm9ybWF0KTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZVJ1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBmb3JtYXQgPSBkYXRlUnVsZVsxXVswXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3JtYXQgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZvcm1hdCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGltZVZhbHVlID0gdGhpcy5zdHJ0b3RpbWUodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aW1lVmFsdWUgPSBmbXQucGFyc2VEYXRlKHZhbHVlLCBmb3JtYXQpO1xuICAgICAgICAgICAgICAgIGlmICh0aW1lVmFsdWUgaW5zdGFuY2VvZiBEYXRlICYmIGZtdC5mb3JtYXREYXRlKHRpbWVWYWx1ZSwgZm9ybWF0KSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZVZhbHVlID0gTWF0aC5yb3VuZCgodGltZVZhbHVlLmdldFRpbWUoKSAvIDEwMDApKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aW1lVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aW1lVmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbXBhcmUgYSBnaXZlbiBkYXRlIGFnYWluc3QgYW5vdGhlciB1c2luZyBhbiBvcGVyYXRvci5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHZhbGlkYXRvclxuICAgICAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIHBhcmFtc1xuICAgICAgICAgKiBAcGFyYW0gb3BlcmF0b3JcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBhcmVEYXRlczogZnVuY3Rpb24gKHZhbGlkYXRvciwgdmFsdWUsIGVsZW1lbnQsIHBhcmFtcywgb3BlcmF0b3IpIHtcblxuICAgICAgICAgICAgdmFyIHRpbWVDb21wYXJlID0gdGhpcy5wYXJzZVRpbWUocGFyYW1zKTtcblxuICAgICAgICAgICAgaWYgKCF0aW1lQ29tcGFyZSkge1xuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSB0aGlzLmRlcGVuZGVudEVsZW1lbnQodmFsaWRhdG9yLCBlbGVtZW50LCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRpbWVDb21wYXJlID0gdGhpcy5wYXJzZVRpbWUodmFsaWRhdG9yLmVsZW1lbnRWYWx1ZSh0YXJnZXQpLCB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdGltZVZhbHVlID0gdGhpcy5wYXJzZVRpbWUodmFsdWUsIGVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKHRpbWVWYWx1ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAob3BlcmF0b3IpIHtcbiAgICAgICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVWYWx1ZSA8IHRpbWVDb21wYXJlO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZVZhbHVlIDw9IHRpbWVDb21wYXJlO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnPT0nOlxuICAgICAgICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lVmFsdWUgPT09IHRpbWVDb21wYXJlO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lVmFsdWUgPiB0aW1lQ29tcGFyZTtcblxuICAgICAgICAgICAgICAgIGNhc2UgJz49JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVWYWx1ZSA+PSB0aW1lQ29tcGFyZTtcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgb3BlcmF0b3IuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgbWV0aG9kIGFsbG93cyB5b3UgdG8gaW50ZWxsaWdlbnRseSBndWVzcyB0aGUgZGF0ZSBieSBjbG9zZWx5IG1hdGNoaW5nIHRoZSBzcGVjaWZpYyBmb3JtYXQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAgICAgKiBAcGFyYW0gZm9ybWF0XG4gICAgICAgICAqIEByZXR1cm5zIHtEYXRlfVxuICAgICAgICAgKi9cbiAgICAgICAgZ3Vlc3NEYXRlOiBmdW5jdGlvbiAodmFsdWUsIGZvcm1hdCkge1xuICAgICAgICAgICAgdmFyIGZtdCA9IG5ldyBEYXRlRm9ybWF0dGVyKCk7XG4gICAgICAgICAgICByZXR1cm4gZm10Lmd1ZXNzRGF0ZSh2YWx1ZSwgZm9ybWF0KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIFVuaXggdGltZXN0YW1wIGJhc2VkIG9uIFBIUCBmdW5jdGlvbiBzdHJvdG90aW1lLlxuICAgICAgICAgKiBodHRwOi8vcGhwLm5ldC9tYW51YWwvZXMvZnVuY3Rpb24uc3RydG90aW1lLnBocFxuICAgICAgICAgKiBodHRwOi8vcGhwanMub3JnL2Z1bmN0aW9ucy9zdHJ0b3RpbWUvXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB0ZXh0XG4gICAgICAgICAqIEBwYXJhbSBub3dcbiAgICAgICAgICogQHJldHVybnMgeyp9XG4gICAgICAgICAqL1xuICAgICAgICBzdHJ0b3RpbWU6IGZ1bmN0aW9uICh0ZXh0LCBub3cpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJ0b3RpbWUodGV4dCwgbm93KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGlmIHZhbHVlIGlzIG51bWVyaWMuXG4gICAgICAgICAqIGh0dHA6Ly9waHAubmV0L21hbnVhbC9lcy92YXIuaXNfbnVtZXJpYy5waHBcbiAgICAgICAgICogaHR0cDovL3BocGpzLm9yZy9mdW5jdGlvbnMvaXNfbnVtZXJpYy9cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG1peGVkX3ZhclxuICAgICAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgICAgICovXG4gICAgICAgIGlzX251bWVyaWM6IGZ1bmN0aW9uIChtaXhlZF92YXIpIHtcbiAgICAgICAgICAgIHJldHVybiBpc19udW1lcmljKG1peGVkX3ZhcilcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgb2YgdHlwZSBBcnJheS5cbiAgICAgICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaXNBcnJheSNQb2x5ZmlsbFxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gYXJnXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgaXNBcnJheTogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgQXJyYXkgZGlmZiBiYXNlZCBvbiBQSFAgZnVuY3Rpb24gYXJyYXlfZGlmZi5cbiAgICAgICAgICogaHR0cDovL3BocC5uZXQvbWFudWFsL2VzL2Z1bmN0aW9uLmFycmF5X2RpZmYucGhwXG4gICAgICAgICAqIGh0dHA6Ly9waHBqcy5vcmcvZnVuY3Rpb25zL2FycmF5X2RpZmYvXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBhcnIxXG4gICAgICAgICAqIEBwYXJhbSBhcnIyXG4gICAgICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAgICAgKi9cbiAgICAgICAgYXJyYXlEaWZmOiBmdW5jdGlvbiAoYXJyMSwgYXJyMikge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5X2RpZmYoYXJyMSwgYXJyMik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIHdoZXRoZXIgdHdvIGFycmF5cyBhcmUgZXF1YWwgdG8gb25lIGFub3RoZXIuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBhcnIxXG4gICAgICAgICAqIEBwYXJhbSBhcnIyXG4gICAgICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAgICAgKi9cbiAgICAgICAgYXJyYXlFcXVhbHM6IGZ1bmN0aW9uIChhcnIxLCBhcnIyKSB7XG4gICAgICAgICAgICBpZiAoISB0aGlzLmlzQXJyYXkoYXJyMSkgfHwgISB0aGlzLmlzQXJyYXkoYXJyMikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChhcnIxLmxlbmd0aCAhPT0gYXJyMi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiAkLmlzRW1wdHlPYmplY3QodGhpcy5hcnJheURpZmYoYXJyMSwgYXJyMikpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYWtlcyBlbGVtZW50IGRlcGVuZGFudCBmcm9tIG90aGVyLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gdmFsaWRhdG9yXG4gICAgICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAgICAgKi9cbiAgICAgICAgZGVwZW5kZW50RWxlbWVudDogZnVuY3Rpb24odmFsaWRhdG9yLCBlbGVtZW50LCBuYW1lKSB7XG5cbiAgICAgICAgICAgIHZhciBlbD12YWxpZGF0b3IuZmluZEJ5TmFtZShuYW1lKTtcblxuICAgICAgICAgICAgaWYgKCBlbFswXSE9PXVuZGVmaW5lZCAgJiYgdmFsaWRhdG9yLnNldHRpbmdzLm9uZm9jdXNvdXQgKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gJ2JsdXInO1xuICAgICAgICAgICAgICAgIGlmIChlbFswXS50YWdOYW1lID09PSAnU0VMRUNUJyB8fFxuICAgICAgICAgICAgICAgICAgICBlbFswXS50YWdOYW1lID09PSAnT1BUSU9OJyB8fFxuICAgICAgICAgICAgICAgICAgICBlbFswXS50eXBlID09PSAnY2hlY2tib3gnIHx8XG4gICAgICAgICAgICAgICAgICAgIGVsWzBdLnR5cGUgPT09ICdyYWRpbydcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQgPSAnY2xpY2snO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBydWxlTmFtZSA9ICcudmFsaWRhdGUtbGFyYXZlbFZhbGlkYXRpb24nO1xuICAgICAgICAgICAgICAgIGVsLm9mZiggcnVsZU5hbWUgKVxuICAgICAgICAgICAgICAgICAgICAub2ZmKGV2ZW50ICsgcnVsZU5hbWUgKyAnLScgKyBlbGVtZW50Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIC5vbiggZXZlbnQgKyBydWxlTmFtZSArICctJyArIGVsZW1lbnQubmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCBlbGVtZW50ICkudmFsaWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBlbFswXTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUGFyc2VzIGVycm9yIEFqYXggcmVzcG9uc2UgYW5kIGdldHMgdGhlIG1lc3NhZ2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSByZXNwb25zZVxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119XG4gICAgICAgICAqL1xuICAgICAgICBwYXJzZUVycm9yUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIG5ld1Jlc3BvbnNlID0gWydXaG9vcHMsIGxvb2tzIGxpa2Ugc29tZXRoaW5nIHdlbnQgd3JvbmcuJ107XG4gICAgICAgICAgICBpZiAoJ3Jlc3BvbnNlVGV4dCcgaW4gcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3JNc2cgPSByZXNwb25zZS5yZXNwb25zZVRleHQubWF0Y2goLzxoMVxccyo+KC4qKTxcXC9oMVxccyo+L2kpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQXJyYXkoZXJyb3JNc2cpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1Jlc3BvbnNlID0gW2Vycm9yTXNnWzFdXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3UmVzcG9uc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVzY2FwZSBzdHJpbmcgdG8gdXNlIGFzIFJlZ3VsYXIgRXhwcmVzc2lvbi5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHN0clxuICAgICAgICAgKiBAcmV0dXJucyBzdHJpbmdcbiAgICAgICAgICovXG4gICAgICAgIGVzY2FwZVJlZ0V4cDogZnVuY3Rpb24gKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bXFwtXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdlbmVyYXRlIFJlZ0V4cCBmcm9tIHdpbGRjYXJkIGF0dHJpYnV0ZXMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICAgICAqIEByZXR1cm5zIHtSZWdFeHB9XG4gICAgICAgICAqL1xuICAgICAgICByZWdleEZyb21XaWxkY2FyZDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHZhciBuYW1lUGFydHMgPSBuYW1lLnNwbGl0KCdbKl0nKTtcbiAgICAgICAgICAgIGlmIChuYW1lUGFydHMubGVuZ3RoID09PSAxKSBuYW1lUGFydHMucHVzaCgnJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKCdeJyArIG5hbWVQYXJ0cy5tYXAoZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXJhdmVsVmFsaWRhdGlvbi5oZWxwZXJzLmVzY2FwZVJlZ0V4cCh4KVxuICAgICAgICAgICAgfSkuam9pbignXFxcXFtbXlxcXFxdXSpcXFxcXScpICsgJyQnKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogTWVyZ2UgYWRkaXRpb25hbCBsYXJhdmVsIHZhbGlkYXRpb24gcnVsZXMgaW50byB0aGUgY3VycmVudCBydWxlIHNldC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHJ1bGVzXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBuZXdSdWxlc1xuICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgbWVyZ2VSdWxlczogZnVuY3Rpb24gKHJ1bGVzLCBuZXdSdWxlcykge1xuICAgICAgICAgICAgdmFyIHJ1bGVzTGlzdCA9IHtcbiAgICAgICAgICAgICAgICAnbGFyYXZlbFZhbGlkYXRpb24nOiBuZXdSdWxlcy5sYXJhdmVsVmFsaWRhdGlvbiB8fCBbXSxcbiAgICAgICAgICAgICAgICAnbGFyYXZlbFZhbGlkYXRpb25SZW1vdGUnOiBuZXdSdWxlcy5sYXJhdmVsVmFsaWRhdGlvblJlbW90ZSB8fCBbXVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIHJ1bGVzTGlzdCkge1xuICAgICAgICAgICAgICAgIGlmIChydWxlc0xpc3Rba2V5XS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBydWxlc1trZXldID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bGVzW2tleV0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBydWxlc1trZXldID0gcnVsZXNba2V5XS5jb25jYXQocnVsZXNMaXN0W2tleV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcnVsZXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhUTUwgZW50aXR5IGVuY29kZSBhIHN0cmluZy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHN0cmluZ1xuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgZW5jb2RlOiBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gJCgnPGRpdi8+JykudGV4dChzdHJpbmcpLmh0bWwoKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogTG9va3VwIG5hbWUgaW4gYW4gYXJyYXkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB2YWxpZGF0b3JcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZSBpbiBkb3Qgbm90YXRpb24gZm9ybWF0LlxuICAgICAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgICAgICovXG4gICAgICAgIGZpbmRCeUFycmF5TmFtZTogZnVuY3Rpb24gKHZhbGlkYXRvciwgbmFtZSkge1xuICAgICAgICAgICAgdmFyIHNxTmFtZSA9IG5hbWUucmVwbGFjZSgvXFwuKFteXFwuXSspL2csICdbJDFdJyksXG4gICAgICAgICAgICAgICAgbG9va3VwcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCBkb3QgdG8gc3F1YXJlIGJyYWNrZXRzLiBlLmcuIGZvby5iYXIuMCBiZWNvbWVzIGZvb1tiYXJdWzBdXG4gICAgICAgICAgICAgICAgICAgIHNxTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gQXBwZW5kIFtdIHRvIHRoZSBuYW1lIGUuZy4gZm9vIGJlY29tZXMgZm9vW10gb3IgZm9vLmJhci4wIGJlY29tZXMgZm9vW2Jhcl1bMF1bXVxuICAgICAgICAgICAgICAgICAgICBzcU5hbWUgKyAnW10nLFxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUga2V5IGZyb20gbGFzdCBhcnJheSBlLmcuIGZvb1tiYXJdWzBdIGJlY29tZXMgZm9vW2Jhcl1bXVxuICAgICAgICAgICAgICAgICAgICBzcU5hbWUucmVwbGFjZSgvKC4qKVxcWyguKilcXF0kL2csICckMVtdJylcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvb2t1cHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbSA9IHZhbGlkYXRvci5maW5kQnlOYW1lKGxvb2t1cHNbaV0pO1xuICAgICAgICAgICAgICAgIGlmIChlbGVtLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gJChudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQXR0ZW1wdCB0byBmaW5kIGFuIGVsZW1lbnQgaW4gdGhlIERPTSBtYXRjaGluZyB0aGUgZ2l2ZW4gbmFtZS5cbiAgICAgICAgICogRXhhbXBsZSBuYW1lcyBpbmNsdWRlOlxuICAgICAgICAgKiAgICAtIGRvbWFpbi4wIHdoaWNoIG1hdGNoZXMgZG9tYWluW11cbiAgICAgICAgICogICAgLSBjdXN0b21maWVsZC4zIHdoaWNoIG1hdGNoZXMgY3VzdG9tZmllbGRbM11cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHZhbGlkYXRvclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgICAgICovXG4gICAgICAgIGZpbmRCeU5hbWU6IGZ1bmN0aW9uICh2YWxpZGF0b3IsIG5hbWUpIHtcbiAgICAgICAgICAgIC8vIEV4YWN0IG1hdGNoLlxuICAgICAgICAgICAgdmFyIGVsZW0gPSB2YWxpZGF0b3IuZmluZEJ5TmFtZShuYW1lKTtcbiAgICAgICAgICAgIGlmIChlbGVtLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmluZCBuYW1lIGluIGRhdGEsIHVzaW5nIGRvdCBub3RhdGlvbi5cbiAgICAgICAgICAgIHZhciBkZWxpbSA9ICcuJyxcbiAgICAgICAgICAgICAgICBwYXJ0cyAgPSBuYW1lLnNwbGl0KGRlbGltKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBwYXJ0cy5sZW5ndGg7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVjb25zdHJ1Y3RlZCA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgaTsgYysrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlY29uc3RydWN0ZWQucHVzaChwYXJ0c1tjXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxlbSA9IHRoaXMuZmluZEJ5QXJyYXlOYW1lKHZhbGlkYXRvciwgcmVjb25zdHJ1Y3RlZC5qb2luKGRlbGltKSk7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAkKG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiBpdCdzIGFuIGFycmF5IGVsZW1lbnQsIGdldCBhbGwgdmFsdWVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gdmFsaWRhdG9yXG4gICAgICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICAgICAqIEByZXR1cm5zIHsqfHN0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIGFsbEVsZW1lbnRWYWx1ZXM6IGZ1bmN0aW9uICh2YWxpZGF0b3IsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50Lm5hbWUuaW5kZXhPZignW10nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmZpbmRCeU5hbWUoZWxlbWVudC5uYW1lKS5tYXAoZnVuY3Rpb24gKGksIGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRvci5lbGVtZW50VmFsdWUoZSk7XG4gICAgICAgICAgICAgICAgfSkuZ2V0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWxpZGF0b3IuZWxlbWVudFZhbHVlKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG4iXSwibmFtZXMiOlsic3RybGVuIiwiYXJyYXlfZGlmZiIsInN0cnRvdGltZSIsImlzX251bWVyaWMiLCIkIiwiZXh0ZW5kIiwibGFyYXZlbFZhbGlkYXRpb24iLCJoZWxwZXJzIiwibnVtZXJpY1J1bGVzIiwiZmlsZWluZm8iLCJmaWVsZE9iaiIsImluZGV4IiwiRmlsZU5hbWUiLCJ2YWx1ZSIsImZpbGVzIiwiZmlsZSIsImV4dGVuc2lvbiIsInN1YnN0ciIsImxhc3RJbmRleE9mIiwic2l6ZSIsInR5cGUiLCJzZWxlY3RvciIsIm5hbWVzIiwiaXNBcnJheSIsImkiLCJsZW5ndGgiLCJwdXNoIiwiam9pbiIsImhhc051bWVyaWNSdWxlcyIsImVsZW1lbnQiLCJoYXNSdWxlcyIsInJ1bGVzIiwiZm91bmQiLCJ2YWxpZGF0b3IiLCJkYXRhIiwiZm9ybSIsImxpc3RSdWxlcyIsImNhY2hlIiwiYXJyYXlSdWxlc0NhY2hlIiwibmFtZSIsImVhY2giLCJhcnJheVJ1bGUiLCJzZXR0aW5ncyIsIm9ialJ1bGVzIiwiX3J1bGVzIiwiaW5BcnJheSIsInN0cmluZyIsImdldFNpemUiLCJvYmoiLCJwYXJzZUZsb2F0IiwiTWF0aCIsImZsb29yIiwiZ2V0TGFyYXZlbFZhbGlkYXRpb24iLCJydWxlIiwidW5kZWZpbmVkIiwic3RhdGljUnVsZXMiLCJrZXkiLCJwYXJzZVRpbWUiLCJmb3JtYXQiLCJ0aW1lVmFsdWUiLCJmbXQiLCJEYXRlRm9ybWF0dGVyIiwiZGF0ZVJ1bGUiLCJwYXJzZURhdGUiLCJEYXRlIiwiZm9ybWF0RGF0ZSIsInJvdW5kIiwiZ2V0VGltZSIsImNvbXBhcmVEYXRlcyIsInBhcmFtcyIsIm9wZXJhdG9yIiwidGltZUNvbXBhcmUiLCJ0YXJnZXQiLCJkZXBlbmRlbnRFbGVtZW50IiwiZWxlbWVudFZhbHVlIiwiRXJyb3IiLCJndWVzc0RhdGUiLCJ0ZXh0Iiwibm93IiwibWl4ZWRfdmFyIiwiYXJnIiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiYXJyYXlEaWZmIiwiYXJyMSIsImFycjIiLCJhcnJheUVxdWFscyIsImlzRW1wdHlPYmplY3QiLCJlbCIsImZpbmRCeU5hbWUiLCJvbmZvY3Vzb3V0IiwiZXZlbnQiLCJ0YWdOYW1lIiwicnVsZU5hbWUiLCJvZmYiLCJvbiIsInZhbGlkIiwicGFyc2VFcnJvclJlc3BvbnNlIiwicmVzcG9uc2UiLCJuZXdSZXNwb25zZSIsImVycm9yTXNnIiwicmVzcG9uc2VUZXh0IiwibWF0Y2giLCJlc2NhcGVSZWdFeHAiLCJzdHIiLCJyZXBsYWNlIiwicmVnZXhGcm9tV2lsZGNhcmQiLCJuYW1lUGFydHMiLCJzcGxpdCIsIlJlZ0V4cCIsIm1hcCIsIngiLCJtZXJnZVJ1bGVzIiwibmV3UnVsZXMiLCJydWxlc0xpc3QiLCJsYXJhdmVsVmFsaWRhdGlvblJlbW90ZSIsImNvbmNhdCIsImVuY29kZSIsImh0bWwiLCJmaW5kQnlBcnJheU5hbWUiLCJzcU5hbWUiLCJsb29rdXBzIiwiZWxlbSIsImRlbGltIiwicGFydHMiLCJyZWNvbnN0cnVjdGVkIiwiYyIsImFsbEVsZW1lbnRWYWx1ZXMiLCJpbmRleE9mIiwiZSIsImdldCJdLCJzb3VyY2VSb290IjoiIn0=
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
