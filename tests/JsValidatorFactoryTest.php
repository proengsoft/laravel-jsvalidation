<?php

namespace Proengsoft\JsValidation\Tests;
use Mockery as m;
use Proengsoft\JsValidation\Exceptions\FormRequestArgumentException;
use Proengsoft\JsValidation\JsValidatorFactory;

require_once __DIR__.'/stubs/JsValidatorFactoryTest.php';

class JsValidatorFactoryTest extends \PHPUnit_Framework_TestCase
{
    protected function mockedApp($rules, $messages, $customAttributes, $data = [])
    {
        $mockValidator = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->disableOriginalConstructor()
            ->setMethods(['addCustomAttributes'])
            ->getMock();

        $mockValidator->expects($this->once())
            ->method('addCustomAttributes')
            ->with($customAttributes);

        $mockFactory = $this->getMockBuilder(\Illuminate\Contracts\Validation\Factory::class)
            ->disableOriginalConstructor()
            ->setMethods(['make','extend','extendImplicit','replacer'])
            ->getMock();

        $mockFactory->expects($this->once())
            ->method('make')
            ->with($data, $rules, $messages, $customAttributes)
            ->willReturn($mockValidator);


        $app = $this->getMockBuilder(\Illuminate\Container\Container::class)
            ->getMock();
        $app->expects($this->once())
            ->method('make')
            ->with(\Illuminate\Contracts\Validation\Factory::class)
            ->willReturn($mockFactory);

        return $app;
    }

    public function testMake()
    {
        $rules=['name'=>'required'];
        $messages = [];
        $customAttributes = [];
        $selector = null;

        $app = $this->mockedApp($rules, $messages, $customAttributes);

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

        $this->assertInstanceOf(\Proengsoft\JsValidation\Javascript\JavascriptValidator::class, $jsValidator);
    }

    public function testMakeArrayRules()
    {
        $rules=['name.*'=>'required'];
        $data['name']['*']=true;
        $messages = [];
        $customAttributes = [];
        $selector = null;

        $app = $this->mockedApp($rules, $messages, $customAttributes, $data);

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

        $this->assertInstanceOf(\Proengsoft\JsValidation\Javascript\JavascriptValidator::class, $jsValidator);
    }

    public function testMakeArrayRulesAndAttributes()
    {
        $rules=['name.*'=>'required'];
        $data['name']['*']=true;
        $data['name']['key0']=true;
        $messages = [];
        $customAttributes = ['name.*'=>'Name', 'name.key0'=>'Name Key 0'];
        $selector = null;

        $app = $this->mockedApp($rules, $messages, $customAttributes, $data);

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

        $this->assertInstanceOf(\Proengsoft\JsValidation\Javascript\JavascriptValidator::class, $jsValidator);
    }

    public function testMakeWithToken()
    {
        $rules=['name'=>'required'];
        $messages = [];
        $customAttributes = [];
        $selector = null;

        $sessionMock = $this->getMockBuilder('stdObject')
            ->setMethods(['token'])
            ->getMock();
        $sessionMock->expects($this->once())
            ->method('token')
            ->willReturn('token');

        $app = $this->mockedApp($rules, $messages, $customAttributes);

        $app->expects($this->at(1))
            ->method('__get')
            ->with('session')
            ->willReturn($sessionMock);

        $encrypterMock = $this->getMockBuilder('stdObject')
            ->setMethods(['encrypt'])
            ->getMock();
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

        $this->assertInstanceOf(\Proengsoft\JsValidation\Javascript\JavascriptValidator::class, $jsValidator);
    }

    public function testCreateFromFormRequestInstance()
    {
        $rules=[];
        $messages = [];
        $customAttributes = [];
        $selector = null;

        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';

        $app = $this->mockedApp($rules, $messages, $customAttributes);

        $mockFormRequest=m::mock(\Illuminate\Foundation\Http\FormRequest::class);
        $mockFormRequest->shouldReceive('rules')->once()->andReturn($rules);
        $mockFormRequest->shouldReceive('messages')->once()->andReturn([]);
        $mockFormRequest->shouldReceive('attributes')->once()->andReturn([]);


        $factory = new JsValidatorFactory($app, $options);

        $jsValidator = $factory->formRequest($mockFormRequest, $selector);


        $this->assertInstanceOf(\Proengsoft\JsValidation\Javascript\JavascriptValidator::class, $jsValidator);
    }


    public function testCreateFromFormRequestClassName()
    {
        $rules=[];
        $messages = [];
        $customAttributes = [];
        $selector = null;

        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';


        $app = $this->mockedApp($rules, $messages, $customAttributes);

        $sessionMock = $this->getMockBuilder(\Symfony\Component\HttpFoundation\Session\SessionInterface::class)
            ->getMock();


        $mockedRequest = m::mock(\Symfony\Component\HttpFoundation\Request::class);
        $mockedRequest->shouldReceive('getSession')->andReturn($sessionMock)
            ->shouldReceive('getUserResolver')->andReturn(function(){})
            ->shouldReceive('getRouteResolver')->andReturn(function(){});

        //$requestMock= $this->getMock('\Symfony\Component\HttpFoundation\Request',['getUserResolver']);

        $app->expects($this->at(0))
            ->method('__get')
            ->with('request')
            ->willReturn($mockedRequest);


        $mockForm = $this->getMockForAbstractClass(\Illuminate\Foundation\Http\FormRequest::class,[],'',true,true,true,['messages','attributes']);
        $mockForm->expects($this->once())
            ->method('messages')
            ->willReturn([]);
        $mockForm->expects($this->once())
            ->method('attributes')
            ->willReturn([]);

        $app->expects($this->once())
            ->method('build')
            ->with(\Proengsoft\JsValidation\Tests\StubFormRequest::class)
            ->willReturn($mockForm);

        $factory = new JsValidatorFactory($app, $options);

        $jsValidator = $factory->formRequest([\Proengsoft\JsValidation\Tests\StubFormRequest::class] , $selector);

        $this->assertInstanceOf(\Proengsoft\JsValidation\Javascript\JavascriptValidator::class, $jsValidator);
    }
}
