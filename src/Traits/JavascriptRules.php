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
     * Handles multidimensional attribute names
     *
     * @param string $attribute
     *
     * @return string
     */
    abstract protected function getJsAttributeName($attribute);

    /**
     * Require a certain number of parameters to be present.
     *
     * @param  int    $count
     * @param  array  $parameters
     * @param  string  $rule
     *
     * @return void
     *
     * @throws \InvalidArgumentException
     */
    abstract protected function requireParameterCount($count, $parameters, $rule);

    /**
     * Replace javascript error message place-holders in RequiredIf with actual values.
     *
     * @param $attribute
     * @param $message
     * @param $parameters
     *
     * @return mixed
     */
    public function jsReplaceRequiredIf($attribute, $message, $parameters)
    {
        $field = $parameters[0];

        $data[$field] = $parameters[1];

        $parameters[0] = $this->getAttribute($field);
        $parameters[1] = $this->getDisplayableValue($field, array_get($data, $field));
        $parameters[2] = $this->getAttribute($attribute);

        return str_replace(array(':other', ':value', ':attribute'), $parameters, $message);
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
        $parameters[0] = $this->getJsAttributeName($attribute);
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
        $this->requireParameterCount(1, $parameters, 'after');

        if (!($date = strtotime($parameters[0]))) {
            $date = $this->getJsAttributeName($parameters[0]);
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
        $this->requireParameterCount(1, $parameters, 'before');

        return $this->jsRuleAfter($attribute, $parameters);
    }

    /**
     * Validate that two attributes match.
     *
     * @param  string  $attribute
     * @param  array   $parameters
     *
     * @return array
     */
    protected function jsRuleSame($attribute, array $parameters)
    {
        $this->requireParameterCount(1, $parameters, 'same');

        $other = $this->getJsAttributeName($parameters[0]);

        return [$attribute, [$other]];
    }

    /**
     * Validate that an attribute is different from another attribute.
     *
     * @param  string  $attribute
     * @param  array   $parameters
     *
     * @return array
     */
    protected function jsRuleDifferent($attribute, array $parameters)
    {
        $this->requireParameterCount(1, $parameters, 'different');

        return $this->jsRuleSame($attribute, $parameters);
    }

    /**
     * Validate that an attribute exists when any other attribute exists.
     *
     * @param  string  $attribute
     * @param  mixed   $parameters
     *
     * @return array
     */
    protected function jsRuleRequiredWith($attribute, array $parameters)
    {
        $parameters = array_map([$this,'getJsAttributeName'], $parameters);

        return [$attribute, $parameters];
    }

    /**
     * Validate that an attribute exists when all other attributes exists.
     *
     * @param  string  $attribute
     * @param  mixed   $parameters
     *
     * @return array
     */
    protected function jsRuleRequiredWithAll($attribute, array $parameters)
    {
        return $this->jsRuleRequiredWith($attribute, $parameters);
    }

    /**
     * Validate that an attribute exists when another attribute does not.
     *
     * @param  string  $attribute
     * @param  mixed   $parameters
     *
     * @return array
     */
    protected function jsRuleRequiredWithout($attribute, array $parameters)
    {
        return $this->jsRuleRequiredWith($attribute, $parameters);
    }

    /**
     * Validate that an attribute exists when all other attributes do not.
     *
     * @param  string  $attribute
     * @param  mixed   $parameters
     *
     * @return array
     */
    protected function jsRuleRequiredWithoutAll($attribute, array $parameters)
    {
        return $this->jsRuleRequiredWith($attribute, $parameters);
    }

    /**
     * Validate that an attribute exists when another attribute has a given value.
     *
     * @param  string  $attribute
     * @param  mixed   $parameters
     *
     * @return array
     */
    protected function jsRuleRequiredIf($attribute, array $parameters)
    {
        $this->requireParameterCount(2, $parameters, 'required_if');

        $parameters[0] = $this->getJsAttributeName($parameters[0]);

        return [$attribute, $parameters];
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
