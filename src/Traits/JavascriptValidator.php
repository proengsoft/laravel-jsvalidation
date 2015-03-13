<?php namespace Proengsoft\JQueryValidation\Traits;

use Illuminate\Support\Str;


trait JavascriptValidator {

    private $disable_js_rule='no_js_validation';

    private $jsRules;
    private $jsMessages;


    /**
     * Generate Javascript validations
     */
    protected function generateJavascriptValidations()
    {

        // We'll spin through each rule, validating the attributes attached to that
        // rule. All enabled rules will be converted.
        foreach ($this->rules as $attribute => $rules)
        {
            // Check if JS Validation is disabled for this attribute
            if (!$this->jsValidationEnabled($attribute)) continue;

            // Convert each rules and messages
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
    private function mergeJsRules($attribute, $rules)
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
    private function mergeJsMessages($attribute, $messages)
    {
        $current = isset($this->jsMessages[$attribute]) ? $this->jsMessages[$attribute] : [];

        if (!is_array($messages)) $messages=array($messages);

        $this->jsMessages[$attribute] = array_merge($current, $messages);
    }

    /**
     * Convert a given rule using the converter.
     *
     * @param  string  $attribute
     * @param  string  $rule
     * @return array
     */
    private function convertRule($attribute, $rule)
    {
        list($rule, $parameters) = $this->parseRule($rule);

        if ($rule == '') return [];
        /*
        if ($this->checkImplicit($rule)) {
            return array("laravelRequired"=>[],"laravel{$rule}"=>$parameters);
        }
        */
        return array("laravel{$rule}"=>$parameters);

    }


    /**
     * Convert the message from given rule using the converter.
     *
     * @param  string  $attribute
     * @param  string  $rule
     * @return array
     */
    private function convertMessage($attribute, $rule)
    {
        list($rule, $parameters) = $this->parseRule($rule);

        if ($rule == '') return [];

        $message = $this->getMessage($attribute, $rule);
        $message = $this->doReplacements($message, $attribute, $rule, $parameters);
        /*
        if ($this->checkImplicit($rule)){
            return array("laravelRequired"=>$message,"laravel{$rule}"=>$message);
        }
        */
        return array("laravel{$rule}"=>$message);

    }


    protected function checkImplicit($rule)
    {
        return $rule!="Required" && $this->isImplicit($rule);
    }

    /**
     * Check if JS Validation is disabled for attribute
     * @param $attribute
     * @return bool
     */
    public function jsValidationEnabled($attribute)
    {
        return !$this->hasRule($attribute,$this->disable_js_rule);

    }


    public function validateNoJsValidation($attribute, $value, $parameters)
    {
        return true;
    }

    public function js()
    {
        $this->generateJavascriptValidations();

        return [
            'rules' => $this->jsRules,
            'messages' => $this->jsMessages
        ];

    }

}