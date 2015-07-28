<script>
    jQuery(document).ready(function(){

        $("<?php echo $validator['selector']; ?>").validate({
            highlight: function (element) { // hightlight error inputs
                $(element)
                        .closest('.form-group, .checkbox').addClass('has-error'); // set error class to the control group
            },
            unhighlight: function (element) { // revert the change done by hightlight
                $(element)
                        .closest('.form-group, .checkbox').removeClass('has-error'); // set error class to the control group
            },
            errorElement: 'p', //default input error message container
            errorClass: 'help-block help-block-error', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",  // validate all fields including form hidden input
            <?php if(Config::get('jsvalidation.focus_on_error')): ?>
            invalidHandler: function(form, validator) {

                if (!validator.numberOfInvalids())
                    return;

                $('html, body').animate({
                    scrollTop: $(validator.errorList[0].element).offset().top
                }, <?php echo Config::get('jsvalidation.duration_animate') ?>);
                $(validator.errorList[0].element).focus();

            },
            <?php endif; ?>
            errorPlacement: function(error, element) {
               element.parents('div.has-error').append(error);
            },
            success: function (label) {
                label
                        .closest('.form-group, .checkbox').removeClass('has-error'); // set success class to the control group
            },
            rules: <?php echo json_encode($validator['rules']); ?> ,
            messages: <?php echo json_encode($validator['messages']) ?>
        })
    })
</script>
