<?php namespace Proengsoft\JsValidation\Test;

use Mockery as m;
use Proengsoft\JsValidation\Exceptions\FormRequestArgumentException;
use Proengsoft\JsValidation\Factory;

class FactoryTest extends \PHPUnit_Framework_TestCase {


    public $mockedFactory;
    public $mockedValidator;
    public $factory;
    public $mockedJs;


    public function tearDown()
    {
        m::close();
        unset($this->mockedFactory);
        unset($this->mockedValidator);
        unset($this->factory);
        unset($this->mockedJs);
    }


    public function setUp() {

        $this->mockedFactory =  m::mock('Illuminate\Contracts\Validation\Factory');
        $this->mockedJs= m::mock('Proengsoft\JsValidation\JsValidator');
        $this->mockedJs->shouldReceive('setValidator');
        $this->factory=new Factory($this->mockedFactory,$this->mockedJs);

    }


    public function testMake() {

        $rules=['name'=>'required'];

        $this->mockedFactory->shouldReceive('make')
            ->once()
            ->with([],$rules,[],[])
            ->andReturn(
                m::mock('Illuminate\Contracts\Validation\Validator')
            );
        $this->mockedJs->shouldReceive('setSelector')->once()->andReturn('form');

        $js=$this->factory->make($rules,[],[],'form');

        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }


    public function testFormRequestFromInstance() {

        $rules=['name'=>'require'];
        $mockFormRequest=m::mock('Illuminate\Foundation\Http\FormRequest');
        $mockFormRequest->shouldReceive('rules')->once()->andReturn($rules);
        $mockFormRequest->shouldReceive('messages')->once()->andReturn([]);
        $mockFormRequest->shouldReceive('attributes')->once()->andReturn([]);

        $this->mockedFactory->shouldReceive('make')
            ->once()
            ->with([],$rules,[],[])
            ->andReturn(
                m::mock('Illuminate\Contracts\Validation\Validator')
            );

        $js=$this->factory->formRequest($mockFormRequest);

        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }


    public function testFormRequestException() {

        try {
            $mock=m::mock('Object');

            $js=$this->factory->formRequest($mock);
            $this->assertNotInstanceOf('Proengsoft\JsValidation\JsValidator',$js);
        }
        catch (FormRequestArgumentException $expected) {
            $this->assertTrue(true);
            return;
        }

        $this->fail('An expected exception has not been raised.');


    }

    public function testValidator()
    {
        $validator=m::mock('Illuminate\Contracts\Validation\Validator');
        $js=$this->factory->validator($validator);
        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }

}
