<?php

namespace Proengsoft\JsValidation\Traits;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Session;

trait JavascriptRules
{
    /**
     * Get the displayable name of the value.
     *
     * @param string $attribute
     * @param mixed  $value
     *
     * @return string
     */
    abstract public function getDisplayableValue($attribute, $value);

    /**
     * Get the displayable name of the attribute.
     *
     * @param string $attribute
     *
     * @return string
     */
    abstract protected function getAttribute($attribute);

    /**
     * Replace javascript error message place-holders in RequiredIf with actual values.
     *
     * @param $message
     * @param $attribute
     * @param $rule
     * @param $parameters
     *
     * @return mixed
     */
    public function jsReplaceRequiredIf($message, $attribute, $rule, $parameters)
    {
        unset($attribute);
        unset($rule);

        $data = array();
        $data[$parameters[0]] = $parameters[1];

        $parameters[1] = $this->getDisplayableValue($parameters[0], array_get($data, $parameters[0]));
        $parameters[0] = $this->getAttribute($parameters[0]);

        return str_replace(array(':other', ':value'), $parameters, $message);
    }

    /**
     * Confirmed rule is applied to confirmed attribute.
     *
     * @param $attribute
     * @param array $parameters
     *
     * @return array
     */
    protected function jsRuleConfirmed($attribute, array $parameters)
    {
        $parameters[0] = $attribute;
        $attribute = "{$attribute}_confirmation";

        return [$attribute, $parameters];
    }

    /**
     * Returns Javascript parameters for After rule.
     *
     * @param $attribute
     * @param array $parameters
     *
     * @return array
     */
    protected function jsRuleAfter($attribute, array $parameters)
    {
        if (!($date = strtotime($parameters[0]))) {
            $date = $this->getAttributeName($parameters[0]);
        }

        return [$attribute, [$date]];
    }

    /**
     * Returns Javascript parameters for Before rule.
     *
     * @param $attribute
     * @param array $parameters
     *
     * @return array
     */
    protected function jsRuleBefore($attribute, array $parameters)
    {
        if (!($date = strtotime($parameters[0]))) {
            $date = $this->getAttributeName($parameters[0]);
        }

        return [$attribute, [$date]];
    }

    /**
     * Returns Javascript parameters for remote validated rules.
     *
     * @param $attribute
     *
     * @return array
     */
    private function jsRemoteRule($attribute)
    {
        $token = Session::token();
        $token = Crypt::encrypt($token);
        $params = [
            $attribute,
            $token,
        ];

        return [$attribute, $params];
    }
}
