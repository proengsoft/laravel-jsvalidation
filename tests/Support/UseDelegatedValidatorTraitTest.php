<?php

namespace Proengsoft\JsValidation\Support;

use Mockery;
use Proengsoft\JsValidation\Javascript\MessageParser;
use Proengsoft\JsValidation\Tests\TestCase;

class UseDelegatedValidatorTraitTest extends TestCase
{
    public function testGetterAndSetter()
    {
        $mockDelegated1 = Mockery::mock(\Proengsoft\JsValidation\Support\DelegatedValidator::class);
        $mockDelegated2 = Mockery::mock(\Proengsoft\JsValidation\Support\DelegatedValidator::class);

        $messageParser = new MessageParser($mockDelegated1);
        $messageParser->setDelegatedValidator($mockDelegated2);

        $this->assertSame($mockDelegated2, $messageParser->getDelegatedValidator());
    }
}
