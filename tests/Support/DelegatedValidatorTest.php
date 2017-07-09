<?php
namespace Proengsoft\JsValidation\Support;

//use Proengsoft\JsValidation\Support\DelegatedValidator;
use PHPUnit_Framework_TestCase;

class DelegatedValidatorTest extends PHPUnit_Framework_TestCase
{
    /**
     * Test getValidator method
     */
    public function testGetValidator()
    {
        $expected = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->disableOriginalConstructor()
            ->getMock();

        $parser = $this->getMockBuilder(\Proengsoft\JsValidation\Support\ValidationRuleParserProxy::class)
            ->disableOriginalConstructor()
            ->getMock();

        $delegated = new DelegatedValidator($expected, $parser);

        $value = $delegated->getValidator();
        $this->assertEquals($expected, $value);
    }

    /**
     * Test getData method
     */
    public function testGetData()
    {
        $expected = ['field'=>'data'];
        $this->callValidatorMethod('getData', $expected);
    }

    /**
     * Test setData method
     */
    public function testSetData()
    {
        $expected = ['field'=>'data'];
        $this->callValidatorMethodWithArg('setData', $expected, null);
    }

    /**
     * Test Get the validation rules.
     */
    public function testGetRules()
    {
        $expected = ['field'=>'required'];

        $this->callValidatorMethod('getRules', $expected);
    }

    /**
     * Test Sometimes method.
     */
    public function testSometimes()
    {
        $expected = null;

        $this->callValidatorMethod('sometimes', $expected, [
            'field',
            'required',
            function () {},
        ]);
    }

    /**
     * Test Get the files under validation.
     */
    public function testGetFiles()
    {
        $expected = ['field'=>'data'];

        $validator = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->disableOriginalConstructor()
            ->setMethods(['getFiles'])
            ->getMock();

        $parser = $this->getMockBuilder(\Proengsoft\JsValidation\Support\ValidationRuleParserProxy::class)
            ->disableOriginalConstructor()
            ->getMock();

        $validator->expects($this->once())
            ->method('getFiles')
            ->willReturn($expected);

        $delegated = new DelegatedValidator($validator, $parser);
        $files = $delegated->getFiles();

        $this->assertEquals($expected, $files);
    }

    /**
     * Test Get the files in Laravel >= 5.3.21
     */
    public function testGetFilesMethodNotExists()
    {
        $expected = [];
        $validator = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->disableOriginalConstructor()
            ->getMock();
        $validator->method($this->anything())
            ->willReturn($expected);

        $parser = $this->getMockBuilder(\Proengsoft\JsValidation\Support\ValidationRuleParserProxy::class)
            ->disableOriginalConstructor()
            ->getMock();

        $delegated = new DelegatedValidator($validator, $parser);
        $files = $delegated->getFiles();

        $this->assertEquals($expected, $files);
    }

    /**
     * Test Set the files under validation.
     */
    public function testSetFiles()
    {
        $return = true;
        $arg = [];

        $validator = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->disableOriginalConstructor()
            ->setMethods(['setFiles'])
            ->getMock();

        $validator->expects($this->once())
            ->method('setFiles')
            ->with($arg)
            ->willReturn($return);

        $parser = $this->getMockBuilder(\Proengsoft\JsValidation\Support\ValidationRuleParserProxy::class)
            ->disableOriginalConstructor()
            ->getMock();

        $delegated = new DelegatedValidator($validator, $parser);
        $result = $delegated->setFiles($arg);

        $this->assertEquals($return , $result);
    }

    /**
     * Test Set the files in Laravel >= 5.3.21
     */
    public function testSetFilesMethodNotExists()
    {
        $arg=[];

        $validator = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->disableOriginalConstructor()
            ->getMock();

        $validator->method($this->anything())
            ->willReturn($validator);

        $parser = $this->getMockBuilder(\Proengsoft\JsValidation\Support\ValidationRuleParserProxy::class)
            ->disableOriginalConstructor()
            ->getMock();

        $delegated = new DelegatedValidator($validator, $parser);
        $result = $delegated->setFiles($arg);

        $this->assertEquals($validator , $result);
    }

    /**
     * Test Explode rules.
     *
     */
    public function testExplodeRules()
    {
        $arg='required|url';
        $this->callValidatorProtectedMethod('explodeRules',$arg);
    }

    /**
     * Test if a given rule implies the attribute is required.
     */
    public function testIsImplicit()
    {
        $this->callValidatorProtectedMethod('isImplicit');
    }

    /**
     *  Test Replace all error message place-holders with actual values.
     */
    public function testMakeReplacements()
    {
        $this->callValidatorProtectedMethod('makeReplacements', ['message','attribute','rule',[]]);
    }

    /**
     * Test if the given attribute has a rule in the given set.
     *
     */
    public function testHasRule()
    {
        $this->callValidatorProtectedMethod('hasRule', ['attribute',[]]);
    }

    /**
     * Test the validation message for an attribute and rule.
     */
    public function testGetMessage()
    {
        $this->callValidatorProtectedMethod('getMessage', ['attribute','rule']);
    }

    /**
     * Test extract the rule name and parameters from a rule.
     */
    public function testParseRule()
    {
        $method = 'parseRule';
        $args = ['required'];

        $validator = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->disableOriginalConstructor()
            ->getMock();

        $parser = $this->getMockBuilder(\Proengsoft\JsValidation\Support\ValidationRuleParserProxy::class)
            ->disableOriginalConstructor()
            ->getMock();

        $parser->expects($this->any())
            ->method('parse')
            ->willReturn(true);

        $delegated = $this->getMockBuilder(\Proengsoft\JsValidation\Support\DelegatedValidator::class)
            ->setConstructorArgs([$validator, $parser])
            ->setMethods(['callProtected'])
            ->getMock();

        if (is_array($args)) {
            $v = call_user_func_array([$delegated,$method], $args);
        } else {
            $v = $delegated->$method($args);
        }

        $this->assertTrue($v);
    }

    /**
     * Test method calls to validator instance.
     */
    public function testCall()
    {
        $validator = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->setMethods(['fakeMethod'])
            ->disableOriginalConstructor()
            ->getMock();

        $parser = $this->getMockBuilder(\Proengsoft\JsValidation\Support\ValidationRuleParserProxy::class)
            ->disableOriginalConstructor()
            ->getMock();

        $delegated = new DelegatedValidator($validator, $parser);
        $validator->expects($this->once())
            ->method('fakeMethod')
            ->with($this->isType('string'))
            ->willReturn(true);

        $value= $delegated->__call('fakeMethod', ['param']);

        $this->assertTrue($value);
    }

    /**
     * Helper to test calls to dependant Validator object
     *
     * @param $method
     * @param $return
     *
     * @return mixed
     */
    private function callValidatorMethod($method, $return = null, $args = [])
    {
        $validator = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->disableOriginalConstructor()
            ->getMock();

        $parser = $this->getMockBuilder(\Proengsoft\JsValidation\Support\ValidationRuleParserProxy::class)
            ->disableOriginalConstructor()
            ->getMock();

        $validator->expects($this->once())
            ->method($method)
            ->willReturn($return);

        $delegated = new DelegatedValidator($validator, $parser);
        $value=call_user_func_array([$delegated, $method],$args);

        $this->assertEquals($return, $value);
    }

    /**
     * Helper to test calls to dependant Validator object with args
     *
     * @param $method
     * @param $arg
     * @param $return
     *
     * @return mixed
     */
    private function callValidatorMethodWithArg($method, $arg= null, $return = null)
    {
        $validator = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->disableOriginalConstructor()
            ->getMock();

        $parser = $this->getMockBuilder(\Proengsoft\JsValidation\Support\ValidationRuleParserProxy::class)
            ->disableOriginalConstructor()
            ->getMock();

        $validator->expects($this->once())
            ->method($method)
            ->with($arg)
            ->willReturn($return);

        $delegated = new DelegatedValidator($validator, $parser);

        $value = $delegated->$method($arg);
        $this->assertNull($value);
    }

    /**
     * Test if a given rule implies the attribute is required.
     */
    private function callValidatorProtectedMethod($method, $args = null)
    {
        $validator = $this->getMockBuilder(\Illuminate\Validation\Validator::class)
            ->disableOriginalConstructor()
            ->getMock();

        $parser = $this->getMockBuilder(\Proengsoft\JsValidation\Support\ValidationRuleParserProxy::class)
            ->disableOriginalConstructor()
            ->getMock();

        $delegated = $this->getMockBuilder(\Proengsoft\JsValidation\Support\DelegatedValidator::class)
            ->setConstructorArgs([$validator, $parser])
            ->setMethods(['callProtected'])
            ->getMock();

        $delegated->expects($this->once())
            ->method('callProtected')
            ->with($this->isInstanceOf(\Closure::class), $method, $this->isType('array'))
            ->willReturn(true);

        if (is_array($args)) {
            $v = call_user_func_array([$delegated,$method],$args);
        } else {
            $v = $delegated->$method($args);
        }

        $this->assertTrue($v);
    }
}
