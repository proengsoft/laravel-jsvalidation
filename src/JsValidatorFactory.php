<?php

namespace Proengsoft\JsValidation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Validator;
use Proengsoft\JsValidation\Exceptions\FormRequestArgumentException;
use Proengsoft\JsValidation\Javascript\JavascriptValidator;
use Proengsoft\JsValidation\Javascript\MessageParser;
use Proengsoft\JsValidation\Javascript\RuleParser;
use Proengsoft\JsValidation\Javascript\ValidatorHandler;
use Proengsoft\JsValidation\Support\DelegatedValidator;

class JsValidatorFactory
{
    /**
     * The application instance.
     *
     * @var \Illuminate\Contracts\Container\Container
     */
    protected $app;

    /**
     * Configuration options.
     *
     * @var array
     */
    protected $options;

    /**
     * Create a new Validator factory instance.
     *
     * @param \Illuminate\Contracts\Container\Container $app
     * @param array                                        $options
     */
    public function __construct($app, array $options = [])
    {
        $this->app = $app;
        $this->setOptions($options);
    }

    protected function setOptions($options)
    {
        $options['disable_remote_validation'] = empty($options['disable_remote_validation']) ? false : $options['disable_remote_validation'];
        $options['view'] = empty($options['view']) ? 'jsvalidation:bootstrap' : $options['view'];
        $options['form_selector'] = empty($options['form_selector']) ? 'form' : $options['form_selector'];

        $this->options = $options;
    }

    /**
     * Creates JsValidator instance based on rules and message arrays.
     *
     * @param array       $rules
     * @param array       $messages
     * @param array       $customAttributes
     * @param null|string $selector
     *
     * @return JavascriptValidator
     */
    public function make(array $rules, array $messages = array(), array $customAttributes = array(), $selector = null)
    {
        $validator = $this->getValidatorInstance($rules, $messages, $customAttributes);

        return $this->validator($validator, $selector);
    }

    /**
     * Get the validator instance for the request.
     *
     * @return \Illuminate\Validation\Validator
     */
    protected function getValidatorInstance(array $rules, array $messages = array(), array $customAttributes = array())
    {
        $factory = $this->app->make('Illuminate\Contracts\Validation\Factory');

        $validator = $factory->make([], $rules, $messages, $customAttributes);
        $validator->addCustomAttributes($customAttributes);

        return $validator;
    }

    /**
     * Creates JsValidator instance based on FormRequest.
     *
     * @param $formRequest
     * @param null $selector
     *
     * @return JavascriptValidator
     *
     * @throws FormRequestArgumentException
     */
    public function formRequest($formRequest, $selector = null)
    {
        if (! is_subclass_of($formRequest, 'Illuminate\\Foundation\\Http\\FormRequest')) {
            throw new FormRequestArgumentException((string) $formRequest);
        }

        if (is_string($formRequest)) {
            $formRequest = $this->createFormRequest($formRequest);
        }

        $rules = method_exists($formRequest, 'rules') ? $formRequest->rules() : [];

        $validator = $this->getValidatorInstance($rules, $formRequest->messages(), $formRequest->attributes());

        return $this->validator($validator, $selector);
    }

    /**
     *  Creates and initializes an Form Request instance.
     *
     * @param string $class
     *
     * @return FormRequest
     */
    protected function createFormRequest($class)
    {
        $request = $this->app->__get('request');
        $formRequest = call_user_func([$class, 'createFromBase'], $request);

        if ($session = $request->getSession()) {
            $formRequest->setSession($session);
        }

        $formRequest->setUserResolver($request->getUserResolver());

        $formRequest->setRouteResolver($request->getRouteResolver());

        return $formRequest;
    }

    /**
     * Creates JsValidator instance based on Validator.
     *
     * @param \Illuminate\Validation\Validator $validator
     * @param string|null                      $selector
     *
     * @return JavascriptValidator
     */
    public function validator(Validator $validator, $selector = null)
    {
        return $this->jsValidator($validator, $selector);
    }

    /**
     * Creates JsValidator instance based on Validator.
     *
     * @param \Illuminate\Validation\Validator $validator
     * @param string|null                      $selector
     *
     * @return JavascriptValidator
     */
    protected function jsValidator(Validator $validator, $selector = null)
    {
        $remote = ! $this->options['disable_remote_validation'];
        $view = $this->options['view'];
        $selector = is_null($selector) ? $this->options['form_selector'] : $selector;

        $delegated = new DelegatedValidator($validator);
        $rules = new RuleParser($delegated, $this->getSessionToken());
        $messages = new MessageParser($delegated);

        $jsValidator = new ValidatorHandler($rules, $messages);

        $manager = new JavascriptValidator($jsValidator, compact('view', 'selector', 'remote'));

        return $manager;
    }

    /**
     * Get and encrypt token from session store.
     *
     * @return null|string
     */
    protected function getSessionToken()
    {
        $token = null;
        if ($session = $this->app->__get('session')) {
            $token = $session->token();
        }

        if ($encrypter = $this->app->__get('encrypter')) {
            $token = $encrypter->encrypt($token);
        }

        return $token;
    }
}
