<?php namespace Proengsoft\JsValidation\Exceptions;

use Exception;

class FormRequestArgumentException extends Exception
{


    /**
     * The specified class must extend FormRequest
     *
     * @param string $class
     * @param int $code
     * @param Exception $previous
     */
    public function __construct($class, $code = 0, Exception $previous = null)
    {
        $message="$class must extends 'Illuminate\\Foundation\\Http\\FormRequest'";
        parent::__construct($message, $code, $previous);
    }
}
