<?php namespace Proengsoft\JsValidation\Test;

use Mockery as m;
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

        $mockFormRequest=m::mock('Illuminate\Foundation\Http\FormRequest');
        $mockFormRequest->shouldReceive('rules')->once()->andReturn(['name'=>'require']);
        $mockFormRequest->shouldReceive('messages')->once()->andReturn([]);

        $this->mockedFactory->shouldReceive('make')
            ->once()
            ->andReturn(
                m::mock('Illuminate\Contracts\Validation\Validator')
            );

        $js=$this->factory->formRequest($mockFormRequest);

        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }

/*
    public function testFormRequestFromString() {

        $mockFormRequest=m::mock('Illuminate\Foundation\Http\FormRequest');

        $this->mockedFactory->shouldReceive('make')
            ->once()
            ->andReturn(
                m::mock('Illuminate\Contracts\Validation\Validator')
            );

        $js=$this->factory->formRequest('Proengsoft\JsValidation\Test\Requests\FormRequest');
        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }
*/

    /**
     * @expectedException \Proengsoft\JsValidation\Exceptions\FormRequestArgumentException
     */
    public function testFormRequestException() {

        $mock=m::mock('Object');

        $js=$this->factory->formRequest($mock);
        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }

    public function testValidator()
    {
        $validator=m::mock('Illuminate\Contracts\Validation\Validator');
        $js=$this->factory->validator($validator);
        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }

}
