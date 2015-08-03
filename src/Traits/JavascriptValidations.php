<?php namespace Proengsoft\JsValidation\Traits;

trait JavascriptValidations
{

    /**
     * Get the validation rules.
     * @return array
     */
    public abstract function getRules();

    /**
     * Get the displayable name of the value.
     *
     * @param  string  $attribute
     * @param  mixed   $value
     * @return string
     */
    public abstract function getDisplayableValue($attribute, $value);


    /**
     * Get the displayable name of the attribute.
     *
     * @param  string  $attribute
     * @return string
     */
    protected abstract function getAttribute($attribute);



    /**
     * Replace javascript error message place-holders in RequiredIf with actual values.
     *
     * @param $message
     * @param $attribute
     * @param $rule
     * @param $parameters
     * @return mixed
     */
    public function jsReplaceRequiredIf($message, $attribute, $rule, $parameters)
    {
        unset($attribute);
        unset($rule);

        $data = array();
        $data[$parameters[0]]=$parameters[1];

        $parameters[1] = $this->getDisplayableValue($parameters[0], array_get($data, $parameters[0]));
        $parameters[0] = $this->getAttribute($parameters[0]);

        return str_replace(array(':other', ':value'), $parameters, $message);
    }


    /**
     * Confirmed rule is applied to confirmed attribute
     *
     * @param $attribute
     * @param $rule
     * @param array $parameters
     * @return array
     */
    protected function jsRuleConfirmed($attribute, $rule, array $parameters)
    {
        $parameters[0]=$attribute;
        $rule="laravel{$rule}";
        $attribute="{$attribute}_confirmation";

        return [$attribute,$rule, $parameters];
    }


    /**
     * Returns Javascript parameters for After rule
     *
     * @param $attribute
     * @param $rule
     * @param array $parameters
     * @return array
     */
    protected function jsRuleAfter($attribute, $rule, array $parameters)
    {
        $rule="laravel{$rule}";

        if ( ! ($date = strtotime($parameters[0])))
        {
            $date=in_array($parameters[0],array_keys($this->getRules()))?$parameters[0]:'false';
        }

        return [$attribute,$rule, [$date]];
    }


    /**
     * Returns Javascript parameters for Before rule
     *
     * @param $attribute
     * @param $rule
     * @param array $parameters
     * @return array
     */
    protected function jsRuleBefore($attribute, $rule, array $parameters)
    {
        $rule="laravel{$rule}";

        if ( ! ($date = strtotime($parameters[0])))
        {
            $date=in_array($parameters[0],array_keys($this->getRules()))?$parameters[0]:'false';
        }

        return [$attribute,$rule, [$date]];
    }

    /**
     * Validate the MIME type of a file upload attribute is in a set of MIME types.
     *
     * @param  string  $attribute
     * @param  mixed  $rule
     * @param  array   $parameters
     * @return array
     */
    protected function jsRuleMimes($attribute, $rule, array $parameters)
    {
        $rule="laravel{$rule}";
        $parameters = array_map('strtolower', $parameters);
        return [$attribute,$rule, $parameters];
    }

}
