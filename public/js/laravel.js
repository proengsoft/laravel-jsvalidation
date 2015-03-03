jQuery.validator.addMethod("different", function(value, element, param) {
    return this.optional(element) || value != param;
}, "Please specify a different (non-default) value");