<?php

namespace Proengsoft\JsValidation\Exceptions;

use Symfony\Component\HttpKernel\Exception\BadRequestHttpException as BaseException;

class BadRequestHttpException extends BaseException
{
    /**
     * Constructor.
     *
     * @param string     $message  The internal exception message
     * @param \Exception $previous The previous exception
     * @param int        $code     The internal exception code
     */
    public function __construct($message = null, \Exception $previous = null, $code = 0)
    {
        $message = is_null($message) ? 'Malformed JsValidation Request' : $message;
        parent::__construct($message, $previous, $code);
    }
}
