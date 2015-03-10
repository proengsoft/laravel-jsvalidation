<?php namespace App\Http\Controllers;

use App\Http\Requests\JSFormRequest;
use Illuminate\Routing\Router;

class WelcomeController extends Controller {

	/*
	|--------------------------------------------------------------------------
	| Welcome Controller
	|--------------------------------------------------------------------------
	|
	| This controller renders the "marketing page" for the application and
	| is configured to only allow guests. Like most of the other sample
	| controllers, you are free to modify or remove it as you desire.
	|
	*/

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('guest');
        $this->middleware('module');
	}

	/**
	 * Show the application welcome screen to the user.
	 *
	 * @return Response
	 */
	public function index(Router $router)
	{
        //dd($router);
        //\Module::disable('blog');

        //return $url;
		return view('welcome');
	}

    public function form()
    {
        $formRequest=new JSFormRequest();
        $validator= \JsValidator::formRequest($formRequest,'#ddd');

        $av=$validator->toArray();
        $messages=$av['messages'];
        foreach ($messages as $k=>$v) {
            $fields[$k]=implode(', ',$v);
        }

        return view('validation',compact('validator','fields'));


    }

}
