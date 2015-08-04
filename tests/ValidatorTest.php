<?php namespace Proengsoft\JsValidation\Test;

use Illuminate\Http\Exception\HttpResponseException;
use Mockery as m;
use Illuminate\Foundation\Testing\TestCase;
use Proengsoft\JsValidation\Validator;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;


function csrf_token() {
    return 'dsdsds';
}

class ValidatorTest extends \PHPUnit_Framework_TestCase {

    public $validator;
    public $translator;



    public function setUp()
    {


        $this->translator = \Mockery::instanceMock('Symfony\Component\Translation\TranslatorInterface')
            ->shouldReceive('trans')
            ->getMock();

        $messages = [
            'name.required'=>'name required',
        ];
        $data = [];
        $rules = ['name'=>'required', 'novalidate'=>'no_js_validation'];
        $customAttributes = [];

        $this->validator= new Validator($this->translator, $data, $rules,$messages ,$customAttributes);
    }



    public function testJsValidationEnabled()
    {
        $data=$this->validator->jsValidationEnabled('name');
        $this->assertTrue($data);
    }


    public function testJsValidationDisabled()
    {
        $data=$this->validator->jsValidationEnabled('novalidate');
        $this->assertFalse($data);
    }


    public function testValidateNoJsValidation()
    {
        $this->assertTrue($this->validator->validateNoJsValidation());
    }


    public function testJs() {

        $expected=array(
            'rules' => array('name'=>['laravelRequired'=>[]]),
            'messages' =>  array('name'=>['laravelRequired'=>'name required']),
        );

        $data=$this->validator->js();
        $this->assertEquals($expected,$data);

    }



    public function testJsRemote() {

        $rule=['name'=>'active_url'];
        $message=['name.active_url'=>'active url'];
        $expected=array(
            'rules' => array('name'=>['jsValidationRemote'=>['name','encrypted token']]),
            'messages'=>array('name'=>['jsValidationRemote'=>'active url'])
        );

        $validator=new Validator($this->translator, [], $rule,$message);
        Session::shouldReceive('token')->once();
        Crypt::shouldReceive('encrypt')->once()->andReturn('encrypted token');
        $data=$validator->js();

        $this->assertEquals($expected,$data);
    }


    public function testJsRemoteCustomRule() {

        $rule=['name'=>'foo'];
        $message=['name.foo'=>'custom rule %replace%'];
        $expected=array(
            'rules' => array('name'=>['jsValidationRemote'=>['name','encrypted token']]),
            'messages'=>array('name'=>['jsValidationRemote'=>'custom rule -replaced text-'])
        );

        $validator=new Validator($this->translator, [], $rule,$message);

        $validator->addExtension('foo', function($attribute, $value, $parameters) {
            return $value == 'foo';
        });

        $validator->addReplacer('foo', function($message, $attribute, $rule, $parameters) {
            return str_replace('%replace%','-replaced text-',$message);
        });


        Session::shouldReceive('token')->once();
        Crypt::shouldReceive('encrypt')->once()->andReturn('encrypted token');
        $data=$validator->js();

        $this->assertEquals($expected,$data);
    }

    public function testNotImplementedRules()
    {
        $rule=['name'=>'not_implemented_rule'];
        $message=['name.not_implemented_rule'=>'not implemented rule'];
        $expected=array(
            'rules' => array(),
            'messages'=>array()
        );

        $validator=new Validator($this->translator, [], $rule,$message);
        $data=$validator->js();

        $this->assertEquals($expected,$data);

    }


    public function testJsRuleConfirmed(){

        $rule=['name'=>'confirmed'];
        $message=['name.confirmed'=>'name confirmed'];
        $expected=array(
            'rules' => array(
                'name_confirmation'=> ['laravelConfirmed'=>array('name')]
            ),
            'messages'=>array(
                'name_confirmation'=> ['laravelConfirmed'=>'name confirmed']
            )
        );

        $validator=new Validator($this->translator, [], $rule,$message);
        $data=$validator->js();

        $this->assertEquals($expected,$data);

    }


    public function testAfter(){

        $mayDay="May 4, 1886";

        $rule=[
            'date'=>'after:"'.$mayDay.'"',
            'other_date'=>'after:date',
            'other'=>'after:not_exists',
        ];
        $message=[
            'date.after'=>'May Day',
            'other_date.after'=>'After May Day',
            'other.after'=>'other invalid'
        ];


        $expected=array(
            'rules' => array(
                'date'=> ['laravelAfter'=>array(strtotime($mayDay))],
                'other_date'=> ['laravelAfter'=>array("date")],
                'other'=> ['laravelAfter'=>array("false")],
            ),
            'messages'=>array(
                'date'=> ['laravelAfter'=>'May Day'],
                'other_date'=> ['laravelAfter'=>'After May Day'],
                'other'=> ['laravelAfter'=>'other invalid'],
            )
        );

        $validator=new Validator($this->translator, [], $rule,$message);
        $data=$validator->js();

        $this->assertEquals($expected,$data);

    }


    public function testBefore(){

        $mayDay="May 4, 1886";
        $rule=[
            'date'=>'before:"'.$mayDay.'"',
            'other_date'=>'before:date',
            'other'=>'before:not_exists',
        ];
        $message=[
            'date.before'=>'May Day',
            'other_date.before'=>'Before May Day',
            'other.before'=>'other invalid'
        ];


        $expected=array(
            'rules' => array(
                'date'=> ['laravelBefore'=>array(strtotime($mayDay))],
                'other_date'=> ['laravelBefore'=>array("date")],
                'other'=> ['laravelBefore'=>array("false")],
            ),
            'messages'=>array(
                'date'=> ['laravelBefore'=>'May Day'],
                'other_date'=> ['laravelBefore'=>'Before May Day'],
                'other'=> ['laravelBefore'=>'other invalid'],
            )
        );

        $validator=new Validator($this->translator, [], $rule,$message);
        $data=$validator->js();

        $this->assertEquals($expected,$data);

    }

    public function testNotUniqueRuleName()
    {
        $rule=[
            'name'=>'required_if:field1,value1|required_if:field2,value2',
            'field1'=>''
        ];
        $message=['name.required_if'=>'The :attribute field is required when :other is :value.'];
        $expected=array(
            'rules' => array(
                'name'=> [
                    'laravelRequiredIf'=>array('field1','value1'),
                    'laravelRequiredIf_1'=>array('field2','value2'),
                ]
            ),
            'messages'=>array(
                'name'=> [
                    'laravelRequiredIf'=>'The  field is required when  is .',
                    'laravelRequiredIf_1'=>'The  field is required when  is .'
                ]
            )
        );
        
        $validator=new Validator($this->translator, [], $rule,$message);
        $data=$validator->js();
        //dd($data);

        $this->assertEquals($expected,$data);

    }

    public function testUniqueRuleName()
    {
        $rule=['name'=>'required_if:field1,value1'];
        $message=['name.required_if'=>'The :attribute field is required when :other is :value.'];
        $expected=array(
            'rules' => array(
                'name'=> [
                    'laravelRequiredIf'=>array('field1','value1'),
                ]
            ),
            'messages'=>array(
                'name'=> [
                    'laravelRequiredIf'=>'The  field is required when  is .',
                ]
            )
        );

        //$rules=['name'=>'required_if:field1,value1|required_if:field2,value2'];
        //$messages=['name'=>'required_if:field1,value1|required_if:field2,value2'];

        $validator=new Validator($this->translator, [], $rule,$message);
        $data=$validator->js();

        $this->assertEquals($expected,$data);

    }

    public function testMimes(){

        $rule=['name'=>'mimes:TXT'];
        $message=['name.mimes'=>'Mime TXT'];
        $expected=array(
            'rules' => array(
                'name'=> ['laravelMimes'=>array('txt')]
            ),
            'messages'=>array(
                'name'=> ['laravelMimes'=>'Mime TXT']
            )
        );

        $validator=new Validator($this->translator, [], $rule,$message);
        $data=$validator->js();

        $this->assertEquals($expected,$data);

    }


    public function  testPassesRemoteOk()
    {

        $messages = [
            'name.active_url'=>'active_url',
        ];
        $data = ['_jsvalidation'=>'name','name'=>'http://www.google.com'];
        $rules = ['name'=>'active_url|required'];


        $validator=new Validator($this->translator, $data, $rules,$messages);

        try {
            $validator->passes();

        } catch (HttpResponseException $ex) {
            $response=$ex->getResponse();
            $this->assertEquals(200,$response->getStatusCode());
            $this->assertEquals('true',$response->getContent());
        }

    }


    public function testRemoteInvalid()
    {

        $messages = [
            'other.required'=>'other required',
            'name.active_url'=>'active_url',
        ];
        $data = ['_jsvalidation'=>'badname','name'=>'http://www.google.com'];
        $rules = ['name'=>'active_url','other'=>'required'];


        $validator=new Validator($this->translator, $data, $rules,$messages);

        try {
            $validator->passes();

        } catch (BadRequestHttpException $ex) {
            $this->assertEquals(400,$ex->getStatusCode());
            $this->assertEquals("Bad request",$ex->getMessage());
        }



    }

    public function testPassesRemoteFail()
    {

        $messages = [
            'other.required'=>'other required',
            'name.active_url'=>'active_url',
        ];
        $data = ['_jsvalidation'=>'name','name'=>'http://this-url-must-fail'];
        $rules = ['name'=>'active_url','other'=>'required'];


        $expected=array(
            'rules' => array('name'=>['laravelRequired'=>[]]),
            'messages' =>  array('name'=>['laravelRequired'=>'name required']),
        );
        $validator=new Validator($this->translator, $data, $rules,$messages);

        try {
            $validator->passes();

        } catch (HttpResponseException $ex) {
            $response=$ex->getResponse();
            $this->assertEquals(200,$response->getStatusCode());
            $this->assertJsonStringEqualsJsonString(json_encode(["active_url"]),$response->getContent());
        }



    }




    public function  testPassesWithoutRemote()
    {

        $messages = [
            'name.required'=>'name required',
        ];
        $data = [];
        $rules = ['name'=>'required', 'novalidate'=>'no_js_validation'];


        $expected=array(
            'rules' => array('name'=>['laravelRequired'=>[]]),
            'messages' =>  array('name'=>['laravelRequired'=>'name required']),
        );
        $validator=new Validator($this->translator, [], $rules,$messages);

        $data=$this->validator->passes();


    }


}
