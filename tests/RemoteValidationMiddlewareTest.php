<?php

namespace Proengsoft\JsValidation\Tests;

use Proengsoft\JsValidation\Remote\Validator;
use Proengsoft\JsValidation\RemoteValidationMiddleware;

class RemoteValidationMiddlewareTest extends \PHPUnit_Framework_TestCase
{
    public function setUp()
    {

    }

    public function testHandle()
    {
        $mockedFactory = $this->getMockBuilder(\Illuminate\Contracts\Validation\Factory::class)
            ->disableOriginalConstructor()
            ->setMethods(['resolver','extend','make','extendImplicit','replacer'])
            ->getMock();
        $mockedFactory->resolver = function(){};
        $mockedFactory->expects($this->once())
            ->method('resolver')
            ->with($this->isInstanceOf(\Closure::class));

        $mockedFactory->expects($this->once())
            ->method('extend')
            ->with(Validator::EXTENSION_NAME, $this->isInstanceOf('Closure'));

        $mockedConfig = $this->getMockForAbstractClass(\Illuminate\Contracts\Config\Repository::class, [],'',false);
        $mockedConfig->expects($this->once())
            ->method('get')
            ->with('jsvalidation.remote_validation_field')
            ->will($this->returnValue('_jsvalidation'));

        $mockedRequest = $this->getMockBuilder(\Illuminate\Http\Request::class)
            ->disableOriginalConstructor()
            ->setMethods(['has'])
            ->getMock();

        $mockedRequest->expects($this->once())
            ->method('has')
            ->with('_jsvalidation')
            ->willReturn(true);

        $stubClosure = function () {return true; };

        $middleware = new RemoteValidationMiddleware($mockedFactory, $mockedConfig);
        $result = $middleware->handle($mockedRequest, $stubClosure);

        $this->assertTrue($result);
    }


    public function testHandleShouldNotValidate()
    {
        $mockedFactory = $this->getMockBuilder(\Illuminate\Contracts\Validation\Factory::class)
            ->disableOriginalConstructor()
            ->getMock();

        $mockedConfig = $this->getMockForAbstractClass(\Illuminate\Contracts\Config\Repository::class,[],'',false);
        $mockedConfig->expects($this->once())
            ->method('get')
            ->with('jsvalidation.remote_validation_field')
            ->will($this->returnValue('_jsvalidation'));

        $mockedRequest = $this->getMockBuilder(\Illuminate\Http\Request::class)
            ->disableOriginalConstructor()
            ->setMethods(['has'])
            ->getMock();

        $mockedRequest->expects($this->once())
            ->method('has')
            ->with('_jsvalidation')
            ->willReturn(false);

        $stubClosure = function () {return true;};

        $middleware = new RemoteValidationMiddleware($mockedFactory, $mockedConfig);
        $result = $middleware->handle($mockedRequest, $stubClosure);

        $this->assertTrue($result);
    }
}
