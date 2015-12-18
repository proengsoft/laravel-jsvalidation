<?php

namespace Proengsoft\JsValidation;

use Illuminate\Contracts\Container\Container;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Factory;
use Illuminate\Validation\Validator;
use Illuminate\Session\Store;
use Proengsoft\JsValidation\Exceptions\FormRequestArgumentException;

class JsValidatorFactory
{

    /**
     * The application instance.
     *
     * @var \Illuminate\Contracts\Foundation\Application
     */
    protected $app;

    /**
     *  Current Request.
     *
     * @var \Illuminate\Http\Request
     */
    protected $request;

    /**
     *  Current Validator Factory
     *
     * @var \Illuminate\Contracts\Validation\Factory
     */
    protected $factory;

    /**
     * Session Store used to secure Ajax validations.
     *
     * @var \Illuminate\Session\Store
     */
    protected $sessionStore;

    /**
     * Configuration options
     *
     * @var array
     */
    protected $options ;


    /**
     * Create a new Validator factory instance.
     *
     * @param \Illuminate\Contracts\Foundation\Application  $app
     * @param array $options
     */
    public function __construct($app, array $options = [])
    {
        $this->app = $app;

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
     * @return \Proengsoft\JsValidation\Manager
     */
    public function make(array $rules, array $messages = array(), array $customAttributes = array(), $selector = null)
    {
        $validator = $this->getValidatorInstance($rules, $messages, $customAttributes);

        return $this->jsValidator($validator, $selector);
    }

    /**
     * Get the validator instance for the request.
     *
     * @return \Illuminate\Validation\Validator
     */
    protected function getValidatorInstance(array $rules, array $messages = array(), array $customAttributes = array())
    {
        //$factory = $this->container->make(ValidationFactory::class);

        /*
        if (method_exists($this, 'validator')) {
            return $this->container->call([$this, 'validator'], compact('factory'));
        }
        */
        $factory = $this->app->make(ValidationFactory::class);

        return $factory->make([], $rules, $messages, $customAttributes);

        //return $this->app->make(ValidationFactory::class,[[], $rules, $messages, $customAttributes]);
    }

    /**
     * Creates JsValidator instance based on FormRequest.
     *
     * @param $formRequest
     * @param null $selector
     *
     * @return Manager
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

        return $this->jsValidator($validator, $selector);
    }

    /**
     *  Creates and initializes an Form Request instance.
     *
     * @param string $class
     * @return FormRequest
     */
    protected function createFormRequest($class)
    {
        /*
         * @var \Illuminate\Foundation\Http\FormRequest
         * @var $request Request
         */
        $request = $this->app['request'];
        $formRequest = call_user_func([$class,'createFromBase'], $request);
        //$request = $this->request;
        //$formRequest->createFromBase($request );
        /*
        $formRequest->initialize($request->query->all(), $request->request->all(), $request->attributes->all(),
            $request->cookies->all(), array(), $request->server->all(), $request->getContent()
        );
        */
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
     * @param \Illuminate\Validation\Validator  $validator
     * @param string|null       $selector
     *
     * @return Manager
     */
    public function validator(Validator $validator, $selector = null)
    {
        return $this->jsValidator($validator, $selector);
    }

    /**
     * Creates JsValidator instance based on Validator.
     *
     * @param \Illuminate\Validation\Validator $validator
     * @param string|null       $selector
     *
     * @return Manager
     */
    protected function jsValidator(Validator $validator, $selector = null)
    {

        $remote = ! $this->options['disable_remote_validation'];
        $view = $this->options['view'];
        $selector = $this->options['form_selector'];

        $jsValidator = new JavascriptValidator($validator, compact('remote'));
        $jsValidator->setRemoteToken(
            $this->getSessionToken()
        );

        $manager = new Manager($jsValidator, compact('view','selector'));

        return $manager;
    }


    protected function getSessionToken()
    {
        $token = null;
        if (!is_null($this->app['session'])) {
            $token = $this->app['session']->token();
        }

        if (! is_null($this->app['encrypter'])) {
            $token = $this->app['encrypter']->encrypt($token);
        }

        return $token;
    }


}
