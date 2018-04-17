<?php

namespace Proengsoft\JsValidation\Javascript;

trait JavascriptRulesTrait
{
    /**
     * Handles multidimensional attribute names.
     *
     * @param string $attribute
     * @return string
     */
    abstract protected function getAttributeName($attribute);

    /**
     * Parse named parameters to $key => $value items.
     *
     * @param array $parameters
     * @return array
     */
    abstract public function parseNamedParameters($parameters);

    /**
     * Confirmed rule is applied to confirmed attribute.
     *
     * @param $attribute
     * @param array $parameters
     * @return array
     */
    protected function ruleConfirmed($attribute, array $parameters)
    {
        $parameters[0] = $this->getAttributeName($attribute);
        $attribute = "{$attribute}_confirmation";

        return [$attribute, $parameters];
    }

    /**
     * Returns Javascript parameters for After rule.
     *
     * @param $attribute
     * @param array $parameters
     * @return array
     */
    protected function ruleAfter($attribute, array $parameters)
    {
        if (! ($date = strtotime($parameters[0]))) {
            $date = $this->getAttributeName($parameters[0]);
        }

        return [$attribute, [$date]];
    }

    /**
     * Returns Javascript parameters for Before rule.
     *
     * @param $attribute
     * @param array $parameters
     * @return array
     */
    protected function ruleBefore($attribute, array $parameters)
    {
        return $this->ruleAfter($attribute, $parameters);
    }

    /**
     * Validate that two attributes match.
     *
     * @param string $attribute
     * @param array $parameters
     * @return array
     */
    protected function ruleSame($attribute, array $parameters)
    {
        $other = $this->getAttributeName($parameters[0]);

        return [$attribute, [$other]];
    }

    /**
     * Validate that an attribute is different from another attribute.
     *
     * @param string $attribute
     * @param array $parameters
     * @return array
     */
    protected function ruleDifferent($attribute, array $parameters)
    {
        return $this->ruleSame($attribute, $parameters);
    }

    /**
     * Validate that an attribute exists when any other attribute exists.
     *
     * @param string $attribute
     * @param mixed $parameters
     * @return array
     */
    protected function ruleRequiredWith($attribute, array $parameters)
    {
        $parameters = array_map([$this, 'getAttributeName'], $parameters);

        return [$attribute, $parameters];
    }

    /**
     * Validate that an attribute exists when all other attributes exists.
     *
     * @param string $attribute
     * @param mixed $parameters
     * @return array
     */
    protected function ruleRequiredWithAll($attribute, array $parameters)
    {
        return $this->ruleRequiredWith($attribute, $parameters);
    }

    /**
     * Validate that an attribute exists when another attribute does not.
     *
     * @param string $attribute
     * @param mixed $parameters
     * @return array
     */
    protected function ruleRequiredWithout($attribute, array $parameters)
    {
        return $this->ruleRequiredWith($attribute, $parameters);
    }

    /**
     * Validate that an attribute exists when all other attributes do not.
     *
     * @param string $attribute
     * @param mixed $parameters
     * @return array
     */
    protected function ruleRequiredWithoutAll($attribute, array $parameters)
    {
        return $this->ruleRequiredWith($attribute, $parameters);
    }

    /**
     * Validate that an attribute exists when another attribute has a given value.
     *
     * @param string $attribute
     * @param mixed $parameters
     * @return array
     */
    protected function ruleRequiredIf($attribute, array $parameters)
    {
        $parameters[0] = $this->getAttributeName($parameters[0]);

        return [$attribute, $parameters];
    }

    /**
     * Validate that an attribute exists when another attribute does not have a given value.
     *
     * @param string $attribute
     * @param mixed $parameters
     * @return array
     */
    protected function ruleRequiredUnless($attribute, array $parameters)
    {
        return $this->ruleRequiredIf($attribute, $parameters);
    }

    /**
     * Validate that the values of an attribute is in another attribute.
     *
     * @param string $attribute
     * @param mixed $parameters
     * @return array
     */
    protected function ruleInArray($attribute, array $parameters)
    {
        return $this->ruleRequiredIf($attribute, $parameters);
    }

    /**
     * Validate the dimensions of an image matches the given values.
     *
     * @param string $attribute
     * @param array $parameters
     * @return array
     */
    protected function ruleDimensions($attribute, $parameters)
    {
        $parameters = $this->parseNamedParameters($parameters);

        return [$attribute, $parameters];
    }

    /**
     * Validate an attribute is unique among other values.
     *
     * @param string $attribute
     * @param array $parameters
     * @return array
     */
    protected function ruleDistinct($attribute, array $parameters)
    {
        $parameters[0] = $attribute;

        return $this->ruleRequiredIf($attribute, $parameters);
    }
}
