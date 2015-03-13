<?php namespace Proengsoft\JQueryValidation;


use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;

class JsValidator implements Arrayable {

    /**
     * @var Validator
     */
    protected $validator;

    protected $selector ;

    public function __construct($selector='form') {
        $this->selector=$selector;
    }


    public function validator(ValidatorContract $validator, $selector=null) {
        $selector=is_null($selector)?$this->selector:$selector;
        $this->validator=$validator;
        $this->selector=$selector;
        return $this;
    }

    public function rules( array $rules, array $messages = array(), array $customAttributes = array(), $selector=null)
    {
        return $this->validator($this->make($rules,$messages,$customAttributes), $selector);
    }

    protected function make( array $rules, array $messages = array(), array $customAttributes = array())
    {
        $factory=app('Illuminate\Contracts\Validation\Factory');
        return $factory->make([], $rules, $messages,$customAttributes);
    }

    public function formRequest($fromRequest, $selector=null) {

        if (is_string($fromRequest)) {
            $fromRequest = new $fromRequest;
        }

        return $this->validator($this->make($fromRequest->rules(),$fromRequest->messages()),$selector);
    }


    public function render($view=null)
    {
        $view=is_null($view)?config('jsvalidation.default_view'):$view;
        return view($view, ['validator'=>$this->getViewData()])->render();
    }

    protected function getViewData()
    {
        $data= [
            'selector' => $this->selector
        ];
        return array_merge($data,$this->validator->js());
    }

    public function __toString()
    {
        return $this->render();
    }


    /**
     * Get the instance as an array.
     *
     * @return array
     */
    public function toArray()
    {
        return $this->getViewData();
    }
}