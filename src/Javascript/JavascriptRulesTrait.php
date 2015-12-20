<?php

namespace Proengsoft\JsValidation\Javascript;

trait JavascriptRulesTrait
{

    /**
     * Handles multidimensional attribute names.
     *
     * @param string $attribute
     *
     * @return string
     */
    abstract protected function getJsAttributeName($attribute);


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
        return $this->jsRuleAfter($attribute, $parameters);
    }

    /**
     * Validate that two attributes match.
     *
     * @param string $attribute
     * @param array  $parameters
     *
     * @return array
     */
    protected function jsRuleSame($attribute, array $parameters)
    {
        $other = $this->getJsAttributeName($parameters[0]);

        return [$attribute, [$other]];
    }

    /**
     * Validate that an attribute is different from another attribute.
     *
     * @param string $attribute
     * @param array  $parameters
     *
     * @return array
     */
    protected function jsRuleDifferent($attribute, array $parameters)
    {
        return $this->jsRuleSame($attribute, $parameters);
    }

    /**
     * Validate that an attribute exists when any other attribute exists.
     *
     * @param string $attribute
     * @param mixed  $parameters
     *
     * @return array
     */
    protected function jsRuleRequiredWith($attribute, array $parameters)
    {
        $parameters = array_map([$this, 'getJsAttributeName'], $parameters);

        return [$attribute, $parameters];
    }

    /**
     * Validate that an attribute exists when all other attributes exists.
     *
     * @param string $attribute
     * @param mixed  $parameters
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
     * @param string $attribute
     * @param mixed  $parameters
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
     * @param string $attribute
     * @param mixed  $parameters
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
     * @param string $attribute
     * @param mixed  $parameters
     *
     * @return array
     */
    protected function jsRuleRequiredIf($attribute, array $parameters)
    {
        $parameters[0] = $this->getJsAttributeName($parameters[0]);

        return [$attribute, $parameters];
    }


}
