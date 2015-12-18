<?php
namespace Proengsoft\JsValidation\Traits;


trait RuleList
{

    /**
     *  Rules validated with Javascript.
     *
     * @var array
     */
    protected $clientRules = ['Accepted', 'After', 'Alpha', 'AlphaDash',
        'AlphaNum', 'Array', 'Before', 'Between', 'Boolean', 'Confirmed', 'Date',
        'DateFormat', 'Different', 'Digits', 'DigitsBetween', 'Email', 'Image',
        'In', 'Integer', 'Ip', 'Json', 'Max', 'Mimes', 'Min', 'NotIn', 'Numeric',
        'Regex', 'Required', 'RequiredIf', 'RequiredWith', 'RequiredWithAll',
        'RequiredWithout', 'RequiredWithoutAll', 'Same', 'Size', 'Sometimes' ,
        'String', 'Timezone', 'Url', ];

    /**
     * Rules validated in Server-Side
     * @var array
     */
    protected $serverRules = ['ActiveUrl', 'Exists', 'Unique'];

    /**
     * Rule used to disable validations
     *
     * @var string
     */
    private $disableJsValidationRule = 'NoJsValidation';


    /**
     * Returns if rule is validated using Javascript.
     *
     * @param $rule
     * @return bool
     */
    public function jsImplementedRule($rule)
    {
        return in_array($rule, $this->clientRules) || in_array($rule, $this->serverRules);
    }

    /**
     * Check if rule must be validated in server-side
     *
     * @param $rule
     * @return bool
     */
    public function isRemoteRule($rule) {
        return in_array($rule, $this->serverRules) ||
            ! in_array($rule, $this->clientRules);
    }

    /**
     * Check if rule disables rule processing
     *
     * @param $rule
     * @return bool
     */
    public function isDisableRule($rule) {
        return $rule === $this->disableJsValidationRule;
    }

    /**
     * Check if rules should be validated
     *
     * @param $rules
     * @return bool
     */
    public function validationDisabled($rules) {
        return in_array($this->disableJsValidationRule, $rules);
    }

}