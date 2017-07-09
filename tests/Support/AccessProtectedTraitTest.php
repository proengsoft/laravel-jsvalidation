<?php

namespace Proengsoft\JsValidation\Support;

class ProtectedClassStubTest
{
    protected $protectedProperty = true;

    protected function protectedMethod()
    {
        return true;
    }
}

class AccessProtectedTraitTest extends \PHPUnit_Framework_TestCase
{
    private $mockTrait;
    private $stubInstance;

    public function setUp()
    {
        $this->mockTrait = $this->getMockForTrait(\Proengsoft\JsValidation\Support\AccessProtectedTrait::class);
        $this->stubInstance = new ProtectedClassStubTest();
    }

    public function testCreateProtectedCaller()
    {
        $stubInstance = $this->stubInstance;
        $caller = function () use ($stubInstance) {
            return $this->createProtectedCaller($stubInstance);
        };

        $testCaller = $caller->bindTo($this->mockTrait, $this->mockTrait);

        $this->assertInstanceOf('Closure', $testCaller());
    }

    public function testGetProtected()
    {
        $stubInstance = $this->stubInstance;
        $caller = function () use ($stubInstance) {
            return $this->getProtected($stubInstance,'protectedProperty');
        };

        $testCaller = $caller->bindTo($this->mockTrait, $this->mockTrait);

        $this->assertTrue($testCaller());
    }

    public function testCallProtected()
    {
        $stubInstance = $this->stubInstance;
        $caller = function () use ($stubInstance) {
            return $this->callProtected($stubInstance,'protectedMethod');
        };

        $testCaller = $caller->bindTo($this->mockTrait, $this->mockTrait);

        $this->assertTrue($testCaller());
    }
}
