<?php

namespace Proengsoft\JsValidation\Exceptions;

use Exception;

class PropertyNotFoundException extends Exception
{
    /**
     * Property Not Found Exception.
     *
     * @param string    $property
     * @param string    $caller
     * @param \Exception $previous
     */
    public function __construct($property = '', $caller = '', Exception $previous = null)
    {
        $message = "'$property' not found in '$caller'' object";
        parent::__construct($message, 0, $previous);
    }
}
