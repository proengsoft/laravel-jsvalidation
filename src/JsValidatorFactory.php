<?php

namespace Proengsoft\JsValidation;

use Illuminate\Contracts\Container\Container;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Proengsoft\JsValidation\Exceptions\FormRequestArgumentException;

class JsValidatorFactory
{
    /**
     * The application instance.
     *
     * @var Factory
     */
    protected $validator;

    /**
     * Javascript validator instance.
     *
     * @var Manager
     */
    protected $manager;

    /**
     *  Current Request.
     * @var Request
     */
    protected $request;

    /**
     *  Current Application Container.
     * @var Container
     */
    protected $container;

    /**
     * Create a new Validator factory instance.
     *
     * @param Factory $validator
     * @param \Proengsoft\JsValidation\Manager $manager
     * @param Container $app
     */
    public function __construct(Factory $validator, Manager $manager, Container $app)
    {
        $this->validator = $validator;
        $this->manager = $manager;
        $this->container = $app;
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
        $validator = $this->validator->make([], $rules, $messages, $customAttributes);

        return $this->jsValidator($validator, $selector);
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
        if (! is_subclass_of($formRequest, FormRequest::class)) {
            throw new FormRequestArgumentException((string) $formRequest);
        }

        if (is_string($formRequest)) {
            $formRequest = $this->createFormRequest($formRequest);
        }

        $rules = method_exists($formRequest, 'rules') ? $formRequest->rules() : [];
        $validator = $this->validator->make([], $rules, $formRequest->messages(), $formRequest->attributes());

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
        $formRequest = new $class();
        $request = $this->container['request'];

        $formRequest->initialize($request->query->all(), $request->request->all(), $request->attributes->all(),
            $request->cookies->all(), array(), $request->server->all(), $request->getContent()
        );

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
     * @param Validator  $validator
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
     * @param Validator $validator
     * @param string|null       $selector
     *
     * @return Manager
     */
    protected function jsValidator(Validator $validator, $selector = null)
    {
        $manager = clone $this->manager;

        $manager->selector($selector);
        $manager->setValidator($validator);

        return $manager;
    }
}
