<?php namespace Proengsoft\JsValidation\Test;


use Illuminate\Contracts\Container\Container;
use Mockery as m;
use Proengsoft\JsValidation\Factory;

require_once(dirname(__FILE__).'/stubs/Application.php');

class ValidationFactoryTest extends \PHPUnit_Framework_TestCase
{
    public function tearDown()
    {
        m::close();
    }

    public function testMakeMethodCreatesValidValidator()
    {
        $laravelFactory = m::mock('Illuminate\Validation\Factory');
        $laravelFactory->shouldReceive('make')
            ->with(['foo' => 'bar'], ['baz' => 'boom'],[],[])
            ->andReturn(m::mock('Illuminate\Validation\Validator'));
        $app = new \Application();

        $factory = new Factory($laravelFactory, $app);
        $validator = $factory->make(['foo' => 'bar'], ['baz' => 'boom']);

        $this->assertInstanceOf('Proengsoft\JsValidation\Validator',$validator);

    }

    public function testSessionStore()
    {
        $translator = m::mock('Illuminate\Validation\Factory');
        $store = m::mock('\Illuminate\Session\Store')
            ->shouldReceive('token')->andReturn('session token')
            ->getMock();
        $app = m::mock('Illuminate\Contracts\Container\Container');
        $factory = new Factory($translator, $app);
        $factory->setSessionStore($store);
        $currentStore = $factory->getSessionStore();
        $this->assertEquals($store,$currentStore);

    }

    public function testRemoteConfigured()
    {
        $laravelFactory = m::mock('Illuminate\Validation\Factory');
        $laravelFactory->shouldReceive('make')
            ->with([], [],[],[])
            ->andReturn(m::mock('Illuminate\Validation\Validator'));
        $store = m::mock('\Illuminate\Session\Store')
            ->shouldReceive('token')->andReturn('session token')
            ->getMock();
        $app = new \Application();
        $app['encrypter']= m::mock()->shouldReceive('encrypt')->with("session token")->andReturn("session token")->getMock();
        $factory = new Factory($laravelFactory, $app);
        $factory->setSessionStore($store);
        $factory->setJsRemoteEnabled(true);
        $validator = $factory->make([], []);

        $enabled =$factory->getJsRemoteEnabled();
        $this->assertTrue($enabled);

        $enabled =$validator->remoteValidationEnabled();
        $this->assertTrue($enabled);


    }

}