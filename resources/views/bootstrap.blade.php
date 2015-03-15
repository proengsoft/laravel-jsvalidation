<script type="text/javascript" src="{{ asset('vendor/jsvalidation/js/jquery.validate.js')}}"></script>
<script type="text/javascript" src="{{ asset('vendor/jsvalidation/js/php-date-formatter.js')}}"></script>
<script type="text/javascript" src="{{ asset('vendor/jsvalidation/js/jsvalidation.js')}}"></script>
<script>
    jQuery.validator.setDefaults({
        debug: true
    });
    jQuery(document).ready(function(){
        console.log($({!! "'".$validator["selector"]."'" !!}));
        $({!! "'".$validator["selector"]."'" !!}).validate({
            highlight: function (element) { // hightlight error inputs
                $(element)
                        .closest('.form-group').addClass('has-error'); // set error class to the control group
            },
            unhighlight: function (element) { // revert the change done by hightlight
                $(element)
                        .closest('.form-group').removeClass('has-error'); // set error class to the control group
            },
            errorElement: 'span', //default input error message container
            errorClass: 'help-block help-block-error', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",  // validate all fields including form hidden input
            errorPlacement: function(error, element) {
                if (element.attr("type") == "radio") {
                    error.insertAfter(element.parents('div').find('.radio-list'));
                } else {
                    if(element.parent('.input-group').length) {
                        error.insertAfter(element.parent());
                    } else {
                        error.insertAfter(element);
                    }
                }
            },
            success: function (label) {
                label
                        .closest('.form-group').removeClass('has-error'); // set success class to the control group
            },
            rules:
                {!! json_encode($validator['rules'],JSON_PRETTY_PRINT) !!} ,
            messages:
                {!! json_encode($validator['messages'],JSON_PRETTY_PRINT) !!}
        })
    })
</script>