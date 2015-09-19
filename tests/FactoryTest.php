<?php namespace Proengsoft\JsValidation\Test;

use Closure;
use Illuminate\Contracts\Container\Container;
use Illuminate\Foundation\Application;
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
        $translator = m::mock('Symfony\Component\Translation\TranslatorInterface');
        $factory = new Factory($translator);
        $validator = $factory->make(['foo' => 'bar'], ['baz' => 'boom']);
        $this->assertEquals($translator, $validator->getTranslator());
        $this->assertEquals(['foo' => 'bar'], $validator->getData());
        $this->assertEquals(['baz' => ['boom']], $validator->getRules());
        $presence = m::mock('Illuminate\Validation\PresenceVerifierInterface');
        $noop1 = function () {
        };
        $noop2 = function () {
        };
        $noop3 = function () {
        };
        $factory->extend('foo', $noop1);
        $factory->extendImplicit('implicit', $noop2);
        $factory->replacer('replacer', $noop3);
        $factory->setPresenceVerifier($presence);
        $validator = $factory->make([], []);
        $this->assertEquals(['foo' => $noop1, 'implicit' => $noop2], $validator->getExtensions());
        $this->assertEquals(['replacer' => $noop3], $validator->getReplacers());
        $this->assertEquals($presence, $validator->getPresenceVerifier());
        $presence = m::mock('Illuminate\Validation\PresenceVerifierInterface');
        $factory->extend('foo', $noop1, 'foo!');
        $factory->extendImplicit('implicit', $noop2, 'implicit!');
        $factory->setPresenceVerifier($presence);
        $validator = $factory->make([], []);
        $this->assertEquals(['foo' => $noop1, 'implicit' => $noop2], $validator->getExtensions());
        $this->assertEquals(['foo' => 'foo!', 'implicit' => 'implicit!'], $validator->getFallbackMessages());
        $this->assertEquals($presence, $validator->getPresenceVerifier());
    }

    public function testCustomResolverIsCalled()
    {
        unset($_SERVER['__validator.factory']);
        $translator = m::mock('Symfony\Component\Translation\TranslatorInterface');
        $app = m::mock('Illuminate\Contracts\Container\Container');
        $factory = new Factory($translator, $app);
        $factory->resolver(function ($translator, $data, $rules) {
            $_SERVER['__validator.factory'] = true;
            return new \Illuminate\Validation\Validator($translator, $data, $rules);
        });
        $validator = $factory->make(['foo' => 'bar'], ['baz' => 'boom']);
        $this->assertTrue($_SERVER['__validator.factory']);
        $this->assertEquals($translator, $validator->getTranslator());
        $this->assertEquals(['foo' => 'bar'], $validator->getData());
        $this->assertEquals(['baz' => ['boom']], $validator->getRules());
        unset($_SERVER['__validator.factory']);
    }

    public function testSessionStore()
    {
        $translator = m::mock('Symfony\Component\Translation\TranslatorInterface');
        $store = m::mock('\Illuminate\Session\Store')
            ->shouldReceive('token')->andReturn('session token')
            ->getMock();
        $app = m::mock('Illuminate\Contracts\Container\Container');
        $factory = new Factory($translator);
        $factory->setSessionStore($store);
        $currentStore = $factory->getSessionStore();
        $this->assertEquals($store,$currentStore);

    }

    public function testRemoteConfigured()
    {
        $translator = m::mock('Symfony\Component\Translation\TranslatorInterface');
        $store = m::mock('\Illuminate\Session\Store')
            ->shouldReceive('token')->andReturn('session token')
            ->getMock();
        $app = new Application();
        $app['encrypter']= m::mock()->shouldReceive('encrypt')->with("session token")->andReturn("session token")->getMock();
        $factory = new Factory($translator, $app);
        $factory->setSessionStore($store);
        $factory->setJsRemoteEnabled(true);
        $validator = $factory->make([], []);

        $enabled =$factory->getJsRemoteEnabled();
        $this->assertTrue($enabled);

        $enabled =$validator->remoteValidationEnabled();
        $this->assertTrue($enabled);


    }

}