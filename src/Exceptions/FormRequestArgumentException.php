<?php namespace Proengsoft\JQueryValidation\Exceptions;

use Exception;

class FormRequestArgumentException extends Exception {

    public function __construct($class, $code = 0, Exception $previous = null)
    {
        $message="$class must extends 'Illuminate\\Foundation\\Http\\FormRequest'";
        parent::__construct($message, $code, $previous);
    }

}