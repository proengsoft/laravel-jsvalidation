<?php namespace Proengsoft\JQueryValidation;

use Illuminate\Support\ServiceProvider;

class JsValidationServiceProvider extends ServiceProvider {



	/**
	 * Bootstrap the application services.
	 *
	 * @return void
	 */
	public function boot()
	{

        $viewPath = __DIR__.'/../resources/views';
        $this->loadViewsFrom($viewPath, 'jsvalidator');
        /*
        $configPath = __DIR__ . '/../config/jsvalidator.php';
        $this->publishes([$configPath => config_path('jsvalidator.php')], 'config');
        */
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
            $plugin = new Plugins\JQueryValidation();
            return new ValidationAdapter( $translator, $data, $rules, $messages, $customAttributes, $plugin );
        } );

    }

}
