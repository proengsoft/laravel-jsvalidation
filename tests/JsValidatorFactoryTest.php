<?php

namespace Proengsoft\JsValidation\Tests;

use Illuminate\Contracts\Validation\Factory;
use Mockery as m;
use Proengsoft\JsValidation\Javascript\JavascriptValidator;
use Proengsoft\JsValidation\JsValidatorFactory;
use Proengsoft\JsValidation\Tests\stubs\StubFormRequest;
use Proengsoft\JsValidation\Tests\stubs\StubFormRequest2;

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

        $mockFactory = $this->getMockBuilder(Factory::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['make','extend','extendImplicit','replacer'])
            ->getMock();

        $mockFactory->expects($this->once())
            ->method('make')
            ->with($data, $rules, $messages, $customAttributes)
            ->willReturn($mockValidator);

        $this->app->bind(Factory::class, function () use ($mockFactory) {
            return $mockFactory;
        });
    }

    public function testMake()
    {
        $rules=['name'=>'required'];
        $messages = [];
        $customAttributes = [];
        $selector = null;

        $this->mockedApp($rules, $messages, $customAttributes);

        $options = $this->app['config']->get('jsvalidation');
        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';

        $factory = new JsValidatorFactory($this->app, $options);

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

        $this->mockedApp($rules, $messages, $customAttributes);

        $options = $this->app['config']->get('jsvalidation');
        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';

        $factory = new JsValidatorFactory($this->app, $options);

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

        $this->mockedApp($rules, $messages, $customAttributes);

        $mockFormRequest=m::mock(\Illuminate\Foundation\Http\FormRequest::class);
        $mockFormRequest->shouldReceive('rules')->andReturn($rules);
        $mockFormRequest->shouldReceive('messages')->once()->andReturn([]);
        $mockFormRequest->shouldReceive('attributes')->once()->andReturn([]);


        $factory = new JsValidatorFactory($this->app, $options);

        $jsValidator = $factory->formRequest($mockFormRequest, $selector);


        $this->assertInstanceOf(\Proengsoft\JsValidation\Javascript\JavascriptValidator::class, $jsValidator);
    }


    public function testCreateFromFormRequestClassName()
    {
        $rules = (new StubFormRequest)->rules();
        $messages = [];
        $customAttributes = [];
        $selector = null;

        $options = $this->app['config']->get('jsvalidation');
        $options['disable_remote_validation'] = false;
        $options['view'] = 'jsvalidation::bootstrap';
        $options['form_selector'] = 'form';

        $this->mockedApp($rules, $messages, $customAttributes);

        $this->startSession();
        $this->app['request']->setLaravelSession($this->app['session.store']);

        $factory = new JsValidatorFactory($this->app, $options);

        $jsValidator = $factory->formRequest([StubFormRequest::class] , $selector);

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
