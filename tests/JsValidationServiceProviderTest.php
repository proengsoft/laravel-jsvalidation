<?php

namespace Proengsoft\JsValidation\Tests;

class JsValidationServiceProviderTest extends \PHPUnit_Framework_TestCase
{
    protected function getMockedService($app)
    {
        $mockedConfig = $this->getMockForAbstractClass('Illuminate\Contracts\Config\Repository',[],'',false);
        $mockedConfig->expects($this->once())
            ->method('get')
            ->with('jsvalidation.disable_remote_validation')
            ->will($this->returnValue(true));
        $app['config']=$mockedConfig;

        $mockedValidator = $this->getMockForAbstractClass('Illuminate\Contracts\Validation\Factory',[],'',false);
        $mockedValidator->expects($this->once())
            ->method('extend')
            ->will($this->returnValue(null));

        $app['validator'] = $mockedValidator;

        $mock = $this->getMockBuilder('Proengsoft\JsValidation\JsValidationServiceProvider')
            ->setMethods(['loadViewsFrom','publishes','mergeConfigFrom'])
            ->setConstructorArgs([$app])
            ->getMock();

        return $mock;
    }

    public function testBootstrapConfigs()
    {
        $app = [];
        $app['path.config']=dirname(__FILE__.'/../config');
        $app['path.base']=dirname(__FILE__.'/../');
        $app['path.public']=dirname(__FILE__.'/../public');

        $mock = $this->getMockedService($app);

        $mock->expects($this->at(1))
            ->method('publishes')
            ->with([realpath(__DIR__.'/../config/jsvalidation.php')=>$app['path.config'].'/jsvalidation.php'], 'config');

        $mock->boot();
    }

    public function testBootstrapViews()
    {
        $app = [];
        $app['path.config']=dirname(__FILE__.'/../config');
        $app['path.base']=dirname(__FILE__.'/../');
        $app['path.public']=dirname(__FILE__.'/../public');

        $mock = $this->getMockedService($app);

        $mock->expects($this->once())
            ->method('loadViewsFrom')
            ->with(realpath(__DIR__.'/../resources/views'), 'jsvalidation');


        $mock->expects($this->at(3))
            ->method('publishes')
            ->with(
                [realpath(__DIR__.'/../resources/views')=>$app['path.base'].'/resources/views/vendor/jsvalidation'],
                'views'
            );

        $mock->boot();
    }

    public function testPublishAssets()
    {
        $app = [];
        $app['path.config']=dirname(__FILE__.'/../config');
        $app['path.base']=dirname(__FILE__.'/../');
        $app['path.public']=dirname(__FILE__.'/../public');

        $mock = $this->getMockedService($app);

        $mock->expects($this->at(4))
            ->method('publishes')
            ->with(
                [realpath(__DIR__.'/../public')=>$app['path.public'].'/vendor/jsvalidation'],
                'public'
            );

        $mock->boot();

    }

    public function testPushMiddleware()
    {
        $app = [];
        $app['path.config']=dirname(__FILE__.'/../config');
        $app['path.base']=dirname(__FILE__.'/../');
        $app['path.public']=dirname(__FILE__.'/../public');


        $mockedConfig = $this->getMockForAbstractClass('Illuminate\Contracts\Config\Repository',[],'',false);
        $mockedConfig->expects($this->once())
            ->method('get')
            ->with('jsvalidation.disable_remote_validation')
            ->will($this->returnValue(false));
        $app['config']=$mockedConfig;

        $mockedValidator = $this->getMockForAbstractClass('Illuminate\Contracts\Validation\Factory',[],'',false);
        $mockedValidator->expects($this->once())
            ->method('extend')
            ->will($this->returnValue(null));

        $app['validator'] = $mockedValidator;


        $mockKernel = $this->getMockForAbstractClass('Illuminate\Contracts\Http\Kernel',[],'',true,true,true,['pushMiddleware']);

        $app['Illuminate\Contracts\Http\Kernel'] = $mockKernel;

        $mock = $this->getMockBuilder('Proengsoft\JsValidation\JsValidationServiceProvider')
            ->setConstructorArgs([$app])
            ->setMethods(['loadViewsFrom','publishes','mergeConfigFrom'])
            ->getMock();

        $mock->boot();

    }

    public function testRegister()
    {
        $app = $this->getMockBuilder('Illuminate\Contracts\Container\Container')
            ->getMock();

        $app->expects($this->once())
            ->method('singleton')
            ->with('jsvalidator', $this->isInstanceOf('Closure'))
            ->willReturnCallback(function($name, $callback)  {
                $mockedConfig = $this->getMockForAbstractClass('Illuminate\Contracts\Config\Repository',[],'',false);
                $mockedConfig->expects($this->once())
                    ->method('get')
                    ->with('jsvalidation')
                    ->will($this->returnValue([]));

                $newApp['config'] = $mockedConfig;

                $factory = $callback($newApp);
                $this->assertInstanceOf('Proengsoft\JsValidation\JsValidatorFactory',$factory);
            });


        $mock = $this->getMockBuilder('Proengsoft\JsValidation\JsValidationServiceProvider')
            ->setConstructorArgs([$app])
            ->setMethods(['loadViewsFrom','publishes','mergeConfigFrom'])
            ->getMock();

        $mock->register();
    }

    public function testExtendValidator()
    {

    }
}
