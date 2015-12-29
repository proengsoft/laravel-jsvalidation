<?php

namespace Proengsoft\JsValidation;
use Mockery as m;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Proengsoft\JsValidation\Exceptions\FormRequestArgumentException;

class MockFormRequest /*extends \Illuminate\Foundation\Http\FormRequest */ {


    public function rules () {}

    public static function createFromBase(\Symfony\Component\HttpFoundation\Request $request) {
        $mockedRequest = m::mock('\Symfony\Component\HttpFoundation\Request');
        $mockedRequest->shouldReceive('all')->andReturn([])
            ->shouldReceive('setUserResolver')
            ->shouldReceive('setRouteResolver')
            ->shouldReceive('messages')->andReturn([])
            ->shouldReceive('attributes')->andReturn([])
            ->shouldReceive('setSession');

        return $mockedRequest;

    }

}
class JsValidatorFactoryTest extends \PHPUnit_Framework_TestCase
{

    public function testMake() {
        $rules=['name'=>'required'];
        $messages = [];
        $customAttributes = [];
        $selector = null;


        $mockValidator = $this->getMock(
            '\Illuminate\Validation\Validator',['addCustomAttributes'],
            [], '', false
        );
        $mockValidator->expects($this->once())
            ->method('addCustomAttributes')
            ->with($customAttributes);


        $mockFactory = $this->getMock(
            'Illuminate\Contracts\Validation\Factory',
            ['make','extend','extendImplicit','replacer'], [], '', false
        );
        $mockFactory->expects($this->once())
            ->method('make')
            ->with([], $rules, $messages, $customAttributes)
            ->willReturn($mockValidator);


        $app = $this->getMock('\Illuminate\Container\Container');
        $app->expects($this->once())
            ->method('make')
            ->with(ValidationFactory::class)
            ->willReturn($mockFactory);

        $app->expects($this->at(1))
            ->method('__get')
            ->with('session')
            ->willReturn(null);

        $app->expects($this->at(2))
            ->method('__get')
            ->with('encrypter')
            ->willReturn(null);

        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';

        $factory = new JsValidatorFactory($app, $options);

        $jsValidator = $factory->make($rules, $messages, $customAttributes, $selector);

        $this->assertInstanceOf('Proengsoft\JsValidation\Javascript\JavascriptValidator', $jsValidator);

    }


    public function testMakeWithToken() {
        $rules=['name'=>'required'];
        $messages = [];
        $customAttributes = [];
        $selector = null;


        $mockValidator = $this->getMock(
            '\Illuminate\Validation\Validator',['addCustomAttributes'],
            [], '', false
        );
        $mockValidator->expects($this->once())
            ->method('addCustomAttributes')
            ->with($customAttributes);


        $mockFactory = $this->getMock(
            'Illuminate\Contracts\Validation\Factory',
            ['make','extend','extendImplicit','replacer'], [], '', false
        );
        $mockFactory->expects($this->once())
            ->method('make')
            ->with([], $rules, $messages, $customAttributes)
            ->willReturn($mockValidator);


        $app = $this->getMock('\Illuminate\Container\Container');
        $app->expects($this->once())
            ->method('make')
            ->with(ValidationFactory::class)
            ->willReturn($mockFactory);

        $sessionMock = $this->getMock('stdObject',['token']);
        $sessionMock->expects($this->once())
            ->method('token')
            ->willReturn('token');

        $app->expects($this->at(1))
            ->method('__get')
            ->with('session')
            ->willReturn($sessionMock);

        $encrypterMock = $this->getMock('stdObject',['encrypt']);
        $encrypterMock->expects($this->once())
            ->method('encrypt')
            ->with('token')
            ->willReturn('encrypted token');

        $app->expects($this->at(2))
            ->method('__get')
            ->with('encrypter')
            ->willReturn($encrypterMock);

        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';

        $factory = new JsValidatorFactory($app, $options);

        $jsValidator = $factory->make($rules, $messages, $customAttributes, $selector);

        $this->assertInstanceOf('Proengsoft\JsValidation\Javascript\JavascriptValidator', $jsValidator);

    }

    public function testCreateFromFormRequestInstance() {
        $rules=['name'=>'required'];
        $messages = [];
        $customAttributes = [];
        $selector = null;

        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';

        $mockValidator = $this->getMock(
            '\Illuminate\Validation\Validator',['addCustomAttributes'],
            [], '', false
        );
        $mockValidator->expects($this->once())
            ->method('addCustomAttributes')
            ->with($customAttributes);


        $mockFactory = $this->getMock(
            'Illuminate\Contracts\Validation\Factory',
            ['make','extend','extendImplicit','replacer'], [], '', false
        );
        $mockFactory->expects($this->once())
            ->method('make')
            ->with([], [], $messages, $customAttributes)
            ->willReturn($mockValidator);


        $app = $this->getMock('\Illuminate\Container\Container');
        $app->expects($this->once())
            ->method('make')
            ->with(ValidationFactory::class)
            ->willReturn($mockFactory);


        $mockFormRequest=m::mock('Illuminate\Foundation\Http\FormRequest');
        $mockFormRequest->shouldReceive('rules')->once()->andReturn($rules);
        $mockFormRequest->shouldReceive('messages')->once()->andReturn([]);
        $mockFormRequest->shouldReceive('attributes')->once()->andReturn([]);


        $factory = new JsValidatorFactory($app, $options);

        $jsValidator = $factory->formRequest($mockFormRequest, $selector);


        $this->assertInstanceOf('Proengsoft\JsValidation\Javascript\JavascriptValidator', $jsValidator);
    }


    public function testCreateFromFormRequestClassName() {
        $rules=['name'=>'required'];
        $messages = [];
        $customAttributes = [];
        $selector = null;

        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';

        $mockValidator = $this->getMock(
            '\Illuminate\Validation\Validator',['addCustomAttributes'],
            [], '', false
        );
        $mockValidator->expects($this->once())
            ->method('addCustomAttributes')
            ->with($customAttributes);


        $mockFactory = $this->getMock(
            'Illuminate\Contracts\Validation\Factory',
            ['make','extend','extendImplicit','replacer'], [], '', false
        );
        $mockFactory->expects($this->once())
            ->method('make')
            ->with([], [], $messages, $customAttributes)
            ->willReturn($mockValidator);


        $app = $this->getMock('\Illuminate\Container\Container');
        $app->expects($this->once())
            ->method('make')
            ->with(ValidationFactory::class)
            ->willReturn($mockFactory);

        $sessionMock = $this->getMock('Symfony\Component\HttpFoundation\Session\SessionInterface',[]);


        $mockedRequest = m::mock('\Symfony\Component\HttpFoundation\Request');
        $mockedRequest->shouldReceive('getSession')->andReturn($sessionMock)
            ->shouldReceive('getUserResolver')->andReturn(function(){})
            ->shouldReceive('getRouteResolver')->andReturn(function(){});

        //$requestMock= $this->getMock('\Symfony\Component\HttpFoundation\Request',['getUserResolver']);
        /*
        $app->expects($this->at(0))
            ->method('__get')
            ->with('request')
            ->willReturn($mockedRequest);
        */

        $factory = new JsValidatorFactory($app, $options);

        $mockForm = $this->getMockForAbstractClass('\Illuminate\Foundation\Http\FormRequest');
        $jsValidator = $factory->formRequest($mockForm , $selector);

        $this->assertInstanceOf('Proengsoft\JsValidation\Javascript\JavascriptValidator', $jsValidator);
    }

    public function testFormRequestException() {
        $app = $this->getMock('\Illuminate\Container\Container');
        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';

        try {
            $mock=m::mock('Object');
            $factory = new JsValidatorFactory($app, $options);

            $js=$factory->formRequest($mock);
            $this->assertNotInstanceOf('Proengsoft\JsValidation\Javascript\JavascriptValidator',$js);
        }
        catch (FormRequestArgumentException $expected) {
            $this->assertTrue(true);
            return;
        }

        $this->fail('An expected exception has not been raised.');


    }


}
