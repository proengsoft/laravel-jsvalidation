<?php namespace Proengsoft\JQueryValidation;

use Illuminate\Support\ServiceProvider;

use Proengsoft\JQueryValidation\Validator;
class JsValidationServiceProvider extends ServiceProvider {



	/**
	 * Bootstrap the application services.
	 *
	 * @return void
	 */
	public function boot()
	{

        $viewPath = __DIR__.'/../resources/views';
        $this->loadViewsFrom($viewPath, 'jsvalidation');
        $this->publishes([
            $viewPath => base_path('resources/views/vendor/jsvalidation'),
        ]);
        /*
        $configPath = __DIR__ . '/../config/jsvalidator.php';
        $this->publishes([$configPath => config_path('jsvalidator.php')], 'config');
        */
        $this->publishes([
            __DIR__.'/../public' => public_path('vendor/jsvalidation'),
        ], 'public');

        $this->bootValidator();
    }

	/**
	 * Register the application services.
	 *
	 * @return void
	 */
	public function register()
	{
		$this->app->bindShared('jsvalidator', function ($app) {

        });
	}

    protected function bootValidator()
    {
        $this->app['validator']->resolver( function( $translator, $data, $rules, $messages = array(), $customAttributes = array() ) {
            $plugin = new JQueryValidation();
            return new Validator( $translator, $data, $rules, $messages, $customAttributes, $plugin );
        } );

    }

}
