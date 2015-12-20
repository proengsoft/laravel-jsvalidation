<?php
namespace Proengsoft\JsValidation\Javascript;


use Proengsoft\JsValidation\Support\DelegatedValidator;
use Proengsoft\JsValidation\Support\RuleListTrait;
use Proengsoft\JsValidation\Support\UseDelegatedValidatorTrait;

class RuleParser
{
    use RuleListTrait, JavascriptRulesTrait, UseDelegatedValidatorTrait;

    /**
     * Rule used to validate remote requests
     */
    const REMOTE_RULE = 'laravelValidationRemote';
    

    /**
     * Token used to secure romte validations
     *
     * @string|null $remoteToken
     */
    protected $remoteToken;

    /**
     * Create a new JsValidation instance.
     *
     * @param \Proengsoft\JsValidation\Support\DelegatedValidator $validator
     * @param string|null $remoteToken
     */
    public function __construct(DelegatedValidator $validator, $remoteToken = null)
    {
        $this->validator = $validator;
        $this->remoteToken = $remoteToken;
    }


    /**
     * Return parsed Javascript Rule.
     *
     * @param string $attribute
     * @param string $rule
     * @param $parameters
     *
     * @return array
     */
    public function getJsRule($attribute, $rule, $parameters)
    {

        if ($this->isRemoteRule($rule)) {
            list($attribute, $parameters) = $this->jsRemoteRule($attribute);
            $jsRule = self::REMOTE_RULE;
        } else {
            list($jsRule, $attribute, $parameters) = $this->jsClientRule($attribute, $rule, $parameters);
        }

        $attribute = $this->getJsAttributeName($attribute);

        return [$attribute, $jsRule, $parameters];
    }

    /**
     * Parses raw rule
     *
     * @param array|string $rawRule
     * @return array
     */
    public function parseRaw($rawRule) {
        return $this->validator->parseRule($rawRule);
    }

    /**
     * Gets rules
     *
     * @return array
     */
    public function getRules() {
        return $this->validator->getRules();
    }

    /**
     * Returns Javascript parameters for remote validated rules.
     *
     * @param string $attribute
     * @param $rule
     * @param $parameters
     *
     * @return array
     */
    protected function jsClientRule($attribute, $rule, $parameters)
    {
        $jsRule = false;
        $method = "jsRule{$rule}";
        if (method_exists($this, $method)) {
            list($attribute, $parameters) = $this->$method($attribute, $parameters);
            $jsRule = 'laravelValidation';
        } elseif ($this->jsImplementedRule($rule)) {
            $jsRule = 'laravelValidation';
        }

        return [$jsRule, $attribute, $parameters];
    }

    /**
     * Returns Javascript parameters for remote validated rules.
     *
     * @param string $attribute
     *
     * @return array
     */
    protected function jsRemoteRule($attribute)
    {
        $params = [
            $attribute,
            $this->remoteToken,
        ];

        return [$attribute, $params];
    }

    /**
     * Handles multidimensional attribute names.
     *
     * @param $attribute
     *
     * @return string
     */
    protected function getJsAttributeName($attribute)
    {
        $attributeArray = explode('.', $attribute);
        if (count($attributeArray) > 1) {
            return $attributeArray[0].'['.implode('][', array_slice($attributeArray, 1)).']';
        }

        return $attribute;
    }


    
}