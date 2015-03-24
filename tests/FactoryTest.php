<?php namespace Proengsoft\JsValidation\Test;

use Mockery;
use Proengsoft\JsValidation\Factory;

class FactoryTest extends \PHPUnit_Framework_TestCase {


    public $mockedFactory;
    public $mockedValidator;
    public $factory;
    protected $mockedJs;


    public function tearDown()
    {
        Mockery::close();
    }


    public function setUp() {

        $this->mockedFactory =  Mockery::mock('Illuminate\Contracts\Validation\Factory');
        $this->mockedJs= Mockery::mock('Proengsoft\JsValidation\JsValidator');
        $this->mockedJs->shouldReceive('setValidator');
        $this->factory=new Factory($this->mockedFactory,$this->mockedJs);

    }


    public function testMake() {

        $rules=['name'=>'required'];

        $this->mockedFactory->shouldReceive('make')
            ->once()
            ->with([],$rules,[],[])
            ->andReturn(
                Mockery::mock('Illuminate\Contracts\Validation\Validator')
            );
        $this->mockedJs->shouldReceive('setSelector')->once()->andReturn('form');

        $js=$this->factory->make($rules,[],[],'form');

        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }


    public function testFormRequestFromInstance() {

        $mockFormRequest=Mockery::mock('Illuminate\Foundation\Http\FormRequest');
        $mockFormRequest->shouldReceive('rules')->once()->andReturn(['name'=>'require']);
        $mockFormRequest->shouldReceive('messages')->once()->andReturn([]);

        $this->mockedFactory->shouldReceive('make')
            ->once()
            ->andReturn(
                Mockery::mock('Illuminate\Contracts\Validation\Validator')
            );

        $js=$this->factory->formRequest($mockFormRequest);

        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }

/*
    public function testFormRequestFromString() {

        $mockFormRequest=Mockery::mock('Illuminate\Foundation\Http\FormRequest');

        $this->mockedFactory->shouldReceive('make')
            ->once()
            ->andReturn(
                Mockery::mock('Illuminate\Contracts\Validation\Validator')
            );

        $js=$this->factory->formRequest('Proengsoft\JsValidation\Test\Requests\FormRequest');
        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }
*/

    /**
     * @expectedException \Proengsoft\JsValidation\Exceptions\FormRequestArgumentException
     */
    public function testFormRequestException() {

        $mock=Mockery::mock('Object');

        $js=$this->factory->formRequest($mock);
        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }

    public function testValidator()
    {
        $validator=Mockery::mock('Illuminate\Contracts\Validation\Validator');
        $js=$this->factory->validator($validator);
        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }

}
