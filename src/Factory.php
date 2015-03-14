<?php namespace Proengsoft\JQueryValidation;


use Illuminate\Contracts\Foundation\Application;
use Proengsoft\JQueryValidation\Exceptions\FormRequestArgumentException;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Contracts\Validation\Factory as FactoryContract;

class Factory {

    /**
     * The application instance.
     *
     * @var \Illuminate\Contracts\Validation\Factory
     */
    protected $validator;

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



    public function make( array $rules, array $messages = array(), array $customAttributes = array(), $selector=null)
    {
        $validator=$this->validator->make([], $rules, $messages,$customAttributes);
        return $this->createValidator($validator, $selector);
    }


    public function formRequest($formRequest, $selector=null) {

        if (!is_subclass_of($formRequest,"Illuminate\\Foundation\\Http\\FormRequest")) {
            $className=is_object($formRequest)?get_class($formRequest):(string)$formRequest;
            throw new FormRequestArgumentException($className);
        }

        $fromRequest= is_string($formRequest)? new $formRequest:$formRequest;
        $validator=$this->validator->make([], $fromRequest->rules(),$fromRequest->messages());

        return $this->createValidator($validator,$selector);

    }

    public function validator(ValidatorContract $validator, $selector=null) {

        return $this->createValidator($validator,$selector);

    }



    protected function createValidator(ValidatorContract $validator, $selector=null, $view=null) {

        $selector=$this->getSelector($selector);
        $view=$this->getView($view);

        return new JsValidator($validator, $selector, $view);

    }

    protected function getSelector($selector=null)
    {
        if (empty($selector)) {
            return $this->defaults["default_form_selector"];
        }
        return (string)$selector;
    }

    private function getView($view)
    {
        if (empty($view)) {
            return $this->defaults["default_view"];
        }
        return (string)$view;

    }


}