<script>
    jQuery(document).ready(function () {

        $("<?= $validator['selector']; ?>").each(function () {
            $(this).validate({
                errorElement: 'span',
                errorClass: 'uk-text-danger',

                errorPlacement: function (error, element) {
                    if (element.closest('.uk-input').length ||
                        element.closest('.uk-select').length || element.closest('.uk-textarea').length ||
                        element.prop('type') === 'checkbox' || element.prop('type') === 'radio') {
                        error.insertAfter(element.parent());
                        // else just place the validation message immediately after the input
                    } else {
                        error.insertAfter(element);
                    }
                },
                highlight: function (element) {
                    $(element).closest('.uk-input').removeClass('uk-form-success').addClass('uk-form-danger'); // add the Bootstrap error class to the control group
                },

                <?php if (isset($validator['ignore']) && is_string($validator['ignore'])): ?>

                ignore: "<?= $validator['ignore']; ?>",
                <?php endif; ?>


                unhighlight: function (element) {
                    $(element).closest('.uk-input').removeClass('uk-form-danger').addClass('uk-form-success');
                },

                success: function (element) {
                    $(element).closest('.uk-input').removeClass('uk-form-danger').addClass('uk-form-success'); // remove the Boostrap error class from the control group
                },

                focusInvalid: true,
                <?php if (Config::get('jsvalidation.focus_on_error')): ?>
                invalidHandler: function (form, validator) {

                    if (!validator.numberOfInvalids())
                        return;

                    $('html, body').animate({
                        scrollTop: $(validator.errorList[0].element).offset().top
                    }, <?= Config::get('jsvalidation.duration_animate') ?>);

                },
                <?php endif; ?>

                rules: <?= json_encode($validator['rules']); ?>
            });
        });
    });
</script>
