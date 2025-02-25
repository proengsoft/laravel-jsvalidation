<?php

namespace Proengsoft\JsValidation\Tests;

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Mockery;
use Proengsoft\JsValidation\JsValidationServiceProvider;
use Proengsoft\JsValidation\RemoteValidationMiddleware;

class JsValidationServiceProviderTest extends TestCase
{
    public function testBootstrapConfigs()
    {
        $this->app['path.config'] = dirname(__FILE__.'/../config');
        $this->app['path.base'] = dirname(__FILE__.'/../');
        $this->app['path.public'] = dirname(__FILE__.'/../public');

        $serviceProvider = new JsValidationServiceProvider($this->app);
        $serviceProvider->boot();

        $this->assertPublishes($this->app['path.config'].'/jsvalidation.php', 'config');
        $this->assertConfigMerged(realpath(__DIR__.'/../config/jsvalidation.php'), 'jsvalidation');
    }

    public function testBootstrapViews()
    {
        $this->app['path.config'] = dirname(__FILE__.'/../config');
        $this->app['path.base'] = dirname(__FILE__.'/../');
        $this->app['path.public'] = dirname(__FILE__.'/../public');

        $serviceProvider = new JsValidationServiceProvider($this->app);
        $serviceProvider->boot();

        $this->assertHasViews(realpath(__DIR__.'/../resources/views'), 'jsvalidation');
        $this->assertPublishes($this->app['path.base'].'/resources/views/vendor/jsvalidation', 'views');
    }

    public function testPublishAssets()
    {
        $this->app['path.config'] = dirname(__FILE__.'/../config');
        $this->app['path.base'] = dirname(__FILE__.'/../');
        $this->app['path.public'] = dirname(__FILE__.'/../public');

        $serviceProvider = new JsValidationServiceProvider($this->app);
        $serviceProvider->boot();

        $this->assertPublishes($this->app['path.public'].'/vendor/jsvalidation', 'public');
    }

    public function testPushMiddleware()
    {
        $app = [];
        $app['path.config']=dirname(__FILE__.'/../config');
        $app['path.base']=dirname(__FILE__.'/../');
        $app['path.public']=dirname(__FILE__.'/../public');

        Config::set('jsvalidation.disable_remote_validation', false);
        $app['config'] = Config::getFacadeRoot();

        $mockedValidator = Mockery::mock(\Illuminate\Contracts\Validation\Factory::class);
        $mockedValidator->shouldReceive('extend')->once();
        $app['validator'] = $mockedValidator;

        $mockKernel = Mockery::mock(\Illuminate\Contracts\Http\Kernel::class);
        $mockKernel->shouldReceive('pushMiddleware')->once();
        $app[\Illuminate\Contracts\Http\Kernel::class] = $mockKernel;

        $mock = $this->getMockBuilder(\Proengsoft\JsValidation\JsValidationServiceProvider::class)
            ->setConstructorArgs([$app])
            ->onlyMethods(['loadViewsFrom','publishes','mergeConfigFrom'])
            ->getMock();

        $mock->boot();
    }

    public function testRegister()
    {
        $app = $this->getMockBuilder(\Illuminate\Contracts\Container\Container::class)
            ->getMock();

        $app->expects($this->once())
            ->method('singleton')
            ->with('jsvalidator', $this->isInstanceOf(\Closure::class))
            ->willReturnCallback(function($name, $callback)  {
                Config::set('jsvalidation', []);

                $newApp['config'] = Config::getFacadeRoot();

                $factory = $callback($newApp);
                $this->assertInstanceOf(\Proengsoft\JsValidation\JsValidatorFactory::class, $factory);
            });

        $mock = $this->getMockBuilder(\Proengsoft\JsValidation\JsValidationServiceProvider::class)
            ->setConstructorArgs([$app])
            ->onlyMethods(['loadViewsFrom','publishes','mergeConfigFrom'])
            ->getMock();

        $mock->register();
    }

    protected function assertConfigMerged(string $file, ?string $configKey = null): void
    {
        $configKey ??= Str::of($file)->beforeLast('.php')->afterLast('/')->afterLast('\\')->toString();

        static::assertThat(
            $this->app->make('config')->has($configKey),
            static::isTrue(),
            "The configuration file was not merged as '$configKey'."
        );

        static::assertSame(
            $this->app->make('files')->getRequire($file),
            $this->app->make('config')->get($configKey),
            "The configuration file in '$file' is not the same for '$configKey'."
        );
    }

    protected function assertPublishes(string $file, string $tag): void
    {
        static::assertArrayHasKey($tag, ServiceProvider::$publishGroups, "The '$tag' is not a publishable tag.");

        static::assertContains(
            $file, ServiceProvider::$publishGroups[$tag], "The '$file' is not publishable in the '$tag' tag."
        );
    }

    protected function assertHasViews(string $path, string $namespace): void
    {
        $namespaces = $this->app->make('view')->getFinder()->getHints();

        static::assertArrayHasKey($namespace, $namespaces, "The '$namespace' views were not registered.");
        static::assertContains($path, $namespaces[$namespace], "The '$namespace' does not correspond to the path '$path'.");
    }
}
