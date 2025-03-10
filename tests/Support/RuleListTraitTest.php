<?php

namespace Proengsoft\JsValidation\Support;

use Mockery as m;
use Proengsoft\JsValidation\Javascript\RuleParser;
use Proengsoft\JsValidation\Tests\TestCase;

class RuleListTraitTest extends TestCase
{
    private $mockTrait;

    /**
     * Setup the test environment.
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->mockTrait = m::mock(RuleParser::class);
    }

    public function testIsImplemented() {
        $this->assertTrue($this->callProtected('isImplemented',['Required']));
        $this->assertFalse($this->callProtected('isImplemented',['NotImplementedRule']));
    }

    public function testIsRemoteRule() {
        $this->assertTrue($this->callProtected('isRemoteRule',['ActiveUrl']));
        $this->assertFalse($this->callProtected('isRemoteRule',['RequiredIf']));
    }

    public function testIsDisableRule() {
        $this->assertTrue($this->callProtected('isDisableRule',['NoJsValidation']));
        $this->assertFalse($this->callProtected('isDisableRule',['RequiredIf']));
    }

    public function testValidationDisabled() {
        $this->assertTrue($this->callProtected('validationDisabled',[['NoJsValidation','Required']]));
        $this->assertFalse($this->callProtected('validationDisabled',[['RequiredIf','ActiveUrl']]));
    }

    public function testIsFileRule() {
        $this->assertTrue($this->callProtected('isFileRule',['Mimes']));
        $this->assertTrue($this->callProtected('isFileRule',['Image']));
        $this->assertFalse($this->callProtected('isFileRule',['RequiredIf']));
    }

    protected function callProtected($method, $args = [])
    {
        $caller = function ($method, $args) {
            return call_user_func_array([$this, $method], $args);

        };
        $testCaller = $caller->bindTo($this->mockTrait, $this->mockTrait);

        return $testCaller($method, $args);
    }
}
