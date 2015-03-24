<?php namespace Proengsoft\JsValidation\Test\Facades;

use Proengsoft\JsValidation\Facades\JsValidatorFacade;

class JsValidatorFacadeTest extends \PHPUnit_Framework_TestCase {


    function testGetFacadeAccessor()
    {
        $app['jsvalidator']=[];
        JsValidatorFacade::setFacadeApplication($app);
        $data=JsValidatorFacade::getFacadeApplication();

        $this->assertEquals($app,$data);

    }

}
