<?php

namespace Proengsoft\JsValidation\Tests\Facades;

use Proengsoft\JsValidation\Tests\TestCase;
use Proengsoft\JsValidation\Facades\JsValidatorFacade;

class JsValidatorFacadeTest extends TestCase
{
    function testGetFacadeAccessor()
    {
        /*
        |------------------------------------------------------------
        | Set
        |------------------------------------------------------------
        */

        $app['jsvalidator'] = [];

        /*
        |------------------------------------------------------------
        | Expectation
        |------------------------------------------------------------
        */

        $expected = [];

        /*
        |------------------------------------------------------------
        | Assertion
        |------------------------------------------------------------
        */

        $facade = new JsValidatorFacade();
        $facade->setFacadeApplication($app);
        $data = $facade->getFacadeRoot();

        $this->assertEquals($expected, $data);

        /*
        |------------------------------------------------------------
        | Cleanup
        |------------------------------------------------------------
        */

        $facade->setFacadeApplication(null);
        unset($app);
        unset($facade);
    }
}
