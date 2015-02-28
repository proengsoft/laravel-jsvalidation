<?php
/**
 * Created by PhpStorm.
 * User: Albert
 * Date: 28/02/2015
 * Time: 4:09
 */

namespace Proengsoft\JQueryValidation;


use \Illuminate\Contracts\Foundation\Application;

class JsValidator {

    /**
     * @var ValidationAdapter
     */
    protected $validator;

    protected $selector = 'form';
    /**
     * @var Application
     */
    private $app;

    public function __construct(ValidationAdapter $validator, Application $app)
    {
        $this->validator = $validator;
        $this->app = $app;
    }

    public function rules()
    {
        return $this->encode($this->validator->getJsRules());
    }

    public function messages()
    {
        return $this->encode($this->validator->getJsMessages());
    }

    public function formSelector()
    {
        return $this->selector;
    }

    public function generate($selector = null)
    {
        $selector = is_null($selector)?$this->selector:$selector;
        $viewToRender='jsvalidation::botstrap.jqueryvalidation.blade.php';

        return view();

    }

    protected function getViewData()
    {
        return [
            'rules' => $this->rules(),
            'messages' => $this->messages(),
        ];
    }

    protected function encode($data)
    {
        return json_encode($data);
    }



}