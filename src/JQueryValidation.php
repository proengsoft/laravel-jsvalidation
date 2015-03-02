<?php
/**
 * Created by PhpStorm.
 * User: Albert
 * Date: 27/02/2015
 * Time: 23:38
 */

namespace Proengsoft\JQueryValidation;


class JQueryValidation {


    public function message($attribute, $message, $parameters)
    {
        return [$attribute=>$message];
    }


    /**
     * "Validate" optional attributes.
     *
     * Always returns empty, just lets us put sometimes in rules.
     *
     * @return array
     */
    public function ruleSometimes()
    {
        return [];
    }

    /**
     * Validate that a required attribute exists.
     *
     * @return array
     */
    public function ruleRequired()
    {
        return ['required' =>true ];
    }

    /**
     * Validate the given attribute is filled if it is present.
     *
     * @param  string  $attribute
     * @return bool
     */
    public function ruleFilled($attribute)
    {
        return ['required' =>true ];
    }

    public function ruleRequiredWith($attribute, $parameters)
    {
        return [];
    }

    public function ruleRequiredWithAll($attribute, $parameters)
    {
        return [];
    }

    public function ruleRequiredWithout($attribute, $parameters)
    {
        return [];
    }

    public function ruleRequiredWithoutAll($attribute, $parameters)
    {
        return [];
    }

    public function ruleRequiredIf($attribute, $parameters)
    {
        return [];
    }

    public function ruleConfirmed($attribute)
    {
        return [];
    }

    public function ruleSame($attribute, $parameters)
    {
        return [];
    }

    public function ruleDifferent($attribute, $parameters)
    {
        return [];
    }

    public function ruleAccepted($attribute)
    {
        return [];
    }

    public function ruleArray($attribute)
    {
        return [];
    }

    public function ruleBoolean($attribute)
    {
        return [];
    }

    public function ruleInteger($attribute)
    {
        return [];
    }

    public function ruleNumeric($attribute)
    {
        return [];
    }

    public function ruleString($attribute)
    {
        return [];
    }

    public function ruleDigits($attribute, $parameters)
    {
        return [];
    }

    public function ruleDigitsBetween($attribute, $parameters)
    {
        return [];
    }

    public function ruleSize($attribute, $parameters)
    {
        return [];
    }

    public function ruleBetween($attribute, $parameters)
    {
        return [];
    }

    public function ruleMin($attribute, $parameters)
    {
        return [];
    }

    public function ruleMax($attribute, $parameters)
    {
        return [];
    }

    public function ruleIn($attribute, $parameters)
    {
        return [];
    }

    public function ruleNotIn($attribute, $parameters)
    {
        return [];
    }

    public function ruleUnique($attribute, $parameters)
    {
        return [];
    }

    public function ruleExists($attribute, $parameters)
    {
        return [];
    }

    public function ruleIp($attribute)
    {
        return [];
    }

    public function ruleEmail($attribute)
    {
        return [];
    }

    public function ruleUrl($attribute)
    {
        return [];
    }

    public function ruleActiveUrl($attribute)
    {
        return [];
    }

    public function ruleImage($attribute)
    {
        return [];
    }

    public function ruleMimes($attribute, $parameters)
    {
        return [];
    }

    public function ruleAlpha($attribute)
    {
        return [];
    }

    public function ruleAlphaNum($attribute)
    {
        return [];
    }

    public function ruleAlphaDash($attribute)
    {
        return [];
    }

    public function ruleRegex($attribute, $parameters)
    {
        return [];
    }

    public function ruleDate($attribute)
    {
        return [];
    }

    public function ruleDateFormat($attribute, $parameters)
    {
        return [];
    }

    public function ruleBefore($attribute, $parameters)
    {
        return [];
    }

    public function ruleBeforeWithFormat($format, $parameters)
    {
        return [];
    }

    public function ruleAfter($attribute, $parameters)
    {
        return [];
    }

    public function ruleAfterWithFormat($format, $parameters)
    {
        return [];
    }

    public function ruleTimezone($attribute)
    {
        return [];
    }



}