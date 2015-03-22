<?php

namespace Proengsoft\JsValidation\Test;
use Mockery;
use Proengsoft\JsValidation\JsValidator;

class JsValidatorTest extends \PHPUnit_Framework_TestCase {

    public $jsValidator;
    public $mockValidator;

    public function setUp()
    {
        $this->mockValidator=Mockery::mock('Illuminate\Contracts\Validation\Validator');
        $this->jsValidator=new JsValidator('form','jsvalidator::bootstrap');
        $this->jsValidator->setValidator($this->mockValidator);
    }

    public function  testRender()
    {
        //$this->assertViewHas('dsdss');
    }


}
