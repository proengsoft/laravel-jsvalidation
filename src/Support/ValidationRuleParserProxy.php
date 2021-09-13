<?php

namespace Proengsoft\JsValidation\Support;

use Illuminate\Validation\ValidationRuleParser;

class ValidationRuleParserProxy
{
    use AccessProtectedTrait;

    /**
     * ValidationRuleParser instance.
     *
     * @var ValidationRuleParser
     */
    protected $parser;

    /**
     * Closure to invoke non accessible Validator methods.
     *
     * @var \Closure
     */
    protected $parserMethod;

    /**
     * ValidationRuleParserProxy constructor.
     *
     * @param  array  $data
     */
    public function __construct($data = [])
    {
        $this->parser = new ValidationRuleParser((array) $data);
        $this->parserMethod = $this->createProtectedCaller($this->parser);
    }

    /**
     * Extract the rule name and parameters from a rule.
     *
     * @param  array|string  $rules
     * @return array
     */
    public function parse($rules)
    {
        return $this->parser->parse($rules);
    }

    /**
     * Explode the rules into an array of explicit rules.
     *
     * @param  array  $rules
     * @return mixed
     */
    public function explodeRules($rules)
    {
        return $this->callProtected($this->parserMethod, 'explodeRules', [$rules]);
    }

    /**
     * Delegate method calls to parser instance.
     *
     * @param  string  $method
     * @param  mixed  $params
     * @return mixed
     */
    public function __call($method, $params)
    {
        $arrCaller = [$this->parser, $method];

        return call_user_func_array($arrCaller, $params);
    }
}
