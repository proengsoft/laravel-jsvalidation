<?php
/**
 * Created by PhpStorm.
 * User: Albert
 * Date: 28/02/2015
 * Time: 0:10
 */

namespace Proengsoft\JQueryValidation;

use Illuminate\Validation\Validator as BaseValidator;
use Symfony\Component\Translation\TranslatorInterface;
use Illuminate\Support\Str;


class ValidationAdapter extends BaseValidator {

    const DISABLE_JS_RULE='no_js_validation';

    /**
     * @var JQueryValidation
     */
    protected $converter;

    protected $jsRules;
    protected $jsMessages;
    protected $selector = 'form';


    public function __construct(
        TranslatorInterface $translator,
        array $data,
        array $rules,
        array $messages = array(),
        array $customAttributes = array(),
        JQueryValidation $converter
    ) {
        parent::__construct($translator, $data, $rules, $messages, $customAttributes);

        $this->converter = $converter;
        $this->generateValidations();



    }



    /**
     * Determine if the data passes the validation rules.
     *
     */
    protected function generateValidations()
    {

        // We'll spin through each rule, validating the attributes attached to that
        // rule. All enabled rules will be converted.
        foreach ($this->rules as $attribute => $rules)
        {
            // Check if JS Validation is disabled for this attribute
            if (!$this->jsValidationEnabled($attribute)) continue;

            // Convert each rules and messages
            $hasImplicit=false;
            foreach ($rules as $rule)
            {
                $js_rule=$this->convertRule($attribute, $rule);
                $this->mergeJsRules($attribute,$js_rule);

                $js_message=$this->convertMessage($attribute, $rule);
                $this->mergeJsMessages($attribute,$js_message);
                $hasImplicit = $hasImplicit || $this->isImplicit($rule);
            }

            // Determine if a given rule implies the attribute is required.
            if ($hasImplicit && !$this->hasRule($attribute,'Required')) {
                $js_rule=$this->convertRule($attribute, 'Required');
                //$this->mergeJsRules($attribute,$js_rule);
            };


        }

    }


    /**
     * Merge additional rules into a given attribute.
     *
     * @param  string  $attribute
     * @param  string|array  $rules
     * @return void
     */
    protected function mergeJsRules($attribute, $rules)
    {
        $current = isset($this->jsRules[$attribute]) ? $this->jsRules[$attribute] : [];

        if (!is_array($rules)) $rules=array($rules);

        $this->jsRules[$attribute] = array_merge($current, $rules);
    }

    /**
     * Merge additional messages into a given attribute.
     *
     * @param  string  $attribute
     * @param  string|array  $messages
     * @return void
     */
    protected function mergeJsMessages($attribute, $messages)
    {
        $current = isset($this->jsMessages[$attribute]) ? $this->jsMessages[$attribute] : [];

        if (!is_array($messages)) $messages=array($messages);

        $this->jsMessages[$attribute] = array_merge($current, $messages);
    }


    /**
     * Check if JS Validation is disabled for attribute
     * @param $attribute
     * @return bool
    protected function jsValidationEnabled($attribute)
    {
        $rules = isset($this->rules[$attribute]) ? $this->rules[$attribute] : [];

        return ! in_array(self::DISABLE_JS_RULE, $rules);
    }



    /**
     * Convert a given rule using the converter.
     *
     * @param  string  $attribute
     * @param  string  $rule
     * @return array
     */
    protected function convertRule($attribute, $rule)
    {
        list($rule, $parameters) = $this->parseRule($rule);

        if ($rule == '') return [];

        return ["laravel{$rule}"=>$parameters];
        $method = "rule{$rule}";
        return $this->converter->$method($attribute, $parameters, $this);

    }


    /**
     * Convert the message from given rule using the converter.
     *
     * @param  string  $attribute
     * @param  string  $rule
     * @return array
     */
    protected function convertMessage($attribute, $rule)
    {
        list($rule, $parameters) = $this->parseRule($rule);

        $message = $this->getMessage($attribute, $rule);

        $message = $this->doReplacements($message, $attribute, $rule, $parameters);

        return $this->converter->message($attribute, $message, $rule, $parameters, $this);

    }

    /**
     * Check if JS Validation is disabled for attribute
     * @param $attribute
     * @return bool
     */
    protected function jsValidationEnabled($attribute)
    {
        return !$this->hasRule($attribute,self::DISABLE_JS_RULE);

    }





    public function validateNoJsValidation($attribute, $value, $parameters)
    {
        return true;
    }


    public function form($selector)
    {
        $this->selector=$selector;
    }

    public function js($selector = null)
    {
        $this->selector=is_null($selector)?$this->selector:$selector;

        return [
            'converter' => Str::slug(class_basename($this->converter)),
            'selector' => $this->selector,
            'rules' => $this->jsRules,
            'messages' => $this->jsMessages
        ];

    }

}