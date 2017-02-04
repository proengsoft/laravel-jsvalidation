<?php


namespace Proengsoft\JsValidation\Tests\Remote;

use Illuminate\Http\Exceptions\HttpResponseException;
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

    protected function getMockedTranslator() {
        $translator = $this->getMockBuilder('Symfony\Component\Translation\TranslatorInterface')
            ->getMock();

        return $translator;

    }

    public function testResolverIsClosure() {


        $resolver = $this->resolverObject->resolver('field');
        $this->assertInstanceOf('Closure', $resolver);

    }

    public function testResolvesNewValidator() {


        $resolver = $this->resolverObject->resolver('field');


        $translator = $this->getMockBuilder('Symfony\Component\Translation\TranslatorInterface')
            ->getMock();
        $validator = $resolver($translator,[],[],[],[]);

        $this->assertInstanceOf('Illuminate\Validation\Validator', $validator);

    }

    public function testResolvesValidatorExists() {


        $translator = $this->getMockBuilder('Symfony\Component\Translation\TranslatorInterface')
            ->getMock();
        $resolverObject = new Resolver(new CustomValidatorStubTest($translator));

        $resolver = $resolverObject->resolver('field');
        $translator = $this->getMockBuilder('Symfony\Component\Translation\TranslatorInterface')
            ->getMock();
        $validator = $resolver($translator,[],[],[],[]);

        $this->assertInstanceOf('Illuminate\Validation\Validator', $validator);

    }

    public function testValidatorIsClosure() {

        $resolver = $this->resolverObject->validatorClosure();
        $this->assertInstanceOf('Closure', $resolver);

    }

    public function testResolvesAndValidated() {
        $translator = $this->getMockBuilder('Symfony\Component\Translation\TranslatorInterface')
            ->getMock();
        $resolverObject = new Resolver(new CustomValidatorStubTest($translator));

        $resolver = $resolverObject->resolver('field');

        $translator = $this->getMockBuilder('Symfony\Component\Translation\TranslatorInterface')
            ->getMock();
        $validator = $resolver($translator,
            ['field'=>'value', '_jsvalidation_validate_all'=>false],
            ['field'=>'required'],
            [],
            []
        );
        $validator->setData(['field'=>'value', '_jsvalidation_validate_all'=>false]);

        $resolverValidator = $this->resolverObject->validatorClosure();


        try {
            $resolverValidator('_jsvalidation','field',[],$validator);
            $this->fail('This test shloud throw Exception');
        } catch (\Illuminate\Validation\ValidationException $e){
            $response = $e->getResponse();
            $this->assertEquals('true',$response->getContent());
            $this->assertEquals(200, $response->getStatusCode());
        } catch (HttpResponseException $e){
            $response = $e->getResponse();
            $this->assertEquals('true',$response->getContent());
            $this->assertEquals(200, $response->getStatusCode());
        }
        //$this->assertInstanceOf('Closure', $resolver);

    }


}
