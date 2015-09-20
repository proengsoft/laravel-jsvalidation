<?php namespace Proengsoft\JsValidation\Test;

use Mockery as m;
use Proengsoft\JsValidation\Exceptions\PropertyNotFoundException;
use Proengsoft\JsValidation\Manager;
use Illuminate\Support\Facades\View;


function view() {


    return m::mock('Illuminate\Contracts\View');
}

class ManagerTest extends \PHPUnit_Framework_TestCase {

    public $jsValidator;
    public $mockValidator;

    public $form = 'form';
    public $view = 'jsvalidator::bootstrap';

    public function setUp()
    {

        $this->mockValidator=m::mock('Proengsoft\JsValidation\Validator');
        $this->jsValidator=new Manager($this->form,$this->view);
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

        $this->mockValidator->shouldReceive('validationData')->once();


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

        $this->mockValidator->shouldReceive('validationData')->once();

        $viewData=$this->jsValidator->toArray();
        $this->assertEquals($expected,$viewData);

    }

    /**
     * @depends testToArray
     */
    public function testToString()
    {
        $this->mockValidator->shouldReceive('validationData')->twice();

        $txt=$this->jsValidator->__toString();
        $this->assertEquals($this->jsValidator->render(),$txt);
    }



    public function testGet()
    {
        $this->mockValidator->shouldReceive('validationData')->once();

        $this->assertEquals($this->form,$this->jsValidator->selector);
    }


    public function testGetException()
    {
        $this->mockValidator->shouldReceive('validationData')->once();
        
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
        $this->mockValidator=m::mock('Proengsoft\JsValidation\Validator');
        $this->jsValidator->setValidator($this->mockValidator);

        $this->mockValidator->shouldReceive('validationData')->once();

        $expected=['selector' =>'form'];
        $viewData=$this->jsValidator->toArray();
        $this->assertEquals($expected,$viewData);
    }


}
