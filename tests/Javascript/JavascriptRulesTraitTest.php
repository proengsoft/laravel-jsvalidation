<?php

namespace Proengsoft\JsValidation\Tests\Javascript;

class JavascriptRulesTraitTest extends \PHPUnit_Framework_TestCase
{
    protected $mockTrait;

    public function setUp()
    {
        $this->mockTrait = $this->getMockForTrait(\Proengsoft\JsValidation\Javascript\JavascriptRulesTrait::class);

        $this->mockTrait->expects($this->any())
            ->method('getAttributeName')
            ->will($this->returnArgument(0));
    }

    public function testRuleConfirmed()
    {
        $values = $this->callProtected('ruleConfirmed','field');
        $expected = ['field_confirmation', ['field']];

        $this->assertEquals($expected,$values);
    }

    public function testRuleAfterDate()
    {
        $date = "10 September 2000";
        $values = $this->callProtected('ruleAfter','field',[$date]);

        $expected = ['field', [strtotime($date)]];

        $this->assertEquals($expected,$values);
    }

    public function testRuleAfterAttribute()
    {
        $date = "field2";
        $values = $this->callProtected('ruleAfter','field',[$date]);

        $expected = ['field', [$date]];

        $this->assertEquals($expected,$values);
    }

    public function testRuleBeforeDate()
    {
        $date = "10 September 2000";
        $values = $this->callProtected('ruleBefore','field',[$date]);

        $expected = ['field', [strtotime($date)]];

        $this->assertEquals($expected,$values);
    }

    public function testRuleBeforeAttribute()
    {
        $date = "field2";
        $values = $this->callProtected('ruleBefore','field',[$date]);

        $expected = ['field', [$date]];

        $this->assertEquals($expected,$values);
    }

    public function testRuleSame()
    {
        $values = $this->callProtected('ruleSame','field',['field2']);
        $expected = ['field', ['field2']];

        $this->assertEquals($expected,$values);
    }

    public function testRuleDifferent()
    {
        $values = $this->callProtected('ruleDifferent','field',['field2']);
        $expected = ['field', ['field2']];

        $this->assertEquals($expected,$values);
    }

    public function testRuleRequiredWith()
    {
        $values = $this->callProtected('ruleRequiredWith','field',['field2','field3']);
        $expected = ['field', ['field2','field3']];

        $this->assertEquals($expected,$values);
    }


    public function testRuleRequiredWithAll()
    {
        $values = $this->callProtected('ruleRequiredWithAll','field',['field2','field3']);
        $expected = ['field', ['field2','field3']];

        $this->assertEquals($expected,$values);
    }

    public function testRuleRequiredWithout()
    {
        $values = $this->callProtected('ruleRequiredWithout','field',['field2','field3']);
        $expected = ['field', ['field2','field3']];

        $this->assertEquals($expected,$values);
    }

    public function testRuleRequiredWithoutAll()
    {
        $values = $this->callProtected('ruleRequiredWithoutAll','field',['field2','field3']);
        $expected = ['field', ['field2','field3']];

        $this->assertEquals($expected,$values);
    }

    public function testRuleRequiredIf()
    {
        $values = $this->callProtected('ruleRequiredIf','field',['field2']);
        $expected = ['field', ['field2']];

        $this->assertEquals($expected,$values);
    }

    public function testRuleRequiredUnless()
    {
        $values = $this->callProtected('ruleRequiredUnless','field',['field2']);
        $expected = ['field', ['field2']];

        $this->assertEquals($expected,$values);
    }

    public function testRuleInArray()
    {
        $values = $this->callProtected('ruleInArray','field',['field.*']);
        $expected = ['field', ['field.*']];

        $this->assertEquals($expected,$values);
    }

    public function testRuleDistinct()
    {
        $values = $this->callProtected('ruleDistinct','field',[]);
        $expected = ['field', ['field']];

        $this->assertEquals($expected,$values);
    }

    public function testRuleDimensions()
    {
        $values = $this->callProtected('ruleDimensions','field',['min_width=100','ratio=16/9']);
        $expected = ['field', null];

        $this->assertEquals($expected,$values);
    }

    protected function callProtected($method, $attribute, $parameters = [])
    {
        $caller = function ($method, $attribute, $parameters) {
            return $this->$method($attribute, $parameters);
        };

        $testCaller = $caller->bindTo($this->mockTrait, $this->mockTrait);
        return $testCaller($method, $attribute, $parameters);
    }
}
