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
            if (!$this->validationEnabled($attribute)) break;

            foreach ($rules as $rule)
            {
                $js_rule=$this->convertRule($attribute, $rule);
                $this->mergeJsRules($attribute,$js_rule);

                $js_message=$this->convertMessage($attribute, $rule);
                $this->mergeJsMessages($attribute,$js_message);

            }
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


    protected function validationEnabled($attribute)
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


        // We will verify that the attribute is indeed validatable. Unless the rule
        // implies that the attribute is required, rules are not run for missing values.
        if (!$this->isValidatable($rule, $attribute, null)) return [];

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

        return $this->converter->message($attribute, $message, $parameters, $this);

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