<?php

namespace  Illuminate\Foundation\Http;
if (!class_exists('FormRequest')) {

    class  FormRequest {
        public function initialize(){}
        public function setSession(){}
        public function setUserResolver(){}
        public function setRouteResolver() {}
    }
}


namespace Proengsoft\JsValidation\Test;

use Mockery as m;
use Proengsoft\JsValidation\Exceptions\FormRequestArgumentException;
use Proengsoft\JsValidation\Factory;


class  FakeFormRequest extends \Illuminate\Foundation\Http\FormRequest {
    public function rules(){return ['name'=>'require'];}
    public function messages(){return [];}
    public function attributes(){return [];}
}



class FactoryTest extends \PHPUnit_Framework_TestCase {


    public $mockedFactory;
    public $mockedValidator;
    public $factory;
    public $mockedJs;
    public $mockedApp;
    /**
     * @var m\Mock
     */
    public  $mockedRequest;


    public function tearDown()
    {
        m::close();
        unset($this->mockedFactory);
        unset($this->mockedValidator);
        unset($this->factory);
        unset($this->mockedJs);
        unset($this->mockedRequest);
        unset($this->mockedApp);
    }


    public function setUp() {

        $this->mockedApp=m::mock('\Illuminate\Contracts\Foundation\Application');
        $this->mockedFactory =  m::mock('Illuminate\Contracts\Validation\Factory');
        $this->mockedJs= m::mock('Proengsoft\JsValidation\Manager');
        $this->mockedRequest= m::mock('Illuminate\Http\Request');
        $this->mockedJs->shouldReceive('setValidator');
        $this->mockedRequest->shouldReceive('all')->andReturn([]);
        $this->factory=new Factory($this->mockedFactory,$this->mockedJs,$this->mockedApp);

    }


    public function testMake() {

        $rules=['name'=>'required'];

        $this->mockedFactory->shouldReceive('make')
            ->once()
            ->with([],$rules,[],[])
            ->andReturn(
                m::mock('Illuminate\Contracts\Validation\Validator')
            );
        $this->mockedJs->shouldReceive('selector')->once()->andReturn('form');

        $js=$this->factory->make($rules,[],[],'form');

        $this->assertInstanceOf('Proengsoft\JsValidation\Manager',$js);

    }


    public function testFormRequestFromInstance() {

        $rules=['name'=>'require'];
        $mockFormRequest=m::mock('Illuminate\Foundation\Http\FormRequest');
        $mockFormRequest->shouldReceive('rules')->once()->andReturn($rules);
        $mockFormRequest->shouldReceive('messages')->once()->andReturn([]);
        $mockFormRequest->shouldReceive('attributes')->once()->andReturn([]);
        $this->mockedJs->shouldReceive('selector')->once()->andReturn('form');

        $this->mockedFactory->shouldReceive('make')
            ->once()
            ->with([],$rules,[],[])
            ->andReturn(
                m::mock('Illuminate\Contracts\Validation\Validator')
            );


        $js=$this->factory->formRequest($mockFormRequest);

        $this->assertInstanceOf('Proengsoft\JsValidation\Manager',$js);

    }


    public function testFormRequestFromClassName() {

        $rules=['name'=>'require'];
        $formRequest='Proengsoft\JsValidation\Test\FakeFormRequest';
        $mockSession=m::mock('\Symfony\Component\HttpFoundation\Session\SessionInterface');
        //$mockedRequest= m::mock('Illuminate\Http\Request');
        //$mockQuery=m::mock('Symfony\Component\HttpFoundation\ParameterBag')->shouldReceive('all')->andReturn([])->getMock();;
        $this->mockedRequest->query =m::mock()->shouldReceive('all')->andReturn([])->getMock();
        $this->mockedRequest->attributes =m::mock()->shouldReceive('all')->andReturn([])->getMock();
        $this->mockedRequest->cookies =m::mock()->shouldReceive('all')->andReturn([])->getMock();
        $this->mockedRequest->server =m::mock()->shouldReceive('all')->andReturn([])->getMock();
        $this->mockedRequest
            ->shouldReceive('all')->andReturn([])
            ->shouldReceive('getContent')->andReturn('')
            ->shouldReceive('getSession')->andReturn($mockSession)
            ->shouldReceive('setSession')->with($mockSession)
            ->shouldReceive('getUserResolver')->andReturn(function(){})
            ->shouldReceive('setUserResolver')
            ->shouldReceive('getRouteResolver')->andReturn(function(){})
            ->shouldReceive('setRouteResolver');

        $this->mockedRequest->request = $this->mockedRequest;
        $this->mockedApp->shouldReceive('offsetGet')->with('request')->andReturn($this->mockedRequest);




        //$mockFormRequest=m::mock('Illuminate\Foundation\Http\FormRequest');
        //$mockFormRequest->shouldReceive('rules')->once()->andReturn($rules);
        //$mockFormRequest->shouldReceive('messages')->once()->andReturn([]);
        //$mockFormRequest->shouldReceive('attributes')->once()->andReturn([]);
        $this->mockedJs->shouldReceive('selector')->once()->andReturn('form');


        $this->mockedFactory->shouldReceive('make')
            ->once()
            ->with([],$rules,[],[])
            ->andReturn(
                m::mock('Illuminate\Contracts\Validation\Validator')
            );

        //$factory=new Factory($this->mockedFactory,$this->mockedJs,$mockedRequest);
        $js=$this->factory->formRequest($formRequest);

        $this->assertInstanceOf('Proengsoft\JsValidation\Manager',$js);

    }


    public function testFormRequestException() {

        try {
            $mock=m::mock('Object');

            $js=$this->factory->formRequest($mock);
            $this->assertNotInstanceOf('Proengsoft\JsValidation\Manager',$js);
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
        $this->mockedJs->shouldReceive('selector')->once()->andReturn('form');

        $js=$this->factory->validator($validator);
        $this->assertInstanceOf('Proengsoft\JsValidation\Manager',$js);

    }

}
