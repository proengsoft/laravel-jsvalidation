<?php

namespace Proengsoft\JsValidation\Support;

use Proengsoft\JsValidation\Tests\TestCase;

class ProtectedClassStubTest
{
    use AccessProtectedTrait;

    protected $protectedProperty = true;

    protected function protectedMethod()
    {
        return true;
    }
}

class AccessProtectedTraitTest extends TestCase
{
    private $stubInstance;

    /**
     * Setup the test environment.
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->stubInstance = new ProtectedClassStubTest();
    }

    public function testCreateProtectedCaller()
    {
        $stubInstance = $this->stubInstance;
        $caller = function () use ($stubInstance) {
            return $this->createProtectedCaller($stubInstance);
        };

        $testCaller = $caller->bindTo($this->stubInstance, $this->stubInstance);

        $this->assertInstanceOf('Closure', $testCaller());
    }

    public function testGetProtected()
    {
        $stubInstance = $this->stubInstance;
        $caller = function () use ($stubInstance) {
            return $this->getProtected($stubInstance,'protectedProperty');
        };

        $testCaller = $caller->bindTo($this->stubInstance, $this->stubInstance);

        $this->assertTrue($testCaller());
    }

    public function testCallProtected()
    {
        $stubInstance = $this->stubInstance;
        $caller = function () use ($stubInstance) {
            return $this->callProtected($stubInstance,'protectedMethod');
        };

        $testCaller = $caller->bindTo($this->stubInstance, $this->stubInstance);

        $this->assertTrue($testCaller());
    }
}
