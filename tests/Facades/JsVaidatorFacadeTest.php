<?php namespace Proengsoft\JsValidation\Test\Facades;

use Mockery as m;
use Proengsoft\JsValidation\Facades\JsValidatorFacade;

class JsValidatorFacadeTest extends \PHPUnit_Framework_TestCase {

    /**
     * Calls Mockery::close
     */
    public function tearDown()
    {
        m::close();
    }

    function testGetFacadeAccessor()
    {
        /*
        |------------------------------------------------------------
        | Set
        |------------------------------------------------------------
        */
        $app['jsvalidator']=[];

        /*
        |------------------------------------------------------------
        | Expectation
        |------------------------------------------------------------
        */
        $expected=[];


        /*
        |------------------------------------------------------------
        | Assertion
        |------------------------------------------------------------
        */

        $facade=new JsValidatorFacade();
        $facade->setFacadeApplication($app);
        $data=$facade->getFacadeRoot();

        $this->assertEquals($expected,$data);

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
