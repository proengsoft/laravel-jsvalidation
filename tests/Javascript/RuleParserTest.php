<?php

namespace Proengsoft\JsValidation\Javascript;


class RuleParserTest extends \PHPUnit_Framework_TestCase
{

    public function testGetClientRule() {
        $attribute = 'field';
        $rule = 'Required';
        $parameters = [];
        $token =null;

        $delegated = $this->getMockBuilder('\Proengsoft\JsValidation\Support\DelegatedValidator')
            ->disableOriginalConstructor()
            ->getMock();


        $parser = new RuleParser($delegated, $token);

        $values = $parser->getRule($attribute, $rule, $parameters);
        $expected = [$attribute,RuleParser::JAVASCRIPT_RULE,$parameters];

        $this->assertEquals($expected, $values);
    }

    public function testGetClientCustomRule() {
        $attribute = 'field';
        $rule = 'RequiredIf';
        $parameters = ['field2','value2'];
        $token =null;

        $delegated = $this->getMockBuilder('\Proengsoft\JsValidation\Support\DelegatedValidator')
            ->disableOriginalConstructor()
            ->getMock();


        $parser = new RuleParser($delegated, $token);

        $values = $parser->getRule($attribute, $rule, $parameters);
        $expected = [$attribute,RuleParser::JAVASCRIPT_RULE,$parameters];

        $this->assertEquals($expected, $values);
    }

    public function testGetRemoteRule() {
        $attribute = 'field';
        $rule = 'ActiveUrl';
        $parameters = [];
        $token ='my token';

        $delegated = $this->getMockBuilder('\Proengsoft\JsValidation\Support\DelegatedValidator')
            ->disableOriginalConstructor()
            ->getMock();


        $parser = new RuleParser($delegated, $token);

        $values = $parser->getRule($attribute, $rule, $parameters);
        $expected = [$attribute,RuleParser::REMOTE_RULE,[$attribute, $token]];

        $this->assertEquals($expected, $values);
    }

    public function testGetRules() {

        $expects = ['somefield'=>'required'];

        $delegated = $this->getMockBuilder('\Proengsoft\JsValidation\Support\DelegatedValidator')
            ->disableOriginalConstructor()
            ->getMock();

        $delegated->expects($this->once())
            ->method('getRules')
            ->willReturn($expects);


        $parser = new RuleParser($delegated, null);

        $this->assertEquals($expects, $parser->getRules());
    }

    public function testGetRuleWithAttributeArray()
    {
        $attribute = 'field.key';
        $rule = 'Required';
        $parameters = [];
        $token =null;

        $delegated = $this->getMockBuilder('\Proengsoft\JsValidation\Support\DelegatedValidator')
            ->disableOriginalConstructor()
            ->getMock();


        $parser = new RuleParser($delegated, $token);

        $values = $parser->getRule($attribute, $rule, $parameters);
        $expected = ['field[key]',RuleParser::JAVASCRIPT_RULE,$parameters];

        $this->assertEquals($expected, $values);
    }

}
