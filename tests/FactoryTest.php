<?php namespace Proengsoft\JsValidation\Test;

use Mockery;
use Proengsoft\JsValidation\Factory as JsValidationFactory;
use Proengsoft\JsValidation\Factory;
use Proengsoft\JsValidation\JsValidator;

class FactoryTest extends \PHPUnit_Framework_TestCase {

    /**
     * @var Mockery
     */
    public $validator;
    public $validatorContract;

    protected $app;

    protected $rules=['accepted' => 'accepted',
            'active_url' => 'active_url',
            'after' => 'after:"14 May"',
            'after_format' => 'after:"14 May"|date_format:Y-m-d',
            'alpha' => 'alpha',
            'alpha_dash' => 'alpha_dash',
            'alpha_num' => 'alpha_num',
            'array' => 'array',
            'before' => 'before:"+2 week"',
            'before_format' => 'before:"+2 week"|date_format:d/m/Y',
            'between' => 'between:3,5',
            'boolean' => 'boolean',
            'confirmed' => 'confirmed',
            'date' => 'date',
            'date_format' => 'date_format:d/m/Y',
            'different' => 'different:digits',
            'digits' => 'digits:2',
            'digits_between' => 'digits_between:3,9',
            'email' => 'email',
            'exists' => 'exists:migrations,migration',
            'image' => 'image',
            'in' => 'in:A,B,"CD"',
            'integer' => 'integer',
            'ip' => 'ip',
            'max' => 'max:100',
            'mimes' => 'mimes:png',
            'min' => 'min:5',
            'not_in' => 'not_in:Z,Y,"V V"',
            'numeric' => 'numeric',
            'regex' => 'regex:/[a-z]+/',
            'required' => 'required',
            'required_if' => 'required_if:alpha,aaaa',
            'required_with' => 'required_with:before,between',
            'required_with_all' => 'required_with_all:before,between',
            'required_without' => 'required_without:before,between',
            'required_without_all' => 'required_without_all:before,between',
            'same' => 'same:before',
            'size' => 'size:13',
            'size_numeric' => 'size:13|numeric',
            'string' => 'string:value',
            'timezone' => 'timezone',
            'unique' => 'unique:migrations,migration',
            'url' => 'url'];

    public $selector='form';
    public $messages=[];
    public $attributes=[];


    public $js;
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
        $mockFormRequest->shouldReceive('rules')->once()->andReturn([]);
        $mockFormRequest->shouldReceive('messages')->once()->andReturn([]);

        $this->mockedFactory->shouldReceive('make')
            ->once()
            ->andReturn(
                Mockery::mock('Illuminate\Contracts\Validation\Validator')
            );

        $js=$this->factory->formRequest($mockFormRequest);

        $this->assertInstanceOf('Proengsoft\JsValidation\JsValidator',$js);

    }


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
