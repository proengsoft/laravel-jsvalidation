<?php


namespace Proengsoft\JsValidation\Javascript;

use Illuminate\Support\Facades\View;
use Mockery as m;
use Proengsoft\JsValidation\Exceptions\PropertyNotFoundException;

class JavascriptValidatorTest extends \PHPUnit_Framework_TestCase
{


    public function setUp()
    {

    }


    public function testRender()
    {


        $mockHandler = $this->getMockBuilder('\Proengsoft\JsValidation\Javascript\ValidatorHandler')
            ->disableOriginalConstructor()
            ->getMock();

        View::shouldReceive('make')
            ->with('jsvalidation::bootstrap',['validator'=>['selector'=>'form']])
            ->once()
            ->andReturn(
                m::mock('Illuminate\Contracts\View\Factory')
                    ->shouldReceive('render')
                    ->once()
                    ->andReturn('return')
                    ->getMock());


        $validator = new JavascriptValidator($mockHandler);

        $txt=$validator->render();
        $this->assertEquals('return',$txt);
    }


    public function testCustomOptions()
    {

        $options = [
            'selector' => 'form-test',
            'view' => 'jsvalidation::test',
            'remote' => true,
        ];

        $mockHandler = $this->getMockBuilder('\Proengsoft\JsValidation\Javascript\ValidatorHandler')
            ->disableOriginalConstructor()
            ->getMock();

        View::shouldReceive('make')
            ->with($options['view'],['validator'=>['selector'=>$options['selector']]])
            ->once()
            ->andReturn(
                m::mock('Illuminate\Contracts\View\Factory')
                    ->shouldReceive('render')
                    ->once()
                    ->andReturn('return')
                    ->getMock());


        $validator = new JavascriptValidator($mockHandler, $options);

        $txt=$validator->render();
        $this->assertEquals('return',$txt);
    }



    public function  testToArray()
    {
        $mockHandler = $this->getMockBuilder('\Proengsoft\JsValidation\Javascript\ValidatorHandler')
            ->disableOriginalConstructor()
            ->setMethods(['validationData'])
            ->getMock();

        $mockHandler->expects($this->once())
            ->method('validationData')
            ->with(true)
            ->willReturn([]);

        $validator = new JavascriptValidator($mockHandler);

        $expected=['selector'=>'form'];
        $viewData=$validator->toArray();
        $this->assertEquals($expected,$viewData);

    }

    /**
     * @depends testToArray
     */
    public function testToString()
    {
        $this->testRender();
    }



    public function testGet()
    {
        $mockHandler = $this->getMockBuilder('\Proengsoft\JsValidation\Javascript\ValidatorHandler')
            ->disableOriginalConstructor()
            ->setMethods(['validationData'])
            ->getMock();

        $mockHandler->expects($this->once())
            ->method('validationData')
            ->with(true)
            ->willReturn([]);

        $validator = new JavascriptValidator($mockHandler);

        $this->assertEquals('form',$validator->selector);
    }


    public function testGetException()
    {
        $mockHandler = $this->getMockBuilder('\Proengsoft\JsValidation\Javascript\ValidatorHandler')
            ->disableOriginalConstructor()
            ->setMethods(['validationData'])
            ->getMock();

        $mockHandler->expects($this->once())
            ->method('validationData')
            ->with(true)
            ->willReturn([]);

        $validator = new JavascriptValidator($mockHandler);

        try {
            $validator->property_not_found;
        }
        catch (PropertyNotFoundException $expected) {
            $this->assertTrue(true);
            return;
        }

        $this->fail('An expected exception has not been raised.');


    }

    public function testIgnore() {
        $mockHandler = $this->getMockBuilder('\Proengsoft\JsValidation\Javascript\ValidatorHandler')
            ->disableOriginalConstructor()
            ->setMethods(['validationData'])
            ->getMock();

        $mockHandler->expects($this->once())
            ->method('validationData')
            ->with(true)
            ->willReturn([]);

        $validator = new JavascriptValidator($mockHandler);
        $validator->ignore('#no-validate');
        $expected=[
            'selector'=>'form',
            'ignore' => '#no-validate'
        ];
        $viewData=$validator->toArray();
        $this->assertEquals($expected,$viewData);
    }

}
