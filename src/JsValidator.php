<?php namespace Proengsoft\JsValidation;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Proengsoft\JsValidation\Exceptions\PropertyNotFoundException;

class JsValidator implements Arrayable
{

    /**
     * Registered validator instance
     *
     * @var \Illuminate\Contracts\Validation\Validator
     */
    protected $validator;

    /**
     * Selector used in javascript generation
     *
     * @var string
     */
    protected $selector ;

    /**
     * View that renders Javascript
     *
     * @var
     */
    private $view;

    /**
     * @param ValidatorContract $validator
     * @param string $selector
     * @param string $view
     */
    public function __construct(ValidatorContract $validator, $selector, $view)
    {
        $this->validator=$validator;
        $this->selector=$selector;
        $this->view = $view;
    }

    /**
     * Render the specified view with validator data
     *
     * @param mixed $view
     * @return string
     */
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


    /**
     * Get the string resulting of render default view
     *
     * @return string
     */
    public function __toString()
    {
        try {
            return $this->render();
        } catch (\Exception $e) {
            return '';
        }
    }

    /**
     * Gets value from view data
     *
     * @param $name
     * @return string
     * @throws PropertyNotFoundException
     */
    public function __get($name)
    {
        $data=$this->getViewData();
        if (array_key_exists($name, $data)) {
            return $data[$name];
        } else {
            throw new PropertyNotFoundException($name, get_class());
        }
    }


    /**
     *  Gets view data
     *
     * @return array
     */
    protected function getViewData()
    {
        $data= [
            'selector' => $this->selector
        ];
        return array_merge($data, $this->validator->js());
    }
}
