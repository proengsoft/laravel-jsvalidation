<?php

namespace Proengsoft\JsValidation\Traits;

use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Proengsoft\JsValidation\DelegatedValidator;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Illuminate\Support\Facades\Config;

trait RemoteValidation
{
    /**
     * Returns DelegatedValidator instance
     *
     * @return DelegatedValidator
     */
    abstract public function getValidator();


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
     * Determine if the data passes the validation rules.
     *
     * @return bool
     */
    public function passes()
    {
        if ($this->isRemoteValidationRequest()) {
            $data=$this->getValidator()->getData();
            return $this->validateJsRemoteRequest($data['_jsvalidation']);
        }

        return $this->getValidator()->passes();
    }


    /**
     * Validate remote Javascript Validations.
     *
     * @param $attribute
     *
     * @return bool
     */
    protected function validateJsRemoteRequest($attribute)
    {
        $attribute = str_replace(array("[", "]"), array(".", ""), $attribute);

        if (!$this->setRemoteValidation($attribute)) {
            throw new BadRequestHttpException('Bad request');
        }

        //$message = call_user_func($callable);
        $passes= $this->getValidator()->passes();
        if ($passes) {
            $message = true;
        } else {
            $message = $this->getValidator()->messages()->get($attribute);
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
        if (!$this->remoteValidationEnabled()) return false;

        $data = $this->getValidator()->getData();
        return !empty($data['_jsvalidation']);
    }

    /**
     * Sets data for validate remote rules.
     *
     * @param $attribute
     *
     * @return bool
     */
    protected function setRemoteValidation($attribute)
    {
        if (!array_key_exists($attribute, $this->getValidator()->getRules())) {
            $this->getValidator()->setRules(array());
            return false;
        }

        $rules = $this->getValidator()->getRules()[$attribute];
        foreach ($rules as $i => $rule) {
            list($rule, $parameters) = $this->getValidator()->parseRule($rule);
            $jsRule = $this->getJsRule($attribute, $rule, $parameters);
            if ($jsRule [1] !== 'laravelValidationRemote') {
                unset($rules[$i]);
            }
        }
        $this->getValidator()->setRules([$attribute => $rules]);

        return !empty($this->getValidator()->getRules()[$attribute]);
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
            return in_array(snake_case($rule), array_keys($this->getValidator()->getExtensions()));
        }

        return true;
    }

    /**
     * Check if remote validation is enabled
     *
     * @return bool
     */
    protected function remoteValidationEnabled()
    {
        return Config::get('jsvalidation.enable_remote_validation');
    }

}
