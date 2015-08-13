<?php
namespace Proengsoft\JsValidation\Test;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Request;
use Mockery as m;
use PHPUnit_Framework_TestCase;



class JsValidationServiceProviderTest extends PHPUnit_Framework_TestCase {

    /**
     * Calls Mockery::close
     */
    public function tearDown()
    {
        m::close();
    }

    public function testShouldBoot()
    {
        /*
        |------------------------------------------------------------
        | Set
        |------------------------------------------------------------
        */
        $namespace='jsvalidation';
        $fakePath=realpath('./');
        $configFile =realpath( __DIR__ . '/../config/jsvalidation.php');
        $viewsPath =realpath( __DIR__ . '/../resources/views');
        $publicPath=realpath( __DIR__ . '/../public');


        $app['config']=[];
        $app['path.base']=$fakePath;
        $app['path.public']=$fakePath.'/public';
        $app['path.config']=$fakePath.'/config';

        $app['validator']=m::mock('Illuminate\Contracts\Validation\Factory');
        $sp = m::mock('Proengsoft\JsValidation\JsValidationServiceProvider[publishes,loadViewsFrom,mergeConfigFrom]',[$app])
            ->shouldAllowMockingProtectedMethods();

        $test=$this;


        /*
        |------------------------------------------------------------
        | Expectation
        |------------------------------------------------------------
        */

        // Publishes configurations
        $this->assertTrue(
            $sp->shouldReceive('mergeConfigFrom')
                ->once()
                ->with($configFile, $namespace)
                ->andReturn(true) &&
            $sp->shouldReceive('publishes')
                ->once()
                ->with([$configFile => "$fakePath/config/jsvalidation.php"], 'config')
                ->andReturn(true)
        );


        // Register Views
        $this->assertTrue(
            $views=$sp->shouldReceive('loadViewsFrom')
                ->with($viewsPath,'jsvalidation')
                ->once()
                ->andReturn(true) &&
            $sp->shouldReceive('publishes')
                ->once()
                ->with([$viewsPath => "$fakePath/resources/views/vendor/jsvalidation"],'views')
                ->andReturn(true)
        );


        // Publishes assets
        $this->assertTrue((bool)
            $sp->shouldReceive('publishes')
                ->once()
                ->with([$publicPath => "$fakePath/public/vendor/jsvalidation"],"public")
                ->andReturn(true)
        );

        // Register Validator
        $app['validator']->shouldReceive('resolver')
            ->once()
            ->andReturnUsing(function($c) use ($test) {
                $test->assertInstanceOf('Proengsoft\JsValidation\Validator',$c(m::mock('Symfony\Component\Translation\TranslatorInterface'),[],[],[]));
            });


        // Boot


        /*
        |------------------------------------------------------------
        | Assertion
        |------------------------------------------------------------
        */

        $result=$sp->boot();

        $this->assertTrue(true);

        /**
         *  Cleanup
         */
        unset($app);
        unset($sp);

    }


    public function testRegister() {

        /*
        |------------------------------------------------------------
        | Set
        |------------------------------------------------------------
        */
        $namespace="jsvalidation";
        $test = $this;
        $app=m::mock('\Illuminate\Contracts\Foundation\Application');
        $request=m::mock('Illuminate\Http\Request');
        $sp = m::mock('Proengsoft\JsValidation\JsValidationServiceProvider[]', [$app])->shouldAllowMockingProtectedMethods();
        /*
        |------------------------------------------------------------
        | Expectation
        |------------------------------------------------------------
        */

        Config::shouldReceive('get')
            ->with("$namespace.form_selector")
            ->atLeast(1)
            ->andReturn('form');

        Config::shouldReceive('get')
            ->with("$namespace.view")
            ->atLeast(1)
            ->andReturn("$namespace::bootstrap");

        Request::shouldReceive('instance')
            ->andReturn($request);

        $app->shouldReceive('bind')
            ->once()->andReturnUsing(
            // Make sure that the name is 'jsvalidator'
            // and that the closure passed returns the correct
            // kind of object.
                function ($name, $closure) use ($test, $app) {
                    $test->assertEquals('jsvalidator', $name);

                    $test->assertInstanceOf(
                        'Proengsoft\JsValidation\Factory',
                        $closure($app)
                    );
                }
            );

        $app->shouldReceive('make')
            ->once()->andReturnUsing(
                function($name) use ($test) {
                    $test->assertEquals('Illuminate\Contracts\Validation\Factory',$name);
                    return m::mock('Illuminate\Contracts\Validation\Factory');
                }
            );
        /*
        |------------------------------------------------------------
        | Assertion
        |------------------------------------------------------------
        */
        $sp->register();


        /**
         *  Cleanup
         */
        unset($sp);
        unset($app);
        unset($test);
        unset($request);
    }


}
