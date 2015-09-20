<?php namespace Proengsoft\JsValidation\Test;

use Illuminate\Http\Exception\HttpResponseException;
use Mockery as m;
use Proengsoft\JsValidation\DelegatedValidator;
use Proengsoft\JsValidation\Validator;
use Illuminate\Validation\Validator as LaravelValidator;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Config;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;


function csrf_token() {
    return 'dsdsds';
}

class ValidatorTest extends \PHPUnit_Framework_TestCase {

    public $validator;
    public $translator;



    public function setUp()
    {

        /*
        $this->translator = \Mockery::instanceMock('Symfony\Component\Translation\TranslatorInterface')
            ->shouldReceive('trans')
            ->getMock();

        $messages = [
            'name.required'=>'name required',
        ];
        $data = [];
        $rules = ['name'=>'required', 'novalidate'=>'no_js_validation'];
        $customAttributes = [];
        */
        Config::shouldReceive('get')->withArgs(['jsvalidation.enable_remote_validation'])->andReturn(true);
        /*
        $this->delegated = m::mock('Proengsoft\JsValidation\DelegatedValidator')
            ->shouldReceive('hasRule')->withAnyArgs()->andReturn(True)
            ->getMock();
        $this->validator= new Validator($this->delegated);
        */

        //$this->delegated= new DelegatedValidator(new LaravelValidator($this->translator, $data, $rules, $messages, $customAttributes));
    }



    public function tearDown(){
        m::close();
        unset($this->validator);
        unset($this->translator);
    }



    public function testJsValidationEnabled()
    {
        $validator = $this->getRealValidator(['name'=>'required']);
        $data=$validator->jsValidationEnabled('name');
        $this->assertTrue($data);
    }

    public function testJsValidationDisabled()
    {

        $validator = $this->getRealValidator(['name'=>Validator::JSVALIDATION_DISABLE]);
        $data=$validator->jsValidationEnabled('name');
        $this->assertFalse($data);

    }

    public function testValidationData() {

        $validator = $this->getRealValidator(['name'=>'required']);
        $data=$validator->validationData();
        $this->assertEquals([
                'rules' => array('name'=>['laravelValidation'=>[['Required',[],'name required!',true]]]),
                'messages' =>  array(),
            ], $data
        );
    }

    public function testValidationDataRemote() {

        $validator = $this->getRealValidator(['name'=>'active_url']);
        $validator->setRemoteToken('encrypted token');
        $validator->enableRemote(true);
        $data=$validator->validationData();
        $this->assertEquals([
                'rules' => array('name'=>['laravelValidationRemote'=>[['ActiveUrl',['name','encrypted token'],'name active_url!',false]]]),
                'messages'=>array()
            ], $data
        );

    }


    public function testJsRemoteCustomRule() {

        $validator = $this->getRealValidator(['name'=>'foo'], ['name.foo'=>'custom rule %replace%']);
        $validator->setRemoteToken('encrypted token');
        $validator->enableRemote(true);

        $validator->addExtension('foo', function($attribute, $value, $parameters) {
            return $value == 'foo';
        });

        $validator->addReplacer('foo', function($message, $attribute, $rule, $parameters) {
            return str_replace('%replace%','-replaced text-',$message);
        });

        $data=$validator->validationData();
        $this->assertEquals([
                'rules' => array('name'=>['laravelValidationRemote'=>[['Foo',['name','encrypted token'],'custom rule -replaced text-',false]]]),
                'messages'=>array()
            ], $data
        );

    }

    public function testNotImplementedRules()
    {
        $rule=['name'=>'not_implemented_rule'];
        $message=['name.not_implemented_rule'=>'not implemented rule'];
        $expected=array(
            'rules' => array(),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);

    }


    public function testJsRuleConfirmed(){

        $rule=['name'=>'confirmed'];
        //$message=['name.confirmed'=>'name confirmed'];
        $message=['name.confirmed'=>'name confirmed'];
        $expected=array(
            'rules' => array(
                'name_confirmation'=> ['laravelValidation'=>[['Confirmed',['name'],'name confirmed',false]]],
            ),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();


        $this->assertEquals($expected,$data);

    }


    public function testAfter(){

        $mayDay="May 4, 1986";

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
                'date'=> ['laravelValidation'=>[['After',[strtotime($mayDay)],'May Day',false]]],
                'other_date'=> ['laravelValidation'=>[['After',["date"],'After May Day',false]]],
                'other'=> ['laravelValidation'=>[['After',["not_exists"],"other invalid",false]]],
            ),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);

    }


    public function testBefore(){

        $mayDay="May 4, 1986";
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
                'date'=> ['laravelValidation'=>[['Before',[strtotime($mayDay)],'May Day',false]]],
                'other_date'=> ['laravelValidation'=>[['Before',["date"],'Before May Day',false]]],
                'other'=> ['laravelValidation'=>[['Before',["not_exists"],"other invalid",false]]],
            ),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);

    }

    public function testSame()
    {
        $rule=[
            'field'=>'same:other.field.name',
        ];
        $message=[
            'field.same'=>'Should be validated',
        ];
        $expected=array(
            'rules' => array(
                'field'=> ['laravelValidation'=>[['Same',['other[field][name]'],'Should be validated',false]]],
            ),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);

    }

    public function testDifferent()
    {
        $rule=[
            'field'=>'different:other.field.name',
        ];
        $message=[
            'field.different'=>'Should be validated',
        ];
        $expected=array(
            'rules' => array(
                'field'=> ['laravelValidation'=>[['Different',['other[field][name]'],'Should be validated',false]]],
            ),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);

    }


    public function testRequiredWith()
    {
        $rule=[
            'field'=>'required_with:other.field.name',
        ];
        $message=[
            'field.required_with'=>'Should be validated',
        ];
        $expected=array(
            'rules' => array(
                'field'=> ['laravelValidation'=>[['RequiredWith',['other[field][name]'],'Should be validated',true]]],
            ),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);

    }

    public function testRequiredWithAll()
    {
        $rule=[
            'field'=>'required_with_all:other.field.name',
        ];
        $message=[
            'field.required_with_all'=>'Should be validated',
        ];
        $expected=array(
            'rules' => array(
                'field'=> ['laravelValidation'=>[['RequiredWithAll',['other[field][name]'],'Should be validated',true]]],
            ),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);

    }

    public function testRequiredWithout()
    {
        $rule=[
            'field'=>'required_without:other.field.name',
        ];
        $message=[
            'field.required_without'=>'Should be validated',
        ];
        $expected=array(
            'rules' => array(
                'field'=> ['laravelValidation'=>[['RequiredWithout',['other[field][name]'],'Should be validated',true]]],
            ),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);

    }

    public function testRequiredWithoutAll()
    {
        $rule=[
            'field'=>'required_without_all:other.field.name',
        ];
        $message=[
            'field.required_without_all'=>'Should be validated',
        ];
        $expected=array(
            'rules' => array(
                'field'=> ['laravelValidation'=>[['RequiredWithoutAll',['other[field][name]'],'Should be validated',true]]],
            ),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);

    }

    public function  testPassesRemoteOk()
    {

        $messages = [
            'name.active_url'=>'active_url',
        ];
        $data = ['_jsvalidation'=>'name','name'=>'http://www.google.com'];
        $rules = ['name'=>'active_url|required'];


        $validator= $this->getRealValidator($rules,$messages, $data);
        $validator->setRemoteToken('encrypted token');
        $validator->enableRemote(true);

        try {
            $result=$validator->passes();
            $this->assertFalse($result);
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


        $validator= $this->getRealValidator($rules,$messages, $data);
        $validator->setRemoteToken('encrypted token');
        $validator->enableRemote(true);

        try {
            $result = $validator->passes();
            $this->assertTrue($result);
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
        $validator= $this->getRealValidator($rules,$messages, $data);
        $validator->setRemoteToken('encrypted token');
        $validator->enableRemote(true);

        try {
            $result = $validator->passes();
            $this->assertTrue($result);

        } catch (HttpResponseException $ex) {
            $response=$ex->getResponse();
            $this->assertEquals(200,$response->getStatusCode());
            $this->assertJsonStringEqualsJsonString(json_encode(["active_url"]),$response->getContent());
        }



    }


    public function testRequiredIfReplacement()
    {
        $rule=['name'=>'required_if:field1,value1'];
        $message=['name.required_if'=>'The :attribute field is required when :other is :value.'];
        $expected=array(
            'rules' => array(
                'name'=> [
                    'laravelValidation'=>[['RequiredIf',array('field1','value1'),'The name field is required when field1 is value1.',true]],
                ]
            ),
            'messages'=>array()
        );

        //$rules=['name'=>'required_if:field1,value1|required_if:field2,value2'];
        //$messages=['name'=>'required_if:field1,value1|required_if:field2,value2'];

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);

    }

    public function testMimes(){

        $rule=['name'=>'mimes:TXT'];
        $message=['name.mimes'=>'Mime TXT'];
        $expected=array(
            'rules' => array(
                'name'=> ['laravelValidation'=>[['Mimes',array('TXT'),'Mime TXT',false]]]
            ),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);

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
        $validator=$this->getRealValidator($rules, $messages);

        $data=$validator->passes();


    }

    public function testGetAttributeName()
    {
        $rules=['att.ribu.te' =>'after:"May 4, 1986"'];
        $validator=$this->getRealValidator($rules);
        $data=$validator->validationData();
        $this->assertArrayHasKey('att[ribu][te]',$data['rules']);

    }

    public function testRemoteValidationDisabled()
    {
        $rule=['name'=>'active_url'];
        $message=['name.active_url'=>'active url'];
        $expected=array(
            'rules' => array(),
            'messages'=>array()
        );

        $validator=$this->getRealValidator($rule,$message);
        Config::clearResolvedInstances();
        Config::shouldReceive('get')->withArgs(['jsvalidation.enable_remote_validation'])->andReturn(false);
        $data=$validator->validationData();

        $this->assertEquals($expected,$data);
    }


    protected function getTranslator()
    {
        return m::mock('Symfony\Component\Translation\TranslatorInterface');
    }

    protected function getRealTranslator()
    {
        $trans = new \Symfony\Component\Translation\Translator('en', new \Symfony\Component\Translation\MessageSelector);
        $trans->addLoader('array', new \Symfony\Component\Translation\Loader\ArrayLoader);
        $trans->addResource(
            'array',
            [
                'validation.required' => ':attribute required!',
                'validation.active_url' => ':attribute active_url!'
            ],
            'en',
            'messages'
        );

        return $trans;
    }


    public function testGetMessageBag()
    {
        $this->getRealValidator([])->getMessageBag();
    }

    public function testFails()
    {
        $this->getRealValidator([])->fails();
    }

    public function testFailed()
    {
        $this->getRealValidator([])->failed();
    }

    public function testSometimes()
    {
        $this->getRealValidator([])->sometimes('', [], function(){});
    }

    public function testAfterCallback()
    {
        $this->getRealValidator([])->after(function(){});
    }


    protected function getRealValidator($rules, $messages = array(), $data=[])
    {
        $trans = $this->getRealTranslator();
        $laravelValidator = new LaravelValidator($trans, $data, $rules, $messages );
        $delegated = new DelegatedValidator($laravelValidator);
        return new Validator($delegated);
    }

    protected function getDelegatedValidator()
    {
        return m::mock('Proengsoft\JsValidation\DelegatedValidator');
    }


}
