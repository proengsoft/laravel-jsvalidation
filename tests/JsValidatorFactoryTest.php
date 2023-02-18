<?php

namespace Proengsoft\JsValidation\Tests;

use Mockery as m;
use Proengsoft\JsValidation\Javascript\JavascriptValidator;
use Proengsoft\JsValidation\JsValidatorFactory;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

require_once __DIR__.'/stubs/JsValidatorFactoryTest.php';

class JsValidatorFactoryTest extends TestCase
{
    protected function mockedApp($rules, $messages, $customAttributes, $data = [])
    {
        $mockValidator = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['addCustomAttributes'])
            ->getMock();

        $mockValidator->expects($this->once())
            ->method('addCustomAttributes')
            ->with($customAttributes);

        $mockFactory = $this->getMockBuilder(\Illuminate\Contracts\Validation\Factory::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['make','extend','extendImplicit','replacer'])
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

        $options = $this->app['config']->get('jsvalidation');
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

        $jsValidator = $this->app['jsvalidator']->make($rules);
        $this->assertEquals([
            "name[*]" => [
                "laravelValidation" => [
                    [
                        "Required",
                        [],
                        "The name.* field is required.",
                        true,
                        "name[*]",
                    ]
                ]
            ]
        ], $jsValidator->toArray()['rules']);
    }

    public function testMakeArrayRulesAndAttributes()
    {
        $rules=['name.*'=>'required'];
        $data['name']['*']=true;
        $data['name']['key0']=true;
        $messages = [];
        $customAttributes = ['name.*'=>'Name', 'name.key0'=>'Name Key 0'];
        $selector = null;

        $jsValidator = $this->app['jsvalidator']->make($rules, $messages, $customAttributes, $data);
        $this->assertEquals([
            "name[*]" => [
                "laravelValidation" => [
                    [
                        "Required",
                        [],
                        "The Name field is required.",
                        true,
                        "name[*]",
                    ]
                ]
            ],
            "name[key0]" => [
                "laravelValidation" => [
                    [
                        "Required",
                        [],
                        "The Name Key 0 field is required.",
                        true,
                        "name[key0]",
                    ]
                ]
            ]
        ], $jsValidator->toArray()['rules']);
    }

    public function testMakeWithToken()
    {
        $rules=['name'=>'required'];
        $messages = [];
        $customAttributes = [];
        $selector = null;

        $sessionMock = $this->getMockBuilder('stdObject')
            ->onlyMethods(['token'])
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
            ->onlyMethods(['encrypt'])
            ->getMock();
        $encrypterMock->expects($this->once())
            ->method('encrypt')
            ->with('token')
            ->willReturn('encrypted token');

        $app->expects($this->at(2))
            ->method('__get')
            ->with('encrypter')
            ->willReturn($encrypterMock);

        $options = $this->app['config']->get('jsvalidation');
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

        $options = $this->app['config']->get('jsvalidation');
        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';

        $app = $this->mockedApp($rules, $messages, $customAttributes);

        $mockFormRequest=m::mock(\Illuminate\Foundation\Http\FormRequest::class);
        $mockFormRequest->shouldReceive('rules')->andReturn($rules);
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

        $options = $this->app['config']->get('jsvalidation');
        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';


        $app = $this->mockedApp($rules, $messages, $customAttributes);

        $sessionMock = $this->getMockBuilder(SessionInterface::class)
            ->getMock();


        $mockedRequest = m::mock(\Symfony\Component\HttpFoundation\Request::class);
        $mockedRequest->shouldReceive('getSession')->andReturn($sessionMock)
            ->shouldReceive('getUserResolver')->andReturn(function(){})
            ->shouldReceive('getRouteResolver')->andReturn(function(){});

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

    public function testCreateFromFormRequestClassNameNew()
    {
        $this->startSession();
        $this->app['request']->setLaravelSession($this->app['session.store']);

        /** @var JavascriptValidator $jsValidator */
        $jsValidator = app('jsvalidator')->formRequest(StubFormRequest2::class);
        $data = $jsValidator->toArray();

        $this->assertCount(2, $data['rules']);
        $this->assertArrayHasKey('name', $data['rules']);
        $this->assertArrayHasKey('laravelValidation', $data['rules']['name']);
        $this->assertArrayHasKey('proengsoft_jsvalidation', $data['rules']);
        $this->assertArrayHasKey('laravelValidationFormRequest', $data['rules']['proengsoft_jsvalidation']);
    }
}
