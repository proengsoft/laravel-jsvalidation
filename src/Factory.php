<?php namespace Proengsoft\JQueryValidation;

use Proengsoft\JQueryValidation\Exceptions\FormRequestArgumentException;
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
    protected $defaults;

    /**
     * Create a new Validator factory instance.
     *
     * @param  \Illuminate\Contracts\Validation\Factory $validator
     * @param array $defaults
     */
    public function __construct(FactoryContract $validator, array $defaults)
    {
        $this->validator=$validator;
        $this->defaults=$defaults;
    }


    /**
     * Creates JsValidator instance based on rules and message arrays
     *
     * @param array $rules
     * @param array $messages
     * @param array $customAttributes
     * @param null|string $selector
     * @return \Proengsoft\JQueryValidation\JsValidator
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
     * @return JsValidator
     * @throws FormRequestArgumentException
     */
    public function formRequest($formRequest, $selector=null)
    {
        if (!is_subclass_of($formRequest, "Illuminate\\Foundation\\Http\\FormRequest")) {
            $className=is_object($formRequest)?get_class($formRequest):(string)$formRequest;
            throw new FormRequestArgumentException($className);
        }

        $fromRequest= is_string($formRequest)? new $formRequest:$formRequest;
        $validator=$this->validator->make([], $fromRequest->rules(), $fromRequest->messages());

        return $this->createValidator($validator, $selector);
    }

    /**
     * Creates JsValidator instance based on Validator
     *
     * @param ValidatorContract $validator
     * @param null $selector
     * @return JsValidator
     */
    public function validator(ValidatorContract $validator, $selector=null)
    {
        return $this->createValidator($validator, $selector);
    }


    /**
     * Creates JsValidator instance based on Validator
     *
     * @param ValidatorContract $validator
     * @param null $selector
     * @param null $view
     * @return JsValidator
     */
    protected function createValidator(ValidatorContract $validator, $selector=null, $view=null)
    {
        $selector=$this->getSelector($selector);
        $view=$this->getView($view);

        return new JsValidator($validator, $selector, $view);
    }

    /**
     * Gets the selector or default if is null
     *
     * @param null $selector
     * @return string
     */
    protected function getSelector($selector=null)
    {
        if (empty($selector)) {
            return $this->defaults["form_selector"];
        }
        return (string)$selector;
    }

    /**
     * Gets the view or default if is null
     *
     * @param $view
     * @return string
     */
    protected function getView($view)
    {
        if (empty($view)) {
            return $this->defaults["view"];
        }
        return (string)$view;
    }
}
