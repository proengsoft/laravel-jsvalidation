<?php namespace Proengsoft\JsValidation;

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
     * Default Config
     *
     * @var array
     */
    //protected $defaults;

    /**
     * Javascript validator instance
     *
     * @var Manager
     */
    protected $js;

    /**
     * Create a new Validator factory instance.
     *
     * @param  \Illuminate\Contracts\Validation\Factory $validator
     * @param  \Proengsoft\JsValidation\Manager $js
     */
    public function __construct(FactoryContract $validator, Manager $js)
    {
        $this->validator=$validator;
        $this->js=$js;
    }


    /**
     * Creates JsValidator instance based on rules and message arrays
     *
     * @param array $rules
     * @param array $messages
     * @param array $customAttributes
     * @param null|string $selector
     * @return \Proengsoft\JsValidation\Manager
     */
    public function make(array $rules, array $messages = array(), array $customAttributes = array(), $selector=null)
    {
        $validator=$this->validator->make([], $rules, $messages, $customAttributes);
        return $this->createValidator($validator, $selector);
    }


    /**
     * Creates JsValidator instance based on FormRequest
     *
     * @param $formRequest
     * @param null $selector
     * @return Manager
     * @throws FormRequestArgumentException
     */
    public function formRequest($formRequest, $selector=null)
    {
        if (!is_subclass_of($formRequest, "Illuminate\\Foundation\\Http\\FormRequest")) {
            $className=is_object($formRequest)?get_class($formRequest):(string)$formRequest;
            throw new FormRequestArgumentException($className);
        }

        $formRequest= is_string($formRequest)? new $formRequest:$formRequest;
        $validator=$this->validator->make([], $formRequest->rules(), $formRequest->messages(), $formRequest->attributes());

        return $this->createValidator($validator, $selector);
    }

    /**
     * Creates JsValidator instance based on Validator
     *
     * @param ValidatorContract $validator
     * @param string|null $selector
     * @return Manager
     */
    public function validator(ValidatorContract $validator, $selector=null)
    {
        return $this->createValidator($validator, $selector);
    }


    /**
     * Creates JsValidator instance based on Validator
     *
     * @param ValidatorContract $validator
     * @param string|null $selector
     * @return Manager
     */
    protected function createValidator(ValidatorContract $validator, $selector=null)
    {
        if (!empty($selector)) {
            $this->js->setSelector($selector);
        }
        $this->js->setValidator($validator);

        return $this->js;
    }


}
