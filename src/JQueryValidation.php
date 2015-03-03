<?php
/**
 * Created by PhpStorm.
 * User: Albert
 * Date: 27/02/2015
 * Time: 23:38
 */

namespace Proengsoft\JQueryValidation;


use Symfony\Component\HttpFoundation\File\MimeType\ExtensionGuesser;

class JQueryValidation {


    public function message($attribute, $message, $rule, $parameters)
    {
        $result=[];

        $function="rule".$rule;
        $rules=method_exists($this,$function)?$this->$function($rule, $parameters):[];
        foreach (array_keys($rules) as $jsRule) {
            $result[$jsRule]=$message;
        }

        return $result;
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
        //@todo: detect if field exists
        return ['required' =>true ];
    }

    /**
     * Validate the given attribute is filled if it is present.
     *
     * @param  string  $attribute
     * @return array
     */
    public function ruleFilled($attribute)
    {
        return ['required' =>true ];
    }

    /**
     * Validate that an attribute exists when any other attribute exists.
     *
     * @param  string  $attribute
     * @param  mixed   $parameters
     * @return array
     */
    public function ruleRequiredWith($attribute, $parameters)
    {
        // @todo:  ruleRequiredWith
        return [];
    }

    public function ruleRequiredWithAll($attribute, $parameters)
    {
        // @todo:  ruleRequiredWithAll
        return [];
    }

    public function ruleRequiredWithout($attribute, $parameters)
    {
        // @todo:  ruleRequiredWithout
        return [];
    }

    public function ruleRequiredWithoutAll($attribute, $parameters)
    {
        // @todo:  ruleRequiredWithoutAll
        return [];
    }

    public function ruleRequiredIf($attribute, $parameters)
    {
        // @todo:  ruleRequiredIf
        return [];
    }

    /**
     * Validate that an attribute has a matching confirmation.
     *
     * @param  string  $attribute
     * @return array
     */
    public function ruleConfirmed($attribute)
    {
        return $this->ruleSame($attribute,array($attribute.'_confirmation'));
    }

    /**
     * Validate that two attributes match.
     *
     * @param  string  $attribute
     * @param  array   $parameters
     * @return array
     */
    public function ruleSame($attribute, $parameters)
    {
        //$this->requireParameterCount(1, $parameters, 'same');

        return ['equalTo'=>$parameters[0]];
    }

    public function ruleDifferent($attribute, $parameters)
    {
        // @todo: ruleDifferent
        return [];
    }

    /**
     * Validate that an attribute was "accepted".
     *
     * This validation rule implies the attribute is "required".
     *
     * @param  string  $attribute
     * @return array
     */
    public function ruleAccepted($attribute)
    {
        return ['pattern'=>'/^(yes|on|1|true)$/i'];
    }


    public function ruleArray($attribute)
    {
        // @todo: ruleArray
        return [];
    }

    /**
     * Validate that an attribute is a boolean.
     *
     * @param  string  $attribute
     * @return array
     */
    public function ruleBoolean($attribute)
    {
        return ['pattern'=>'/^(true|false|1|0)$/i'];
    }

    /**
     * Validate that an attribute is an integer.
     *
     * @param  string  $attribute
     * @return array
     */
    public function ruleInteger($attribute)
    {
        return ['integer' => true];
    }

    /**
     * Validate that an attribute is numeric.
     *
     * @param  string  $attribute
     * @return array
     */
    public function ruleNumeric($attribute)
    {
        return ['number' => true];
    }

    /**
     * Validate that an attribute is a string.
     *
     * @param  string  $attribute
     * @return array
     */
    public function ruleString($attribute)
    {
        return ['pattern'=>'/[a-z]+|^$/i'];
    }

    /**
     * Validate that an attribute has a given number of digits.
     *
     * @param  string  $attribute
     * @param  array   $parameters
     * @return array
     */
    public function ruleDigits($attribute, $parameters)
    {
        //$this->requireParameterCount(1, $parameters, 'digits');
        $parameters[1]=$parameters[0];
        return $this->ruleDigitsBetween($attribute,$parameters);
    }

    /**
     * Validate that an attribute is between a given number of digits.
     *
     * @param  string  $attribute
     * @param  array   $parameters
     * @return array
     */
    public function ruleDigitsBetween($attribute, $parameters)
    {
        //$this->requireParameterCount(2, $parameters, 'digits_between');

        return array_merge($this->ruleNumeric($attribute),['rangelength'=>$parameters]);
    }

    public function ruleSize($attribute, $parameters)
    {
        // @todo: ruleSize
        return [];
    }

    public function ruleBetween($attribute, $parameters)
    {
        // @todo: ruleBetween
        return [];
    }

    public function ruleMin($attribute, $parameters)
    {
        // @todo: ruleMin
        return [];
    }

    public function ruleMax($attribute, $parameters)
    {
        // @todo: ruleMax
        return [];
    }

    public function ruleIn($attribute, $parameters)
    {
        // @todo: ruleIn
        return [];
    }

    public function ruleNotIn($attribute, $parameters)
    {
        // @todo: ruleNotIn
        return [];
    }

    public function ruleUnique($attribute, $parameters)
    {
        // @todo: ruleUnique
        return [];
    }

    public function ruleExists($attribute, $parameters)
    {
        // @todo: ruleExists
        return [];
    }

    /**
     * Validate that an attribute is a valid IP.
     *
     * @param  string  $attribute
     * @return bool
     */
    public function ruleIp($attribute)
    {
        return ['ipv4'=>true];
    }


    /**
     * Validate that an attribute is a valid e-mail address.
     *
     * @param  string  $attribute
     * @return bool
     */
    public function ruleEmail($attribute)
    {
        return ['email'=>true];
    }

    /**
     * Validate that an attribute is a valid URL.
     *
     * @param  string  $attribute
     * @return array
     */
    public function ruleUrl($attribute)
    {
        return ['url'=>true];
    }

    public function ruleActiveUrl($attribute)
    {
        return [];
    }

    public function ruleImage($attribute)
    {
        return [];
    }

    /**
     * Validate the MIME type of a file upload attribute is in a set of MIME types.
     *
     * @param  string  $attribute
     * @param  array   $parameters
     * @return bool
     */
    public function ruleMimes($attribute, $parameters)
    {
         return[];
    }

    /**
     * Validate that an attribute contains only alphabetic characters.
     *
     * @param  string  $attribute
     * @return bool
     */
    public function ruleAlpha($attribute)
    {
        return ['pattern'=>'/^[a-z]+$|^$/i'];
    }

    /**
     * Validate that an attribute contains only alpha-numeric characters.
     *
     * @param  string  $attribute
     * @return bool
     */
    public function ruleAlphaNum($attribute)
    {
        return ['alphanumeric'=>true];
    }

    public function ruleAlphaDash($attribute)
    {
        return ['pattern' =>'/^[\w+\-_]+$|^$/'];
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