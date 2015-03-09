<?php namespace Proengsoft\JQueryValidation;

use Illuminate\Support\ServiceProvider;

use Proengsoft\JQueryValidation;
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

        $configPath = __DIR__ . '/../config/jsvalidation.php';
        $this->publishes([$configPath => config_path('jsvalidation.php')], 'config');

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
        $this->mergeConfigFrom(
            __DIR__ . '/../config/jsvalidation.php', 'jsvalidation'
        );

		$this->app->bind('jsvalidator', function ($app) {
            return new JsValidator();
        });
	}

    protected function bootValidator()
    {
        $this->app['validator']->resolver( function( $translator, $data, $rules, $messages = array(), $customAttributes = array() ) {
            return new Validator( $translator, $data, $rules, $messages, $customAttributes);
        } );

    }

}
