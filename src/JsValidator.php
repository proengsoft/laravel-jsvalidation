<?php namespace Proengsoft\JQueryValidation;


use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Proengsoft\JQueryValidation\Exceptions\PropertyNotFoundException;

class JsValidator implements Arrayable {

    /**
     * @var Validator
     */
    protected $validator;

    protected $selector ;

    /**
     * @var
     */
    private $view;


    public function __construct(ValidatorContract $validator, $selector, $view) {

        $this->validator=$validator;
        $this->selector=$selector;
        $this->view = $view;
    }

    public function render($view=null)
    {
        $view=is_null($view)?$this->view:$view;
        return view($view, ['validator'=>$this->getViewData()])->render();
    }



    /**
     * Get the view data as an array.
     *
     * @return array
     */
    public function toArray()
    {
        return $this->getViewData();
    }


    public function __toString()
    {
        return $this->render();
    }

    /**
     * Gets value from view data
     *
     * @param $name
     * @return mixed
     * @throws PropertyNotFoundException
     */
    public function __get($name)
    {
        $data=$this->getViewData();
        if (array_key_exists($name,$data)) {
            return $data['name'];
        } else {
            throw new PropertyNotFoundException($name, get_class());
        }
    }


    protected function getViewData()
    {
        $data= [
            'selector' => $this->selector
        ];
        return array_merge($data,$this->validator->js());
    }

}