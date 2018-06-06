<?php

return [

    /*
     * Default view used to render Javascript validation code
     *
     * Supported: 'jsvalidation::bootstrap', 'jsvalidation::bootstrap4', 'jsvalidation::uikit'
     */
    'view' => 'jsvalidation::bootstrap',

    /*
     * Default JQuery selector find the form to be validated.
     * By default, the validations are applied to all forms.
     */
    'form_selector' => 'form',

    /*
     * If you change the focus on detect some error then active
     * this parameter to move the focus to the first error found.
     */
    'focus_on_error' => false,

    /*
     * Duration time for the animation when We are moving the focus
     * to the first error, http://api.jquery.com/animate/ for more information.
     */
    'duration_animate' => 1000,

    /*
     * Enable or disable Ajax validations of Database and custom rules.
     * By default Unique, ActiveURL, Exists and custom validations are validated via AJAX
     */
    'disable_remote_validation' => false,

    /*
     * Field name used in the remote validation Ajax request
     * You can change this value to avoid conflicts wth your field names
     */
    'remote_validation_field' => '_jsvalidation',

    /*
     * Whether to escape all validation messages with htmlentities.
     */
    'escape' => false,
];
