<?php

namespace Proengsoft\JsValidation\Support;

class UseDelegatedValidatorTraitTest extends \PHPUnit_Framework_TestCase
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
