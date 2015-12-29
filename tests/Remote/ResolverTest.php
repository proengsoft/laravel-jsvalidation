<?php


namespace Proengsoft\JsValidation\Tests\Remote;

use Illuminate\Http\Exception\HttpResponseException;
use Proengsoft\JsValidation\Remote\Resolver;

require_once __DIR__.'/../stubs/ResolverTest.php';

class ResolverTest extends \PHPUnit_Framework_TestCase
{

    public function setUp()
    {
        $this->mockFactory = $this->getMockBuilder('Illuminate\Validation\Factory')
            ->disableOriginalConstructor()
            ->getMock();

        $this->resolverObject = new Resolver($this->mockFactory);

    }

    public function testResolverIsClosure() {


        $resolver = $this->resolverObject->resolver('filed');
        $this->assertInstanceOf('Closure', $resolver);

    }

    public function testResolvesNewValidator() {


        $resolver = $this->resolverObject->resolver('filed');


        $translator = $this->getMock('Symfony\Component\Translation\TranslatorInterface');
        $validator = $resolver($translator,[],[],[],[]);

        $this->assertInstanceOf('Illuminate\Validation\Validator', $validator);

    }

    public function testResolvesValidatorExists() {


        $translator = $this->getMock('Symfony\Component\Translation\TranslatorInterface');
        $resolverObject = new Resolver(new CustomValidatorStubTest($translator));

        $resolver = $resolverObject->resolver('filed');

        $translator = $this->getMock('Symfony\Component\Translation\TranslatorInterface');
        $validator = $resolver($translator,[],[],[],[]);

        $this->assertInstanceOf('Illuminate\Validation\Validator', $validator);

    }

    public function testValidatorIsClosure() {

        $resolver = $this->resolverObject->validator();
        $this->assertInstanceOf('Closure', $resolver);

    }

    public function testResolvesAndValidated() {
        $translator = $this->getMock('Symfony\Component\Translation\TranslatorInterface');
        $resolverObject = new Resolver(new CustomValidatorStubTest($translator));

        $resolver = $resolverObject->resolver('filed');

        $translator = $this->getMock('Symfony\Component\Translation\TranslatorInterface');
        $validator = $resolver($translator,['field'=>'value'],['field'=>'required'],[],[]);
        $validator->getRules();

        $resolverValidator = $this->resolverObject->validator();


        try {
            $resolverValidator('__jsvalidation','field',[],$validator);
            $this->fail('This test shloud throw Exception');
        } catch (HttpResponseException $e){
            $response = $e->getResponse();
            $this->assertEquals('true',$response->getContent());
            $this->assertEquals(200, $response->getStatusCode());
        }
        //$this->assertInstanceOf('Closure', $resolver);

    }


}
