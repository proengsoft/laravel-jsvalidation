<?php namespace Proengsoft\JsValidation\Test;

use Mockery as m;
use Proengsoft\JsValidation\Exceptions\PropertyNotFoundException;
use Proengsoft\JsValidation\JsValidator;
use Illuminate\Support\Facades\View;


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

        $this->mockValidator->shouldReceive('js')->once();


        View::shouldReceive('make')
            ->with('jsvalidator::bootstrap',['validator'=>['selector'=>$this->form]])
            ->once()
            ->andReturn(
                m::mock('Illuminate\Contracts\View\Factory')
                    ->shouldReceive('render')
                    ->once()
                    ->andReturn('return')
                    ->getMock());


        $txt=$this->jsValidator->render();
        $this->assertEquals('return',$txt);
    }

    public function  testToArray()
    {
        $expected=['selector'=>$this->form];

        $this->mockValidator->shouldReceive('js')->once();

        $viewData=$this->jsValidator->toArray();
        $this->assertEquals($expected,$viewData);

    }

    /**
     * @depends testToArray
     */
    public function testToString()
    {
        $this->testRender();
    }


    public function testToStringExceptionCatch()
    {

        $this->mockValidator->shouldReceive('js')->once();

        View::shouldReceive('make')
            ->with('jsvalidator::bootstrap',['validator'=>['selector'=>$this->form]])
            ->once()
            ->andThrow('\Exception');

        $txt=$this->jsValidator->__toString();
        $this->assertEquals('',$txt);

    }

    public function testGet()
    {
        $this->mockValidator->shouldReceive('js')->once();

        $this->assertEquals($this->form,$this->jsValidator->selector);
    }


    public function testGetException()
    {
        $this->mockValidator->shouldReceive('js')->once();
        
        try {
            $this->jsValidator->property_not_found;
        }
        catch (PropertyNotFoundException $expected) {
            $this->assertTrue(true);
            return;
        }

        $this->fail('An expected exception has not been raised.');


    }

    public function testGetViewDataFails()
    {
        unset($this->mockValidator);
        $this->mockValidator=m::mock('Illuminate\Contracts\Validation\Validator');
        $this->jsValidator->setValidator($this->mockValidator);

        $expected=[];
        $viewData=$this->jsValidator->toArray();

        $this->assertEquals($expected,$viewData);
    }


}
