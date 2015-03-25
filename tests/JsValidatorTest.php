<?php

namespace Proengsoft\JsValidation\Test;
use Mockery as m;
use Proengsoft\JsValidation\JsValidator;
use Illuminate\Support\Facades\View;
use Illuminate\Contracts\View\Factory;


function view() {


    return m::mock('Illuminate\Contracts\View');
}

class JsValidatorTest extends \PHPUnit_Framework_TestCase {

    public $jsValidator;
    public $mockValidator;

    public $form = 'form';
    public $view = 'jsvalidator::bootstrap';

    public function setUp()
    {

        $this->mockValidator=m::mock('Proengsoft\JsValidation\Validator');
        $this->jsValidator=new JsValidator($this->form,$this->view);
        $this->jsValidator->setValidator($this->mockValidator);
    }

    public function tearDown()
    {
        m::close();
        unset($this->mockValidator);
        unset($this->jsValidator);

    }


    public function testRender()
    {

        $this->mockValidator->shouldReceive('js');


        View::shouldReceive('make')
            ->with('jsvalidator::bootstrap',['validator'=>['selector'=>$this->form]])
            ->once()
            ->andReturn(
                m::mock('Illuminate\Contracts\View\Factory','Illuminate\Contracts\Support\Renderable')
                    ->shouldReceive('render')
                    ->once()
                    ->andReturn('return')
                    ->getMock());


        $txt=$this->jsValidator->render();
        $this->assertEquals('return',$txt);
    }

    public function  testToArray()
    {
        $this->mockValidator->shouldReceive('js');
        $expected=['selector'=>$this->form];
        $viewData=$this->jsValidator->toArray();

        $this->assertEquals($expected,$viewData);

    }


    public function testToString()
    {
        $this->testRender();
    }


    public function testToStringExceptionCatch()
    {

        $this->mockValidator->shouldReceive('js');

        View::shouldReceive('make')
            ->with('jsvalidator::bootstrap',['validator'=>['selector'=>$this->form]])
            ->once()
            ->andThrow('\Exception');

        $txt=$this->jsValidator->__toString();
        $this->assertEquals('',$txt);

    }

    public function testGet()
    {
        $this->mockValidator->shouldReceive('js');
        $this->assertEquals($this->form,$this->jsValidator->selector);
    }

    /**
     * @expectedException \Proengsoft\JsValidation\Exceptions\PropertyNotFoundException
     */
    public function testGetException()
    {
        $this->mockValidator->shouldReceive('js');
        $test=$this->jsValidator->property_not_found;
    }

    public function testGetViewDataFails()
    {
        $mockValidator=m::mock('Illuminate\Contracts\Validation\Validator');
        $this->jsValidator->setValidator($mockValidator);

        $expected=[];
        $viewData=$this->jsValidator->toArray();

        $this->assertEquals($expected,$viewData);
    }


}
