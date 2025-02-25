<?php

namespace Proengsoft\JsValidation\Tests;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Mockery;
use Proengsoft\JsValidation\Remote\Validator;
use Proengsoft\JsValidation\RemoteValidationMiddleware;

class RemoteValidationMiddlewareTest extends TestCase
{
    public function testHandle()
    {
        $mockedFactory = Mockery::mock(\Illuminate\Contracts\Validation\Factory::class);
        $mockedFactory->resolver = function(){};
        $mockedFactory->shouldReceive('resolver')->once()->with(Mockery::type(\Closure::class));
        $mockedFactory->shouldReceive('extend')->once()->with(Validator::EXTENSION_NAME, Mockery::type(\Closure::class));

        $this->app['config']->set('jsvalidation.remote_validation_field', '_jsvalidation');
        $this->app['config']->set('jsvalidation.escape', '_jsvalidation');

        $mockedRequest = new Request(['_jsvalidation' => true]);

        $stubClosure = function () {return true; };

        $middleware = new RemoteValidationMiddleware($mockedFactory, $this->app['config']);
        $result = $middleware->handle($mockedRequest, $stubClosure);

        $this->assertTrue($result);
    }


    public function testHandleShouldNotValidate()
    {
        $mockedFactory = $this->getMockBuilder(\Illuminate\Contracts\Validation\Factory::class)
            ->disableOriginalConstructor()
            ->getMock();

        $this->app['config']->set('jsvalidation.remote_validation_field', '_jsvalidation');
        $this->app['config']->set('jsvalidation.escape', '_jsvalidation');

        $mockedRequest = new Request;

        $stubClosure = function () {return true;};

        $middleware = new RemoteValidationMiddleware($mockedFactory, $this->app['config']);
        $result = $middleware->handle($mockedRequest, $stubClosure);

        $this->assertTrue($result);
    }
}
