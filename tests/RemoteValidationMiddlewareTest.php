<?php

namespace Proengsoft\JsValidation\Tests;

use Illuminate\Support\Facades\Config;
use Proengsoft\JsValidation\Remote\Validator;
use Proengsoft\JsValidation\RemoteValidationMiddleware;

class RemoteValidationMiddlewareTest extends TestCase
{
    public function testHandle()
    {
        $mockedFactory = $this->getMockBuilder(\Illuminate\Contracts\Validation\Factory::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['extend','make','extendImplicit','replacer'])
            ->addMethods(['resolver'])
            ->getMock();
        $mockedFactory->resolver = function(){};
        $mockedFactory->expects($this->once())
            ->method('resolver')
            ->with($this->isInstanceOf(\Closure::class));

        $mockedFactory->expects($this->once())
            ->method('extend')
            ->with(Validator::EXTENSION_NAME, $this->isInstanceOf('Closure'));

        $this->app['config']->set('jsvalidation.remote_validation_field', '_jsvalidation');
        $this->app['config']->set('jsvalidation.escape', '_jsvalidation');

        $mockedRequest = $this->getMockBuilder(\Illuminate\Http\Request::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['has'])
            ->getMock();

        $mockedRequest->expects($this->once())
            ->method('has')
            ->with('_jsvalidation')
            ->willReturn(true);

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

        $mockedRequest = $this->getMockBuilder(\Illuminate\Http\Request::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['has'])
            ->getMock();

        $mockedRequest->expects($this->once())
            ->method('has')
            ->with('_jsvalidation')
            ->willReturn(false);

        $stubClosure = function () {return true;};

        $middleware = new RemoteValidationMiddleware($mockedFactory, $this->app['config']);
        $result = $middleware->handle($mockedRequest, $stubClosure);

        $this->assertTrue($result);
    }
}
