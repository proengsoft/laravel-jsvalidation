<?php

namespace Proengsoft\JsValidation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Proengsoft\JsValidation\Exceptions\FormRequestArgumentException;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Contracts\Validation\Factory as FactoryContract;

class Factory
{
    /**
     * The application instance.
     *
     * @var \Illuminate\Contracts\Validation\Factory
     */
    protected $validator;

    /**
     * Javascript validator instance.
     *
     * @var Manager
     */
    protected $manager;

    /**
     *  Current Request
     * @var Request
     */
    protected  $request;

    /**
     * Create a new Validator factory instance.
     *
     * @param \Illuminate\Contracts\Validation\Factory $validator
     * @param \Proengsoft\JsValidation\Manager $manager
     * @param Request $request
     */
    public function __construct(FactoryContract $validator, Manager $manager, Request $request)
    {
        $this->validator = $validator;
        $this->manager = $manager;
        $this->request = $request;
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

        return $this->createValidator($validator, $selector);
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
        if (!is_subclass_of($formRequest,  'Illuminate\\Foundation\\Http\\FormRequest')) {
            $className = is_object($formRequest) ? get_class($formRequest) : (string) $formRequest;
            throw new FormRequestArgumentException($className);
        }

        if (is_string($formRequest)) {
            $formRequest = $this->createFormRequest($formRequest);
        }


        $validator = $this->validator->make([], $formRequest->rules(), $formRequest->messages(), $formRequest->attributes());

        return $this->createValidator($validator, $selector);
    }


    /**
     *  Creates and initializes an Form Request instance
     *
     * @param $class
     * @return FormRequest
     */
    protected function createFormRequest($class)
    {
        /**
         * @var $formRequest FormRequest
         */
        $formRequest=new $class();

        $formRequest->initialize(
            $this->request->query->all(),
            $this->request->request->all(),
            $this->request->attributes->all(),
            $this->request->cookies->all(),
            array(),
            $this->request->server->all(),
            $this->request->getContent()
        );

        if ($session = $this->request->getSession())
        {
            $formRequest->setSession($session);
        }
        $formRequest->setUserResolver($this->request->getUserResolver());
        $formRequest->setRouteResolver($this->request->getRouteResolver());

        return $formRequest;
    }

    /**
     * Creates JsValidator instance based on Validator.
     *
     * @param ValidatorContract $validator
     * @param string|null       $selector
     *
     * @return Manager
     */
    public function validator(ValidatorContract $validator, $selector = null)
    {
        return $this->createValidator($validator, $selector);
    }

    /**
     * Creates JsValidator instance based on Validator.
     *
     * @param ValidatorContract $validator
     * @param string|null       $selector
     *
     * @return Manager
     */
    protected function createValidator(ValidatorContract $validator, $selector = null)
    {

        $this->manager->selector($selector);
        $this->manager->setValidator($validator);

        return $this->manager;
    }
}
