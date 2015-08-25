<?php

namespace Proengsoft\JsValidation\Traits;

use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

trait RemoteValidation
{
    /**
     * Get the data under validation.
     *
     * @return array
     */
    abstract public function getData();

    /**
     * Set the data under validation.
     *
     * @param array $data
     */
    abstract public function setData(array $data);

    /**
     * Get the message container for the validator.
     *
     * @return \Illuminate\Support\MessageBag
     */
    abstract public function messages();

    /**
     * Get the array of custom validator extensions.
     *
     * @return array
     */
    abstract public function getExtensions();

    /**
     * Get the validation rules.
     *
     * @return array
     */
    abstract public function getRules();

    /**
     * Set the validation rules.
     *
     * @param array $rules
     *
     * @return $this
     */
    abstract public function setRules(array $rules);

    /**
     * Extract the rule name and parameters from a rule.
     *
     * @param array|string $rules
     *
     * @return array
     */
    abstract protected function parseRule($rules);

    /**
     * Return parsed Javascript Rule.
     *
     * @param string $attribute
     * @param string $rule
     * @param array  $parameters
     *
     * @return array
     */
    abstract protected function getJsRule($attribute, $rule, $parameters);

    /**
     * Validate remote Javascript Validations.
     *
     * @param $attribute
     * @param $callable
     *
     * @return bool
     */
    protected function validateJsRemoteRequest($attribute, $callable)
    {
        if (!$this->setRemoteValidationData($attribute)) {
            throw new BadRequestHttpException('Bad request');
        }

        $message = call_user_func($callable);
        if (!$message) {
            $message = $this->messages()->get($attribute);
        }

        throw new HttpResponseException(
            new JsonResponse($message, 200));
    }

    /**
     *  Check if Request must be validated by JsValidation.
     *
     * @return bool
     */
    protected function isRemoteValidationRequest()
    {
        $data = $this->getData();

        return !empty($data['_jsvalidation']);
    }

    /**
     * Sets data for validate remote rules.
     *
     * @param $attribute
     *
     * @return bool
     */
    protected function setRemoteValidationData($attribute)
    {
        $attribute = str_replace(array("[", "]"), array(".", ""), $attribute);
        
        if (!array_key_exists($attribute, $this->getRules())) {
            $this->setRules(array());
            return false;
        }

        $rules = $this->getRules()[$attribute];
        foreach ($rules as $i => $rule) {
            list($rule, $parameters) = $this->parseRule($rule);
            $jsRule = $this->getJsRule($attribute, $rule, $parameters);
            if ($jsRule [1] !== 'laravelValidationRemote') {
                unset($rules[$i]);
            }
        }
        $this->setRules([$attribute => $rules]);

        return !empty($this->getRules()[$attribute]);
    }

    /**
     * Check if rule must be validated remotely.
     *
     * @param string $rule
     *
     * @return bool
     */
    protected function isRemoteRule($rule)
    {
        if (!in_array($rule, ['ActiveUrl', 'Exists', 'Unique'])) {
            return in_array(snake_case($rule), array_keys($this->getExtensions()))
                && !method_exists($this, "jsRule{$rule}");
        }

        return true;
    }
}
