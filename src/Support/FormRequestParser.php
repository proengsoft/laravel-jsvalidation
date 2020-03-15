<?php

namespace Proengsoft\JsValidation\Support;

class FormRequestParser
{
    /**
     * @var string
     */
    protected $className;

    /**
     * @var array
     */
    protected $params;

    /**
     * FormRequestParser constructor.
     *
     * @param string|array $request
     */
    public function __construct($request)
    {
        $this->split($request);
    }

    /**
     * Form request class.
     *
     * @return string
     */
    public function className()
    {
        return $this->className;
    }

    /**
     * Parameters to pass to the form request.
     *
     * @return array
     */
    public function params()
    {
        return $this->params;
    }

    /**
     * Split the form request.
     *
     * @param $request
     * @return $this
     */
    protected function split($request)
    {
        $params = [];
        if (is_array($request)) {
            $params = empty($request[1]) ? $params : $request[1];
            $request = $request[0];
        }

        $this->className = $request;
        $this->params    = $params;

        return $this;
    }
}
