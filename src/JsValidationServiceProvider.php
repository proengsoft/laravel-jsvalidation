<?php namespace Proengsoft\JsValidation;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\ServiceProvider;
use \Illuminate\Contracts\Foundation\Application;
use Proengsoft\JsValidation;

class JsValidationServiceProvider extends ServiceProvider
{


    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        // First we bootstrap configurations
        $this->bootstrapConfigs();

        $this->bootstrapViews();
        $this->publishAssets();
        $this->bootstrapValidator();
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind('jsvalidator', function (Application $app) {

            $selector=Config::get('jsvalidation.form_selector');
            $view=Config::get('jsvalidation.view');

            $validator=new Manager($selector,$view);
            $validatorFactory=$app->make('Illuminate\Contracts\Validation\Factory');

            return new Factory($validatorFactory, $validator);
        });
    }


    /**
     * Register Validator resolver
     */
    protected function bootstrapValidator()
    {
        $this->app['validator']->resolver(function ($translator, $data, $rules, $messages = array(), $customAttributes = array()) {
            return new Validator($translator, $data, $rules, $messages, $customAttributes);
        });
    }

    /**
     * Configure and publish views
     */
    protected function bootstrapViews()
    {
        $viewPath = realpath(__DIR__.'/../resources/views');

        $this->loadViewsFrom($viewPath, 'jsvalidation');
        $this->publishes([
            $viewPath =>$this->app['path.base'].'/resources/views/vendor/jsvalidation',
        ], 'views');
    }

    /**
     * Load and publishes configs
     */
    protected function bootstrapConfigs()
    {
        $configFile = realpath(__DIR__ . '/../config/jsvalidation.php');

        $this->mergeConfigFrom($configFile, 'jsvalidation');
        $this->publishes([$configFile =>  $this->app['path.config'].'/jsvalidation.php'], 'config');
    }

    /**
     * Publish public assets
     */
    protected function publishAssets()
    {
        $this->publishes([
            realpath(__DIR__.'/../public') => $this->app['path.public'].'/vendor/jsvalidation',
        ], 'public');
    }
}
