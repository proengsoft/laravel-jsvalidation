<?php

namespace Proengsoft\JsValidation\Traits;

use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

trait RemoteValidation
{
    /**
     * Token used to secure remote validations.
     *
     * @var
     */
    protected $token;

    /**
     * Enable or disable remote validations.
     *
     * @var
     */
    protected $remoteEnabled;

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
     * Returns if rule is validated using Javascript.
     *
     * @param $rule
     * @return bool
     */
    abstract public function jsImplementedRule($rule);

    /**
     * Determine if the data passes the validation rules.
     *
     * @return bool
     */
    public function passesRemote($delegated)
    {
        if ($this->isRemoteValidationRequest()) {
            $data = $this->getData();

            return $this->validateJsRemoteRequest($data['_jsvalidation'], $delegated);
        }

        return call_user_func($delegated);
    }

    /**
     * Check if remote validation is enabled.
     
     * @param bool $enabled
     */
    public function enableRemote($enabled)
    {
        $this->remoteEnabled = $enabled;
    }

    /**
     * Set the token  for securing remote validation.
     
     * @param string $token
     */
    public function setRemoteToken($token)
    {
        $this->token = $token;
    }

    /**
     * Validate remote Javascript Validations.
     *
     * @param $attribute
     *
     * @return bool
     */
    protected function validateJsRemoteRequest($attribute, $delegated)
    {
        $attribute = str_replace(array('[', ']'), array('.', ''), $attribute);

        if (! $this->setRemoteValidation($attribute)) {
            throw new BadRequestHttpException('Bad request');
        }

        //$message = call_user_func($callable);
        $passes = call_user_func($delegated);
        if ($passes) {
            $message = true;
        } else {
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
        if (! $this->remoteValidationEnabled()) {
            return false;
        }

        $data = $this->getData();

        return ! empty($data['_jsvalidation']);
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
        if (! array_key_exists($attribute, $this->getRules())) {
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
        $newRules = $this->getRules();

        return ! empty($newRules[$attribute]);
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
        $validator = $this;
        if (! in_array($rule, ['ActiveUrl', 'Exists', 'Unique'])) {
            return in_array(snake_case($rule), array_keys($validator->getExtensions())) ||
            (! $this->jsImplementedRule($rule) && method_exists($validator->getValidator(), "validate{$rule}"));
        }

        return true;
    }

    /**
     * Check if remote validation is enabled.
     *
     * @return bool
     */
    public function remoteValidationEnabled()
    {
        return $this->remoteEnabled === true;
    }

    /**
     * Returns Javascript parameters for remote validated rules.
     *
     * @param string $attribute
     *
     * @return array
     */
    private function jsRemoteRule($attribute)
    {
        $params = [
            $attribute,
            $this->token,
        ];

        return [$attribute, $params];
    }
}
