<?php namespace Proengsoft\JsValidation;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Support\Facades\View;
use Proengsoft\JsValidation\Exceptions\PropertyNotFoundException;

class Manager implements Arrayable
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
     * @param string $selector
     * @param string $view
     */
    public function __construct($selector, $view)
    {
        $this->selector=$selector;
        $this->view = $view;
    }


    /**
     * Set Validation instance used to get rules and messages
     *
     * @param ValidatorContract $validator
     */
    public function setValidator(ValidatorContract $validator)
    {
        $this->validator = $validator;
    }

    /**
     * Render the specified view with validator data
     *
     * @param \Illuminate\Contracts\View\View|string|null $view
     * @param string|null $selector
     * @return string
     */
    public function render($view=null, $selector=null)
    {
        $view=is_null($view)?$this->view:$view;
        $this->setSelector(is_null($selector)?$this->selector:$selector);


        return View::make($view, ['validator'=>$this->getViewData()])
            ->render();
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
        return $this->render();
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

        if (method_exists($this->validator, 'js')) {
            $data= [
                'selector' => $this->selector
            ];

            return array_merge($data, (array)call_user_func([$this->validator, 'js']));
        }

        return array();
    }

    /**
     * @param string $selector
     */
    public function setSelector($selector)
    {
        $this->selector = $selector;
    }


}
