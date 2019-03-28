<?php

namespace Proengsoft\JsValidation\Support;

use PHPUnit\Framework\TestCase;

class UseDelegatedValidatorTraitTest extends TestCase
{
    public function testGetterAndSetter()
    {
        $mockTrait = $this->getMockForTrait(\Proengsoft\JsValidation\Support\UseDelegatedValidatorTrait::class);
        $mockDelegated = $this->getMockBuilder(\Proengsoft\JsValidation\Support\DelegatedValidator::class)
            ->disableOriginalConstructor()
            ->getMock();

        $mockTrait->setDelegatedValidator($mockDelegated);
        $value = $mockTrait->getDelegatedValidator($mockDelegated);

        $this->assertEquals($mockDelegated, $value);
    }
}
