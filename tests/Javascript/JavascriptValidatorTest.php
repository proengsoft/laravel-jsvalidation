<?php


namespace Proengsoft\JsValidation\Tests\Javascript;

use Illuminate\Support\Facades\View;
use Mockery as m;
use Proengsoft\JsValidation\Exceptions\PropertyNotFoundException;
use Proengsoft\JsValidation\Javascript\JavascriptValidator;

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
            ->setMethods(['validationData','setRemote'])
            ->getMock();

        $mockHandler->expects($this->once())
            ->method('setRemote')
            ->with(true)
            ->willReturn([]);

        $mockHandler->expects($this->once())
            ->method('validationData')
            ->with()
            ->willReturn([]);

        $validator = new JavascriptValidator($mockHandler);

        $expected=['selector'=>'form'];
        $viewData=$validator->toArray();
        $this->assertEquals($expected,$viewData);

    }


    public function testGet()
    {
        $mockHandler = $this->getMockBuilder('\Proengsoft\JsValidation\Javascript\ValidatorHandler')
            ->disableOriginalConstructor()
            ->setMethods(['validationData','setRemote'])
            ->getMock();

        $mockHandler->expects($this->once())
            ->method('validationData')
            ->with()
            ->willReturn([]);

        $mockHandler->expects($this->once())
            ->method('setRemote')
            ->with(true)
            ->willReturn([]);


        $validator = new JavascriptValidator($mockHandler);

        $this->assertEquals('form',$validator->selector);
    }


    public function testGetException()
    {
        $mockHandler = $this->getMockBuilder('\Proengsoft\JsValidation\Javascript\ValidatorHandler')
            ->disableOriginalConstructor()
            ->setMethods(['validationData','setRemote'])
            ->getMock();

        $mockHandler->expects($this->once())
            ->method('validationData')
            ->with()
            ->willReturn([]);

        $mockHandler->expects($this->once())
            ->method('setRemote')
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
            ->setMethods(['validationData','setRemote'])
            ->getMock();

        $mockHandler->expects($this->once())
            ->method('validationData')
            ->with()
            ->willReturn([]);

        $mockHandler->expects($this->once())
            ->method('setRemote')
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

    public function testRemote() {
        $remote = true;
        $mockHandler = $this->getMockBuilder('\Proengsoft\JsValidation\Javascript\ValidatorHandler')
            ->disableOriginalConstructor()
            ->setMethods(['validationData','setRemote'])
            ->getMock();

        $mockHandler->expects($this->once())
            ->method('validationData')
            ->with()
            ->willReturn([]);

        $mockHandler->expects($this->once())
            ->method('setRemote')
            ->with($remote)
            ->willReturn([]);

        $validator = new JavascriptValidator($mockHandler);
        $validator->remote($remote);
        $data = $validator->toArray();

        $this->assertEquals(['selector'=>'form'],$data);
    }

    public function testSometimes() {
        $remote = true;
        $mockHandler = $this->getMockBuilder('\Proengsoft\JsValidation\Javascript\ValidatorHandler')
            ->disableOriginalConstructor()
            ->setMethods(['validationData','sometimes','setRemote'])
            ->getMock();

        $mockHandler->expects($this->once())
            ->method('sometimes')
            ->with('field','required')
            ->willReturn([]);

        $mockHandler->expects($this->once())
            ->method('validationData')
            ->with()
            ->willReturn([]);
        $mockHandler->expects($this->once())
            ->method('setRemote')
            ->with($remote)
            ->willReturn([]);

        $validator = new JavascriptValidator($mockHandler);
        //$validator->remote(true);
         $validator->sometimes('field','required');
        $data = $validator->toArray();
        $this->assertEquals(['selector'=>'form'],$data);
    }

    public function testToString()
    {


        $mockHandler = $this->getMockBuilder('\Proengsoft\JsValidation\Javascript\ValidatorHandler')
            ->disableOriginalConstructor()
            ->getMock();

        View::shouldReceive('make')
            ->with('jsvalidation::bootstrap', ['validator' => ['selector' => 'form']])
            ->once()
            ->andReturn(
                m::mock('Illuminate\Contracts\View\Factory')
                    ->shouldReceive('render')
                    ->once()
                    ->andReturn('return')
                    ->getMock());


        $validator = new JavascriptValidator($mockHandler);

        $txtRender = $validator->render();
        $txt = $validator->__toString();
        $this->assertEquals($txtRender, $txt);

    }
}
