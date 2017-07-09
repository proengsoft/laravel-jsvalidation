<?php

namespace Proengsoft\JsValidation\Tests\Javascript;

use Proengsoft\JsValidation\Javascript\RuleParser;

class RuleParserTest extends \PHPUnit_Framework_TestCase
{
    public function testGetClientRule()
    {
        $attribute = 'field';
        $rule = 'Required';
        $parameters = [];
        $token =null;

        $delegated = $this->getMockBuilder(\Proengsoft\JsValidation\Support\DelegatedValidator::class)
            ->disableOriginalConstructor()
            ->getMock();


        $parser = new RuleParser($delegated, $token);

        $values = $parser->getRule($attribute, $rule, $parameters,'required');
        $expected = [$attribute,RuleParser::JAVASCRIPT_RULE,$parameters];

        $this->assertEquals($expected, $values);
    }

    public function testGetClientCustomRule()
    {
        $attribute = 'field';
        $rule = 'RequiredIf';
        $parameters = ['field2','value2'];
        $token =null;

        $delegated = $this->getMockBuilder(\Proengsoft\JsValidation\Support\DelegatedValidator::class)
            ->disableOriginalConstructor()
            ->getMock();


        $parser = new RuleParser($delegated, $token);

        $values = $parser->getRule($attribute, $rule, $parameters, 'required_if:field2,value2');
        $expected = [$attribute,RuleParser::JAVASCRIPT_RULE,$parameters];

        $this->assertEquals($expected, $values);
    }

    public function testGetRemoteRule()
    {
        $attribute = 'field';
        $rule = 'ActiveUrl';
        $parameters = [];
        $token ='my token';

        $delegated = $this->getMockBuilder(\Proengsoft\JsValidation\Support\DelegatedValidator::class)
            ->disableOriginalConstructor()
            ->getMock();


        $parser = new RuleParser($delegated, $token);

        $values = $parser->getRule($attribute, $rule, $parameters,'active_url');
        $expected = [$attribute,RuleParser::REMOTE_RULE,[$attribute, $token, false]];

        $this->assertEquals($expected, $values);
    }

    public function testGetRemoteRuleArray()
    {
        $attribute = 'field.name.array';
        $attributeHtml = 'field[name][array]';
        $rule = 'ActiveUrl';
        $parameters = [];
        $token ='my token';

        $delegated = $this->getMockBuilder(\Proengsoft\JsValidation\Support\DelegatedValidator::class)
            ->disableOriginalConstructor()
            ->getMock();


        $parser = new RuleParser($delegated, $token);

        $values = $parser->getRule($attribute, $rule, $parameters,'active_url');
        $expected = [$attributeHtml,RuleParser::REMOTE_RULE,[$attributeHtml, $token, false]];

        $this->assertEquals($expected, $values);
    }

    public function testGetRules()
    {
        $expects = ['somefield'=>'required'];

        $delegated = $this->getMockBuilder(\Proengsoft\JsValidation\Support\DelegatedValidator::class)
            ->disableOriginalConstructor()
            ->getMock();

        $delegated->expects($this->once())
            ->method('getRules')
            ->willReturn($expects);


        $parser = new RuleParser($delegated, null);

        $this->assertEquals($expects, $parser->getValidatorRules());
    }

    public function testGetRuleWithAttributeArray()
    {
        $attribute = 'field.key';
        $rule = 'Required';
        $parameters = [];
        $token =null;

        $delegated = $this->getMockBuilder(\Proengsoft\JsValidation\Support\DelegatedValidator::class)
            ->disableOriginalConstructor()
            ->getMock();


        $parser = new RuleParser($delegated, $token);

        $values = $parser->getRule($attribute, $rule, $parameters,'required');
        $expected = ['field[key]',RuleParser::JAVASCRIPT_RULE,$parameters];

        $this->assertEquals($expected, $values);
    }

    public function testAddConditionalRules()
    {
        $attribute = 'field';
        $rule = 'Required';
        $parameters = [];
        $token ='my token';

        $delegated = $this->getMockBuilder(\Proengsoft\JsValidation\Support\DelegatedValidator::class)
            ->disableOriginalConstructor()
            ->getMock();

        $delegated->expects($this->once())
            ->method('explodeRules')
            ->with(['required'])
            ->willReturn([['required']]);

        $parser = new RuleParser($delegated, $token);

        $parser->addConditionalRules($attribute,'required');
        $values = $parser->getRule($attribute, $rule, $parameters,'required');
        $expected = [$attribute,RuleParser::REMOTE_RULE,[$attribute, $token, true]];

        $this->assertEquals($expected, $values);
    }

    public function testParseNamedParameters()
    {
        $parameters = ['min_height=100','ratio=1/3'];
        $token =null;

        $delegated = $this->getMockBuilder(\Proengsoft\JsValidation\Support\DelegatedValidator::class)
            ->disableOriginalConstructor()
            ->getMock();


        $parser = new RuleParser($delegated, $token);

        $values = $parser->parseNamedParameters($parameters);
        $expected = [
            'min_height' =>100,
            'ratio' => '1/3',
        ];

        $this->assertEquals($expected, $values);
    }
}
