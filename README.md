# Laravel 5 Javascript Validation

[![Latest Version](https://img.shields.io/github/release/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://github.com/proengsoft/laravel-jsvalidation/releases)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![Build Status](https://img.shields.io/travis/proengsoft/laravel-jsvalidation/master.svg?style=flat-square)](https://travis-ci.org/proengsoft/laravel-jsvalidation)
[![Coverage Status](https://img.shields.io/scrutinizer/coverage/g/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation/code-structure)
[![Quality Score](https://img.shields.io/scrutinizer/g/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation)
[![Total Downloads](https://img.shields.io/packagist/dt/league/laravel-jsvalidation.svg?style=flat-square)](https://packagist.org/packages/league/laravel-jsvalidation)

[JQueryValidation]: http://jqueryvalidation.org/
[FormRequest]: http://laravel.com/docs/5.0/validation#form-request-validation
[Validators]: http://laravel.com/docs/5.0/validation#form-request-validation
[Validation Rules]: http://laravel.com/docs/5.0/validation#available-validation-rules
[Custom Validations]: http://laravel.com/docs/5.0/validation#custom-validation-rules
[Messages]: http://laravel.com/docs/5.0/validation#error-messages-and-views
[Laravel Localization]: http://laravel.com/docs/5.0/localization 
[Validation]: http://laravel.com/docs/5.0/validation 

## About

This package allows to reuse your Laravel [Validation Rules][], [Messages][], [FormRequest][] and [Validators][] to validate forms via Javascript transparently. You can validate forms automatically
 referencing it to your defined validations. The messages are loaded from your validators and translated according your Localization preferences.
  
The Javascript validations are made using [JQueryValidation][], that is compiled into javascript in the package. 


### Feature overview

- Automatic creation of javascript validation based on your [Validation Rules][], [Messages][], [FormRequest][] and [Validators][].
- All Laravel validations supported (except remotes)
- Uhe package uses bundled [Jquery Validation Plugin](http://jqueryvalidation.org/)  
- Unobtrusive integration, you can use independently of Laravel Form Builder. and no Javascript coding required.
- Uses Laravel Localization to translate messages.
- Can be configured in controllers or views.


## Installation

Require `proengsoft/laravel-jsvalidation` in composer.json and run `composer update`.

    {
        "require": {
            "laravel/framework": "5.0.*",
            ...
            "proengsoft/laravel-jsvalidation": "*"
        }
        ...
    }

Composer will download the package. After the package is downloaded, open `/config/app.php` and add the service provider and alias as below:

```php
    'providers' => array(
        ...
        'Proengsoft\JsValidation\JsValidationServiceProvider',
    ),
```


```php
    'alias' => array(
        ...
        'JsValidator' => 'Proengsoft\JsValidation\Facades\JsValidatorFacade',
    ),
```

Also you need to publish configuration file and assets by running the following Artisan commands.

```php
$ php artisan vendor:publish proengsoft/laravel-jsvalidation
```


## Usage

<a name="basic-usage"></a>
### Basic Usage

Laravel Javascript Validation ships with a simple, convenient facility for configuring rules error messages via the `JsValidator` facade.

The `JsValidator` created by the *Facade* inherits from [Laravel Validation][], so you can use all methods and procedures that Laravel provides to 
setup your validations. Also class and rule syntax are the same that Laravel Validation class implements. When the instance is printed in a 
view the Javascript code needed to validate your form is rendered to the page. 

#### Basic Validator Example

The first argument passed to the `make` method is the validation rules that should be applied to the data. The rule syntax is the same that 
Laravel `Validation` class.

     $validator = JsValidator::make(
         [
            'name' => 'required',
            'password' => 'required|min:8',
            'email' => 'required|email|unique:users'
          ]
     );

#### Validator Example with all params

Like Laravel `Validation` class, you can customize the messages showed when validation errors occurs. Also you 
can define what the form will be validated.

     $validator = JsValidator::make(
         [
            'name' => 'required',
            'password' => 'required|min:8',
            'email' => 'required|email|unique:users'
          ],
          [
            'name' => 'validation.my_custom_lang_message'
            'password.required' => ':attribute can't be empty'
            'password.min' => ':attribute should has at least :min chars'
          ],
          [
            'name' => 'Username',
            'password=> 'Password'
            'email' => 'E-Mail'
           ],
           '#myform'
     );

The second *(optional)* argument passed to the `make` method is the custom error messages showed when validation fails.
By default `jsValidator` uses the Laravel messages translated according [Laravel Localization][] settings but if you want 
you can customize the message for each rule.

The third *(optional)* argument passed to the `make` method is the custom attribute name displayed in error messages.

The last *(optional)* argument passed to the `make` method is the JQuery selector to find the form to validate. By default this
selector is `form` so, any form will be validated.  You can change the default selector in `config/jsvalidation.php` config file


#### Form Request Validation

Yo also can use your [FormRequest][] to create the Javascript validations.

```php
$validator = JsValidator::formRequest('App\Http\Request\MyFormRequest');
$validator = JsValidator::formRequest('App\Http\Request\MyFormRequest', '#my-form');
```

The first parameter is the fully qualified class name or instance of the *FormRequest* that you want to validate.

The second *(optional)* parameter is the JQuery form selector to find the form to validate.


### Validating the HTML Forms
  
The main goal of this package is the ability to reuse your PHP validation logic to validate forms  via Javascript. If you validate your
 forms using controller, the simplest way to reuse your validation rules is  tho share yor rules between controllers methods.

If you use [FormRequest][] you could configure your validations directly in the view


#### Reusing Validation rules in the controller

This is a basic example of how to reuse your validation rules in the controller .

```php
namespace App\Http\Controllers;

class PostController extends Controller {

    /**
     * Define your validation rules in a property in 
     * the controller to reuse the rules.
     */
    protected $validationRules=[
                'title' => 'required|unique|max:255',
                'body' => 'required',
    ];
    
    /**
     * Show the edit form for blog post
     * We create a JsValidator instance based on shared validation rules
     * @param  string  $post_id
     * @return Response
     */
    public function edit($post_id)
    {
        $validator = JsValidator::make($this->validationRules]);
        $post = Post::find($post_id);
    
        return view('edit_post')->with([
            'validator' => $validator,
            'post' => $post
        ])    
   
    }
    
    
    /**
     * Store the incoming blog post.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request)
    {
        $v = Validator::make($request->all(), $this->validationRules]);
    
        if ($v->fails())
        {
            return redirect()->back()->withErrors($v->errors());
        }
    
        // do store stuff
    }
}

 ``` 

In the view you simply should print the *validator* object passed to the view. Remember that this package depends of JQuery and
you have to include before that *jsvalidation.js*
 
 ```html
     <div class="container">
         <div class="row">
             <div class="col-md-10 col-md-offset-1">
                 <form class="form-horizontal" role="form" method="POST" action="" id="ddd">
                     <div class="form-group">
                         <label class="col-md-4 control-label">Title</label>
                         <div class="col-md-6">
                             <input type="text" class="form-control" name="title">
                         </div>
                     </div>
                     <div class="form-group">
                         <label class="col-md-4 control-label">Array</label>
                         <div class="col-md-6">
                             <textarea name="body"></textarea>
                         </div>
                     </div>
                 </form>
             </div>
         </div>
     </div>
     <!-- Scripts -->
     <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
     <script src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.1/js/bootstrap.min.js"></script>
     <!-- Laravel Javascript Validation -->
     <script type="text/javascript" src="{{ asset('vendor/jsvalidation/js/jsvalidation.js')}}"></script>
     {!! $validator !!}
  
 ```


#### Reusing Form Request Validations

If you validates the forms using [FormRequest][], you can simply put your validation code in the view.

```php
namespace App\Http\Requests;
use App\Http\Requests\Request;

class StoreBlogPostRequest extends Request {

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
           'title' => 'required|unique|max:255',
           'body' => 'required',
        ];
	}

}
```
 
```html
    
     <!-- Scripts -->
     <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
     <script src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.1/js/bootstrap.min.js"></script>
     <!-- Laravel Javascript Validation -->
     <script type="text/javascript" src="{{ asset('vendor/jsvalidation/js/jsvalidation.js')}}"></script>
     {!! JsValidator::formRequest('App\Http\Request\StoreBlogPostRequest'); !!}
  
```
 

## Testing

The package still has no tests. As soon as possible I will be code it. *Contributions are welcome*

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email a.moreno@proengsoft.com instead of using the issue tracker.

## Credits

- [Proengsoft](http://www.proengsoft.com/)
- [Albert Moreno](https://github.com/torrentalle)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
